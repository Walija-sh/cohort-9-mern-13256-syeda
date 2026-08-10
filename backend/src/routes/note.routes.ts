import {Router} from "express";
import protect from "../middleware/protect.middleware";
import { createNote, deleteNote, getAllNotes, getNoteById, updateNote } from "../controllers/note.controller";
const noteRouter=Router();

noteRouter.use(protect);
noteRouter.post("/",createNote);
noteRouter.get("/",getAllNotes);
noteRouter.get("/:id",getNoteById);
noteRouter.patch("/:id",updateNote);
noteRouter.delete("/:id",deleteNote);

export default noteRouter;

