import mongoose, {Document,Schema} from 'mongoose'

export interface IFolder extends Document {
    name:string,
    owner:mongoose.Types.ObjectId,
}

const folderSchema=new Schema<IFolder>({
    name:{
    type:String,
    required:[true,'Folder name is required'],
    trim:true,
    maxlength:[100,'Folder name cannot exceed 100 characters']
},
owner:{
    type:Schema.Types.ObjectId,
    ref:"User",
    required:[true,'Folder must have owner']
}
},{
    timestamps:true
})

const Folder= (mongoose.models.Folder as mongoose.Model<IFolder>) || mongoose.model<IFolder>('Folder',folderSchema);

export default Folder;