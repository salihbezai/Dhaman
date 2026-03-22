import { createSlice } from "@reduxjs/toolkit";
import { getNotifications, handleMarkAsRead } from "./notificationActions";

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
    .addCase(handleMarkAsRead.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(handleMarkAsRead.fulfilled, (state, action) => {
      state.loading = false;
      // find the notification in the state and change the notification 
      // with the new one that we gaonna get from the action.payload 
      // using the index of the notification in the state
      const index = state.notifications.findIndex(
        (notification) => notification._id === action.payload._id
      );
      if (index !== -1) {
        state.notifications[index] = action.payload;
      }
    })
    .addCase(handleMarkAsRead.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? "خطاء في جعل التنبيه مقروء ";
    })

  },
});

export const {} = notificationSlice.actions;
export default notificationSlice.reducer;
