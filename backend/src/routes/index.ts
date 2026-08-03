import {Router} from 'express';
import healthRouter from './health.routes';
import authRouter from './auth.routes';

const mainRouter: Router = Router();

mainRouter.use('/health', healthRouter);
mainRouter.use("/auth", authRouter);

export default mainRouter;