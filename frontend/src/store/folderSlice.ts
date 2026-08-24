import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import folderService from "@/services/folderService";
import type {
  CreateFolderPayload,
  ExplorerFolderResponse,
  ExplorerRootResponse,
  Folder,
  UpdateFolderPayload,
} from "@/types/folder";
import { getErrorMessage } from "@/utils/getErrorMessage";

interface FolderState {
  folders: Folder[];
  currentFolder: Folder | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: FolderState = {
  folders: [],
  currentFolder: null,
  isLoading: false,
  error: null,
};

export const createFolder = createAsyncThunk<
  Folder,
  CreateFolderPayload,
  { rejectValue: string }
>("folders/createFolder", async (payload, thunkAPI) => {
  try {
    const response = await folderService.createFolder(payload);
    return response.data.folder;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to create folder."),
    );
  }
});

export const getAllFolders = createAsyncThunk<
  Folder[],
  void,
  { rejectValue: string }
>("folders/getAllFolders", async (_, thunkAPI) => {
  try {
    const response = await folderService.getAllFolders();
    return response.data.folders;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to fetch folders."),
    );
  }
});

export const getFolderById = createAsyncThunk<
  Folder,
  string,
  { rejectValue: string }
>("folders/getFolderById", async (id, thunkAPI) => {
  try {
    const response = await folderService.getFolderById(id);
    return response.data.folder;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to fetch folder."),
    );
  }
});

export const updateFolder = createAsyncThunk<
  Folder,
  { id: string; payload: UpdateFolderPayload },
  { rejectValue: string }
>("folders/updateFolder", async ({ id, payload }, thunkAPI) => {
  try {
    const response = await folderService.updateFolder(id, payload);
    return response.data.folder;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to update folder."),
    );
  }
});

export const deleteFolder = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("folders/deleteFolder", async (id, thunkAPI) => {
  try {
    await folderService.deleteFolder(id);
    return id;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to delete folder."),
    );
  }
});

export const getExplorerContents = createAsyncThunk<
  ExplorerRootResponse | ExplorerFolderResponse,
  string | undefined,
  { rejectValue: string }
>("folders/getExplorerContents", async (folderId, thunkAPI) => {
  try {
    const response = await folderService.getExplorerContents(folderId);
    return response;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to fetch explorer contents."),
    );
  }
});

const folderSlice = createSlice({
  name: "folders",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentFolder: (state) => {
      state.currentFolder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createFolder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createFolder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.folders.unshift(action.payload);
      })
      .addCase(createFolder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create folder.";
      })

      .addCase(getAllFolders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllFolders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.folders = action.payload;
      })
      .addCase(getAllFolders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch folders.";
      })

      .addCase(getFolderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFolderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFolder = action.payload;
      })
      .addCase(getFolderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch folder.";
      })

      .addCase(updateFolder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateFolder.fulfilled, (state, action) => {
        state.isLoading = false;

        const index = state.folders.findIndex(
          (folder) => folder._id === action.payload._id,
        );

        if (index !== -1) {
          state.folders[index] = action.payload;
        }

        if (state.currentFolder?._id === action.payload._id) {
          state.currentFolder = action.payload;
        }
      })
      .addCase(updateFolder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update folder.";
      })

      .addCase(deleteFolder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteFolder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.folders = state.folders.filter(
          (folder) => folder._id !== action.payload,
        );

        if (state.currentFolder?._id === action.payload) {
          state.currentFolder = null;
        }
      })
      .addCase(deleteFolder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete folder.";
      })
      .addCase(getExplorerContents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getExplorerContents.fulfilled, (state, action) => {
        state.isLoading = false;

        if ("folder" in action.payload.data) {
          state.currentFolder = action.payload.data.folder;
          state.folders = [];
        } else {
          state.currentFolder = null;
          state.folders = action.payload.data.folders;
        }
      })
      .addCase(getExplorerContents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch explorer contents.";
      });
  },
});

export const { clearError, clearCurrentFolder } = folderSlice.actions;

export default folderSlice.reducer;
