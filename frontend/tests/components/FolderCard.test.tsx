import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import FolderCard from "@/components/folders/FolderCard";
import { deleteFolder } from "@/store/folderSlice";
import type { Folder } from "@/types/folder";

const mockDispatch = vi.fn();
const mockUseAppSelector = vi.fn();

const mockOnClick = vi.fn();

type MockRootState = {
  folders: {
    isLoading: boolean;
    error: string | null;
  };
};

vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: unknown) => mockUseAppSelector(selector),
}));

vi.mock("@/store/folderSlice", async () => {
  try {
    const actual = await vi.importActual<typeof import("@/store/folderSlice")>(
      "@/store/folderSlice",
    );

    return {
      ...actual,
      deleteFolder: vi.fn(),
    };
  } catch (error) {
    throw new Error("Failed to load folderSlice mock", { cause: error });
  }
});

vi.mock("@/components/folders/FolderDialog", () => ({
  default: ({
    folder,
    open,
    onOpenChange,
  }: {
    folder: Folder;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) =>
    open ? (
      <div data-testid="folder-dialog">
        <span>Rename folder: {folder.name}</span>
        <button type="button" onClick={() => onOpenChange(false)}>
          Close rename dialog
        </button>
      </div>
    ) : null,
}));

vi.mock("@/components/common/ConfirmDialog", () => ({
  default: ({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel,
    isLoading,
    onConfirm,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
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

        <button type="button" onClick={() => onOpenChange(false)}>
          Cancel delete
        </button>
      </div>
    ) : null,
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),

  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    [key: string]: unknown;
  }) => (
    <button type="button" onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),

  DropdownMenuTrigger: ({ render }: { render: React.ReactElement }) => render,

  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-content">{children}</div>
  ),

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

describe("FolderCard", () => {
  const folder: Folder = {
    _id: "folder-1",
    name: "Work",
    owner: "user-1",
    createdAt: "2026-08-29T10:00:00.000Z",
    updatedAt: "2026-08-29T10:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAppSelector.mockImplementation(
  (selector: (state: MockRootState) => unknown) =>
    selector({
      folders: {
        isLoading: false,
        error: null,
      },
    }),
);

    mockDispatch.mockImplementation(() => ({
      unwrap: vi.fn().mockResolvedValue({}),
    }));

    vi.mocked(deleteFolder).mockReturnValue("delete-folder-action" as never);
  });

  it("renders the folder information", () => {
    render(<FolderCard folder={folder} onClick={mockOnClick} />);

    expect(screen.getByText("Work")).toBeInTheDocument();
    expect(screen.getByText("Folder")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Actions for Work",
      }),
    ).toBeInTheDocument();
  });

  it("calls onClick with the folder when the folder is clicked", () => {
    render(<FolderCard folder={folder} onClick={mockOnClick} />);

    const folderButton = screen.getByRole("button", {
      name: (name) => name.includes("Work") && name.includes("Folder"),
    });

    fireEvent.click(folderButton);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith(folder);
  });

  it("opens the rename dialog when Rename is clicked", () => {
    render(<FolderCard folder={folder} onClick={mockOnClick} />);

    fireEvent.click(screen.getByRole("button", { name: "Rename" }));

    expect(screen.getByTestId("folder-dialog")).toBeInTheDocument();

    expect(screen.getByText("Rename folder: Work")).toBeInTheDocument();
  });

  it("closes the rename dialog when requested", () => {
    render(<FolderCard folder={folder} onClick={mockOnClick} />);

    fireEvent.click(screen.getByRole("button", { name: "Rename" }));

    fireEvent.click(
      screen.getByRole("button", {
        name: "Close rename dialog",
      }),
    );

    expect(screen.queryByTestId("folder-dialog")).not.toBeInTheDocument();
  });

  it("opens the delete confirmation dialog when Delete is clicked", () => {
    render(<FolderCard folder={folder} onClick={mockOnClick} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: 'Delete "Work"?',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "This will permanently delete this folder and all notes inside it. This action cannot be undone.",
      ),
    ).toBeInTheDocument();
  });

  it("deletes the folder and closes the confirmation dialog", async () => {
    render(<FolderCard folder={folder} onClick={mockOnClick} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete folder",
      }),
    );

    await waitFor(() => {
      expect(deleteFolder).toHaveBeenCalledWith("folder-1");
    });

    expect(mockDispatch).toHaveBeenCalledWith("delete-folder-action");

    expect(screen.queryByTestId("confirm-dialog")).not.toBeInTheDocument();
  });

  it("does not close the confirmation dialog when deletion fails", async () => {
    mockDispatch.mockImplementation(() => ({
      unwrap: vi.fn().mockRejectedValue(new Error("Delete failed")),
    }));

    render(<FolderCard folder={folder} onClick={mockOnClick} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete folder",
      }),
    );

    await waitFor(() => {
      expect(deleteFolder).toHaveBeenCalledWith("folder-1");
    });

    expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
  });

  it("disables delete confirmation while deletion is loading", () => {
    mockUseAppSelector.mockImplementation(
  (selector: (state: MockRootState) => unknown) =>
    selector({
      folders: {
        isLoading: true,
        error: null,
      },
    }),
);

    render(<FolderCard folder={folder} onClick={mockOnClick} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(
      screen.getByRole("button", {
        name: "Delete folder",
      }),
    ).toBeDisabled();
  });

  it("allows cancelling the delete confirmation", () => {
    render(<FolderCard folder={folder} onClick={mockOnClick} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    fireEvent.click(
      screen.getByRole("button", {
        name: "Cancel delete",
      }),
    );

    expect(screen.queryByTestId("confirm-dialog")).not.toBeInTheDocument();
  });
});
