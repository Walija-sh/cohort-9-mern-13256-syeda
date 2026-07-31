
import express from 'express';
import cors from 'cors';
import mainRouter from './routes/index';
import globalErrorHandler from './middleware/globalErrorHandler';
import AppError from './utils/appError';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api/v1', mainRouter);
// 404 handler
app.use((req, res, next) => {
    next(new AppError("Route not found.", 404));
});
app.use(globalErrorHandler);

export default app;