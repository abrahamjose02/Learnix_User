
import { User } from "../../model/user.entities";
import jwt,{Secret } from "jsonwebtoken";
import 'dotenv/config'

 export interface IResetToken{
    token:string,
    resetCode:string,
}

export const createResetToken = (user:any) : IResetToken =>{
    const resetCode = Math.floor(1000+Math.random()*9000).toString();
    const token = jwt.sign(
        {user,resetCode},
        process.env.JWT_SECRET as Secret,
        {
            expiresIn:'5m',
        }
    );
    return {token,resetCode};
}