import { IUserService } from "../interface/iUserInterface";
import publisher from '../events/publisher/user.publisher';
import { User, UserRole } from "../model/user.entities";


export class UserController{
    private service:IUserService;

    constructor(service:IUserService){
        this.service = service
    }

    onRegister = async(data:{name:string,email:string,password:string})=>{
        try {
            const userData: User = {
                name: data.name,
                email: data.email,
                password: data.password,
                avatar: "", 
                role: UserRole.User, 
                isVerified: false,
                isBlocked:false
              };
              const response = await this.service.userRegister(userData)
            if(!response.success){
               return response
            }
            else{
                const activationData = {
                    code:response.activationCode,
                    name:data.name,
                    email:data.email
                };
                publisher.ActivationCode(activationData)
                return{
                    msg:'Activation code send to the Email',
                    data:response,
                    status:201,
                    success:true
                }
            }
        } catch (e:any) {
            console.log(e)
        }
    }
    activateUser = async(data:{token:string;activationCode:string}) =>{
        try {
           
            const response = await this.service.activateUser(data)
            return response
        } catch (e:any) {
            console.log(e)
        }
    }
    loginUser = async (email: string, password: string) => {
        try {
            const response = await this.service.userLogin(email, password);
    
           return response
        } catch (e: any) {
            console.log(e);
            return {
                msg: 'Internal server error',
                status: 500,
            };
        }
    };
    getUser = async(id:string)=>{
        try {
            const response = await this.service.getUser(id)
            if(response){
                return response
            }
        } catch (e:any) {
            console.log(e)
        }
    }
    socialAuth = async(data: { name: string; email: string; avatar: string; })=>{
        try {
            const userData = {
                name: data.name,
                email: data.email,
                avatar: data.avatar,
                role: UserRole.User,
                isVerified: false,
                isBlocked:false
            }
            console.log(userData)
            const response = await this.service.userRegister(userData)
            console.log(response)
            return response
        } catch (e:any) {
            console.log(e)
        }
    }

    updateUserInfo  = async(data:{userId:string;name:string})=>{
        try {
            const response = await this.service.updateUserInfo(data.userId,data.name)
            if(response){
                return response
            }
        } catch (e:any) {
            console.log(e)
        }
    }

    updatePassword = async(data:{userId:string;oldPassword:string;newPassword:string})=>{
        try {
            const response = await this.service.updatePassword(data.oldPassword,data.newPassword,data.userId)
            if(response){
                return response
            }
        } catch (e:any) {
            console.log(e)
        }
    }
    
    getUsers = async()=>{
        try {
            const response = await this.service.getUsers()
            return response
        } catch (e:any) {
            console.log(e)
        }
    }

    getInstructor = async()=>{
        try {
            const response = await this.service.getInstructors()
            return response
        } catch (e:any) {
            console.log(e)
        }
    }

    deleteUser = async(userId:string)=>{
        try {
            const response = await this.service.deleteUser(userId);
            return response
        } catch (e:any) {
            console.log(e)
        }
    }

    updateAvatar = async(data: Buffer, fieldName: string, mimeType: string, id: string)=>{
        try {
            const response = await this.service.updateAvatar(
                data,
                fieldName,
                mimeType,
                id
            )
            return response            
        } catch (e:any) {
            console.log(e)
        }
    }

    forgotPassword = async(data:{email:string})=>{
        try {
            const response = await this.service.forgotPassword(data.email);
            if(!response.success){
                return response 
            }
            const resetData = {
                name:response.name,
                email:data.email,
                resetCode:response.resetCode,
                resetToken:response.resetToken
            }
            
            publisher.ResetCode(resetData);

            return{
                msg:"Reset code send to the Email",
                data:response,
                status:201,
                success:true
            }
        } catch (e:any) {
            console.log(e)
        }
    }

    verifyResetCode =async(data:{token:string,resetCode:string}) =>{
        try {
            const response = await this.service.verifyResetCode(data)
            return response
        } catch (e:any) {
            console.log(e)
        }
    }

    resetPassword = async(data:{userId:string;newPassword:string}) =>{
        try {
            const response = await this.service.resetPassword(data.userId, data.newPassword);
            if (!response.success) {
                return {
                    msg: response.message,
                    status: 400, 
                };
            }
            return {
                msg: 'Password reset successfully.',
                status: 200,
            };
        } catch (e:any) {
            console.log(e)
        }
    }

    async updateUserRole(data:{userId:string,newRole:string}){
        try {

            const validRoles = Object.values(UserRole) as string[];
            if(!validRoles.includes(data.newRole)){
                return {msg:'Invalid role provided',status:400};
            }

            const role = data.newRole as UserRole;

            const response = await this.service.updateUserRole(data.userId,role);

            if(!response.success){
                return {msg:response.message,status:400}
            }

            return {msg:"User role updated successfully",data:response.user,status:200};
            
        } catch (e:any) {
            console.log(e);
            return {
                msg: 'Internal server error',
                status: 500,
            };
        }
    }

    updateCourseList = async(data:{userId:string;courseId:string}) =>{
        try {
            const{userId,courseId} = data;

            const response = await this.service.updateCourseList(userId,courseId);
            if (!response.success) {
                return {
                    msg: response.message,
                    status: 400, 
                };
            }
            return {
                msg: 'Course List updated',
                status: 200,
                succes:true
            };
        } catch (e:any) {
            console.log(e);
            return {
                msg: 'Internal server error',
                status: 500,
                succes:false
            };
        }
    }
    verifyInstructor = async(id:string) =>{
        console.log("id",id);
        try {
            const response = await this.service.verifyInstructor(id);
            if (!response.success) {
                return response; 
            }
            return {
                msg: 'Instructor verified successfully',
                status: 200,
                success: true
            };
        } catch (e:any) {
            console.log(e);
            return { msg: 'Internal server error', status: 500 };
        }
    }

    blockUser = async(id:string) =>{
        try {
            const response = await this.service.blockUser(id);
            if(!response.succes){
                return response;
            }
            return {
                msg:"User has been blocked",
                success:true,
                status:200
            }
        } catch (e:any) {
            console.log(e);
            return { msg: 'Internal server error', status: 500 };
        }
    }

    unBlockUser = async(id:string)=>{
        try {
            const response = await this.service.unBlockUser(id);
            if(!response.succes){
                return response;
            }
            return {
                msg:"User has been UnBlocked",
                success:true,
                status:200
            }
        } catch (e:any) {
            console.log(e);
            return { msg: 'Internal server error', status: 500 };
        }
    }
}