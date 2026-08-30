import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DashboardLayout from "@/layouts/DashboardLayout";
import type { AppDispatch } from "@/store/store";

const mockDispatch = vi.fn<AppDispatch>();

vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
}));

vi.mock("@/store/authSlice", () => ({
  logout: () => ({ type: "auth/logout" }),
}));

vi.mock("@/components/Logo", () => ({
  default: () => <div>Logo</div>,
}));

const renderLayout = (initialEntry = "/dashboard") => {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<div>Dashboard Content</div>} />

          <Route path="folders/:folderId" element={<div>Folder Content</div>} />

          <Route
            path="folders/:folderId/notes/new"
            element={<div data-testid="new-folder-note">New Folder Note</div>}
          />

          <Route
            path="notes/new"
            element={<div data-testid="new-note-page">New Note Page</div>}
          />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
};

describe("DashboardLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.classList.remove("dark");
  });

  it("renders the dashboard content and navigation", () => {
    renderLayout();

    expect(screen.getAllByText("NotesHub")).toHaveLength(2);
    expect(screen.getByText("Productivity Workspace")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /notes/i })).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /new note/i }),
    ).toBeInTheDocument();

    expect(screen.getByText("Dashboard Content")).toBeInTheDocument();
  });

  it("navigates to the new note page", () => {
    renderLayout();

    fireEvent.click(screen.getByRole("button", { name: /new note/i }));

    expect(screen.getByTestId("new-note-page")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard Content")).not.toBeInTheDocument();
  });

  it("navigates to a new note inside the current folder", () => {
    renderLayout("/dashboard/folders/folder-123");

    fireEvent.click(screen.getByRole("button", { name: /new note/i }));

    expect(screen.getByTestId("new-folder-note")).toBeInTheDocument();
  });

  it("dispatches logout when logout is clicked", () => {
    renderLayout();

    fireEvent.click(screen.getByRole("button", { name: /logout/i }));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "auth/logout",
    });
  });

  it("toggles dark mode", () => {
    renderLayout();

    expect(document.documentElement.classList.contains("dark")).toBe(false);

    const themeButton = screen.getByRole("button", {
      name: /dark mode/i,
    });

    fireEvent.click(themeButton);

    expect(document.documentElement.classList.contains("dark")).toBe(true);

    expect(
      screen.getByRole("button", {
        name: /light mode/i,
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: /light mode/i,
      }),
    );

    expect(document.documentElement.classList.contains("dark")).toBe(false);

    expect(
      screen.getByRole("button", {
        name: /dark mode/i,
      }),
    ).toBeInTheDocument();
  });

  it("opens the mobile navigation menu", () => {
    renderLayout();

    fireEvent.click(
      screen.getByRole("button", {
        name: /open navigation/i,
      }),
    );

    expect(
      screen.getByRole("dialog", {
        name: /navigation menu/i,
      }),
    ).toBeInTheDocument();
  });

  it("closes the mobile navigation using the close button", () => {
    renderLayout();

    fireEvent.click(
      screen.getByRole("button", {
        name: /open navigation/i,
      }),
    );

    const dialog = screen.getByRole("dialog", {
      name: /navigation menu/i,
    });

    expect(dialog).toBeInTheDocument();

    const closeButton = dialog.querySelector(
      'button[aria-label="Close navigation"]',
    );

    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton!);

    expect(
      screen.queryByRole("dialog", {
        name: /navigation menu/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("closes the mobile navigation when the backdrop is clicked", () => {
    renderLayout();

    fireEvent.click(
      screen.getByRole("button", {
        name: /open navigation/i,
      }),
    );

    const backdrop = screen.getAllByRole("button", {
      name: /close navigation/i,
    })[0];

    fireEvent.click(backdrop);

    expect(
      screen.queryByRole("dialog", {
        name: /navigation menu/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("closes the mobile menu when a navigation link is clicked", () => {
    renderLayout();

    fireEvent.click(
      screen.getByRole("button", {
        name: /open navigation/i,
      }),
    );

    const dialog = screen.getByRole("dialog", {
      name: /navigation menu/i,
    });

    const notesLinks = screen.getAllByRole("link", {
      name: /notes/i,
    });

    const mobileNotesLink = notesLinks.find((link) => dialog.contains(link));

    expect(mobileNotesLink).toBeDefined();

    fireEvent.click(mobileNotesLink!);

    expect(
      screen.queryByRole("dialog", {
        name: /navigation menu/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("closes the mobile menu when Escape is pressed", () => {
    renderLayout();

    fireEvent.click(
      screen.getByRole("button", {
        name: /open navigation/i,
      }),
    );

    expect(
      screen.getByRole("dialog", {
        name: /navigation menu/i,
      }),
    ).toBeInTheDocument();

    fireEvent.keyDown(document, {
      key: "Escape",
    });

    expect(
      screen.queryByRole("dialog", {
        name: /navigation menu/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("wraps focus to the last element when Shift+Tab is pressed on the first element", () => {
    renderLayout();

    fireEvent.click(
      screen.getByRole("button", {
        name: /open navigation/i,
      }),
    );

    const dialog = screen.getByRole("dialog", {
      name: /navigation menu/i,
    });

    const focusableElements = dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
    );

    expect(focusableElements.length).toBeGreaterThan(1);

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement.focus();

    expect(document.activeElement).toBe(firstElement);

    fireEvent.keyDown(document, {
      key: "Tab",
      shiftKey: true,
    });

    expect(document.activeElement).toBe(lastElement);
  });

  it("wraps focus to the first element when Tab is pressed on the last element", () => {
    renderLayout();

    fireEvent.click(
      screen.getByRole("button", {
        name: /open navigation/i,
      }),
    );

    const dialog = screen.getByRole("dialog", {
      name: /navigation menu/i,
    });

    const focusableElements = dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
    );

    expect(focusableElements.length).toBeGreaterThan(1);

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    lastElement.focus();

    expect(document.activeElement).toBe(lastElement);

    fireEvent.keyDown(document, {
      key: "Tab",
    });

    expect(document.activeElement).toBe(firstElement);
  });

  it("returns focus to the menu button when the mobile menu closes", () => {
    renderLayout();

    const menuButton = screen.getByRole("button", {
      name: /open navigation/i,
    });

    fireEvent.click(menuButton);

    expect(
      screen.getByRole("dialog", {
        name: /navigation menu/i,
      }),
    ).toBeInTheDocument();

    fireEvent.keyDown(document, {
      key: "Escape",
    });

    expect(document.activeElement).toBe(menuButton);
  });
});
