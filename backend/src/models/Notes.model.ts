import mongoose , {Document, Schema} from "mongoose";

export interface IProseMirrorNode {
  type: string;
  content?: IProseMirrorNode[];
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
}

export interface IProseMirrorDocument{
    type:string,
    content?:IProseMirrorNode[]
}

export interface INotes extends Document{
    title:string,
    content: IProseMirrorDocument,
    owner: mongoose.Types.ObjectId,
    parentFolder?: mongoose.Types.ObjectId | null
}

function isValidAttrs(attrs: unknown): boolean {
  return typeof attrs === "object" && attrs !== null && !Array.isArray(attrs);
}

function isValidMark(mark: unknown): mark is { type: string; attrs?: Record<string, unknown> } {
  if (typeof mark !== "object" || mark === null || Array.isArray(mark)) return false;
  const m = mark as Record<string, unknown>;

  if (typeof m.type !== "string" || m.type.trim() === "") return false;
  if (m.attrs !== undefined && !isValidAttrs(m.attrs)) return false;

  return true;
}

function isValidNode(node: unknown): node is IProseMirrorNode {
  if (typeof node !== "object" || node === null || Array.isArray(node)) return false;
  const n = node as Record<string, unknown>;

  if (typeof n.type !== "string" || n.type.trim() === "") return false;

  if (n.text !== undefined && typeof n.text !== "string") return false;

  if (n.attrs !== undefined && !isValidAttrs(n.attrs)) return false;

  if (n.content !== undefined) {
    if (!Array.isArray(n.content)) return false;
    if (!n.content.every(isValidNode)) return false;
  }

  if (n.marks !== undefined) {
    if (!Array.isArray(n.marks)) return false;
    if (!n.marks.every(isValidMark)) return false;
  }

  return true;
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
   validator: function (value: unknown): boolean {
        if (typeof value !== "object" || value === null) return false;
        const doc = value as Record<string, unknown>;

        if (doc.type !== "doc") return false;
        if (doc.content === undefined) return true;
        if (!Array.isArray(doc.content)) return false;

        return doc.content.every(isValidNode);
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