import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';

import User from '../models/User.model';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

interface JwtPayload {
  id: string;
}
const protect = catchAsync(async (req:Request, res:Response, next:NextFunction): Promise<void> => {

    const token = req.cookies.token;
    if (!token) {
      return next(new AppError('Missing token',401));
    }
    let decoded:JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    } catch (err) {
      return next(new AppError('Invalid or expired token',401));
    }

    const user = await User.findById(decoded.id).select('-password');;
    if (!user) {
      return next(new AppError('User no longer exists',401));
    }

    req.user = user;
    next();
  
});


export default protect;


