import {Router} from "express";
import protect from "../middleware/protect.middleware";
import { createFolder, deleteFolder, getAllFolders,getFolderById, getExplorerContents, updateFolder } from "../controllers/folder.controller";

const folderRouter=Router();

folderRouter.use(protect);
folderRouter.post("/",createFolder);
folderRouter.get("/",getAllFolders);
folderRouter.get("/explorer", getExplorerContents);
folderRouter.get("/:id", getFolderById);
folderRouter.patch("/:id",updateFolder);
folderRouter.delete("/:id",deleteFolder);


export default folderRouter;

