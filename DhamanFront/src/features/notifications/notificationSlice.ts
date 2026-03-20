import { createSlice } from "@reduxjs/toolkit";
import { getNotifications } from "./notificationActions";

export interface Notification {
    _id: string;
    recipientId: string;
    senderId: string;
    orderId: string;
    type: string;
    isRead: boolean;
}

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
    .addCase(getNotifications.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getNotifications.fulfilled, (state, action) => {
      state.loading = false;
      state.notifications = action.payload;
    })
    .addCase(getNotifications.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? "خطاء في جلب الاشعارات";
    })
     
  },
});

export const {} = notificationSlice.actions;
export default notificationSlice.reducer;
