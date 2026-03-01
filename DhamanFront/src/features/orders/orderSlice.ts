import { createSlice } from "@reduxjs/toolkit";
import { getConfirmerOrders, handleCancelOrder, handleConfirmTheOrder, handleNoAnswerOrder, handlePostponeOrder, updateOrderByConfirmer } from "./orderActions";

export interface Order {
    _id: string;
  orderNumber: string;
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
  refreshing: boolean;
  loading: boolean;
  loadingStatusOrder: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  refreshing: false,
  loading: false,
  loadingStatusOrder: false,
  error: null,
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getConfirmerOrders.pending, (state) => {
        state.loading = true;
        state.refreshing = true;
        state.error = null;
      })
      .addCase(getConfirmerOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.orders = action.payload.orders;
      })
      .addCase(getConfirmerOrders.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload ?? "خطاء في جلب الطلبات";
      })
      .addCase(handleNoAnswerOrder.pending, (state) => {
        state.loadingStatusOrder = true;
        state.error = null;
      })
      .addCase(handleNoAnswerOrder.fulfilled, (state, action) => {
        state.loadingStatusOrder = false;
        state.error = null;
        const updatedOrderIndex = state.orders.findIndex(
          (order) => order._id === action.payload._id,
        );
        if (updatedOrderIndex !== -1) {
          state.orders[updatedOrderIndex] = action.payload;
        }
      
      })
      .addCase(handleNoAnswerOrder.rejected, (state, action) => {
        state.loadingStatusOrder = false;
        state.error = action.payload ?? "خطاء في رفض الطلب";
      })
      .addCase(handleCancelOrder.pending, (state) => {
        state.loadingStatusOrder = true;
        state.error = null;
      })
      .addCase(handleCancelOrder.fulfilled, (state, action) => {
        state.loadingStatusOrder = false;
        state.error = null;
        const updatedOrderIndex = state.orders.findIndex(
          (order) => order._id === action.payload._id,
        );
        if (updatedOrderIndex !== -1) {
          state.orders[updatedOrderIndex] = action.payload;
        }
      })
      .addCase(handleCancelOrder.rejected, (state, action) => {
        state.loadingStatusOrder = false;
        state.error = action.payload ?? "خطاء في رفض الطلب";
      })
      .addCase(handleConfirmTheOrder.pending, (state) => {
        state.loadingStatusOrder = true;
        state.error = null;
      })
      .addCase(handleConfirmTheOrder.fulfilled, (state, action) => {
        state.loadingStatusOrder = false;
        state.error = null;
        const updatedOrderIndex = state.orders.findIndex(
          (order) => order._id === action.payload._id,
        );
        if (updatedOrderIndex !== -1) {
          state.orders[updatedOrderIndex] = action.payload;
        }
      })
      .addCase(handleConfirmTheOrder.rejected, (state, action) => {
        state.loadingStatusOrder = false;
        state.error = action.payload ?? "خطاء في تاكيد الطلب";
      })
      .addCase(handlePostponeOrder.pending, (state) => {
        state.loadingStatusOrder = true;
        state.error = null;
      })
      .addCase(handlePostponeOrder.fulfilled, (state, action) => {
        state.loadingStatusOrder = false;
        state.error = null;
        const updatedOrderIndex = state.orders.findIndex(
          (order) => order._id === action.payload._id,
        );
        if (updatedOrderIndex !== -1) {
          state.orders[updatedOrderIndex] = action.payload;
        }
      })
      .addCase(handlePostponeOrder.rejected, (state, action) => {
        state.loadingStatusOrder = false;
        state.error = action.payload ?? "خطاء في تاكيد الطلب";
      })
      .addCase(updateOrderByConfirmer.pending, (state) => {
        state.loadingStatusOrder = true;
        state.error = null;
      })
      .addCase(updateOrderByConfirmer.fulfilled, (state, action) => {
        state.loadingStatusOrder = false;
        state.error = null;
        const updatedOrderIndex = state.orders.findIndex(
          (order) => order._id === action.payload._id,
        );
        if (updatedOrderIndex !== -1) {
          state.orders[updatedOrderIndex] = action.payload;
        }
      })
      .addCase(updateOrderByConfirmer.rejected, (state, action) => {
        state.loadingStatusOrder = false;
        state.error = action.payload ?? "خطاء في تاكيد الطلب";
      })
  },
});

export const {} = orderSlice.actions;
export default orderSlice.reducer;
