import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import {NextFunction, Request, Response} from 'express';
import Note from '../models/Notes.model';
import mongoose from 'mongoose';

const createNote=catchAsync(async(req: Request,res:Response,next:NextFunction)=>{

  const {title,content,parentFolder}=req.body;

  const userId=req.user?._id;

  if(typeof title !== "string" ){
    return next(new AppError("Title is required",400));
  }
  if( title.trim()===""){
    return next(new AppError("Title can't be empty",400));
  }

  const note=await Note.create({
    title,
    content,
    owner:userId,
    parentFolder:parentFolder ?? null
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
const updateNote=catchAsync(async(req: Request,res:Response,next:NextFunction)=>{

  const noteId=req.params.id;
  const userId=req.user?._id;
  const {title,content,parentFolder}=req.body ?? {};

  let updateFields: { title?: string; content?: unknown, parentFolder?: mongoose.Types.ObjectId | null } = {};

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
    updateFields.content = content;
  }

  if(parentFolder !== undefined) {
    updateFields.parentFolder = parentFolder;
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