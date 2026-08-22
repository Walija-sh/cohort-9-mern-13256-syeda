import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import noteService from "@/services/noteService";
import type { CreateNotePayload, Note, UpdateNotePayload } from "@/types/note";
import { getErrorMessage } from "@/utils/getErrorMessage";

interface NoteState {
  notes: Note[];
  currentNote: Note | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: NoteState = {
  notes: [],
  currentNote: null,
  isLoading: false,
  error: null,
};

export const createNote = createAsyncThunk<
  Note,
  CreateNotePayload,
  { rejectValue: string }
>("notes/createNote", async (payload, thunkAPI) => {
  try {
    const response = await noteService.createNote(payload);
    return response.data.note;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to create note."),
    );
  }
});

export const getAllNotes = createAsyncThunk<
  Note[],
  string | undefined,
  { rejectValue: string }
>("notes/getAllNotes", async (parentFolder, thunkAPI) => {
  try {
    const response = await noteService.getAllNotes(parentFolder);
    return response.data.notes;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to fetch notes."),
    );
  }
});

export const getNoteById = createAsyncThunk<
  Note,
  string,
  { rejectValue: string }
>("notes/getNoteById", async (id, thunkAPI) => {
  try {
    const response = await noteService.getNoteById(id);
    return response.data.note;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to fetch note."),
    );
  }
});

export const updateNote = createAsyncThunk<
  Note,
  { id: string; payload: UpdateNotePayload },
  { rejectValue: string }
>("notes/updateNote", async ({ id, payload }, thunkAPI) => {
  try {
    const response = await noteService.updateNote(id, payload);
    return response.data.note;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to update note."),
    );
  }
});

export const deleteNote = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("notes/deleteNote", async (id, thunkAPI) => {
  try {
    await noteService.deleteNote(id);
    return id;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to delete note."),
    );
  }
});

const noteSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentNote: (state) => {
      state.currentNote = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes.unshift(action.payload);
        state.currentNote = action.payload;
      })
      .addCase(createNote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create note.";
      })

      .addCase(getAllNotes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllNotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes = action.payload;
      })
      .addCase(getAllNotes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch notes.";
      })

      .addCase(getNoteById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getNoteById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentNote = action.payload;
      })
      .addCase(getNoteById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch note.";
      })

      .addCase(updateNote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        state.isLoading = false;

        const index = state.notes.findIndex(
          (note) => note._id === action.payload._id,
        );

        if (index !== -1) {
          state.notes[index] = action.payload;
        }

        state.currentNote = action.payload;
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update note.";
      })

      .addCase(deleteNote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes = state.notes.filter((note) => note._id !== action.payload);

        if (state.currentNote?._id === action.payload) {
          state.currentNote = null;
        }
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete note.";
      });
  },
});

export const { clearError, clearCurrentNote } = noteSlice.actions;

export default noteSlice.reducer;
