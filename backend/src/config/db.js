import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const connectToDatabase = async () =>{
    try{
        const url = process.env.MONGO_URL
        const port = process.env.MONGO_PORT
        const user = process.env.MONGO_USER
        const password = process.env.MONGO_PASSWORD
        const db = process.env.MONGO_DB
        const connectionString = `mongodb://${user}:${password}@${url}:${port}/${db}`
        await mongoose.connect(connectionString)
        console.log('MongoDB connected');
        
    }
    catch(error){
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }

}


export default connectToDatabase