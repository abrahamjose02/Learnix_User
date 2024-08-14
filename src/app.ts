import { connectDB } from "./config/db";
import RabbitMQClient from './events/rabbitMQ/client';


class App{
    constructor(){
       this.initializeRabbitMQ();
       this.connectDatabase();
    }
    private initializeRabbitMQ():void {
        RabbitMQClient.initialize();
    }

    private connectDatabase():void{
        connectDB()
    }
}

export default App