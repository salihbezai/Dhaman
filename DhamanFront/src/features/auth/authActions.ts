import api from "@/src/api/axios";
import { getErrorMessage } from "@/src/utils/errorHelper";
import { createAsyncThunk } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import { User } from "./authSlice";

interface LoginResponse {
  user: {
    id: string;
    username: string;
    email: string;
    profileImageUrl?: string;
    phone: string;
    role: string;
  };
  token: string;
  refreshToken: string;
}

export const loginUser = createAsyncThunk<
  LoginResponse,
  { username: string; password: string },
  { rejectValue: string }
>("auth/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/login", credentials);
    // Save tokens to Secure Storage immediately upon successful login
    await SecureStore.setItemAsync("accessToken", data.token);
    await SecureStore.setItemAsync("refreshToken", data.refreshToken);
    console.log("the data that we got " + JSON.stringify(data));
    return data;
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error));
  }
});


export const fetchProfile = createAsyncThunk<
  { user: User },
  void,
  { rejectValue: string }
>("auth/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/auth/me");
    return data;
  } catch (error: any) {
    return rejectWithValue(getErrorMessage(error));
  }
});


export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, { rejectWithValue }) => {
  try {
   
    const refreshToken = await SecureStore.getItemAsync("refreshToken");

    await api.post("/auth/logout", { token: refreshToken });

    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");

    return true;
  } catch (error: unknown) {
    // Even if the server fails, we usually want to clear local storage anyway
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    return rejectWithValue(getErrorMessage(error));
  }
});
