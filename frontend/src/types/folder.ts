import type { Note } from "./note";

export interface Folder {
  _id: string;
  name: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface FolderResponse {
  success: boolean;
  message?: string;
  data: {
    folder: Folder;
  };
}

export interface FoldersResponse {
  success: boolean;
  results: number;
  data: {
    folders: Folder[];
  };
}

export interface CreateFolderPayload {
  name: string;
}

export interface UpdateFolderPayload {
  name: string;
}

export interface ExplorerRootResponse {
  success: boolean;
  results: number;
  data: {
    folders: Folder[];
    notes: Note[];
  };
}

export interface ExplorerFolderResponse {
  success: boolean;
  results: number;
  data: {
    folder: Folder;
    notes: Note[];
  };
}