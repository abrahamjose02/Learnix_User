
import { User } from "../../model/user.entities";
import jwt,{Secret } from "jsonwebtoken";
import 'dotenv/config'

 export interface IActivationToken{
    token:string,
    activationCode:string,
    success:boolean
}

export const createActivationToken = (user:User) : IActivationToken =>{
    const activationCode = Math.floor(1000+Math.random()*9000).toString();
    const token = jwt.sign(
        {user,activationCode},
        process.env.JWT_SECRET as Secret,
        {
            expiresIn:'5m',
        }
    );
    return {token,activationCode,success:true};
}