import api from "@/src/api/axios";
import { getErrorMessage } from "@/src/utils/errorHelper";
import { createAsyncThunk } from "@reduxjs/toolkit";

interface LoginPayload {
  username: string;
  password: string;
}
interface loginResponse {
  id: string;
  username: string;
  token: string;
}

// login user thunk
const loginUser = createAsyncThunk<
  loginResponse,
  { email: string; password: string },
  { rejectValue: string }
>(
  "auth/loginUser",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.post("/auth/login", credentials);
      // setAccessToken(data.token);
      return data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export { loginUser };