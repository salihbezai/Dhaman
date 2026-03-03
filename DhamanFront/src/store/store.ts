import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import orderReducer from "../features/orders/orderSlice"
import productReducer from "../features/products/productSlice"
import superVisorSlice from "../features/supervisor/supervisorSlice"
export const store = configureStore({
  reducer: {
    auth: authReducer,
    orders: orderReducer,
    products: productReducer,
    supervisor: superVisorSlice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;