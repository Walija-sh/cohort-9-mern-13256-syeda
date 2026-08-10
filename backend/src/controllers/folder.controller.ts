import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";
import Folder from "../models/Folder.model";
import Note from "../models/Notes.model";
import { ParamsDictionary } from "express-serve-static-core";
import mongoose from "mongoose";

interface CreateFolderBody {
  name?: unknown;
}

interface UpdateFolderBody {
  name?: unknown;
}

const createFolder=catchAsync(async(req: Request<{},{},CreateFolderBody>,res:Response,next:NextFunction)=>{
    const {name}=req.body;
    const userId=req.user?._id;

     if(typeof name !== "string" ){
        return next(new AppError("Folder Name is required",400));
      }
      if( name.trim()===""){
        return next(new AppError("Folder Name can't be empty",400));
      }

      

      const folder=await Folder.create({name,owner:userId});
      res.status(201).json({
        "success": true,
        "message": "Folder created successfully",
        data:{
          folder
        }
      })

})
const getAllFolders=catchAsync(async(req: Request,res:Response)=>{
    const userId=req.user?._id;
     const folders=await Folder.find({owner:userId}).sort({createdAt:-1})

      res.status(200).json({
  "success": true,
  "results": folders.length,
 data:{
    folders
 }
})
    
})
const getFolderById=catchAsync(async(req: Request,res:Response,next:NextFunction)=>{
    const folderId=req.params.id;
    const userId=req.user?._id;

    const folder=await Folder.findOne({_id:folderId,owner:userId});
    if(!folder){
        return next(new AppError("Folder not found",404));
    }
    res.status(200).json({
        "success": true,
        data:{
            folder
         }
    }) 
})
const updateFolder=catchAsync(async(req: Request<ParamsDictionary,{},UpdateFolderBody>,res:Response,next:NextFunction)=>{
    const folderId=req.params.id;
    const userId=req.user?._id;
    const {name}=req.body ?? {};

    let updateFields: { name?: string; } = {};

    if(name === undefined) {
        return next(new AppError("Please provide at least one field to update",400));
    }
     if(name !== undefined){
          if(typeof name !== "string" ){
        return next(new AppError("Name must be a string",400));
      }
      if( name.trim()===""){
        return next(new AppError("Name can't be empty",400));
      }
      updateFields.name = name;
      }

   
      
      const folder=await Folder.findOneAndUpdate({_id:folderId,owner:userId},updateFields,{new:true,runValidators:true});
      if(!folder){
        return next(new AppError("Folder not found",404));
      }

      res.status(200).json({
        success: true,
        message: "Folder updated successfully",
        data:{
            folder
        }
      })
})
const deleteFolder=catchAsync(async(req: Request,res:Response,next:NextFunction)=>{
    const folderId=req.params.id;
    const userId=req.user?._id;

    const session=await mongoose.startSession();

    try {
        session.startTransaction();
         const folder=await Folder.findOne(
            {_id:folderId,owner:userId},
            null,
            {session}
        );
    if(!folder){
        await session.abortTransaction();
        return next(new AppError("Folder not found",404));
    }
    await Note.deleteMany({parentFolder:folderId,owner:userId},{session});
    await folder.deleteOne({session});
    await session.commitTransaction();
    res.status(200).json({
        success: true,
        message: "Folder and its notes deleted successfully"
      })
        
    } catch (error) {
        await session.abortTransaction();
      throw error;
    }finally{
        session.endSession();
    }

    

   
})
const getExplorerContents=catchAsync(async(req: Request,res:Response,next:NextFunction)=>{
    const folderId=req.query.folderId as string | undefined;
    const userId=req.user?._id;

    if(folderId === undefined){
        const rootFolders=await Folder.find({owner:userId}).sort({createdAt:-1});
        const rootNotes=await Note.find({owner:userId,parentFolder:null}).sort({createdAt:-1});
        res.status(200).json({
            success: true,
               results: rootNotes.length,
            data:{
                folders:rootFolders,
                notes:rootNotes
            }
          })
    } else {
        const folder=await Folder.findOne({_id:folderId,owner:userId});
        if(!folder){
            return next(new AppError("Folder not found",404));
        }
        
        const notes=await Note.find({parentFolder:folderId,owner:userId}).sort({createdAt:-1});
        res.status(200).json({
            success: true,
            results: notes.length,
            data:{
                folder,
                notes:notes
            }
          })
    }
})

export {createFolder,getAllFolders,getFolderById,updateFolder,deleteFolder,getExplorerContents}