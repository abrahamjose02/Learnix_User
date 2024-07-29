import { Channel,Connection,connect } from "amqplib";
import rabbitmqConfig from "../../config/rabbitmq";
import Producer from "./producer";
import Consumer from "./consumer";

class RabbitMQClient{
    private constructor(){}
    private static instance : RabbitMQClient;
    private isInitialized = false;
    private producer:Producer | undefined;
    private consumer:Consumer | undefined;
    private connection:Connection | undefined;
    private produceChannel:Channel | undefined;
    private consumerChannel:Channel | undefined;

    public static getInstance(){
        if(!this.instance){
            this.instance = new RabbitMQClient()
        }
        return this.instance;
    }

    async initialize(){
        if(this.isInitialized){
            return ;
        }
        try {
            this.connection = await connect(rabbitmqConfig.rabbitMQ.url)
            this.produceChannel = await this.connection.createChannel();
            this.consumerChannel = await this.connection.createChannel();

            const{queue:rpcQueue} = await this.consumerChannel.assertQueue(
                rabbitmqConfig.rabbitMQ.queues.userQueues,
                {exclusive:true}
            );
            this.producer = new Producer(this.produceChannel)
            this.consumer = new Consumer(this.consumerChannel,rpcQueue);

            this.consumer.consumeMessage();
            this.isInitialized = true;
        } catch (error) {
            console.log("rabbitmq error...", error);
        }
    }

    async produce(data:any,correlationId:string,replyToQueue:string){
        if(!this.isInitialized){
            await this.initialize()
        }
        return await this.producer?.produceMessages(
            data,
            correlationId,
            replyToQueue
        )
    }
}

export default RabbitMQClient.getInstance()