import api from "@/lib/axios";
import type {
  CreateNotePayload,
  DeleteNoteResponse,
  NoteResponse,
  NotesResponse,
  UpdateNotePayload,
} from "@/types/note";

const createNote = async (
  payload: CreateNotePayload,
): Promise<NoteResponse> => {
  const response = await api.post<NoteResponse>("/notes", payload);
  return response.data;
};

const getAllNotes = async (parentFolder?: string): Promise<NotesResponse> => {
  const response = await api.get<NotesResponse>("/notes", {
    params: parentFolder ? { parentFolder } : undefined,
  });
  return response.data;
};

const getNoteById = async (id: string): Promise<NoteResponse> => {
  const response = await api.get<NoteResponse>(`/notes/${id}`);
  return response.data;
};

const updateNote = async (
  id: string,
  payload: UpdateNotePayload,
): Promise<NoteResponse> => {
  const response = await api.patch<NoteResponse>(`/notes/${id}`, payload);
  return response.data;
};

const deleteNote = async (id: string): Promise<DeleteNoteResponse> => {
  const response = await api.delete<DeleteNoteResponse>(`/notes/${id}`);
  return response.data;
};

const noteService = {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
};

export default noteService;
