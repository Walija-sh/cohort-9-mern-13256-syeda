
import User from '../models/User.model'
import generateToken from '../utils/generateToken';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { Request, Response,CookieOptions } from 'express';

interface RegisterBody {
    name: string;
    email: string;
    password: string;
}
interface LoginBody {
    email: string;
    password: string;
}

const isProduction=process.env.NODE_ENV==='production';

const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
}

const registerUser=catchAsync(
    async(req: Request<{}, {}, RegisterBody>,res:Response)=>{
    
    
 const {name,email,password}=req.body;
       

        if(!name || !email || !password ){
            
             throw new AppError(
        "Name, email and password are required.",
        400
    );
        }
         

        const existingUser=await User.findOne({email});
        if(existingUser){
            throw new AppError(
    "User already exists.",
    409
);
            
        }
         
        const trimmedPassword = password.trim();
        const user =await User.create({name,email,password:trimmedPassword});

        const token= generateToken(user._id.toString());

        res.cookie('token', token, cookieOptions);

          
          res.status(201).json({
         "success": true,
  "message": "User registered successfully.",
         data: {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  }
    })

  
    
}
)

const loginUser=catchAsync(async(req:Request<{}, {}, LoginBody>,res:Response)=>{
           const {email,password}=req.body;

        if( !email || !password ){
            
           throw new AppError(
    "Email and password are required.",
    400
);
        }
         

        const user=await User.findOne({email}).select('+password');
      
        
     if (!user || !(await user.comparePassword(password.trim()))) {
    throw new AppError(
        "Invalid email or password.",
        401
    );
}

        const token= generateToken(user._id.toString());

        res.cookie('token', token, cookieOptions);
          
          res.status(200).json({
        success: true,
        message:'Login User successfully',
         data: {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    
  }
    })


})
const getMe = catchAsync(async (req:Request, res:Response) => {
    const user = req.user!;

    res.status(200).json({
        success: true,
        message: "Current user fetched successfully.",
        data: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
        },
    });
});
const logOut = catchAsync(async (req:Request, res:Response) => {
   
    res.clearCookie('token',  {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
});

    res.status(200).json({
        success: true,
        message: "Current user Logged Out successfully."
    });
});

export {registerUser,loginUser,getMe,logOut}