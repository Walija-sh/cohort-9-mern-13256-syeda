
import express from 'express';
import cors from 'cors';
import mainRouter from './routes/index';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api/v1', mainRouter);

export default app;