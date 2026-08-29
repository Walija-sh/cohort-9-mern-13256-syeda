import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import LoginForm from "@/components/auth/LoginForm";

const mockNavigate = vi.fn();
const mockDispatch = vi.fn();

let mockAuthState = {
  isLoading: false,
  error: null as string | null,
};

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

vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (
    selector: (state: { auth: typeof mockAuthState }) => unknown,
  ) => selector({ auth: mockAuthState }),
}));

vi.mock("@/store/authSlice", () => ({
  login: vi.fn((payload) => ({
    type: "auth/login",
    payload,
  })),
}));

const renderLoginForm = () =>
  render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>,
  );

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockAuthState = {
      isLoading: false,
      error: null,
    };
  });

  it("renders the login form", () => {
    renderLoginForm();

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log In" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute(
      "href",
      "/signup",
    );
  });

  it("updates the email and password fields", async () => {
    const user = userEvent.setup();

    renderLoginForm();

    const email = screen.getByLabelText("Email");
    const password = screen.getByLabelText("Password");

    await user.type(email, "jane@example.com");
    await user.type(password, "Password123");

    expect(email).toHaveValue("jane@example.com");
    expect(password).toHaveValue("Password123");
  });

  it("logs in the user and navigates to the dashboard", async () => {
    const user = userEvent.setup();

    mockDispatch.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        user: {
          _id: "user-1",
          name: "Jane Doe",
          email: "jane@example.com",
        },
      }),
    });

    renderLoginForm();

    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "Password123");

    await user.click(screen.getByRole("button", { name: "Log In" }));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "auth/login",
      payload: {
        email: "jane@example.com",
        password: "Password123",
      },
    });

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  it("does not navigate when login fails", async () => {
    const user = userEvent.setup();

    mockDispatch.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue(new Error("Invalid credentials")),
    });

    renderLoginForm();

    await user.type(screen.getByLabelText("Email"), "wrong@example.com");
    await user.type(screen.getByLabelText("Password"), "WrongPassword");

    await user.click(screen.getByRole("button", { name: "Log In" }));

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("shows the authentication error", () => {
    mockAuthState.error = "Invalid email or password.";

    renderLoginForm();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Invalid email or password.",
    );
  });

  it("shows the loading state while login is in progress", () => {
    mockAuthState.isLoading = true;

    renderLoginForm();

    const button = screen.getByRole("button", {
      name: "Logging in...",
    });

    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Logging in...");
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();

    renderLoginForm();

    const password = screen.getByLabelText("Password");
    const toggleButton = screen.getByRole("button", {
      name: "Show password",
    });

    expect(password).toHaveAttribute("type", "password");

    await user.click(toggleButton);

    expect(password).toHaveAttribute("type", "text");
    expect(
      screen.getByRole("button", { name: "Hide password" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Hide password" }));

    expect(password).toHaveAttribute("type", "password");
    expect(
      screen.getByRole("button", { name: "Show password" }),
    ).toBeInTheDocument();
  });

  it("links to the signup page", async () => {
    const user = userEvent.setup();

    renderLoginForm();

    const signupLink = screen.getByRole("link", { name: "Sign up" });

    expect(signupLink).toHaveAttribute("href", "/signup");

    await user.click(signupLink);

    expect(signupLink).toBeInTheDocument();
  });
});
