import { describe, expect, it, beforeEach, vi } from "vitest";

import api from "@/lib/axios";
import noteService from "@/services/noteService";
import type {
  DeleteNoteResponse,
  Note,
  NoteResponse,
  NotesResponse,
} from "@/types/note";

vi.mock("@/lib/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

const mockNote: Note = {
  _id: "note-1",
  title: "Test Note",
  content: {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Test content",
          },
        ],
      },
    ],
  },
  owner: "user-1",
  parentFolder: null,
  createdAt: "2026-08-30T00:00:00.000Z",
  updatedAt: "2026-08-30T00:00:00.000Z",
};

const mockNoteResponse: NoteResponse = {
  success: true,
  data: {
    note: mockNote,
  },
};

const mockNotesResponse: NotesResponse = {
  success: true,
  results: 1,
  data: {
    notes: [mockNote],
  },
};

describe("noteService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createNote", () => {
    it("creates a note and returns the response data", async () => {
      const payload = {
        title: "New Note",
        content: {
          type: "doc",
          content: [],
        },
        parentFolder: null,
      };

      mockedApi.post.mockResolvedValue({
        data: mockNoteResponse,
      });

      const result = await noteService.createNote(payload);

      expect(mockedApi.post).toHaveBeenCalledWith("/notes", payload);
      expect(result).toEqual(mockNoteResponse);
    });
  });

  describe("getAllNotes", () => {
    it("gets notes with a parent folder", async () => {
      mockedApi.get.mockResolvedValue({
        data: mockNotesResponse,
      });

      const result = await noteService.getAllNotes("folder-1");

      expect(mockedApi.get).toHaveBeenCalledWith("/notes", {
        params: {
          parentFolder: "folder-1",
        },
      });

      expect(result).toEqual(mockNotesResponse);
    });

    it("gets all root notes when no parent folder is provided", async () => {
      mockedApi.get.mockResolvedValue({
        data: mockNotesResponse,
      });

      const result = await noteService.getAllNotes();

      expect(mockedApi.get).toHaveBeenCalledWith("/notes", {
        params: undefined,
      });

      expect(result).toEqual(mockNotesResponse);
    });
  });

  describe("getNoteById", () => {
    it("gets a note by id and returns the response data", async () => {
      mockedApi.get.mockResolvedValue({
        data: mockNoteResponse,
      });

      const result = await noteService.getNoteById("note-1");

      expect(mockedApi.get).toHaveBeenCalledWith("/notes/note-1");
      expect(result).toEqual(mockNoteResponse);
    });
  });

  describe("updateNote", () => {
    it("updates a note and returns the response data", async () => {
      const payload = {
        title: "Updated Note",
        parentFolder: "folder-1",
      };

      mockedApi.patch.mockResolvedValue({
        data: mockNoteResponse,
      });

      const result = await noteService.updateNote("note-1", payload);

      expect(mockedApi.patch).toHaveBeenCalledWith(
        "/notes/note-1",
        payload,
      );

      expect(result).toEqual(mockNoteResponse);
    });
  });

  describe("deleteNote", () => {
    it("deletes a note and returns the response data", async () => {
      const response: DeleteNoteResponse = {
        success: true,
        message: "Note deleted successfully",
      };

      mockedApi.delete.mockResolvedValue({
        data: response,
      });

      const result = await noteService.deleteNote("note-1");

      expect(mockedApi.delete).toHaveBeenCalledWith("/notes/note-1");
      expect(result).toEqual(response);
    });
  });
});