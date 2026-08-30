import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SignupForm from "@/components/auth/SignupForm";
import { register } from "@/store/authSlice";

const mockDispatch = vi.fn();
const mockUseAppSelector = vi.fn();
const mockNavigate = vi.fn();

vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: unknown) => mockUseAppSelector(selector),
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/store/authSlice", async () => {
  const actual =
    await vi.importActual<typeof import("@/store/authSlice")>(
      "@/store/authSlice",
    );

  return {
    ...actual,
    register: vi.fn(),
  };
});

const renderSignupForm = () => {
  return render(
    <MemoryRouter>
      <SignupForm />
    </MemoryRouter>,
  );
};

describe("SignupForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAppSelector.mockImplementation((selector) =>
      selector({
        auth: {
          isLoading: false,
          error: null,
        },
      }),
    );

    mockDispatch.mockImplementation(() => ({
      unwrap: vi.fn().mockResolvedValue({}),
    }));

    vi.mocked(register).mockReturnValue("register-action" as never);
  });

  it("renders the signup form", () => {
    renderSignupForm();

    expect(screen.getByLabelText("Full Name")).toBeInTheDocument();

    expect(screen.getByLabelText("Email")).toBeInTheDocument();

    expect(screen.getByLabelText("Password")).toBeInTheDocument();

    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Create Account",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Log in",
      }),
    ).toHaveAttribute("href", "/login");
  });

  it("updates all form fields", () => {
    renderSignupForm();

    const nameInput = screen.getByLabelText("Full Name");
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");

    fireEvent.change(nameInput, {
      target: { value: "Jane Doe" },
    });

    fireEvent.change(emailInput, {
      target: { value: "jane@example.com" },
    });

    fireEvent.change(passwordInput, {
      target: { value: "Password123" },
    });

    fireEvent.change(confirmPasswordInput, {
      target: { value: "Password123" },
    });

    expect(nameInput).toHaveValue("Jane Doe");
    expect(emailInput).toHaveValue("jane@example.com");
    expect(passwordInput).toHaveValue("Password123");
    expect(confirmPasswordInput).toHaveValue("Password123");
  });

  it("shows an error when passwords do not match", async () => {
    renderSignupForm();

    fireEvent.change(screen.getByLabelText("Full Name"), {
      target: { value: "Jane Doe" },
    });

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "jane@example.com" },
    });

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password123" },
    });

    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "DifferentPassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

    expect(
      await screen.findByText("Passwords do not match."),
    ).toBeInTheDocument();
  });

  it("registers the user and navigates to the dashboard", async () => {
    renderSignupForm();

    fireEvent.change(screen.getByLabelText("Full Name"), {
      target: { value: "Jane Doe" },
    });

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "jane@example.com" },
    });

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password123" },
    });

    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "Password123" },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Create Account",
      }),
    );

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "Password123",
      });
    });

    expect(mockDispatch).toHaveBeenCalledWith("register-action");

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("does not navigate when registration fails", async () => {
    mockDispatch.mockImplementation(() => ({
      unwrap: vi.fn().mockRejectedValue(new Error("Registration failed")),
    }));

    renderSignupForm();

    fireEvent.change(screen.getByLabelText("Full Name"), {
      target: { value: "Jane Doe" },
    });

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "jane@example.com" },
    });

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password123" },
    });

    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "Password123" },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Create Account",
      }),
    );

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "Password123",
      });
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("shows the authentication error", () => {
    mockUseAppSelector.mockImplementation((selector) =>
      selector({
        auth: {
          isLoading: false,
          error: "Email is already registered.",
        },
      }),
    );

    renderSignupForm();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Email is already registered.",
    );
  });

  it("shows the loading state while registration is in progress", () => {
    mockUseAppSelector.mockImplementation((selector) =>
      selector({
        auth: {
          isLoading: true,
          error: null,
        },
      }),
    );

    renderSignupForm();

    const button = screen.getByRole("button", {
      name: "Creating account...",
    });

    expect(button).toBeDisabled();
  });

  it("toggles password visibility", () => {
    renderSignupForm();

    const passwordInput = screen.getByLabelText("Password");

    expect(passwordInput).toHaveAttribute("type", "password");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Show password",
      }),
    );

    expect(passwordInput).toHaveAttribute("type", "text");

    expect(
      screen.getByRole("button", {
        name: "Hide password",
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Hide password",
      }),
    );

    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("toggles confirm password visibility", () => {
    renderSignupForm();

    const confirmPasswordInput = screen.getByLabelText("Confirm Password");

    expect(confirmPasswordInput).toHaveAttribute("type", "password");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Show confirm password",
      }),
    );

    expect(confirmPasswordInput).toHaveAttribute("type", "text");

    expect(
      screen.getByRole("button", {
        name: "Hide confirm password",
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Hide confirm password",
      }),
    );

    expect(confirmPasswordInput).toHaveAttribute("type", "password");
  });

  it("clears the password mismatch error when passwords match", async () => {
    renderSignupForm();

    fireEvent.change(screen.getByLabelText("Full Name"), {
      target: { value: "Jane Doe" },
    });

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "jane@example.com" },
    });

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password123" },
    });

    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "Different123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

    expect(
      await screen.findByText("Passwords do not match."),
    ).toBeInTheDocument();

    // Now make the passwords match
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "Password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

    await waitFor(() => {
      expect(
        screen.queryByText("Passwords do not match."),
      ).not.toBeInTheDocument();
    });
  });
});
