
import express from 'express';
import cors from 'cors';
import mainRouter from './routes/index';
import globalErrorHandler from './middleware/globalErrorHandler';
import AppError from './utils/appError';
import helmet from 'helmet';

const app = express();

app.use(helmet())
app.use(cors());
app.use(express.json());

app.use('/api/v1', mainRouter);


app.use((req, res, next) => {
    next(new AppError("Route not found.", 404));
});
app.use(globalErrorHandler);

export default app;