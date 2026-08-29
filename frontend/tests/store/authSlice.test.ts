import { describe, expect, it } from "vitest";
import reducer, {
  clearError,
  getMe,
  login,
  logout,
  register,
} from "../../src/store/authSlice";
import type { User } from "../../src/types/auth";

const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: "user-1",
  name: "Test User",
  email: "test@example.com",
  ...overrides,
});

describe("authSlice", () => {
  const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
    error: null,
  };

  describe("clearError", () => {
    it("clears the authentication error", () => {
      const stateWithError = {
        ...initialState,
        error: "Login failed.",
      };

      const state = reducer(stateWithError, clearError());

      expect(state.error).toBeNull();
    });
  });

  describe("register", () => {
    const credentials = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    };

    it("sets loading state when registration starts", () => {
      const state = reducer(
        initialState,
        register.pending("request-1", credentials),
      );

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("authenticates the user after successful registration", () => {
      const user = createMockUser();

      const response = {
        success: true,
        message: "Registration successful.",
        data: user,
      };

      const state = reducer(
        initialState,
        register.fulfilled(
          response,
          "request-1",
          credentials,
        ),
      );

      expect(state.isLoading).toBe(false);
      expect(state.user).toEqual(user);
      expect(state.isAuthenticated).toBe(true);
    });

    it("stores the registration error when registration fails", () => {
      const state = reducer(
        initialState,
        register.rejected(
          new Error("Request failed"),
          "request-1",
          credentials,
          "Registration failed.",
        ),
      );

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe("Registration failed.");
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe("login", () => {
    const credentials = {
      email: "test@example.com",
      password: "password123",
    };

    it("sets loading state when login starts", () => {
      const state = reducer(
        initialState,
        login.pending("request-1", credentials),
      );

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("authenticates the user after successful login", () => {
      const user = createMockUser();

      const response = {
        success: true,
        message: "Login successful.",
        data: user,
      };

      const state = reducer(
        initialState,
        login.fulfilled(
          response,
          "request-1",
          credentials,
        ),
      );

      expect(state.isLoading).toBe(false);
      expect(state.user).toEqual(user);
      expect(state.isAuthenticated).toBe(true);
    });

    it("stores the login error when login fails", () => {
      const state = reducer(
        initialState,
        login.rejected(
          new Error("Request failed"),
          "request-1",
          credentials,
          "Login failed.",
        ),
      );

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe("Login failed.");
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe("getMe", () => {
    it("sets loading state when checking the current user", () => {
      const state = reducer(
        initialState,
        getMe.pending("request-1", undefined),
      );

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("authenticates and initializes the user after success", () => {
      const user = createMockUser();

      const response = {
        success: true,
        message: "User retrieved successfully.",
        data: user,
      };

      const state = reducer(
        initialState,
        getMe.fulfilled(
          response,
          "request-1",
          undefined,
        ),
      );

      expect(state.isLoading).toBe(false);
      expect(state.user).toEqual(user);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isInitialized).toBe(true);
    });

    it("initializes authentication as unauthenticated when getMe fails", () => {
      const state = reducer(
        initialState,
        getMe.rejected(
          new Error("Unauthorized"),
          "request-1",
          undefined,
          "Failed to fetch user.",
        ),
      );

      expect(state.isLoading).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isInitialized).toBe(true);
    });

    it("clears an existing user when getMe fails", () => {
      const existingUser = createMockUser();

      const authenticatedState = {
        ...initialState,
        user: existingUser,
        isAuthenticated: true,
      };

      const state = reducer(
        authenticatedState,
        getMe.rejected(
          new Error("Unauthorized"),
          "request-1",
          undefined,
          "Failed to fetch user.",
        ),
      );

      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isInitialized).toBe(true);
      expect(state.isLoading).toBe(false);
    });
  });

  describe("logout", () => {
    it("sets loading state when logout starts", () => {
      const state = reducer(
        initialState,
        logout.pending("request-1", undefined),
      );

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("clears the user after successful logout", () => {
      const user = createMockUser();

      const authenticatedState = {
        ...initialState,
        user,
        isAuthenticated: true,
      };

      const response = {
        success: true,
        message: "Logout successful.",
      };

      const state = reducer(
        authenticatedState,
        logout.fulfilled(
          response,
          "request-1",
          undefined,
        ),
      );

      expect(state.isLoading).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it("stores the logout error when logout fails", () => {
      const user = createMockUser();

      const authenticatedState = {
        ...initialState,
        user,
        isAuthenticated: true,
      };

      const state = reducer(
        authenticatedState,
        logout.rejected(
          new Error("Request failed"),
          "request-1",
          undefined,
          "Logout failed.",
        ),
      );

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe("Logout failed.");
      expect(state.user).toEqual(user);
      expect(state.isAuthenticated).toBe(true);
    });
  });
});
