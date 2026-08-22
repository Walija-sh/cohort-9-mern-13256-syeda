import type { JSONContent } from "@tiptap/core";

export interface Note {
  _id: string;
  title: string;
  content: JSONContent;
  owner: string;
  parentFolder: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NoteResponse {
  success: boolean;
  message?: string;
  data: {
    note: Note;
  };
}

export interface NotesResponse {
  success: boolean;
  results: number;
  data: {
    notes: Note[];
  };
}

export interface CreateNotePayload {
  title: string;
  content?: JSONContent;
  parentFolder?: string | null;
}

export interface UpdateNotePayload {
  title?: string;
  content?: JSONContent;
  parentFolder?: string | null;
}