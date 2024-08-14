import { UserController } from "../../controller/userController";
import { UserRepository } from "../../repository/userRepository";
import { UserService } from "../../service/user.service";
import rabbitClient from './client'

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

export default class MessageHandler{
    static async handle(
        operation:string,
        data:any,
        correlationId:string,
        replyTo:string
    ){
        let response = data;
        console.log('The operation in user service is ',operation,data)
        try {
            switch(operation){
                case "register":
                    response = await userController.onRegister.bind(userController)(data);
                    break;
                
                case "activate":
                    response = await userController.activateUser.bind(userController)(data);
                    break;
                
                case "login":
                    response = await userController.loginUser.bind(userController)(data.email,data.password)
                    break;
    
                case "get-user":
                    response = await userController.getUser.bind(userController)(data.id)
                    break;
    
                case "social-auth":
                    response = await userController.socialAuth.bind(userController)(data)
                    break;
                
                case "update-user-info":
                    response = await userController.updateUserInfo.bind(userController)(data)
                    break;
    
                case "update-password":
                    response = await userController.updatePassword.bind(userController)(data)
                    break;

                case "get-all-users":
                    response = await userController.getUsers.bind(userController)(data);
                    break;
                
                case "get-all-instructors":
                    response = await userController.getInstructor.bind(userController)(data);
                    break;

                case "update-avatar":
                    response = await userController.updateAvatar.bind(userController)(data.fieldName,data.id,data.mimeType,data.data)
                    break;

                default:
                    response = 'Request-key not found';
                    break;
            }
        } catch (error:any) {
            console.error(`Error handling operation ${operation}:`, error);
        }
        
        await rabbitClient.produce(response, correlationId, replyTo);
    }
}