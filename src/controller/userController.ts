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
              };
              const response = await this.service.userRegister(userData)
            if(!response){
                throw new Error('Email Exist')
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
                    status:201
                }
            }
        } catch (e:any) {
            console.log(e)
        }
    }
    activateUser = async(data:{token:string;activationCode:string}) =>{
        try {
           
            const response = await this.service.activateUser(data)
            if(!response){
                return{
                    msg:'Email Already Exist',
                    status:409
                };
            }
            else{
                return{msg:'Successfully registered',status:201}
            }
        } catch (e:any) {
            console.log(e)
        }
    }
    loginUser = async (email: string, password: string) => {
        try {
            const response = await this.service.userLogin(email, password);
    
            if (!response.success) {
                return {
                    msg: response.message,
                    status: 400, 
                };
            }
    
            return {
                msg: 'Login successful',
                data: {
                    accessToken: response.accessToken,
                    refreshToken: response.refreshToken,
                    user: response.user,
                },
                status: 200,
            };
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
    socialAuth = async(data:{name:string,email:string,avatar:string})=>{
        try {
            const userData = {
                name:data.name,
                email:data.email,
                avatar:data.avatar,
                role:UserRole.User,
                isVerified: false
            }
            const response = await this.service.userRegister(userData)
            if(response){
                return response
            }
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
    
    getUsers = async(data: any)=>{
        try {
            const response = await this.service.getUsers()
            return response
        } catch (e:any) {
            console.log(e)
        }
    }

    getInstructor = async(data: any)=>{
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
                status:201
            }
        } catch (e:any) {
            console.log(e)
        }
    }

    verifyResetCode =async(data:{token:string,resetCode:string}) =>{
        try {
            const response = await this.service.verifyResetCode(data)
            if (!response.success) {
                return {
                    msg: response.message,
                    status: 400,
                };
            }
            return {
                msg: 'Reset code verified successfully.',
                status: 200,
            };
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
}