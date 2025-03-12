import express from "express";
import connectdb from "./db.js"
import cors from "cors";
import bodyParser from 'body-parser';
import dotenv from "dotenv"
import User from "./User.js"; // ✅ Import User Model
import { registerTeam,verifyUser , getUserdetails , updateMarks , level1completion , decrement , getTeams , getLevel2Participants , updateCheckpoint , getLevel3Participants , level2completion , eliminateParticipants , completeLevel3 , incrementMarks , getLevel3Leaderboard,getLevel2Leaderboard, addRunner,getWinner} from "./controller.js";

const app = express();
dotenv.config();
// app.use(cors());
app.use(bodyParser.json());

// Or restrict to your frontend's origin (recommended for production)
app.use(cors({
    origin: ["http://localhost:5173","https://cresence2k25.onrender.com","https://geniusgateway2k25.vercel.app"],// Replace with your frontend URL
    methods: ["GET", "POST"],
    credentials: true // If you are using cookies or authentication
}));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
connectdb();
app.post("/createUser",registerTeam);
app.post("/loginUser",verifyUser);
app.post("/access",getUserdetails);
app.post("/marks",updateMarks);
app.get("/winner",getWinner);
app.post("/completion1",level1completion);
app.post("/completion2",level2completion);
app.post("/decrementMarks",decrement);
app.get("/teams", getTeams);
app.get("/level2participants",getLevel2Participants );
app.get("/level3participants",getLevel3Participants );
app.post("/checkpoints",updateCheckpoint );
app.post("/level3completion",completeLevel3);
app.post("/eliminated",eliminateParticipants );
app.post("/questions",incrementMarks);
app.get("/l2leaderboard",getLevel2Leaderboard);
app.get("/l3leaderboard",getLevel3Leaderboard);
app.get("/runner",addRunner);

// console.log(process.env.SAMPLE);
const PORT=process.env.PORT||5000;
app.listen(PORT, () => console.log(`server running on port ${PORT}`))