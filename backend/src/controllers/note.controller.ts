import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import {NextFunction, Request, Response} from 'express';
import Note from '../models/Notes.model';


const createNote=catchAsync(async(req: Request,res:Response,next:NextFunction)=>{

  const {title,content}=req.body;

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
    owner:userId
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

  const notes=await Note.find({owner:userId}).sort({createdAt:-1})

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
  const {title,content}=req.body ?? {};

  let updateFields: { title?: string; content?: unknown } = {};

  if(title === undefined && content === undefined) {
    return next(new AppError("At least one field (title or content) is required to update",400));
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