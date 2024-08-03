import { connectDB } from "./config/db";
import RabbitMQClient from './events/rabbitMQ/client';


class App{
    constructor(){
        RabbitMQClient.initialize();
        connectDB()
    }
}

export default App