import api from "@/src/api/axios";
import { getErrorMessage } from "@/src/utils/errorHelper";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Notification } from "./notificationSlice";





export const getNotifications = createAsyncThunk<
  Notification[],
  void,
  { rejectValue: string }
>("orders/getNotifications", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/confirmer/notifications");
    return data.notifications;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});