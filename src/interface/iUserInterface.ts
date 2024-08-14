
import { User } from "../model/user.entities";

export interface IUserService{
    userRegister(userData:User):any;
    activateUser(data:{
        token:string;
        activationCode:string
    }):any;
    getUser(id:string): Promise <User|any>;
    userLogin(email:string,password:string):any;
    updateUserInfo(id:string,name:string):any;
    updatePassword(oldPassword:string,newPassword:string,userId:string):any;
    updateAvatar(
        data:Buffer,
        fieldName:string,
        mimeType:string,
        id:string
    ):any
    getUsers():any;
    getInstructors():any;
    deleteUser(userId:string):any;
    forgotPassword(email:string):any;
    verifyResetCode(data:{
        token:string;
        resetCode:string
    }):any;
    resetPassword(userId:string,newPassword:string):any
}