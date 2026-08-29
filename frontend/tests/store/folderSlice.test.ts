import { describe, expect, it } from "vitest";
import reducer, {
  clearCurrentFolder,
  clearError,
  createFolder,
  deleteFolder,
  getAllFolders,
  getExplorerContents,
  getFolderById,
  updateFolder,
} from "../../src/store/folderSlice";
import type { Folder } from "../../src/types/folder";
import type { Note } from "../../src/types/note";

const createMockFolder = (overrides: Partial<Folder> = {}): Folder => ({
  _id: "folder-1",
  name: "Test Folder",
  owner: "user-1",
  createdAt: "2026-08-29T00:00:00.000Z",
  updatedAt: "2026-08-29T00:00:00.000Z",
  ...overrides,
});

const createMockNote = (overrides: Partial<Note> = {}): Note => ({
  _id: "note-1",
  title: "Test Note",
  content: {
    type: "doc",
    content: [],
  },
  owner: "user-1",
  parentFolder: null,
  createdAt: "2026-08-29T00:00:00.000Z",
  updatedAt: "2026-08-29T00:00:00.000Z",
  ...overrides,
});

describe("folderSlice", () => {
  const initialState = {
    folders: [],
    currentFolder: null,
    explorerRequestId: null,
    isLoading: false,
    error: null,
  };

  describe("synchronous reducers", () => {
    it("returns the initial state", () => {
      expect(reducer(undefined, { type: "unknown" })).toEqual(initialState);
    });

    it("clears the error", () => {
      const stateWithError = {
        ...initialState,
        error: "Something went wrong",
      };

      const state = reducer(stateWithError, clearError());

      expect(state.error).toBeNull();
    });

    it("clears the current folder", () => {
      const folder = createMockFolder();

      const stateWithFolder = {
        ...initialState,
        currentFolder: folder,
      };

      const state = reducer(stateWithFolder, clearCurrentFolder());

      expect(state.currentFolder).toBeNull();
    });
  });

  describe("createFolder", () => {
    const payload = {
      name: "New Folder",
    };

    it("sets loading state when creating a folder", () => {
      const state = reducer(
        initialState,
        createFolder.pending("request-1", payload),
      );

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("adds the created folder to the beginning of the list", () => {
      const existingFolder = createMockFolder();

      const newFolder = createMockFolder({
        _id: "folder-2",
        name: "New Folder",
      });

      const stateWithFolder = {
        ...initialState,
        folders: [existingFolder],
      };

      const state = reducer(
        stateWithFolder,
        createFolder.fulfilled(newFolder, "request-1", payload),
      );

      expect(state.isLoading).toBe(false);
      expect(state.folders).toEqual([newFolder, existingFolder]);
    });

    it("stores the error when folder creation fails", () => {
      const state = reducer(
        initialState,
        createFolder.rejected(
          new Error("Request failed"),
          "request-1",
          payload,
          "Failed to create folder.",
        ),
      );

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe("Failed to create folder.");
    });
  });

  describe("getAllFolders", () => {
    it("sets loading state when fetching folders", () => {
      const state = reducer(
        initialState,
        getAllFolders.pending("request-1", undefined),
      );

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("stores the fetched folders", () => {
      const folders = [
        createMockFolder(),
        createMockFolder({
          _id: "folder-2",
          name: "Second Folder",
        }),
      ];

      const state = reducer(
        initialState,
        getAllFolders.fulfilled(folders, "request-1", undefined),
      );

      expect(state.isLoading).toBe(false);
      expect(state.folders).toEqual(folders);
    });

    it("stores the error when fetching folders fails", () => {
      const state = reducer(
        initialState,
        getAllFolders.rejected(
          new Error("Request failed"),
          "request-1",
          undefined,
          "Failed to fetch folders.",
        ),
      );

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe("Failed to fetch folders.");
    });
  });

  describe("getFolderById", () => {
    it("sets loading state when fetching a folder", () => {
      const state = reducer(
        initialState,
        getFolderById.pending("request-1", "folder-1"),
      );

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("stores the fetched folder as the current folder", () => {
      const folder = createMockFolder();

      const state = reducer(
        initialState,
        getFolderById.fulfilled(folder, "request-1", "folder-1"),
      );

      expect(state.isLoading).toBe(false);
      expect(state.currentFolder).toEqual(folder);
    });

    it("stores the error when fetching a folder fails", () => {
      const state = reducer(
        initialState,
        getFolderById.rejected(
          new Error("Request failed"),
          "request-1",
          "folder-1",
          "Failed to fetch folder.",
        ),
      );

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe("Failed to fetch folder.");
    });
  });

  describe("updateFolder", () => {
    const payload = {
      name: "Updated Folder",
    };

    it("sets loading state when updating a folder", () => {
      const state = reducer(
        initialState,
        updateFolder.pending("request-1", {
          id: "folder-1",
          payload,
        }),
      );

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("updates an existing folder in the folder list", () => {
      const existingFolder = createMockFolder();

      const updatedFolder = createMockFolder({
        name: "Updated Folder",
        updatedAt: "2026-08-29T01:00:00.000Z",
      });

      const stateWithFolder = {
        ...initialState,
        folders: [existingFolder],
      };

      const state = reducer(
        stateWithFolder,
        updateFolder.fulfilled(updatedFolder, "request-1", {
          id: "folder-1",
          payload,
        }),
      );

      expect(state.isLoading).toBe(false);
      expect(state.folders).toEqual([updatedFolder]);
    });

    it("does not add a folder that is not already in the list", () => {
      const updatedFolder = createMockFolder({
        _id: "folder-2",
        name: "Updated Folder",
      });

      const state = reducer(
        initialState,
        updateFolder.fulfilled(updatedFolder, "request-1", {
          id: "folder-2",
          payload,
        }),
      );

      expect(state.folders).toEqual([]);
    });

    it("updates currentFolder when the updated folder is selected", () => {
      const existingFolder = createMockFolder();

      const updatedFolder = createMockFolder({
        name: "Updated Folder",
      });

      const stateWithFolder = {
        ...initialState,
        folders: [existingFolder],
        currentFolder: existingFolder,
      };

      const state = reducer(
        stateWithFolder,
        updateFolder.fulfilled(updatedFolder, "request-1", {
          id: "folder-1",
          payload,
        }),
      );

      expect(state.currentFolder).toEqual(updatedFolder);
      expect(state.folders).toEqual([updatedFolder]);
    });

    it("stores the error when updating fails", () => {
      const state = reducer(
        initialState,
        updateFolder.rejected(
          new Error("Request failed"),
          "request-1",
          {
            id: "folder-1",
            payload,
          },
          "Failed to update folder.",
        ),
      );

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe("Failed to update folder.");
    });
  });

  describe("deleteFolder", () => {
    it("sets loading state when deleting a folder", () => {
      const state = reducer(
        initialState,
        deleteFolder.pending("request-1", "folder-1"),
      );

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("removes the deleted folder from the list", () => {
      const folder = createMockFolder();

      const otherFolder = createMockFolder({
        _id: "folder-2",
        name: "Other Folder",
      });

      const stateWithFolders = {
        ...initialState,
        folders: [folder, otherFolder],
      };

      const state = reducer(
        stateWithFolders,
        deleteFolder.fulfilled("folder-1", "request-1", "folder-1"),
      );

      expect(state.isLoading).toBe(false);
      expect(state.folders).toEqual([otherFolder]);
    });

    it("clears currentFolder when the deleted folder is selected", () => {
      const folder = createMockFolder();

      const stateWithFolder = {
        ...initialState,
        folders: [folder],
        currentFolder: folder,
      };

      const state = reducer(
        stateWithFolder,
        deleteFolder.fulfilled("folder-1", "request-1", "folder-1"),
      );

      expect(state.folders).toEqual([]);
      expect(state.currentFolder).toBeNull();
    });

    it("keeps currentFolder when a different folder is deleted", () => {
      const currentFolder = createMockFolder();

      const otherFolder = createMockFolder({
        _id: "folder-2",
        name: "Other Folder",
      });

      const stateWithFolders = {
        ...initialState,
        folders: [currentFolder, otherFolder],
        currentFolder,
      };

      const state = reducer(
        stateWithFolders,
        deleteFolder.fulfilled("folder-2", "request-1", "folder-2"),
      );

      expect(state.folders).toEqual([currentFolder]);
      expect(state.currentFolder).toEqual(currentFolder);
    });

    it("stores the error when deleting fails", () => {
      const state = reducer(
        initialState,
        deleteFolder.rejected(
          new Error("Request failed"),
          "request-1",
          "folder-1",
          "Failed to delete folder.",
        ),
      );

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe("Failed to delete folder.");
    });
  });

  describe("getExplorerContents", () => {
    const rootContents = {
      success: true,
      results: 2,
      data: {
        folders: [createMockFolder()],
        notes: [createMockNote()],
      },
    };

    const folderContents = {
      success: true,
      results: 1,
      data: {
        folder: createMockFolder(),
        notes: [createMockNote()],
      },
    };

    it("tracks the latest explorer request", () => {
      const state = reducer(
        initialState,
        getExplorerContents.pending("request-1", undefined),
      );

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.explorerRequestId).toBe("request-1");
    });

    it("stores root explorer contents", () => {
      const pendingState = reducer(
        initialState,
        getExplorerContents.pending("request-1", undefined),
      );

      const state = reducer(
        pendingState,
        getExplorerContents.fulfilled(rootContents, "request-1", undefined),
      );

      expect(state.isLoading).toBe(false);
      expect(state.currentFolder).toBeNull();
      expect(state.folders).toEqual(rootContents.data.folders);
      expect(state.explorerRequestId).toBeNull();
    });

    it("stores folder explorer contents", () => {
      const pendingState = reducer(
        initialState,
        getExplorerContents.pending("request-1", "folder-1"),
      );

      const state = reducer(
        pendingState,
        getExplorerContents.fulfilled(folderContents, "request-1", "folder-1"),
      );

      expect(state.isLoading).toBe(false);
      expect(state.currentFolder).toEqual(folderContents.data.folder);
      expect(state.folders).toEqual([]);
      expect(state.explorerRequestId).toBeNull();
    });

    it("ignores stale explorer responses", () => {
      const firstFolder = createMockFolder({
        _id: "folder-1",
        name: "First Folder",
      });

      const secondFolder = createMockFolder({
        _id: "folder-2",
        name: "Second Folder",
      });

      const firstResponse = {
        success: true,
        results: 1,
        data: {
          folder: firstFolder,
          notes: [],
        },
      };

      const secondResponse = {
        success: true,
        results: 1,
        data: {
          folder: secondFolder,
          notes: [],
        },
      };

      const firstRequestState = reducer(
        initialState,
        getExplorerContents.pending("request-1", "folder-1"),
      );

      const latestRequestState = reducer(
        firstRequestState,
        getExplorerContents.pending("request-2", "folder-2"),
      );

      const staleResponseState = reducer(
        latestRequestState,
        getExplorerContents.fulfilled(firstResponse, "request-1", "folder-1"),
      );

      expect(staleResponseState.currentFolder).toBeNull();
      expect(staleResponseState.explorerRequestId).toBe("request-2");
      expect(staleResponseState.isLoading).toBe(true);

      const finalState = reducer(
        staleResponseState,
        getExplorerContents.fulfilled(secondResponse, "request-2", "folder-2"),
      );

      expect(finalState.currentFolder).toEqual(secondFolder);
      expect(finalState.explorerRequestId).toBeNull();
      expect(finalState.isLoading).toBe(false);
    });

    it("stores an explorer error for the latest request", () => {
      const pendingState = reducer(
        initialState,
        getExplorerContents.pending("request-1", undefined),
      );

      const state = reducer(
        pendingState,
        getExplorerContents.rejected(
          new Error("Request failed"),
          "request-1",
          undefined,
          "Failed to fetch explorer contents.",
        ),
      );

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe("Failed to fetch explorer contents.");
      expect(state.explorerRequestId).toBeNull();
    });

    it("ignores an explorer error from a stale request", () => {
      const firstRequestState = reducer(
        initialState,
        getExplorerContents.pending("request-1", "folder-1"),
      );

      const latestRequestState = reducer(
        firstRequestState,
        getExplorerContents.pending("request-2", "folder-2"),
      );

      const state = reducer(
        latestRequestState,
        getExplorerContents.rejected(
          new Error("Request failed"),
          "request-1",
          "folder-1",
          "Failed to fetch explorer contents.",
        ),
      );

      expect(state.error).toBeNull();
      expect(state.explorerRequestId).toBe("request-2");
      expect(state.isLoading).toBe(true);
    });
  });
});
