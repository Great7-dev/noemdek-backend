import mongoose from "mongoose";

export interface UserAttributes extends mongoose.Document{
    id:string;
    firstname: string;
    lastname: string;
    email:string;
    password:string;
    isAdmin:boolean;
    isVerified:boolean;
}



const UserInstance = new mongoose.Schema({
    firstname:{type: String, required:true},
    lastname:{type: String, required:true},
    email:{type: String, required:true, unique:true},
    password:{type: String, required:true},
    isVerified:{type: Boolean, required: false},
    isAdmin:{type:Boolean, required: false},
},{
    timestamps:true
});

export const User = mongoose.model<UserAttributes>('User', UserInstance);