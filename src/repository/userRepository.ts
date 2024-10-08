
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
          return await UserModel.findByIdAndUpdate(id, { avatar });
        } catch (e: any) {
          throw new Error("db error");
        }
      }
    async updateResetToken(userId: string, resetToken: string, resetCode: string): Promise<IUser | null> {
        try {
            const expirationTime = new Date();
            expirationTime.setMinutes(expirationTime.getMinutes()+5);

            return await UserModel.findByIdAndUpdate(userId,{
                resetToken,
                resetCode,
                resetTokenExpires:expirationTime
            },{new:true});
        } catch (e:any) {
            throw new Error('db error')
        }
    }

    async clearResetToken(userId: string): Promise<IUser | null> {
        try {
            return await UserModel.findByIdAndUpdate(userId,{$unset:{resetToken:1,resetCode:1,resetTokenExpires:1}},{new:true})            
        } catch (e:any) {
            throw new Error("db error")
        }
    }

    async updateUserRole(userId:string,newRole:string):Promise<IUser | null>{
        try {
            const user = await UserModel.findByIdAndUpdate(userId,{role:newRole},{new:true});
            return user;
        } catch (e:any) {
            throw new Error('db error')
        }
    }
    async updateCourseList(
        userId: string,
        courseId: string
      ): Promise<IUser | null> {
        try {
          const user = await UserModel.findById(userId);
          user?.courses.push({ courseId });
          await user?.save();
          return null;
        } catch (e: any) {
          throw new Error("db error");
        }
      }
      async updateVerificationStatus(userId: string): Promise<IUser | null> {
        try {
            const user = await UserModel.findByIdAndUpdate(
                userId,
                { isVerified: true },
                { new: true }
              );
              return user;
        } catch (error) {
            console.error("Error updating verification status:", error);
            return null;
        }
    }
    async blockUser(userId: string): Promise<IUser | null> {
        try {
            const user = await UserModel.findByIdAndUpdate(
                userId,
                {isBlocked:true},
                {new:true}
            );
            return user;
        } catch (e:any) {
            console.error("Error blocking user:", e);
            return null;
        }
    }

    async UnBlockUser(userId: string): Promise<IUser | null> {
        try {
            const user = await UserModel.findByIdAndUpdate(
                userId,
                {isBlocked:false},
                {new:true}
            )
            return user
        } catch (e:any) {
            console.error("Error blocking user:", e);
            return null;
        }
    }

    async getUserAnalytics(instructorId: string): Promise<Object[] | null> {
        try {
          const twelveMonthsAgo = new Date();
          twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
          const matchStage: any = {
            $match: {
              createdAt: { $gte: twelveMonthsAgo },
            },
          };
          if (instructorId !== "admin") {
            matchStage.$match.instructorId = instructorId;
          }
    
          const response = await UserModel.aggregate([
            matchStage,
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                count: { $sum: 1 },
              },
            },
          ]);
    
          return response || [];
        } catch (e: any) {
          throw new Error("db error");
        }
      }

}