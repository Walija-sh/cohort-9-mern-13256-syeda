import jwt from 'jsonwebtoken';
import { StringValue } from 'ms';
import { JWT_EXPIRES_IN, JWT_SECRET } from '../config/env';
const generateToken=(userId:string): string =>{
    return jwt.sign(
        {id:userId},
        JWT_SECRET as string,
        {expiresIn:JWT_EXPIRES_IN as StringValue}
    );
}

export default generateToken;