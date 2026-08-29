import { describe, expect, it } from "vitest";
import reducer, {
  clearCurrentNote,
  clearError,
  clearNotes,
  createNote,
  deleteNote,
  getAllNotes,
  getNoteById,
  setNotes,
  updateNote,
} from "../../src/store/noteSlice";
import type { Note } from "../../src/types/note";

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

describe("noteSlice", () => {
  const initialState = {
    notes: [],
    currentNote: null,
    currentNoteRequestId: null,
    isLoading: false,
    error: null,
  };

  describe("synchronous reducers", () => {
    it("returns the initial state", () => {
      expect(reducer(undefined, { type: "unknown" })).toEqual(
        initialState,
      );
    });

    it("sets notes", () => {
      const notes = [createMockNote()];

      const state = reducer(initialState, setNotes(notes));

      expect(state.notes).toEqual(notes);
    });

    it("clears notes", () => {
      const stateWithNotes = {
        ...initialState,
        notes: [createMockNote()],
      };

      const state = reducer(stateWithNotes, clearNotes());

      expect(state.notes).toEqual([]);
    });

    it("clears the error", () => {
      const stateWithError = {
        ...initialState,
        error: "Something went wrong",
      };

      const state = reducer(stateWithError, clearError());

      expect(state.error).toBeNull();
    });

    it("clears the current note and related state", () => {
      const stateWithCurrentNote = {
        ...initialState,
        currentNote: createMockNote(),
        currentNoteRequestId: "request-1",
        isLoading: true,
        error: "Previous error",
      };

      const state = reducer(
        stateWithCurrentNote,
        clearCurrentNote(),
      );

      expect(state.currentNote).toBeNull();
      expect(state.currentNoteRequestId).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe("createNote", () => {
    const payload = {
      title: "Test Note",
      content: {
        type: "doc" as const,
        content: [],
      },
    };

    it("sets loading state when creating a note", () => {
      const state = reducer(
        initialState,
        createNote.pending("request-1", payload),
      );

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("adds the created note and sets it as current note", () => {
      const note = createMockNote();

      const state = reducer(
        initialState,
        createNote.fulfilled(note, "request-1", payload),
      );

      expect(state.isLoading).toBe(false);
      expect(state.notes).toEqual([note]);
      expect(state.currentNote).toEqual(note);
    });

    it("stores the error when note creation fails", () => {
      const state = reducer(
        initialState,
        createNote.rejected(
          new Error("Request failed"),
          "request-1",
          payload,
          "Failed to create note.",
        ),
      );

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe("Failed to create note.");
    });
  });

  describe("getAllNotes", () => {
    it("sets loading state when fetching notes", () => {
      const state = reducer(
        initialState,
        getAllNotes.pending("request-1", undefined),
      );

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("stores the fetched notes", () => {
      const notes = [
        createMockNote(),
        createMockNote({
          _id: "note-2",
          title: "Second Note",
        }),
      ];

      const state = reducer(
        initialState,
        getAllNotes.fulfilled(notes, "request-1", undefined),
      );

      expect(state.isLoading).toBe(false);
      expect(state.notes).toEqual(notes);
    });

    it("stores the error when fetching notes fails", () => {
      const state = reducer(
        initialState,
        getAllNotes.rejected(
          new Error("Request failed"),
          "request-1",
          undefined,
          "Failed to fetch notes.",
        ),
      );

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe("Failed to fetch notes.");
    });
  });

  describe("getNoteById", () => {
    it("sets loading state and tracks the request id", () => {
      const state = reducer(
        initialState,
        getNoteById.pending("request-1", "note-1"),
      );

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.currentNoteRequestId).toBe("request-1");
    });

    it("stores the current note when the latest request succeeds", () => {
      const note = createMockNote();

      const pendingState = reducer(
        initialState,
        getNoteById.pending("request-1", "note-1"),
      );

      const state = reducer(
        pendingState,
        getNoteById.fulfilled(note, "request-1", "note-1"),
      );

      expect(state.isLoading).toBe(false);
      expect(state.currentNote).toEqual(note);
      expect(state.currentNoteRequestId).toBeNull();
    });

    it("ignores a stale response", () => {
      const firstNote = createMockNote({
        _id: "note-1",
        title: "First Note",
      });

      const secondNote = createMockNote({
        _id: "note-2",
        title: "Second Note",
      });

      const firstRequestState = reducer(
        initialState,
        getNoteById.pending("request-1", "note-1"),
      );

      const latestRequestState = reducer(
        firstRequestState,
        getNoteById.pending("request-2", "note-2"),
      );

      const staleResponseState = reducer(
        latestRequestState,
        getNoteById.fulfilled(
          firstNote,
          "request-1",
          "note-1",
        ),
      );

      expect(staleResponseState.currentNote).toBeNull();
      expect(staleResponseState.currentNoteRequestId).toBe(
        "request-2",
      );
      expect(staleResponseState.isLoading).toBe(true);

      const finalState = reducer(
        staleResponseState,
        getNoteById.fulfilled(
          secondNote,
          "request-2",
          "note-2",
        ),
      );

      expect(finalState.currentNote).toEqual(secondNote);
      expect(finalState.currentNoteRequestId).toBeNull();
      expect(finalState.isLoading).toBe(false);
    });

    it("stores the error when the latest request fails", () => {
      const pendingState = reducer(
        initialState,
        getNoteById.pending("request-1", "note-1"),
      );

      const state = reducer(
        pendingState,
        getNoteById.rejected(
          new Error("Request failed"),
          "request-1",
          "note-1",
          "Failed to fetch note.",
        ),
      );

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe("Failed to fetch note.");
      expect(state.currentNoteRequestId).toBeNull();
    });

    it("ignores an error from a stale request", () => {
      const firstRequestState = reducer(
        initialState,
        getNoteById.pending("request-1", "note-1"),
      );

      const latestRequestState = reducer(
        firstRequestState,
        getNoteById.pending("request-2", "note-2"),
      );

      const state = reducer(
        latestRequestState,
        getNoteById.rejected(
          new Error("Request failed"),
          "request-1",
          "note-1",
          "Failed to fetch note.",
        ),
      );

      expect(state.error).toBeNull();
      expect(state.currentNoteRequestId).toBe("request-2");
      expect(state.isLoading).toBe(true);
    });
  });

  describe("updateNote", () => {
    const payload = {
      title: "Updated Note",
    };

    it("sets loading state when updating a note", () => {
      const state = reducer(
        initialState,
        updateNote.pending("request-1", {
          id: "note-1",
          payload,
        }),
      );

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("updates an existing note and sets it as current note", () => {
      const existingNote = createMockNote();

      const updatedNote = createMockNote({
        title: "Updated Note",
        updatedAt: "2026-08-29T01:00:00.000Z",
      });

      const stateWithNote = {
        ...initialState,
        notes: [existingNote],
      };

      const state = reducer(
        stateWithNote,
        updateNote.fulfilled(
          updatedNote,
          "request-1",
          {
            id: "note-1",
            payload,
          },
        ),
      );

      expect(state.isLoading).toBe(false);
      expect(state.notes).toEqual([updatedNote]);
      expect(state.currentNote).toEqual(updatedNote);
    });

    it("sets the current note when the note is not in the list", () => {
      const updatedNote = createMockNote({
        _id: "note-2",
        title: "Updated Note",
      });

      const state = reducer(
        initialState,
        updateNote.fulfilled(
          updatedNote,
          "request-1",
          {
            id: "note-2",
            payload,
          },
        ),
      );

      expect(state.notes).toEqual([]);
      expect(state.currentNote).toEqual(updatedNote);
      expect(state.isLoading).toBe(false);
    });

    it("stores the error when updating fails", () => {
      const state = reducer(
        initialState,
        updateNote.rejected(
          new Error("Request failed"),
          "request-1",
          {
            id: "note-1",
            payload,
          },
          "Failed to update note.",
        ),
      );

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe("Failed to update note.");
    });
  });

  describe("deleteNote", () => {
    it("sets loading state when deleting a note", () => {
      const state = reducer(
        initialState,
        deleteNote.pending("request-1", "note-1"),
      );

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("removes the deleted note from the list", () => {
      const note = createMockNote();

      const otherNote = createMockNote({
        _id: "note-2",
        title: "Other Note",
      });

      const stateWithNotes = {
        ...initialState,
        notes: [note, otherNote],
      };

      const state = reducer(
        stateWithNotes,
        deleteNote.fulfilled(
          "note-1",
          "request-1",
          "note-1",
        ),
      );

      expect(state.isLoading).toBe(false);
      expect(state.notes).toEqual([otherNote]);
    });

    it("clears the current note when the deleted note is currently selected", () => {
      const note = createMockNote();

      const stateWithCurrentNote = {
        ...initialState,
        notes: [note],
        currentNote: note,
      };

      const state = reducer(
        stateWithCurrentNote,
        deleteNote.fulfilled(
          "note-1",
          "request-1",
          "note-1",
        ),
      );

      expect(state.notes).toEqual([]);
      expect(state.currentNote).toBeNull();
      expect(state.isLoading).toBe(false);
    });

    it("keeps the current note when a different note is deleted", () => {
      const currentNote = createMockNote();

      const otherNote = createMockNote({
        _id: "note-2",
        title: "Other Note",
      });

      const stateWithNotes = {
        ...initialState,
        notes: [currentNote, otherNote],
        currentNote,
      };

      const state = reducer(
        stateWithNotes,
        deleteNote.fulfilled(
          "note-2",
          "request-1",
          "note-2",
        ),
      );

      expect(state.notes).toEqual([currentNote]);
      expect(state.currentNote).toEqual(currentNote);
    });

    it("stores the error when deleting fails", () => {
      const state = reducer(
        initialState,
        deleteNote.rejected(
          new Error("Request failed"),
          "request-1",
          "note-1",
          "Failed to delete note.",
        ),
      );

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe("Failed to delete note.");
    });
  });
});