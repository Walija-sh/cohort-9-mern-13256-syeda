import mongoose , {Document, Schema} from "mongoose";


export interface IProseMirrorDocument{
    type:string,
    content?:unknown[]
}

export interface INotes extends Document{
    title:string,
    content: IProseMirrorDocument,
    owner: mongoose.Types.ObjectId,
    parentFolder?: mongoose.Types.ObjectId | null
}

const notesSchema=new Schema<INotes>({
title:{
    type:String,
    required:[true,'Notes title is required'],
    trim:true,
    maxlength:[200,'Title cannot exceed 200 characters']
},
content:{
    type: Schema.Types.Mixed,
    default:{
    type: "doc",
    content: [],},
    validate:{
        validator:function (value: unknown): boolean {
    if (typeof value !== "object" || value === null) return false;

    const doc = value as IProseMirrorDocument;

    if (doc.type !== "doc") return false;
    if (!Array.isArray(doc.content)) return false;

    return true;
},
        message: "Invalid ProseMirror document"

    }
},
owner:{
    type:Schema.Types.ObjectId,
    ref:"User",
    required:[true,'Notes must have owner']
},
parentFolder:{
type:Schema.Types.ObjectId,
ref:"Folder",
default:null
}
},{
    timestamps:true
})

const Note= (mongoose.models.Note as mongoose.Model<INotes>) || mongoose.model<INotes>('Note',notesSchema);

export default Note;