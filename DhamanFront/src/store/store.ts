import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import orderReducer from "../features/orders/orderSlice"
import productReducer from "../features/products/productSlice"
import userSlice from "../features/user/userSlice"
import notificationsReducer from "../features/notifications/notificationSlice"
export const store = configureStore({
  reducer: {
    auth: authReducer,
    orders: orderReducer,
    products: productReducer,
    users: userSlice,
    notifications: notificationsReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;