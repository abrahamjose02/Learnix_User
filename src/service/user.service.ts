
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
              return { success: false, message: "Email Already Exist!" };
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
            return { success: true, accessToken, refreshToken, user };
          }
        } catch (err) {
          return null;
    }
  }

      async userLogin(email: string, password: string) {
        try {
            const user = await this.repository.findOne(email);
            console.log('Retrieved user:', user); 
    
            if (!user) {
                return { success: false, message: 'Invalid email' };
            }

            if(user.isBlocked){
                return {success:false,message:"User has been blocked by Admin"}
            }
    
            const isPasswordMatch = await user.comparePassword(password);
            console.log('Is password match:', isPasswordMatch);
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
                return { success: false, message: 'Invalid activation code' };
            }
            const existingUser = await this.repository.findOne(newUser.user.email)
            if(existingUser){
                return { success: false, message: 'Email already Exist' };
            }
            await this.repository.register(newUser.user);
            return { success: true, message: 'User activated successfully' };
        } catch (err) {
            return null;
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
                return {success:false,message:"User not found"}
            }

            const resetTokenData = createResetToken(user);

            await this.repository.updateResetToken(user.id,resetTokenData.token,resetTokenData.resetCode);

            return {
                success:true,
                name:user.name,
                userId:user.id,
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
                return { success: false, message: "Invalid reset code" };
            }
    
            const user = await this.repository.findOne(decode.user.email);
            if (!user) {
                return { success: false, message: "User not found" };
            }
    
            if (user.resetToken !== token || new Date() > user.resetTokenExpires) {
                return { success: false, message: "Invalid or expired reset token" };
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
    async updateUserRole(userId: string, newRole: string) {
        try {
            const user = await this.repository.updateUserRole(userId,newRole);
            if(!user){
                return {success:false,message:"User not found"};
            }
            return {success:true,message:"User role updated successfully",user};
        } catch (err) {
            console.error('Error updating user role:', err);
            return { success: false, message: "Failed to update user role" };
        }
    }
    async updateCourseList(userId: string, courseId: string) {
        await this.repository.updateCourseList(userId, courseId);
        return {success:true,message:"Updated users-course list"};
      }
      
    async verifyInstructor(userId: string) {
        try {
            const user = await this.repository.findbyId(userId);
            if(!user){
                return {success:false,message:"Instructor not found"};
            }
            if(user.isVerified){
                return {success:true,message:"Instructor is already verified"}
            }
            await this.repository.updateVerificationStatus(userId)
        } catch (e:any) {
            console.log(e);
            return { success: false, message: "Failed to verify instructor" };
        }
    }

    async blockUser(userId: string) {
        try {
            const user = await this.repository.blockUser(userId)
        if(!user){
            return {success:false,message:"Admin failed to Block user"}
        }
        return {success:true,message:"User is blocked by Admin"};
        } catch (e:any) {
            console.log(e);
            return { success: false, message: "Failed to block user" };
        }
        
    }

    async unBlockUser(userId: string) {
        try {
            const user = await this.repository.UnBlockUser(userId);
            if(!user){
                return {success:false,message:"Admin failed to Unblock user"}
            }
            return {success:true,message:"User is Unblocked by Admin" , forceLogout: true};
        } catch (e:any) {
            console.log(e);
            return {success:false,message:"Failed to unblock user "}
        }
    }
}