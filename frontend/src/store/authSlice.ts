import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import authService from "../services/authService";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "../types/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const register = createAsyncThunk<
  AuthResponse,
  RegisterCredentials,
  { rejectValue: string }
>("auth/register", async (credentials, thunkAPI) => {
  try {
    return await authService.register(credentials);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Registration failed."
    );
  }
});

export const login = createAsyncThunk<
  AuthResponse,
  LoginCredentials,
  { rejectValue: string }
>("auth/login", async (credentials, thunkAPI) => {
  try {
    return await authService.login(credentials);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Login failed."
    );
  }
});

export const getMe = createAsyncThunk<
  AuthResponse,
  void,
  { rejectValue: string }
>("auth/getMe", async (_, thunkAPI) => {
  try {
    return await authService.getMe();
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Failed to fetch user."
    );
  }
});

export const logout = createAsyncThunk<
  { success: boolean; message: string },
  void,
  { rejectValue: string }
>("auth/logout", async (_, thunkAPI) => {
  try {
    return await authService.logout();
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Logout failed."
    );
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Registration failed.";
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Login failed.";
      })
      .addCase(getMe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data;
        state.isAuthenticated = true;
      })
      .addCase(getMe.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Logout failed.";
      });
  },
});

export default authSlice.reducer;