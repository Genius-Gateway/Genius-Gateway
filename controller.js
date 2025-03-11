import User from "./User.js";

// Utility function to shuffle an array
const shuffleArray = (arr) => {
    const array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// Function to generate the question array from the unique number
const generateQuestionArray = (uniqueNumber) => {
    const keyDigits = uniqueNumber.split("").map(Number);
    if (new Set(keyDigits).size !== 3) {
        throw new Error("Unique Number digits must be unique.");
    }
    if (!keyDigits.every((d) => d >= 1 && d <= 9)) {
        throw new Error("Each digit must be between 1 and 9.");
    }

    const allDigits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const nonKeyDigits = allDigits.filter((d) => !keyDigits.includes(d));
    const shuffledNonKey = shuffleArray(nonKeyDigits);

    const group1 = [keyDigits[0], shuffledNonKey[0], shuffledNonKey[1]];
    const group2 = [keyDigits[1], shuffledNonKey[2], shuffledNonKey[3]];
    const group3 = [keyDigits[2], shuffledNonKey[4], shuffledNonKey[5]];

    return [shuffleArray(group1), shuffleArray(group2), shuffleArray(group3)];
};

// Function to register a new team with teammates
const registerTeam = async (req, res) => {
    try {
        const { emails, teamDetails } = req.body; // Destructure from request body

        // Validate that required fields are present
        if (!emails || !teamDetails || !teamDetails.teamName) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Check if any of the provided emails already exist in the database
        const existingEmail = await User.findOne({ emails: { $in: emails } });
        if (existingEmail) {
            return res.status(409).json({ message: "One or more emails are already registered with another team" });
        }
        let teamname=teamDetails.teamName.replace(/\s+/g, "");

        const password = teamname + "@genius";

        // Generate a unique 3-digit number for the team
        const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        let unique3DigitNumber = '';
        while (unique3DigitNumber.length < 3) {
            const randomIndex = Math.floor(Math.random() * digits.length);
            unique3DigitNumber += digits.splice(randomIndex, 1)[0];
        }

        const questionArray = generateQuestionArray(unique3DigitNumber);

        // Create a new user for the team (one account per team)
        const newUser = new User({
            emails:emails,
            Teamname: teamDetails.teamName,
            teammates: teamDetails.teammates, // Store teammates' names and emails
            points: 100,
            level1: false,
            level2: false,
            level3: false,
            gridNumber: Math.floor(Math.random() * 5) + 1, // Random grid number
            uniqueNumber: unique3DigitNumber,
            questionsArray: questionArray, // Store the generated question array
            checkPoint1: false,
            checkPoint2: false,
            checkPoint3: false,
            password:password
        });

        await newUser.save(); // Save the team to the database

        // Return success response with team and user details
        res.status(201).json({
            message: "Team registration successful",
            teamName: teamDetails.teamName,
            teammates: teamDetails.teammates // Returning the teammates' data
        });

    } catch (error) {
        console.error("Error registering team:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const verifyUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        let upass=password.toLowerCase();

        // Check if user exists
        const user = await User.findOne({emails: { $in: email }, upass });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // If user exists, send success response
        res.status(200).json({ message: 'Sign-in successful' });
    } catch (error) {
        res.status(500).json({ message: "error occurred", error: error.message })
    }
}

const getUserdetails = async(req,res) => {
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        // Find user by email
        const user = await User.findOne({emails: { $in: email }});
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return user details (excluding password for security)
        res.json({
            name: user.name,
            emails: user.emails,
            teamName: user.Teamname,
            Points: user.points,
            Level1:user.level1,
            Level2:user.level2,
            Level3:user.level3,
            gridNum:user.gridNumber,
            groups:user.questionsArray,
            UniqueNumber:user.uniqueNumber,
            Checkpoint1:user.checkPoint1,
            Checkpoint2:user.checkPoint2,
            Checkpoint3:user.checkPoint3,
            eliminated: user.eliminated,   
            winner: user.winner,           
            questions: user.questions,
            teammates:user.teammates
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

const updateMarks = async (req, res) => {
    const { email } = req.body; // Receive email & correctness flag

    // Check if email is provided
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        // Find user by email
        const user = await User.findOne({emails: { $in: email }});
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
       
            user.points += 50; 
            await user.save(); 
        

        res.status(200).json({ message: 'Marks updated successfully', updatedMarks: user.points });
    } catch (error) {
        console.error('Error updating marks:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

const level1completion = async (req, res) => {
    const { email } = req.body;
    try {
        // Find the user by email
        const user = await User.findOne({emails: { $in: email }});
    
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
    
        // Update the level 1 completion status
        user.level1 = true;
        await user.save();
    
        res.json({ message: "Level 1 completed" });
      } 
      catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
      }
}

const decrement = async (req,res) => {
    const { email, hintsUsed } = req.body;

    if (!email || !hintsUsed || hintsUsed < 1 || hintsUsed > 3) {
        return res.status(400).json({ message: "Invalid request data" });
    }

    try {
        let user = await User.findOne({emails: { $in: email }});

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Calculate deduction based on hints used
        const deduction = hintsUsed === 1 ? 5 : hintsUsed === 2 ? 10 : 15;
        user.points =  user.points - deduction;

        await user.save();

        res.json({ message: "Points updated", points: user.points });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

const getTeams = async (req, res) => {
    try {
        const teams = await User.find({}, { Teamname: 1, points: 1, _id: 0 })
            .sort({ points: -1, Teamname: 1 }); // Sort by points (descending)
        res.json(teams); // Send the sorted teams as a response
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Function to get participants who passed Level 1 and moved to Level 2
const getLevel2Participants = async (req, res) => {
    try {
        // Find users who completed Level 1 and proceeded to Level 2
        const participants = await User.find(
            { level1: true }, // Checking both level statuses
            { name: 1, email: 1, Teamname: 1, points: 1, _id: 0 } // Fields to return
        ).sort({ points: -1 }); // Sort by points in descending order

        res.status(200).json(participants);
    } catch (error) {
        console.error("Error fetching Level 2 participants:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const updateCheckpoint = async (req, res) => {
    const { email, checkpoint } = req.body;

    if (!email || !checkpoint || ![1, 2, 3].includes(checkpoint)) {
        return res.status(400).json({ message: "Invalid request data" });
    }

    try {
        const user = await User.findOne({ emails: { $in: email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Mark the corresponding checkpoint as true
        if (checkpoint === 1) {
            user.checkPoint1 = true;
        } else if (checkpoint === 2) {
            user.checkPoint2 = true;
        } else if (checkpoint === 3) {
            user.checkPoint3 = true;
        }

        await user.save();

        res.json({ message: `Checkpoint ${checkpoint} updated successfully`, 
                   checkPoint1: user.checkPoint1,
                   checkPoint2: user.checkPoint2,
                   checkPoint3: user.checkPoint3
                 });
    } catch (error) {
        console.error("Error updating checkpoint:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

const level2completion = async (req, res) => {
    const { email } = req.body;
    try {
        // Find the user by email
        const user = await User.findOne({emails: { $in: email }});
    
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
    
        // Update the level 1 completion status
        user.level2 = true;
        await user.save();
    
        res.json({ message: "Level 2 completed" });
      } 
      catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
      }
};

const getLevel3Participants = async (req, res) => {
    try {
        // Find users who completed Level 1 and proceeded to Level 2
        const participants = await User.find(
            { level2: true }, // Checking both level statuses
            { name: 1, email: 1, Teamname: 1, points: 1, _id: 0 } // Fields to return
        ).sort({ points: -1 }); // Sort by points in descending order

        res.status(200).json(participants);
    } catch (error) {
        console.error("Error fetching Level 3 participants:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const eliminateParticipants = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        // Find the user by email
        const user = await User.findOne({ emails: { $in: email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the user is already eliminated
        if (user.eliminated) {
            return res.status(400).json({ message: "User is already eliminated" });
        }

        // Mark the user as eliminated
        user.eliminated = true;
        await user.save();

        res.status(200).json({ message: "Participant eliminated successfully", eliminated: true });
    } catch (error) {
        console.error("Error eliminating participant:", error);
        res.status(500).json({ message: "Server error" });
    }
};


const completeLevel3 = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ winner: false });
    }

    try {
        // Check if a winner already exists
        const existingWinner = await User.findOne({ winner: true });

        // Find the user attempting Level 3 completion
        const user = await User.findOne({ emails: { $in: email } });

        if (!user) {
            return res.status(404).json({ winner: false });
        }

        // Mark Level 3 as completed
        user.level3 = true;
        await user.save();

        if (existingWinner) {
            // If a winner already exists, don't make another winner
            return res.status(200).json({ winner: false });
        } else {
            // No winner exists, make this user the winner
            user.winner = true;
            await user.save();
            return res.status(200).json({ winner: true });
        }
    } catch (error) {
        console.error("Error updating Level 3 status:", error);
        res.status(500).json({ winner: false });
    }
};

const incrementMarks = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        // Find user by email
        const user = await User.findOne({ emails: { $in: email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Increment points by 50 and increase the question count
        user.points += 50;
        user.questions += 1;
        await user.save();

        res.status(200).json({ message: "Marks updated", points: user.points, questions: user.questions });
    } catch (error) {
        console.error("Error updating marks:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const getLevel2Leaderboard = async (req, res) => {
    try {
        // Find users who have completed Level 1 (moved to Level 2)
        const leaderboard = await User.find(
            { level1: true },  
            {
                Teamname: 1,
                points: 1,
                questions: 1,
                checkPoint1: 1,
                checkPoint2: 1,
                checkPoint3: 1,
                _id: 0
            }
        ).sort({ points: -1, questions: -1 });  

        res.status(200).json(leaderboard);
    } catch (error) {
        console.error("Error fetching Level 2 leaderboard:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const getLevel3Leaderboard = async (req, res) => {
    try {
        // Find users who have completed Level 2 (moved to Level 3)
        const leaderboard = await User.find(
            { level2: true },  
            { Teamname: 1, _id: 0 }  
        );

        res.status(200).json(leaderboard);
    } catch (error) {
        console.error("Error fetching Level 3 leaderboard:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


export { registerTeam, verifyUser , getUserdetails , updateMarks , level1completion , decrement , getTeams , getLevel2Participants , updateCheckpoint , getLevel3Participants , level2completion , eliminateParticipants , completeLevel3 , incrementMarks , getLevel2Leaderboard , getLevel3Leaderboard};