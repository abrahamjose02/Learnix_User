
import 'dotenv/config'

export default{
    rabbitMQ:{
        url:String(process.env.RabbitMQ_link),
        queues:{
            userQueues: "user_queue"
        }
    }
}