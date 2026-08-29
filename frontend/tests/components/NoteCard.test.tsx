import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import NoteCard from "../../src/components/notes/NoteCard";
import { deleteNote } from "../../src/store/noteSlice";

// ---------- mocks ----------

const mockDispatch = vi.fn();
const mockNavigate = vi.fn();
const mockUseAppSelector = vi.fn();

vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: unknown) => mockUseAppSelector(selector),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/store/noteSlice", async () => {
  const actual =
    await vi.importActual<typeof import("../../src/store/noteSlice")>(
      "@/store/noteSlice",
    );

  return {
    ...actual,
    deleteNote: vi.fn(),
  };
});

vi.mock("@/components/ui/card", () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,

  CardContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),

  DropdownMenuTrigger: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => <button {...props}>{children}</button>,

  DropdownMenuContent: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => <div {...props}>{children}</div>,

  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),

  DropdownMenuSeparator: () => <hr />,
}));

vi.mock("@/components/common/ConfirmDialog", () => ({
  default: ({
    open,
    title,
    description,
    confirmLabel,
    isLoading,
    onConfirm,
  }: {
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    isLoading: boolean;
    onConfirm: () => void;
  }) =>
    open ? (
      <div data-testid="confirm-dialog">
        <h2>{title}</h2>
        <p>{description}</p>
        <button type="button" disabled={isLoading} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    ) : null,
}));

vi.mock("@/components/notes/MoveNoteDialog", () => ({
  default: ({
    open,
    onOpenChange,
    onMoved,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onMoved?: () => void;
  }) =>
    open ? (
      <div data-testid="move-note-dialog">
        <span>Move note dialog</span>

        <button type="button" onClick={() => onOpenChange(false)}>
          Close move dialog
        </button>

        <button type="button" onClick={onMoved}>
          Note moved
        </button>
      </div>
    ) : null,
}));

describe("NoteCard", () => {
  const note = {
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

    mockUseAppSelector.mockImplementation((selector) =>
      selector({
        notes: {
          isLoading: false,
        },
      }),
    );

    vi.mocked(deleteNote).mockReturnValue("delete-note-action" as never);

    mockDispatch.mockImplementation(() => ({
      unwrap: vi.fn().mockResolvedValue({}),
    }));
  });

  it("renders the note title and updated date", () => {
    render(<NoteCard note={note} onClick={vi.fn()} />);

    expect(screen.getByText("Test Note")).toBeInTheDocument();

    expect(
      screen.getByText((content) => content.includes("29 Aug 2026")),
    ).toBeInTheDocument();
  });

  it("calls onClick when the note card is clicked", () => {
    const onClick = vi.fn();

    render(<NoteCard note={note} onClick={onClick} />);

    const title = screen.getByRole("heading", { name: "Test Note" });
    const cardButton = title.closest("button");

    expect(cardButton).not.toBeNull();

    fireEvent.click(cardButton!);

    expect(onClick).toHaveBeenCalledWith(note);
  });

  it("navigates to the note edit page", () => {
    render(<NoteCard note={note} onClick={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/notes/note-1/edit");
  });

  it("opens and closes the move note dialog", () => {
    render(<NoteCard note={note} onClick={vi.fn()} />);

    expect(screen.queryByTestId("move-note-dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Move to folder" }));

    expect(screen.getByTestId("move-note-dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close move dialog" }));

    expect(screen.queryByTestId("move-note-dialog")).not.toBeInTheDocument();
  });

  it("calls onChanged when the note is moved", () => {
    const onChanged = vi.fn();

    render(<NoteCard note={note} onClick={vi.fn()} onChanged={onChanged} />);

    fireEvent.click(screen.getByRole("button", { name: "Move to folder" }));

    fireEvent.click(screen.getByRole("button", { name: "Note moved" }));

    expect(onChanged).toHaveBeenCalledTimes(1);
  });

  it("opens the delete confirmation dialog", () => {
    render(<NoteCard note={note} onClick={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: 'Delete "Test Note"?',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "This will permanently delete this note. This action cannot be undone.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Delete note" }),
    ).toBeInTheDocument();
  });

  it("deletes the note successfully and calls onChanged", async () => {
    const onChanged = vi.fn();

    render(<NoteCard note={note} onClick={vi.fn()} onChanged={onChanged} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    fireEvent.click(screen.getByRole("button", { name: "Delete note" }));

    await waitFor(() => {
      expect(deleteNote).toHaveBeenCalledWith("note-1");
      expect(mockDispatch).toHaveBeenCalledWith("delete-note-action");
      expect(onChanged).toHaveBeenCalledTimes(1);
    });

    expect(screen.queryByTestId("confirm-dialog")).not.toBeInTheDocument();
  });

  it("keeps the delete dialog open when deletion fails", async () => {
    const onChanged = vi.fn();

    mockDispatch.mockImplementation(() => ({
      unwrap: vi.fn().mockRejectedValue(new Error("Delete failed")),
    }));

    render(<NoteCard note={note} onClick={vi.fn()} onChanged={onChanged} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    fireEvent.click(screen.getByRole("button", { name: "Delete note" }));

    await waitFor(() => {
      expect(deleteNote).toHaveBeenCalledWith("note-1");
    });

    expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();

    expect(onChanged).not.toHaveBeenCalled();
  });

  it("disables delete confirmation while deletion is loading", () => {
    mockUseAppSelector.mockImplementation((selector) =>
      selector({
        notes: {
          isLoading: true,
        },
      }),
    );

    render(<NoteCard note={note} onClick={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.getByRole("button", { name: "Delete note" })).toBeDisabled();
  });

  it("does not fail when onChanged is not provided", async () => {
    render(<NoteCard note={note} onClick={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    fireEvent.click(screen.getByRole("button", { name: "Delete note" }));

    await waitFor(() => {
      expect(deleteNote).toHaveBeenCalledWith("note-1");
    });
  });

  it("renders the actions menu without triggering the note click", () => {
    const onClick = vi.fn();

    render(<NoteCard note={note} onClick={onClick} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Actions for Test Note",
      }),
    );

    expect(onClick).not.toHaveBeenCalled();
  });
});
