
import mongoose,{Document,Model,model,mongo,Schema} from "mongoose";
import  jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs'
import 'dotenv/config'
import { UserRole } from "../user.entities";

const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Interface defining the shape of the User document
export interface IUser extends Document{
    name:string;
    email:string;
    password?:string;
    avatar:{
        public_id:string;
        url:string;
    };
    role:UserRole;
    isVerified:boolean;
    isBlocked:boolean;
    courses:Array<{courseId:string}>;
    comparePassword:(password:string) => Promise<boolean>
    SignAccessToken:()=>string;
    SignRefreshToken:()=> string;
    resetToken:string,
    resetCode:string,
    resetTokenExpires:Date
}

const userSchema : Schema<IUser> = new mongoose.Schema(
    {
        name:{
            type:String,
            required:[true,"please enter your first name"]
        },
        email:{
            type:String,
            required:[true,"please enter your email"],
            validate:{
                validator: function(value:string){
                    return emailRegex.test(value)
                },
                message:'Please enter a valid email',
            },
            unique:true,
        },

        password:{
            type:String,
        },
        avatar:{
            type:String,
        },
        role:{
            type:String,
            enum:["user","admin","instructor"],
            default:UserRole.User,
        },
        isVerified:{
            type:Boolean,
            default:false,
        },
        isBlocked:{
            type:Boolean,
            default:false
        },
        courses:[
            {
                courseId:String
            },
        ],
        resetToken:{
            type:String
        },
        resetCode:{
            type:String
        },
        resetTokenExpires:{
            type:Date
        },
    },
    {
        timestamps:true
    }
)

//Hash Password

userSchema.pre<IUser>('save',async function(next){
    if(!this.isModified('password')){
        next();
    }
    this.password = await bcrypt.hash(this.password || "",10);
    next();
})

//Sign Acess Token

userSchema.methods.SignAccessToken = function(){
    return jwt.sign(
        {id:this._id,role:this.role},
        process.env.ACCESS_TOKEN || "",
        {
            expiresIn:"5m",
        }
    )
}

//Sign Refresh Token 

userSchema.methods.SignRefreshToken = function(){
    return jwt.sign(
        {id:this._id,role:this.role},
        process.env.REFRESH_TOKEN || "",
        {
            expiresIn:"3d"
        }
    )
}


userSchema.methods.comparePassword = async function(enteredPassword:string){
    return await bcrypt.compare(enteredPassword,this.password)
}



const UserModel : Model<IUser> = mongoose.model('User',userSchema)
export default UserModel