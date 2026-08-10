import {Router} from 'express';
import healthRouter from './health.routes';
import authRouter from './auth.routes';
import noteRouter from './note.routes';
import folderRouter from './folder.route';

const mainRouter: Router = Router();

mainRouter.use('/health', healthRouter);
mainRouter.use("/auth", authRouter);
mainRouter.use("/notes", noteRouter);
mainRouter.use("/folders", folderRouter);

export default mainRouter;