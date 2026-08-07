import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import {NextFunction, Request, Response} from 'express';
import Note, {IProseMirrorDocument} from '../models/Notes.model';
import mongoose from 'mongoose';
import { ParamsDictionary } from 'express-serve-static-core';
import Folder from '../models/Folder.model';

interface CreateNoteBody {
  title?: unknown;
  content?: unknown;
  parentFolder?: string | null;
}
interface UpdateNoteBody {
  title?: unknown;
  content?: unknown;
  parentFolder?: string | null;
}

async function resolveParentFolder(
  parentFolder: unknown,
  userId: mongoose.Types.ObjectId | undefined,
  next: NextFunction
): Promise<mongoose.Types.ObjectId | null | undefined> {
  if (parentFolder === undefined) return undefined;
  if (parentFolder === null) return null;            

  if (typeof parentFolder !== "string" || !mongoose.Types.ObjectId.isValid(parentFolder)) {
    next(new AppError("Invalid parentFolder id", 400));
    return undefined;
  }

  const folder = await Folder.findOne({ _id: parentFolder, owner: userId });
  if (!folder) {
    next(new AppError("Parent folder not found", 404));
    return undefined;
  }

  return new mongoose.Types.ObjectId(parentFolder);
}

const createNote=catchAsync(async(req: Request<{}, {}, CreateNoteBody>,res:Response,next:NextFunction)=>{

  const {title,content,parentFolder}=req.body;

  const userId=req.user?._id;

  if(typeof title !== "string" ){
    return next(new AppError("Title is required",400));
  }
  if( title.trim()===""){
    return next(new AppError("Title can't be empty",400));
  }

   let resolvedParent: mongoose.Types.ObjectId | null = null;
    if (parentFolder !== undefined && parentFolder !== null) {
      const result = await resolveParentFolder(parentFolder, userId, next);
      if (result === undefined) return; // error already sent
      resolvedParent = result;
    }

  const note=await Note.create({
    title,
    content:content as IProseMirrorDocument,
    owner:userId,
    parentFolder: resolvedParent
  });
    
    res.status(201).json({
  "success": true,
  "message": "Note created successfully",
  data:{
    note
  }
})
})
const getAllNotes=catchAsync(async(req: Request,res:Response)=>{

  const userId=req.user?._id;
  const parentFolder=req.query.parentFolder as string | undefined;

  let notes;
  if(parentFolder !== undefined){
notes=await Note.find({owner:userId,parentFolder:parentFolder}).sort({createdAt:-1})
  }else{
    notes=await Note.find({owner:userId,parentFolder:null}).sort({createdAt:-1})
  }


  

    res.status(200).json({
  "success": true,
  results: notes.length,
  data:{
    notes
  }
})
})
const getNoteById=catchAsync(async(req: Request,res:Response,next:NextFunction)=>{

  const noteId=req.params.id;
  const userId=req.user?._id;

  const note=await Note.findOne({_id:noteId,owner:userId});

  if(!note){
    return next(new AppError("Note not found",404));
  }
    
    res.status(200).json({
  "success": true,
  data:{
    note
  }
})
})
const updateNote=catchAsync(async(req: Request<ParamsDictionary, {}, UpdateNoteBody>,res:Response,next:NextFunction)=>{

  const noteId=req.params.id;
  const userId=req.user?._id;
  const {title,content,parentFolder}=req.body ?? {};

  let updateFields: { title?: string; content?: IProseMirrorDocument, parentFolder?: mongoose.Types.ObjectId | null } = {};

  if(title === undefined && content === undefined && parentFolder ===undefined) {
    return next(new AppError("Please provide at least one field to update",400));
  }

  if(title !== undefined){
      if(typeof title !== "string" ){
    return next(new AppError("Title must be a string",400));
  }
  if( title.trim()===""){
    return next(new AppError("Title can't be empty",400));
  }
  updateFields.title = title;
  }

  if(content !== undefined) {
    updateFields.content = content as IProseMirrorDocument;
  }

  if (parentFolder !== undefined) {
      const result = await resolveParentFolder(parentFolder, userId, next);
      if (result === undefined && parentFolder !== null) return; 
      updateFields.parentFolder = result ?? null;
    }
  
  const note=await Note.findOneAndUpdate({_id:noteId,owner:userId},updateFields,{new:true,runValidators:true});

  if(!note){
    return next(new AppError("Note not found",404));
  }
    
    res.status(200).json({
  "success": true,
  "message": "Note updated successfully",
  data:{
    note
  }
})

})

const deleteNote=catchAsync(async(req: Request,res:Response,next:NextFunction)=>{

  const noteId=req.params.id;
  const userId=req.user?._id;

  const note=await Note.findOneAndDelete({_id:noteId,owner:userId});

  if(!note){
    return next(new AppError("Note not found",404));
  }
    
    res.status(200).json({
  "success": true,
  "message": "Note deleted successfully"
})
})


export {createNote,getAllNotes,getNoteById,updateNote,deleteNote};  