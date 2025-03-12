import mongoose from 'mongoose'
import {config} from 'dotenv'


const connectToDatabase = async () =>{
    try{
        const url = config.get('MONGO_URL')
        const db = config.get('MONGO_DB')
        const port = config.get('MONGO_PORT')
        const user = config.get('MONGO_USER')
        const password = config.get('MONGO_PASSWORD')
        const connectionString = `mongodb://${user}:${password}@${url}:${port}/${db}`
        await mongoose.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        })
        console.log('MongoDB connected');
        
    }
    catch(error){
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }

}


export default connectToDatabase