import mongoose from "mongoose";

const teammateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true }
});

const userSchema=new mongoose.Schema(
    {
        Teamname: { type: String, required: true , unique:false }, // Unique team name
        teammates: { type: [teammateSchema], required: true }, // Array of teammates
        password:{
            type:String,
            required:true
        },
        emails:{
            type:[String],
            required:true
        },
        points: { 
            type: Number, 
            default: 100 
        } ,  
        level1:{
          type:Boolean,
          default:false
            
        },
        level2:{
            type:Boolean,
            default:false
        },
        level3:{
            type:Boolean,
            default:false
        },
        gridNumber:{
            type: Number,
            required:true
        },
        uniqueNumber: {
            type: String,
            required:true
        },
        questionsArray: {
            type: [[Number]],  // Array of arrays of numbers
            required: true
        },
        checkPoint1: {
            type:Boolean,
            default:false
        },
        checkPoint2: {
            type:Boolean,
            default:false
        },
        checkPoint3: {
            type:Boolean,
            default:false
        },
        eliminated: { 
            type: Boolean, 
            default: false 
        },
        winner: { 
            type: Boolean, 
            default: false 
        }, 
        questions: { 
            type: Number, 
            default: 0 
        },
        runner: { 
            type: Boolean, 
            default: false 
        }
    }
)
const User=mongoose.model("User",userSchema);





export default User;