import api from "@/lib/axios";
import type {
  AuthResponse,
  LoginCredentials,
  LogoutResponse,
  RegisterCredentials,
} from "@/types/auth";

const register = async (
  credentials: RegisterCredentials,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/register", credentials);
  return response.data;
};
const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", credentials);
  return response.data;
};
const getMe = async (): Promise<AuthResponse> => {
  const response = await api.get<AuthResponse>("/auth/me");
  return response.data;
};
const logout = async (): Promise<LogoutResponse> => {
  const response = await api.post<LogoutResponse>("/auth/logout");
  return response.data;
};

const authService = {
  register,
  login,
  getMe,
  logout,
};

export default authService;
