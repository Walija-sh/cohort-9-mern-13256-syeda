import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import MoveNoteDialog from "@/components/notes/MoveNoteDialog";
import { getAllFolders } from "@/store/folderSlice";
import { updateNote } from "@/store/noteSlice";
import type { Folder } from "@/types/folder";
import type { Note } from "@/types/note";

const mockDispatch = vi.fn();
const mockUseAppSelector = vi.fn();
const mockOnOpenChange = vi.fn();
const mockOnMoved = vi.fn();

let mockState: {
  folders: {
    folders: Folder[];
  };
  notes: {
    isLoading: boolean;
  };
};

vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: unknown) => mockUseAppSelector(selector),
}));

vi.mock("@/store/folderSlice", async () => {
  const actual =
    await vi.importActual<typeof import("@/store/folderSlice")>(
      "@/store/folderSlice",
    );

  return {
    ...actual,
    getAllFolders: vi.fn(),
  };
});

vi.mock("@/store/noteSlice", async () => {
  const actual =
    await vi.importActual<typeof import("@/store/noteSlice")>(
      "@/store/noteSlice",
    );

  return {
    ...actual,
    updateNote: vi.fn(),
  };
});

// Keep the test focused on MoveNoteDialog behavior.
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({
    open,
    onOpenChange,
    children,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
  }) =>
    open ? (
      <div data-testid="dialog">
        {children}

        <button
          type="button"
          onClick={() => onOpenChange(false)}
        >
          Close dialog
        </button>
      </div>
    ) : null,

  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),

  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),

  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),

  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),

  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
    >
      {children}
    </button>
  ),
}));

const folder1: Folder = {
  _id: "folder-1",
  name: "Work",
  owner: "user-1",
  createdAt: "2026-08-01T00:00:00.000Z",
  updatedAt: "2026-08-01T00:00:00.000Z",
};

const folder2: Folder = {
  _id: "folder-2",
  name: "Personal",
  owner: "user-1",
  createdAt: "2026-08-02T00:00:00.000Z",
  updatedAt: "2026-08-02T00:00:00.000Z",
};

const note: Note = {
  _id: "note-1",
  title: "Meeting notes",
  content: {},
  owner: "user-1",
  parentFolder: "folder-1",
  createdAt: "2026-08-10T00:00:00.000Z",
  updatedAt: "2026-08-10T00:00:00.000Z",
};

const renderDialog = (
  props: Partial<React.ComponentProps<typeof MoveNoteDialog>> = {},
) => {
  return render(
    <MoveNoteDialog
      note={note}
      open
      onOpenChange={mockOnOpenChange}
      {...props}
    />,
  );
};

describe("MoveNoteDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockState = {
      folders: {
        folders: [folder1, folder2],
      },
      notes: {
        isLoading: false,
      },
    };

    mockUseAppSelector.mockImplementation((selector) =>
      selector(mockState),
    );

    mockDispatch.mockImplementation(() => ({
      unwrap: vi.fn().mockResolvedValue({}),
    }));

    vi.mocked(getAllFolders).mockReturnValue(
      "getAllFolders-action" as never,
    );

    vi.mocked(updateNote).mockReturnValue(
      "updateNote-action" as never,
    );
  });

  it("renders the move note dialog", () => {
    renderDialog();

    expect(
      screen.getByRole("heading", { name: "Move note" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Choose where you want to move "Meeting notes".'),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Folder"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "No Folder" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "Work" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "Personal" }),
    ).toBeInTheDocument();
  });

  it("does not render when the dialog is closed", () => {
    render(
      <MoveNoteDialog
        note={note}
        open={false}
        onOpenChange={mockOnOpenChange}
      />,
    );

    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });

  it("uses the note's current folder as the initial selection", () => {
    renderDialog();

    expect(screen.getByLabelText("Folder")).toHaveValue("folder-1");
  });

  it("initializes with no folder when the note has no parent folder", () => {
    const rootNote = {
      ...note,
      parentFolder: null,
    };

    renderDialog({ note: rootNote });

    expect(screen.getByLabelText("Folder")).toHaveValue("");
  });

  it("fetches folders when the dialog opens and no folders are loaded", () => {
    mockState.folders.folders = [];

    renderDialog();

    expect(getAllFolders).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(
      "getAllFolders-action",
    );
  });

  it("does not fetch folders when folders are already loaded", () => {
    renderDialog();

    expect(getAllFolders).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("allows selecting a different folder", () => {
    renderDialog();

    const select = screen.getByLabelText("Folder");

    fireEvent.change(select, {
      target: { value: "folder-2" },
    });

    expect(select).toHaveValue("folder-2");
  });

  it("disables the move button when the selected folder is the current folder", () => {
    renderDialog();

    expect(
      screen.getByRole("button", { name: "Move note" }),
    ).toBeDisabled();
  });

  it("enables the move button when a different folder is selected", () => {
    renderDialog();

    fireEvent.change(screen.getByLabelText("Folder"), {
      target: { value: "folder-2" },
    });

    expect(
      screen.getByRole("button", { name: "Move note" }),
    ).toBeEnabled();
  });

  it("moves the note to another folder", async () => {
    renderDialog();

    fireEvent.change(screen.getByLabelText("Folder"), {
      target: { value: "folder-2" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Move note" }),
    );

    await waitFor(() => {
      expect(updateNote).toHaveBeenCalledWith({
        id: "note-1",
        payload: {
          parentFolder: "folder-2",
        },
      });
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      "updateNote-action",
    );

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("moves the note to the root when No Folder is selected", async () => {
    renderDialog();

    fireEvent.change(screen.getByLabelText("Folder"), {
      target: { value: "" },
    });

    // Select a different folder first so the Move button becomes enabled.
    fireEvent.change(screen.getByLabelText("Folder"), {
      target: { value: "folder-2" },
    });

    fireEvent.change(screen.getByLabelText("Folder"), {
      target: { value: "" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Move note" }),
    );

    await waitFor(() => {
      expect(updateNote).toHaveBeenCalledWith({
        id: "note-1",
        payload: {
          parentFolder: null,
        },
      });
    });

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("calls onMoved after successfully moving the note", async () => {
    renderDialog({
      onMoved: mockOnMoved,
    });

    fireEvent.change(screen.getByLabelText("Folder"), {
      target: { value: "folder-2" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Move note" }),
    );

    await waitFor(() => {
      expect(mockOnMoved).toHaveBeenCalledTimes(1);
    });
  });

  it("does not fail when onMoved is not provided", async () => {
    renderDialog();

    fireEvent.change(screen.getByLabelText("Folder"), {
      target: { value: "folder-2" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Move note" }),
    );

    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("does not close the dialog when moving the note fails", async () => {
    mockDispatch.mockImplementation(() => ({
      unwrap: vi.fn().mockRejectedValue(new Error("Move failed")),
    }));

    renderDialog();

    fireEvent.change(screen.getByLabelText("Folder"), {
      target: { value: "folder-2" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Move note" }),
    );

    await waitFor(() => {
      expect(updateNote).toHaveBeenCalledWith({
        id: "note-1",
        payload: {
          parentFolder: "folder-2",
        },
      });
    });

    expect(mockOnOpenChange).not.toHaveBeenCalled();
    expect(mockOnMoved).not.toHaveBeenCalled();
  });

  it("shows the loading state while moving", () => {
    mockState.notes.isLoading = true;

    renderDialog();

    expect(
      screen.getByRole("button", { name: "Moving..." }),
    ).toBeDisabled();

    expect(
      screen.getByRole("button", { name: "Cancel" }),
    ).toBeDisabled();

    expect(
      screen.getByLabelText("Folder"),
    ).toBeDisabled();
  });

  it("closes the dialog when Cancel is clicked", () => {
    renderDialog();

    fireEvent.click(
      screen.getByRole("button", { name: "Cancel" }),
    );

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes the dialog when the dialog requests closing", () => {
    renderDialog();

    fireEvent.click(
      screen.getByRole("button", { name: "Close dialog" }),
    );

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not move the note when the Move button is disabled", () => {
    renderDialog();

    const moveButton = screen.getByRole("button", {
      name: "Move note",
    });

    expect(moveButton).toBeDisabled();

    fireEvent.click(moveButton);

    expect(updateNote).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
