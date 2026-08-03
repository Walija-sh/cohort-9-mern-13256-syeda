import 'dotenv/config';
import { PORT } from "./config/env";
import app from './app';
import connectDB from './config/db';
import logger from './utils/logger';


const startServer=async (): Promise<void>=>{
    try {
        await connectDB();
        const server=app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
server.on("error",(error)=>{
    logger.error(error);
    process.exit(1);
});

    } catch (error) {
       logger.fatal(error, "Failed to start server");
    process.exit(1);
    }
}


startServer();
