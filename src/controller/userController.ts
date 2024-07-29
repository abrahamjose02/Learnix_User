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
    loginUser  = async(email:string,password:string)=>{
        try {
            const response = await this.service.userLogin(email,password)
            return response
            }
             catch (e:any) {
            console.log(e)
        }
    }
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
}
    