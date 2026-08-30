import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NavigateFunction } from "react-router-dom";

import Explorer from "@/pages/Explorer";
import type { AppDispatch, RootState } from "@/store/store";
import type { Folder } from "@/types/folder";
import type { Note } from "@/types/note";
import { getExplorerContents } from "@/store/folderSlice";
import { setNotes } from "@/store/noteSlice";

type MockDispatch = (action: Parameters<AppDispatch>[0]) => {
  unwrap: () => Promise<unknown>;
};

const mockDispatch = vi.fn<MockDispatch>();
const mockNavigate = vi.fn<NavigateFunction>();

let mockState: Pick<RootState, "folders" | "notes">;

const mockUseAppSelector = vi.fn<<T>(selector: (state: RootState) => T) => T>();

vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: RootState) => unknown) =>
    mockUseAppSelector(selector),
}));

let mockFolderId: string | undefined;

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ folderId: mockFolderId }),
}));

vi.mock("@/store/folderSlice", async () => {
  const actual = await vi.importActual<typeof import("@/store/folderSlice")>(
    "@/store/folderSlice",
  );

  return {
    ...actual,
    getExplorerContents: vi.fn(),
  };
});

vi.mock("@/store/noteSlice", async () => {
  const actual =
    await vi.importActual<typeof import("@/store/noteSlice")>(
      "@/store/noteSlice",
    );

  return {
    ...actual,
    setNotes: vi.fn(),
  };
});

vi.mock("@/components/folders/FolderCard", () => ({
  default: ({
    folder,
    onClick,
  }: {
    folder: { _id: string; name: string };
    onClick: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      Folder: {folder.name}
    </button>
  ),
}));

vi.mock("@/components/notes/NoteCard", () => ({
  default: ({
    note,
    onClick,
    onChanged,
  }: {
    note: { _id: string; title: string };
    onClick: () => void;
    onChanged?: () => void;
  }) => (
    <div>
      <button type="button" onClick={onClick}>
        Note: {note.title}
      </button>

      <button type="button" onClick={onChanged}>
        Note changed
      </button>
    </div>
  ),
}));

vi.mock("@/components/folders/FolderDialog", () => ({
  default: ({
    open,
    onOpenChange,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) => (
    <div data-testid="folder-dialog">
      {open ? "Folder dialog open" : "Folder dialog closed"}

      {open && (
        <button type="button" onClick={() => onOpenChange(false)}>
          Close folder dialog
        </button>
      )}
    </div>
  ),
}));

describe("Explorer", () => {
  const folder: Folder = {
    _id: "folder-1",
    name: "Work",
    owner: "user-1",
    createdAt: "2026-08-29T00:00:00.000Z",
    updatedAt: "2026-08-29T00:00:00.000Z",
  };

  const note : Note  = {
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
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFolderId = undefined;

    mockState = {
      folders: {
        folders: [folder],
        currentFolder: null,
        explorerRequestId: null,
        isLoading: false,
        error: null,
      },
      notes: {
        notes: [note],
        currentNote: null,
        currentNoteRequestId: null,
        isLoading: false,
        error: null,
      },
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
        ...mockState,
      }),
    );

    mockDispatch.mockImplementation(() => ({
      unwrap: vi.fn().mockResolvedValue({
        data: {
          notes: [],
          folders: [],
        },
      }),
    }));

    vi.mocked(getExplorerContents).mockReturnValue(
      "getExplorerContents-action" as never,
    );
  });

  it("renders folders and notes on the root explorer", async () => {
    render(<Explorer />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Notes" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Your notes and folders.")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /Folder: Work/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /Note: Test Note/i }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(getExplorerContents).toHaveBeenCalledWith(undefined);
    });
  });

  it("renders the current folder and back button when inside a folder", () => {
    mockState.folders.currentFolder = folder;

    render(<Explorer />);

    expect(screen.getByRole("heading", { name: "Work" })).toBeInTheDocument();

    expect(screen.getByText("Notes inside this folder.")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /Back/i })).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /New Folder/i }),
    ).not.toBeInTheDocument();
  });

  it("shows the loading state", () => {
    mockState.folders.isLoading = true;

    render(<Explorer />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows the folder error and retries when requested", async () => {
    mockState.folders.error = "Failed to load folders";

    render(<Explorer />);

    expect(screen.getByText("Failed to load folders")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(mockDispatch).toHaveBeenCalled();
    expect(getExplorerContents).toHaveBeenCalledWith(undefined);
  });

  it("shows the note error when notes fail", () => {
    mockState.notes.error = "Failed to load notes";

    render(<Explorer />);

    expect(screen.getByText("Failed to load notes")).toBeInTheDocument();
  });

  it("shows the empty folders state", () => {
    mockState.folders.folders = [];

    render(<Explorer />);

    expect(screen.getByText("No folders yet.")).toBeInTheDocument();
  });

  it("shows the empty root notes state", () => {
    mockState.notes.notes = [];

    render(<Explorer />);

    expect(
      screen.getByText("You don't have any notes yet."),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /Create note/i }),
    ).toBeInTheDocument();
  });

  it("shows the empty folder notes state", () => {
    mockState.folders.currentFolder = folder;
    mockState.notes.notes = [];

    render(<Explorer />);

    expect(
      screen.getByText("This folder has no notes yet."),
    ).toBeInTheDocument();
  });
  it.each([
    {
      name: "folder",
      buttonName: "Folder: Work",
      expectedPath: "/dashboard/folders/folder-1",
    },
    {
      name: "note",
      buttonName: "Note: Test Note",
      expectedPath: "/dashboard/notes/note-1",
    },
    {
      name: "new note",
      buttonName: "New Note",
      expectedPath: "/dashboard/notes/new",
    },
  ])("navigates to a $name when clicked", ({ buttonName, expectedPath }) => {
    render(<Explorer />);

    fireEvent.click(screen.getByRole("button", { name: buttonName }));

    expect(mockNavigate).toHaveBeenCalledWith(expectedPath);
  });

  it("navigates to a new note inside a folder", () => {
    mockFolderId = "folder-1";
    mockState.folders.currentFolder = folder;

    render(<Explorer />);

    fireEvent.click(screen.getByRole("button", { name: "New Note" }));

    expect(mockNavigate).toHaveBeenCalledWith(
      "/dashboard/folders/folder-1/notes/new",
    );
  });

  it("navigates back to the dashboard from a folder", () => {
    mockState.folders.currentFolder = folder;

    render(<Explorer />);

    fireEvent.click(screen.getByRole("button", { name: "Back" }));

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  it("opens the new folder dialog", () => {
    render(<Explorer />);

    expect(screen.getByText("Folder dialog closed")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /New Folder/i }));

    expect(screen.getByText("Folder dialog open")).toBeInTheDocument();
  });

  it("reloads explorer contents when a note changes", () => {
    render(<Explorer />);

    fireEvent.click(screen.getByRole("button", { name: "Note changed" }));

    expect(getExplorerContents).toHaveBeenCalledWith(undefined);
  });

  it("stores notes returned by the explorer request", async () => {
    const explorerNotes = [
      {
        ...note,
        _id: "note-2",
        title: "Explorer Note",
      },
    ];

    mockDispatch.mockImplementation(() => ({
      unwrap: vi.fn().mockResolvedValue({
        data: {
          notes: explorerNotes,
          folders: [],
        },
      }),
    }));

    render(<Explorer />);

    await waitFor(() => {
      expect(setNotes).toHaveBeenCalledWith(explorerNotes);
    });
  });

  it("does not store notes when the explorer request fails", async () => {
    mockDispatch.mockImplementation(() => ({
      unwrap: vi.fn().mockRejectedValue(new Error("Request failed")),
    }));

    render(<Explorer />);

    await waitFor(() => {
      expect(getExplorerContents).toHaveBeenCalledWith(undefined);
    });

    expect(setNotes).not.toHaveBeenCalled();
  });
});
