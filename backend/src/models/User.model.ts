import mongoose, { Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";
import { BCRYPT_SALT_ROUNDS } from "../config/env";


export interface IUser extends Document {
  name: string;
  email: string;
  password: string;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

interface IUserModel extends Model<IUser> {}

const userSchema = new mongoose.Schema<IUser>({
    name:{
        type: String,
        required: [true, "Name is required"],
        minlength:  [3, "Name must be at least 3 characters long."],
        trim: true,
    },
    email:{
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        validate:{
            validator: function(value:string):boolean{
                return validator.isEmail(value);
            },
               message: "Please provide a valid email address"
        }
    },
    password:{
        type: String,
        required:[true, "Password is required"],
        minlength:  [8, "Password must be at least 8 characters long."],
        select: false,
    }
}, { timestamps: true });

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
    return  bcrypt.compare(enteredPassword, this.password);
}

const User = (mongoose.models.User as IUserModel) || mongoose.model<IUser, IUserModel>("User", userSchema);

export default User;