import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { loginUser, logoutUser } from "./authActions";
import * as SecureStore from 'expo-secure-store';

export interface User {
  id: string;
  username: string;
  email: string;
  profileImageUrl?: string;
  phone: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Call this to clear state on logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      // Note: Actual storage deletion should be handled in the component 
      // or via an async thunk if you want to call the backend /logout
    },
    // Useful for restoring session from Index.tsx
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "خطأ في تسجيل الدخول"; // Default Arabic error message
      })
        
  },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;