import { createAsyncThunk } from "@reduxjs/toolkit";

export interface LoginPayload {
  username: string;
  password: string;
}

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ username, password }: LoginPayload, { rejectWithValue }) => {
    try {
    //   // 🔥 Replace with your backend URL
    //   const response = await fetch("https://your-api.com/login", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ username, password }),
    //   });

    //   const data = await response.json();

    //   if (!response.ok) {
    //     return rejectWithValue(data.message || "Login failed");
    //   }

    //   return data; // must match User interface
    console.log("api call")
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);