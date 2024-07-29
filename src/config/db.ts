import mongoose from "mongoose";

import 'dotenv/config'

const connectDB = async()=>{
    try {
        const uri = `${process.env.MONGO_URI}/${process.env.MONGO_DATA}`
        const conn =  await mongoose.connect(uri)
        console.log(`UserDb Connected : ${conn.connection.host}`)
    } catch (error:any) {
        console.log(error.message)
        process.exit(1)
    }
}

export {connectDB}