
import { IUserService } from "../interface/iUserInterface";
import { IUserRepository } from "../interface/iUserRepository";
import { User } from "../model/user.entities";
import jwt,{Secret } from "jsonwebtoken";
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { createActivationToken } from "./utils/activationToken";



export class UserService implements IUserService{
    private repository:IUserRepository

    constructor(repository:IUserRepository){
        this.repository = repository;
    }

    async userRegister(userData: User) {
        try {
          const isEmailExist = await this.repository.findOne(userData.email);
          if (isEmailExist) {
            if (!userData.avatar) {
              throw new Error("Email Already Exists");
            } else {
              const accessToken = isEmailExist.SignAccessToken();
              const refreshToken = isEmailExist.SignRefreshToken();
              return { accessToken, refreshToken, user: isEmailExist };
            }
          } else {
            if (!userData.avatar) {
              const activationToken = createActivationToken(userData);
              return activationToken;
            }
            const user = await this.repository.register(userData);
            const accessToken = user?.SignAccessToken();
            const refreshToken = user?.SignRefreshToken();
            return { accessToken, refreshToken, user };
          }
        } catch (err) {
          return null;
        }
      }

    async userLogin(email: string, password: string) {
        try {
            const user = await this.repository.findOne(email)
            if(!user){
                throw new Error('invalid Email')
            }
            const isPassword = await user.comparePassword(password)
            if(!isPassword){
                throw new Error('Password incorrect')
            }
            const accessToken = user.SignAccessToken()
            const refreshToken = user.SignRefreshToken()
            return {accessToken,refreshToken,user}
        } catch (err) {
            return null;
        }
    }

    async activateUser(data: { token: string; activationCode: string; }) {
        try {
            const{token,activationCode}  = data
            const newUser = jwt.verify(token,process.env.JWT_SECRET as Secret) as {
                user:User;
                activationCode:string;
            };
            if(newUser.activationCode !== activationCode){
                throw new Error('Invalid Code')
            }
            const existingUser = await this.repository.findOne(newUser.user.email)
            if(existingUser){
                return null
            }
            return this.repository.register(newUser.user);
        } catch (err) {
            return null
        }
    }

    async getUser(id: string): Promise<User | any> {
        try {
            const user = await this.repository.findbyId(id)
            return user;
        } catch (err) {
            return null
        }
    }

    async updatePassword(oldPassword: string, newPassword: string, userId: string) {
        try {
            const user = await this.repository.findbyId(userId)
            const isPasswordMatch = await user?.comparePassword(oldPassword)
            if(!isPasswordMatch){
                throw new Error('Password not match')
            }
            const password = await bcrypt.hash(newPassword || "",10);
            await this.repository.updatePassword(userId,password)
        } catch (err) {
            return null
        }
    }

    async updateUserInfo(id: string, name: string) {
        try {
            const user = await this.repository.findbyIdAndUpdate(id,name)
            if(user){
                const response = {status:201,msg:'User info and updated successfully'};
                return response
            }
        } catch (err) {
            return null
        }
    }
    
}