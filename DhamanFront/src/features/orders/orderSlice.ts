import { createSlice } from "@reduxjs/toolkit";
import { getConfirmerOrders } from "./orderActions";

export interface Order {
  customerName: string;
  customerPhone: string;
  address: string;
  wilaya: string;
  items: [
    {
      product: string;
      productName: string;
      quantity: number;
      priceAtTimeOfOrder: number;
    },
  ];
  totalAmount: number;
  deliveryPrice: number;
  status: string;

  confirmerId?: string;
  driverId?: string;

  callAttempts: number;
  postponedDate?: Date;
  deliveryNotificationSent: boolean;
  paymentReceived: number;

  history: [
    {
      status: string;
      updatedAt: Date;
      updatedBy: string;
      note?: string;
    },
  ];
}

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getConfirmerOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getConfirmerOrders.fulfilled, (state, action) => {
        state.loading = false;
        // state.orders = action.payload;
      })
      .addCase(getConfirmerOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "خطاء في جلب الطلبات";
      });
  },
});

export const {} = orderSlice.actions;
export default orderSlice.reducer;
