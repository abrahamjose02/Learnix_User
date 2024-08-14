
import { IUserRepository } from "../interface/iUserRepository";
import UserModel, { IUser } from "../model/schema/userSchema";
import { User } from "../model/user.entities";


export class UserRepository implements IUserRepository{
   

    register(userData: User): Promise<IUser | null> {
        try {
            return UserModel.create(userData)
        } catch (e:any) {
            throw new Error("db error")
        }
    }
    async findOne(email: string): Promise<IUser | null> {
        try {
            const user = await UserModel.findOne({email})
            return user
        } catch (e:any) {
            throw new Error("db error")
        }
    }
    async findbyId(id: string): Promise<IUser | null> {
        try {
            const user = await UserModel.findById(id)
            return user;
        } catch (e:any) {
            throw new Error('db error')
        }
    }

    
    async findbyIdAndUpdate(id: string, name: string): Promise<IUser | null> {
        try {
            const user = await UserModel.findByIdAndUpdate(id,{name:name})
            return user
        } catch (e:any) {
            throw new Error ('db error')
        }
    }
    async updatePassword(id: string, password: string): Promise<IUser | null> {
        try {
            const user = await UserModel.findByIdAndUpdate(id,{password:password})
            return user;
        } catch (e:any) {
            throw new Error('db error')
        }
    }
    async deleteUser(userId: string): Promise<Object> {
        try {
            await UserModel.findByIdAndDelete(userId);
            return {success:true}
        } catch (e:any) {
            return {success:false,message:"Database error"}
        }
    }

    async getUsers() {
        try {
            const user = await UserModel.find({role:"user"});
            return user
        } catch (error) {
            throw new Error("db error");
        }
    }

    async getInstructors() {
        try {
            const instructors = UserModel.find({role:"instructor"});
            return instructors;
        } catch (error:any) {
            throw new Error("db error");
        }
    }
    async avatarUpdate(id: string, avatar: string): Promise<IUser | null> {
        try {
            return await UserModel.findByIdAndUpdate(id,{avatar});
        } catch (e:any) {
            throw new Error("db error");
        }
    }
}