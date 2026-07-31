import mongoose from "mongoose";
import logger from "../utils/logger";

const connectDB =async (): Promise<void>=>{
    try {

       
        await mongoose.connect(process.env.MONGODB_URI as string);
        logger.info('MongoDB connected successfully');
       

    } catch (error) {
        logger.error(error,'Error connecting to MongoDB:');
        process.exit(1); 
    }
}

export default connectDB;