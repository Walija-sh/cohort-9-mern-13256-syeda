import {Router} from 'express';
import healthRouter from './health.routes';

const mainRouter: Router = Router();

mainRouter.use('/health', healthRouter);

export default mainRouter;