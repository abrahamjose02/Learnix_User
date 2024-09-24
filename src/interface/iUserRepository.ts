
import { User } from "../model/user.entities";

import { IUser } from "../model/schema/userSchema";


export interface IUserRepository{
    register(userData:User) : Promise<IUser | null>;
    findOne(email:string) :Promise<IUser | null>;
    findbyId(id:string) : Promise <IUser | null>;
    findbyIdAndUpdate(id:string,name:string) : Promise <IUser | null>
    avatarUpdate(id:string,avatar:string) : Promise <IUser | null>
    updatePassword(id:string , password:string) : Promise <IUser | null>
    getUsers():any;
    getInstructors():any;
    deleteUser(id:string):Promise<Object>
    updateResetToken(userId:string,resetToken:string,resetCode:string):Promise<IUser | null>
    clearResetToken(userId:string):Promise<IUser | null>
    updateUserRole(userId:string,newRole:string):Promise<IUser | null>
    updateCourseList(userId: string, courseId: string): Promise<IUser | null>;
    updateVerificationStatus(userId: string): Promise<IUser | null>;
    blockUser(userId:string):Promise<IUser | null>
    UnBlockUser(userId:string):Promise<IUser | null>
    getUserAnalytics(instructorId:string):Promise<Object[] | null>
}