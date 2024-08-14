import { Channel,ConsumeMessage } from "amqplib";
import MessageHandler from "./messageHandler";

export default class Consumer{
    constructor(private channel:Channel,private rpcQueue:string){}

    async consumeMessage(){
        console.log('Ready to consume user-Messages...')

        this.channel.consume(this.rpcQueue,async(message:ConsumeMessage | null)=>{
            if(message){
                if(message.properties){
                    const{correlationId,replyTo} = message.properties
                    const operation = message.properties.headers?.function;
                    if(!correlationId || !replyTo){
                        console.log('Missing some properties...')
                        return;
                    }
                    if(message.content){
                        await MessageHandler.handle(
                            operation,
                            JSON.parse(message.content.toString()),
                            correlationId,
                            replyTo
                        );
                    }else{
                        console.log('Recieved message content is null or undefined')
                    }
                }
                else{
                    console.log('Recieved message is null')
                }
            }
            else{
                console.log('Missing some properties')
            }
        },{noAck:true});
    }
}