
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
    
}