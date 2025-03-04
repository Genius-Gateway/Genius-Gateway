import express from "express";
import connectdb from "./db.js"
import cors from "cors";
import bodyParser from 'body-parser';
import User from "./User.js"; // ✅ Import User Model
import { registerTeam,verifyUser , getUserdetails , updateMarks , level1completion , decrement , getTeams , getLevel2Participants } from "./controller.js";

const app = express();
// app.use(cors());
app.use(bodyParser.json());

// Or restrict to your frontend's origin (recommended for production)
app.use(cors({
    origin: ["http://localhost:5173","https://cresence2k25.onrender.com"],// Replace with your frontend URL
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
app.post("/completion",level1completion);
app.post("/decrementMarks",decrement);
app.get("/teams", getTeams);
app.get("/level2participants",getLevel2Participants );

app.listen(5000, () => console.log("server running on port 5000"))