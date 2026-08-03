import mongoose from "mongoose";
import logger from "../utils/logger";
import { MONGODB_URI } from "./env";

const connectDB =async (): Promise<void>=>{
    try {

       
        await mongoose.connect(MONGODB_URI as string);
        logger.info('MongoDB connected successfully');
       

    } catch (error) {
        logger.error(error,'Error connecting to MongoDB:');
        process.exit(1); 
    }
}

export default connectDB;