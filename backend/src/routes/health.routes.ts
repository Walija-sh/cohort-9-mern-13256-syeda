
import { Router } from 'express'

const healthRouter: Router =Router();

healthRouter.get('/', (_req, res) => {
    res.status(200).json({ success: true, message: 'API is healthy' });
})

export default healthRouter;