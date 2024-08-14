
import { IUserService } from "../interface/iUserInterface";
import { IUserRepository } from "../interface/iUserRepository";
import { User } from "../model/user.entities";
import jwt,{Secret } from "jsonwebtoken";
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { createActivationToken } from "./utils/activationToken";
import crypto from 'crypto'
import sharp from "sharp";
import { S3Params } from "./types/interface";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import {s3} from './utils/s3'
import { createResetToken } from "./utils/ResetToken";

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
            const user = await this.repository.findOne(email);
            console.log('Retrieved user:', user); // Log the retrieved user
    
            if (!user) {
                return { success: false, message: 'Invalid email' };
            }
    
            const isPasswordMatch = await user.comparePassword(password);
            console.log('Is password match:', isPasswordMatch); // Log the password comparison result
    
            if (!isPasswordMatch) {
                return { success: false, message: 'Incorrect password' };
            }
    
            const accessToken = user.SignAccessToken();
            const refreshToken = user.SignRefreshToken();
            return { success: true, accessToken, refreshToken, user };
        } catch (err) {
            console.error('Login error:', err); // Log the error
            return { success: false, message: 'Failed to login' };
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

    async getUsers() {
        return await this.repository.getUsers()
    }

  async  getInstructors() {
        return await this.repository.getInstructors()
    }
    
   async deleteUser(userId: string) {
        return await this.repository.deleteUser(userId)
    }

    async updateAvatar(data: Buffer, fieldName: string, mimeType: string, id: string) {
        const randomImageName = (bytes = 32) =>
            crypto.randomBytes(bytes).toString("hex");
        const bucketName = process.env.S3_BUCKET_NAME || "";
        const buffer = await sharp(data)
            .resize({height:600,width:600,fit:"cover"})
            .toBuffer();

        const imageName = `learnix-profile/${randomImageName}`;
        const params:S3Params = {
            Bucket:bucketName,
            Key:imageName,
            Body:buffer,
            ContentType:mimeType
        };

       const command = new PutObjectCommand(params);

       const rslt = await s3.send(command);
       const url = `https://user-avatar-info.s3.ap-south-1.amazonaws.com/${imageName}`;
       await this.repository.avatarUpdate(id,url)
       return {success:true};
    }

    async forgotPassword(email: string) {
        try {
            const user = await this.repository.findOne(email)
            if(!user){
                throw new Error("user not found")
            }

            const resetTokenData = createResetToken(user);

            await this.repository.updateResetToken(user.id,resetTokenData.token,resetTokenData.resetCode);

            return {
                success:true,
                name:user.name,
                message:"Reset code generated",
                resetCode:resetTokenData.resetCode,
                resetToken:resetTokenData.token
            }
        } catch (error) {
            console.log( error)
        }
    }

    async verifyResetCode(data: { token: string; resetCode: string }) {
        try {
            const { token, resetCode } = data;
            const decode = jwt.verify(token, process.env.JWT_SECRET as Secret) as {
                user: User;
                resetCode: string;
            };
    
            if (decode.resetCode !== resetCode) {
                throw new Error("Invalid reset code");
            }
    
            const user = await this.repository.findOne(decode.user.email);
            if (!user) {
                throw new Error("User not found");
            }
    
            if (user.resetToken !== token || new Date() > user.resetTokenExpires) {
                throw new Error("Invalid or expired reset token");
            }
    
            return { success: true, userId: user._id, message: "Reset token and code verified successfully" };
        } catch (e: any) {
            console.log(e);
            return { success: false, message: "Failed to verify reset code" };
        }
    }
    async resetPassword(userId: string, newPassword: string) {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
        const user = await this.repository.updatePassword(userId, hashedPassword);
        
        if (!user) {
            return { success: false, message: "User not found" };
        }

        await this.repository.clearResetToken(userId);
        return { success: true, message: "Password reset successfully" };
        } catch (e) {
            console.log(e)
            return { success: false, message: "Failed to reset password" };
        }
    }
}