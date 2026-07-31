// JWT generator
import jwt from 'jsonwebtoken';
import { StringValue } from 'ms';
const generateToken=(userId:string): string =>{
    return jwt.sign(
        {id:userId},
        process.env.JWT_SECRET as string,
        {expiresIn:process.env.JWT_EXPIRES_IN as StringValue}
    );
}

export default generateToken;