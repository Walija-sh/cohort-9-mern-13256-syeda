
import User from '../models/User.model'
import generateToken from '../utils/generateToken';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { Request, Response } from 'express';

interface RegisterBody {
    name: string;
    email: string;
    password: string;
}
interface LoginBody {
    email: string;
    password: string;
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

        const token= generateToken(user.id);


          
          res.status(201).json({
         "success": true,
  "message": "User registered successfully.",
         data: {
    id: user.id,
    name: user.name,
    email: user.email,
    token
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

        const token= generateToken(user.id);

          
          res.status(200).json({
        success: true,
        message:'Login User successfully',
         data: {
    id: user.id,
    name: user.name,
    email: user.email,
    token
  }
    })


})
const getMe = catchAsync(async (req:Request, res:Response) => {
    const user = req.user!;

    res.status(200).json({
        success: true,
        message: "Current user fetched successfully.",
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
    });
});

export {registerUser,loginUser,getMe}