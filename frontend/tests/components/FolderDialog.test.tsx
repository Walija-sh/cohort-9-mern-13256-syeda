import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

import FolderDialog from "@/components/folders/FolderDialog";
import { createFolder, updateFolder } from "@/store/folderSlice";
import type { Folder } from "@/types/folder";

const mockDispatch = vi.fn();
const mockUseAppSelector = vi.fn();
const mockOnOpenChange = vi.fn();

let mockState: {
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
  const actual =
    await vi.importActual<typeof import("../../src/store/folderSlice")>(
      "@/store/folderSlice",
    );

  return {
    ...actual,
    createFolder: vi.fn(),
    updateFolder: vi.fn(),
  };
});

// Keep the test focused on FolderDialog behavior rather than Radix internals.
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({
    open,
    onOpenChange,
    children,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
  }) =>
    open ? (
      <div data-testid="dialog">
        {children}

        <button type="button" onClick={() => onOpenChange(false)}>
          Close dialog
        </button>
      </div>
    ) : null,

  DialogContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),

  DialogDescription: ({ children }: { children: ReactNode }) => (
    <p>{children}</p>
  ),

  DialogFooter: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),

  DialogHeader: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),

  DialogTitle: ({ children }: { children: ReactNode }) => (
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
    children: ReactNode;
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

vi.mock("@/components/ui/input", () => ({
  Input: ({
    value,
    onChange,
    onKeyDown,
    placeholder,
    disabled,
    maxLength,
    autoFocus,
  }: {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    placeholder?: string;
    disabled?: boolean;
    maxLength?: number;
    autoFocus?: boolean;
  }) => (
    <input
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      maxLength={maxLength}
      autoFocus={autoFocus}
    />
  ),
}));

describe("FolderDialog", () => {
  // Complete Folder fixture matching the application's actual Folder type.
  const folder: Folder = {
    _id: "folder-1",
    name: "Work",
    owner: "user-1",
    createdAt: "2026-08-29T00:00:00.000Z",
    updatedAt: "2026-08-29T00:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockState = {
      folders: {
        isLoading: false,
        error: null,
      },
    };

    mockUseAppSelector.mockImplementation((selector) =>
      selector(mockState),
    );

    mockDispatch.mockImplementation(() => ({
      unwrap: vi.fn().mockResolvedValue({}),
    }));

    vi.mocked(createFolder).mockReturnValue(
      "createFolder-action" as never,
    );

    vi.mocked(updateFolder).mockReturnValue(
      "updateFolder-action" as never,
    );
  });

  it("renders the create folder dialog", () => {
    render(
      <FolderDialog
        open
        onOpenChange={mockOnOpenChange}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Create folder" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Create a new folder to organize your notes.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Folder name"),
    ).toHaveValue("");

    expect(
      screen.getByRole("button", { name: "Create folder" }),
    ).toBeDisabled();
  });

  it("renders the rename folder dialog with the existing name", () => {
    render(
      <FolderDialog
        folder={folder}
        open
        onOpenChange={mockOnOpenChange}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Rename folder" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Update the name of this folder."),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Folder name"),
    ).toHaveValue("Work");

    expect(
      screen.getByRole("button", { name: "Save changes" }),
    ).toBeEnabled();
  });

  it("does not render the dialog when closed", () => {
    render(
      <FolderDialog
        open={false}
        onOpenChange={mockOnOpenChange}
      />,
    );

    expect(
      screen.queryByTestId("dialog"),
    ).not.toBeInTheDocument();
  });

  it("creates a folder with a trimmed name", async () => {
    render(
      <FolderDialog
        open
        onOpenChange={mockOnOpenChange}
      />,
    );

    const input = screen.getByPlaceholderText("Folder name");

    fireEvent.change(input, {
      target: { value: "  Personal  " },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Create folder" }),
    );

    await waitFor(() => {
      expect(createFolder).toHaveBeenCalledWith({
        name: "Personal",
      });
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      "createFolder-action",
    );

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not create a folder when the name is empty", () => {
    render(
      <FolderDialog
        open
        onOpenChange={mockOnOpenChange}
      />,
    );

    const input = screen.getByPlaceholderText("Folder name");

    fireEvent.change(input, {
      target: { value: "   " },
    });

    expect(
      screen.getByRole("button", { name: "Create folder" }),
    ).toBeDisabled();

    fireEvent.click(
      screen.getByRole("button", { name: "Create folder" }),
    );

    expect(createFolder).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("creates a folder when Enter is pressed", async () => {
    render(
      <FolderDialog
        open
        onOpenChange={mockOnOpenChange}
      />,
    );

    const input = screen.getByPlaceholderText("Folder name");

    fireEvent.change(input, {
      target: { value: "Projects" },
    });

    fireEvent.keyDown(input, {
      key: "Enter",
    });

    await waitFor(() => {
      expect(createFolder).toHaveBeenCalledWith({
        name: "Projects",
      });
    });

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("updates an existing folder with a trimmed name", async () => {
    render(
      <FolderDialog
        folder={folder}
        open
        onOpenChange={mockOnOpenChange}
      />,
    );

    const input = screen.getByPlaceholderText("Folder name");

    fireEvent.change(input, {
      target: { value: "  Updated Work  " },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Save changes" }),
    );

    await waitFor(() => {
      expect(updateFolder).toHaveBeenCalledWith({
        id: "folder-1",
        payload: {
          name: "Updated Work",
        },
      });
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      "updateFolder-action",
    );

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not close the dialog when creating a folder fails", async () => {
    mockDispatch.mockImplementation(() => ({
      unwrap: vi.fn().mockRejectedValue(new Error("Create failed")),
    }));

    render(
      <FolderDialog
        open
        onOpenChange={mockOnOpenChange}
      />,
    );

    fireEvent.change(
      screen.getByPlaceholderText("Folder name"),
      {
        target: { value: "Projects" },
      },
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Create folder" }),
    );

    await waitFor(() => {
      expect(createFolder).toHaveBeenCalledWith({
        name: "Projects",
      });
    });

    expect(mockOnOpenChange).not.toHaveBeenCalled();
  });

  it("does not close the dialog when updating a folder fails", async () => {
    mockDispatch.mockImplementation(() => ({
      unwrap: vi.fn().mockRejectedValue(new Error("Update failed")),
    }));

    render(
      <FolderDialog
        folder={folder}
        open
        onOpenChange={mockOnOpenChange}
      />,
    );

    fireEvent.change(
      screen.getByPlaceholderText("Folder name"),
      {
        target: { value: "Renamed Work" },
      },
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Save changes" }),
    );

    await waitFor(() => {
      expect(updateFolder).toHaveBeenCalledWith({
        id: "folder-1",
        payload: {
          name: "Renamed Work",
        },
      });
    });

    expect(mockOnOpenChange).not.toHaveBeenCalled();
  });

  it("shows the loading state for creating a folder", () => {
    mockState.folders.isLoading = true;

    render(
      <FolderDialog
        open
        onOpenChange={mockOnOpenChange}
      />,
    );

    fireEvent.change(
      screen.getByPlaceholderText("Folder name"),
      {
        target: { value: "Projects" },
      },
    );

    expect(
      screen.getByRole("button", { name: "Creating..." }),
    ).toBeDisabled();

    expect(
      screen.getByRole("button", { name: "Cancel" }),
    ).toBeDisabled();
  });

  it("shows the loading state for updating a folder", () => {
    mockState.folders.isLoading = true;

    render(
      <FolderDialog
        folder={folder}
        open
        onOpenChange={mockOnOpenChange}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Saving..." }),
    ).toBeDisabled();

    expect(
      screen.getByRole("button", { name: "Cancel" }),
    ).toBeDisabled();
  });

  it("shows the folder error", () => {
    mockState.folders.error = "Folder already exists";

    render(
      <FolderDialog
        open
        onOpenChange={mockOnOpenChange}
      />,
    );

    expect(
      screen.getByRole("alert"),
    ).toHaveTextContent("Folder already exists");
  });

  it("closes the dialog when Cancel is clicked", () => {
    render(
      <FolderDialog
        open
        onOpenChange={mockOnOpenChange}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Cancel" }),
    );

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes the dialog when the dialog requests closing", () => {
    render(
      <FolderDialog
        open
        onOpenChange={mockOnOpenChange}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Close dialog" }),
    );

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
