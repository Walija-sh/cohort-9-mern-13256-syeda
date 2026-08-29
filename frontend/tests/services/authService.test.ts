import { describe, expect, it, vi, beforeEach } from "vitest";
import api from "@/lib/axios";
import authService from "@/services/authService";

vi.mock("@/lib/axios", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("should register a user and return the response data", async () => {
      const credentials = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      const responseData = {
        success: true,
        message: "Registration successful",
        data: {
          id: "user-1",
          name: "John Doe",
          email: "john@example.com",
        },
      };

      vi.mocked(api.post).mockResolvedValueOnce({
        data: responseData,
      });

      const result = await authService.register(credentials);

      expect(api.post).toHaveBeenCalledWith("/auth/register", credentials);
      expect(result).toEqual(responseData);
    });
  });

  describe("login", () => {
    it("should login a user and return the response data", async () => {
      const credentials = {
        email: "john@example.com",
        password: "password123",
      };

      const responseData = {
        success: true,
        message: "Login successful",
        data: {
          id: "user-1",
          name: "John Doe",
          email: "john@example.com",
        },
      };

      vi.mocked(api.post).mockResolvedValueOnce({
        data: responseData,
      });

      const result = await authService.login(credentials);

      expect(api.post).toHaveBeenCalledWith("/auth/login", credentials);
      expect(result).toEqual(responseData);
    });
  });

  describe("getMe", () => {
    it("should get the current user and return the response data", async () => {
      const responseData = {
        success: true,
        message: "User fetched successfully",
        data: {
          id: "user-1",
          name: "John Doe",
          email: "john@example.com",
        },
      };

      vi.mocked(api.get).mockResolvedValueOnce({
        data: responseData,
      });

      const result = await authService.getMe();

      expect(api.get).toHaveBeenCalledWith("/auth/me");
      expect(result).toEqual(responseData);
    });
  });

  describe("logout", () => {
    it("should logout the user and return the response data", async () => {
      const responseData = {
        success: true,
        message: "Logout successful",
      };

      vi.mocked(api.post).mockResolvedValueOnce({
        data: responseData,
      });

      const result = await authService.logout();

      expect(api.post).toHaveBeenCalledWith("/auth/logout");
      expect(result).toEqual(responseData);
    });
  });
});
