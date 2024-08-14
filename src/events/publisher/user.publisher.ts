
import amqp from 'amqplib'
import 'dotenv/config'

const publisher = async(queue:string,data:{})=>{
    try {
        const url = process.env.RabbitMQ_link as string
        const connection = await amqp.connect(url)
        const channel = await connection.createChannel()
        await channel.assertQueue(queue)
        channel.sendToQueue(queue,Buffer.from(JSON.stringify(data)))
        await channel.close()
        await connection.close()        
    } catch (err) {
        console.log(err)
    }
}

//sending activation data from user to notification service

export default{
    ActivationCode : async(data:any)=>{
        try {
            const queue = 'activation-code'
            publisher(queue,data)
        } catch (error) {
            console.log(error)
        }
    },

    ResetCode: async(data:any)=>{
        try {
            const queue = 'reset-code'
            publisher(queue,data);
        } catch (error) {
            console.log(error)
        }
    }
}