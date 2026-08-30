import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import NoteDetails from "@/pages/NoteDetails";
import { clearCurrentNote, getNoteById } from "@/store/noteSlice";

const mockDispatch = vi.fn();
const mockNavigate = vi.fn();
const mockUseAppSelector = vi.fn();

let mockNoteId: string | undefined;

vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: unknown) => mockUseAppSelector(selector),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: mockNoteId }),
}));

vi.mock("@/store/noteSlice", async () => {
  const actual =
    await vi.importActual<typeof import("@/store/noteSlice")>(
      "@/store/noteSlice",
    );

  return {
    ...actual,
    clearCurrentNote: vi.fn(),
    getNoteById: vi.fn(),
  };
});

vi.mock("@/components/notes/NoteContent", () => ({
  default: ({ content }: { content: unknown }) => (
    <div data-testid="note-content">{JSON.stringify(content)}</div>
  ),
}));

describe("NoteDetails", () => {
  const note = {
    _id: "note-1",
    title: "My Test Note",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Hello from my note",
            },
          ],
        },
      ],
    },
    updatedAt: "2026-08-29T00:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockNoteId = "note-1";

    mockUseAppSelector.mockImplementation((selector) =>
      selector({
        notes: {
          currentNote: note,
          isLoading: false,
          error: null,
        },
      }),
    );

    mockDispatch.mockImplementation(() => undefined);

    vi.mocked(getNoteById).mockReturnValue("getNoteById-action" as never);

    vi.mocked(clearCurrentNote).mockReturnValue(
      "clearCurrentNote-action" as never,
    );
  });

  it("loads the note by id", () => {
    render(<NoteDetails />);

    expect(getNoteById).toHaveBeenCalledWith("note-1");
    expect(mockDispatch).toHaveBeenCalledWith("getNoteById-action");
  });

  it("renders the note details", () => {
    render(<NoteDetails />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "My Test Note",
      }),
    ).toBeInTheDocument();

    const updatedDate = new Date(note.updatedAt).toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    expect(screen.getByText(`Updated ${updatedDate}`)).toBeInTheDocument();

    expect(screen.getByTestId("note-content")).toHaveTextContent(
      "Hello from my note",
    );

    expect(screen.getByRole("button", { name: /Back/i })).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /Edit/i })).toBeInTheDocument();
  });

  it("navigates back when Back is clicked", () => {
    render(<NoteDetails />);

    fireEvent.click(screen.getByRole("button", { name: /Back/i }));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("navigates to the edit page when Edit is clicked", () => {
    render(<NoteDetails />);

    fireEvent.click(screen.getByRole("button", { name: /Edit/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/notes/note-1/edit");
  });

  it("shows the loading state", () => {
    mockUseAppSelector.mockImplementation((selector) =>
      selector({
        notes: {
          currentNote: null,
          isLoading: true,
          error: null,
        },
      }),
    );

    render(<NoteDetails />);

    expect(screen.getByText("Loading note...")).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /Edit/i }),
    ).not.toBeInTheDocument();
  });

  it("shows the error state with a Back button", () => {
    mockUseAppSelector.mockImplementation((selector) =>
      selector({
        notes: {
          currentNote: null,
          isLoading: false,
          error: "Failed to load note",
        },
      }),
    );

    render(<NoteDetails />);

    expect(screen.getByText("Failed to load note")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /Back/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Back/i }));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("shows the not found state when there is no current note", () => {
    mockUseAppSelector.mockImplementation((selector) =>
      selector({
        notes: {
          currentNote: null,
          isLoading: false,
          error: null,
        },
      }),
    );

    render(<NoteDetails />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Note not found",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("This note may have been deleted or no longer exists."),
    ).toBeInTheDocument();
  });

  it("does not load a note when there is no id", () => {
    mockNoteId = undefined;

    render(<NoteDetails />);

    expect(getNoteById).not.toHaveBeenCalled();
  });

  it("clears the current note when unmounted", () => {
    const { unmount } = render(<NoteDetails />);

    unmount();

    expect(clearCurrentNote).toHaveBeenCalled();
  });

  it("does not navigate to edit when the note id is missing", () => {
    mockNoteId = undefined;

    mockUseAppSelector.mockImplementation((selector) =>
      selector({
        notes: {
          currentNote: note,
          isLoading: false,
          error: null,
        },
      }),
    );

    render(<NoteDetails />);

    fireEvent.click(screen.getByRole("button", { name: /Edit/i }));

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
