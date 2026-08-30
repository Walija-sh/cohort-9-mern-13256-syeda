import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NavigateFunction } from "react-router-dom";

import NoteEditor from "@/pages/NoteEditor";
import {
  clearCurrentNote,
  createNote,
  getNoteById,
  updateNote,
} from "@/store/noteSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { Note } from "@/types/note";

type MockDispatch = (
  action: Parameters<AppDispatch>[0],
) => {
  unwrap: () => Promise<unknown>;
};

const mockDispatch = vi.fn<MockDispatch>();
const mockNavigate = vi.fn<NavigateFunction>();

const mockUseAppSelector = vi.fn<
  <T>(selector: (state: RootState) => T) => T
>();

let mockParams: {
  id?: string;
  folderId?: string;
} = {};

vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: <T,>(selector: (state: RootState) => T) =>
    mockUseAppSelector(selector),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
}));

vi.mock("@/store/noteSlice", async () => {
  const actual =
    await vi.importActual<typeof import("@/store/noteSlice")>(
      "@/store/noteSlice",
    );

  return {
    ...actual,
    clearCurrentNote: vi.fn(),
    createNote: vi.fn(),
    getNoteById: vi.fn(),
    updateNote: vi.fn(),
  };
});

vi.mock("@/components/notes/NoteEditor", () => ({
  default: ({
    content,
    onChange,
  }: {
    content: unknown;
    onChange: (content: unknown) => void;
  }) => (
    <div data-testid="note-editor">
      <span data-testid="editor-content">{JSON.stringify(content)}</span>

      <button
        type="button"
        onClick={() =>
          onChange({
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Updated content" }],
              },
            ],
          })
        }
      >
        Change content
      </button>
    </div>
  ),
}));

describe("NoteEditor", () => {
  const note: Note = {
    _id: "note-1",
    title: "Existing Note",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Existing content" }],
        },
      ],
    },
    owner: "user-1",
    parentFolder: null,
    createdAt: "2026-08-29T00:00:00.000Z",
    updatedAt: "2026-08-29T00:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockParams = {};

    mockUseAppSelector.mockImplementation((selector) =>
      selector({
        auth: {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: false,
          error: null,
        },
        notes: {
          notes: [],
          currentNote: null,
          currentNoteRequestId: null,
          isLoading: false,
          error: null,
        },
        folders: {
          folders: [],
          currentFolder: null,
          explorerRequestId: null,
          isLoading: false,
          error: null,
        },
      }),
    );

    mockDispatch.mockImplementation(() => ({
      unwrap: vi.fn().mockResolvedValue({}),
    }));

    vi.mocked(clearCurrentNote).mockReturnValue(
      "clearCurrentNote-action" as never,
    );

    vi.mocked(createNote).mockReturnValue("createNote-action" as never);

    vi.mocked(getNoteById).mockReturnValue("getNoteById-action" as never);

    vi.mocked(updateNote).mockReturnValue("updateNote-action" as never);
  });

  it("renders the new note editor", () => {
    render(<NoteEditor />);

    expect(screen.getByPlaceholderText("Note title")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /Save/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /Cancel/i }),
    ).toBeInTheDocument();

    expect(screen.getByTestId("note-editor")).toBeInTheDocument();
  });

  it("clears the current note when creating a new note", () => {
    render(<NoteEditor />);

    expect(clearCurrentNote).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith("clearCurrentNote-action");
  });

  it("creates a new note and navigates to the created note", async () => {
    mockParams = {
      folderId: "folder-1",
    };

    mockDispatch.mockImplementation(() => ({
      unwrap: vi.fn().mockResolvedValue({
        _id: "new-note-1",
      }),
    }));

    render(<NoteEditor />);

    fireEvent.change(screen.getByPlaceholderText("Note title"), {
      target: {
        value: "  My New Note  ",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: /Save/i }));

    await waitFor(() => {
      expect(createNote).toHaveBeenCalledWith({
        title: "My New Note",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
            },
          ],
        },
        parentFolder: "folder-1",
      });
    });

    expect(mockDispatch).toHaveBeenCalledWith("createNote-action");

    expect(mockNavigate).toHaveBeenCalledWith(
      "/dashboard/notes/new-note-1",
    );
  });

  it("creates a root note with a null parent folder", async () => {
    render(<NoteEditor />);

    fireEvent.change(screen.getByPlaceholderText("Note title"), {
      target: {
        value: "Root Note",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: /Save/i }));

    await waitFor(() => {
      expect(createNote).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Root Note",
          parentFolder: null,
        }),
      );
    });
  });

  it("does not create a note when the title is empty", () => {
    render(<NoteEditor />);

    const saveButton = screen.getByRole("button", {
      name: /Save/i,
    });

    expect(saveButton).toBeDisabled();

    fireEvent.click(saveButton);

    expect(createNote).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("does not create a note when the title contains only whitespace", () => {
    render(<NoteEditor />);

    fireEvent.change(screen.getByPlaceholderText("Note title"), {
      target: {
        value: "   ",
      },
    });

    expect(
      screen.getByRole("button", { name: /Save/i }),
    ).toBeDisabled();

    expect(createNote).not.toHaveBeenCalled();
  });

  it("updates the editor content", () => {
    render(<NoteEditor />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Change content",
      }),
    );

    expect(screen.getByTestId("editor-content")).toHaveTextContent(
      "Updated content",
    );
  });

  it("navigates back when cancel is clicked", () => {
    render(<NoteEditor />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Cancel/i,
      }),
    );

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("shows the loading state while an existing note is loading", () => {
    mockParams = {
      id: "note-1",
    };

    mockUseAppSelector.mockImplementation((selector) =>
      selector({
        auth: {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: false,
          error: null,
        },
        notes: {
          notes: [],
          currentNote: null,
          currentNoteRequestId: "request-1",
          isLoading: true,
          error: null,
        },
        folders: {
          folders: [],
          currentFolder: null,
          explorerRequestId: null,
          isLoading: false,
          error: null,
        },
      }),
    );

    render(<NoteEditor />);

    expect(screen.getByText("Loading note...")).toBeInTheDocument();

    expect(
      screen.queryByPlaceholderText("Note title"),
    ).not.toBeInTheDocument();

    expect(getNoteById).toHaveBeenCalledWith("note-1");
  });

  it("shows the error when the requested note is not available", () => {
    mockParams = {
      id: "missing-note",
    };

    mockUseAppSelector.mockImplementation((selector) =>
      selector({
        auth: {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: false,
          error: null,
        },
        notes: {
          notes: [],
          currentNote: null,
          currentNoteRequestId: null,
          isLoading: false,
          error: "Failed to load note",
        },
        folders: {
          folders: [],
          currentFolder: null,
          explorerRequestId: null,
          isLoading: false,
          error: null,
        },
      }),
    );

    render(<NoteEditor />);

    expect(screen.getByText("Failed to load note")).toBeInTheDocument();

    expect(
      screen.queryByPlaceholderText("Note title"),
    ).not.toBeInTheDocument();
  });

  it("shows the default not found message when there is no error", () => {
    mockParams = {
      id: "missing-note",
    };

    render(<NoteEditor />);

    expect(screen.getByText("Note not found.")).toBeInTheDocument();
  });

  it("loads an existing note and populates the editor", () => {
    mockParams = {
      id: "note-1",
    };

    mockUseAppSelector.mockImplementation((selector) =>
      selector({
        auth: {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: false,
          error: null,
        },
        notes: {
          notes: [note],
          currentNote: note,
          currentNoteRequestId: null,
          isLoading: false,
          error: null,
        },
        folders: {
          folders: [],
          currentFolder: null,
          explorerRequestId: null,
          isLoading: false,
          error: null,
        },
      }),
    );

    render(<NoteEditor />);

    expect(getNoteById).toHaveBeenCalledWith("note-1");

    expect(
      screen.getByDisplayValue("Existing Note"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("editor-content"),
    ).toHaveTextContent("Existing content");
  });

  it("updates an existing note and navigates to its details page", async () => {
    mockParams = {
      id: "note-1",
    };

    mockUseAppSelector.mockImplementation((selector) =>
      selector({
        auth: {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: false,
          error: null,
        },
        notes: {
          notes: [note],
          currentNote: note,
          currentNoteRequestId: null,
          isLoading: false,
          error: null,
        },
        folders: {
          folders: [],
          currentFolder: null,
          explorerRequestId: null,
          isLoading: false,
          error: null,
        },
      }),
    );

    render(<NoteEditor />);

    fireEvent.change(screen.getByDisplayValue("Existing Note"), {
      target: {
        value: "  Updated Note  ",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Change content",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /Save/i,
      }),
    );

    await waitFor(() => {
      expect(updateNote).toHaveBeenCalledWith({
        id: "note-1",
        payload: {
          title: "Updated Note",
          content: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Updated content",
                  },
                ],
              },
            ],
          },
        },
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith(
      "/dashboard/notes/note-1",
    );
  });

  it("does not navigate when creating a note fails", async () => {
    mockDispatch.mockImplementation(() => ({
      unwrap: vi.fn().mockRejectedValue(new Error("Create failed")),
    }));

    render(<NoteEditor />);

    fireEvent.change(screen.getByPlaceholderText("Note title"), {
      target: {
        value: "Failed Note",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /Save/i,
      }),
    );

    await waitFor(() => {
      expect(createNote).toHaveBeenCalled();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("does not navigate when updating a note fails", async () => {
    mockParams = {
      id: "note-1",
    };

    mockUseAppSelector.mockImplementation((selector) =>
      selector({
        auth: {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: false,
          error: null,
        },
        notes: {
          notes: [note],
          currentNote: note,
          currentNoteRequestId: null,
          isLoading: false,
          error: null,
        },
        folders: {
          folders: [],
          currentFolder: null,
          explorerRequestId: null,
          isLoading: false,
          error: null,
        },
      }),
    );

    mockDispatch.mockImplementation(() => ({
      unwrap: vi.fn().mockRejectedValue(new Error("Update failed")),
    }));

    render(<NoteEditor />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Save/i,
      }),
    );

    await waitFor(() => {
      expect(updateNote).toHaveBeenCalled();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("shows the saving state when Redux reports a loading save", () => {
    mockUseAppSelector.mockImplementation((selector) =>
      selector({
        auth: {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: false,
          error: null,
        },
        notes: {
          notes: [],
          currentNote: null,
          currentNoteRequestId: null,
          isLoading: true,
          error: null,
        },
        folders: {
          folders: [],
          currentFolder: null,
          explorerRequestId: null,
          isLoading: false,
          error: null,
        },
      }),
    );

    render(<NoteEditor />);

    fireEvent.change(screen.getByPlaceholderText("Note title"), {
      target: {
        value: "Saving Note",
      },
    });

    expect(
      screen.getByRole("button", {
        name: "Saving...",
      }),
    ).toBeDisabled();
  });

  it("clears the current note when the component unmounts in edit mode", () => {
    mockParams = {
      id: "note-1",
    };

    mockUseAppSelector.mockImplementation((selector) =>
      selector({
        auth: {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: false,
          error: null,
        },
        notes: {
          notes: [note],
          currentNote: note,
          currentNoteRequestId: null,
          isLoading: false,
          error: null,
        },
        folders: {
          folders: [],
          currentFolder: null,
          explorerRequestId: null,
          isLoading: false,
          error: null,
        },
      }),
    );

    const { unmount } = render(<NoteEditor />);

    expect(getNoteById).toHaveBeenCalledWith("note-1");

    unmount();

    expect(clearCurrentNote).toHaveBeenCalled();
  });
});
