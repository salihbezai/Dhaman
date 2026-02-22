import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Order {
  id: string;
  description: string;
  status: "pending" | "confirmed" | "delivered";
}

interface OrdersState {
  orders: Order[];
  loading: boolean;
}

const initialState: OrdersState = {
  orders: [],
  loading: false,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    ordersLoadingStart: (state) => {
      state.loading = true;
    },
    ordersLoaded: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
      state.loading = false;
    },
    logout: (state) => {
      state.orders = [];
    },
  },
});

export const { ordersLoadingStart, ordersLoaded, logout } = ordersSlice.actions;
export default ordersSlice.reducer;