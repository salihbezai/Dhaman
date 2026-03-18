import { createSlice } from "@reduxjs/toolkit";
import { acceptOrderByDriver, getDriverOrders, getOrders, handleAddOrder, handleCancelOrder, handleConfirmTheOrder, handleNoAnswerOrder, handlePostponeOrder, handleRemoveOrderByConfirmer, sendArrivalNotification, updateOrderByConfirmer, updateOrderStatusByDriver } from "./orderActions";

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
      .addCase(getOrders.pending, (state) => {
        state.loading = true;
        state.refreshing = true;
        state.error = null;
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.orders = action.payload;
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload ?? "خطاء في جلب الطلبات";
      })
      .addCase(getDriverOrders.pending, (state) => {
        state.loading = true;
        state.refreshing = true;
        state.error = null;
      })
      .addCase(getDriverOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.orders = action.payload;
      })
      .addCase(getDriverOrders.rejected, (state, action) => {
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
      .addCase(handleAddOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(handleAddOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.orders.push(action.payload);
      })
      .addCase(handleAddOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "خطاء في اضافة الطلبية";
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
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderByConfirmer.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const updatedOrderIndex = state.orders.findIndex(
          (order) => order._id === action.payload._id,
        );
        if (updatedOrderIndex !== -1) {
          state.orders[updatedOrderIndex] = action.payload;
        }
      })
      .addCase(updateOrderByConfirmer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "خطاء في تاكيد الطلب";
      })
      .addCase(handleRemoveOrderByConfirmer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(handleRemoveOrderByConfirmer.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const updatedOrderIndex = state.orders.findIndex(
          (order) => order._id === action.payload._id,
        );
        if (updatedOrderIndex !== -1) {
          state.orders.splice(updatedOrderIndex, 1);
        }
      })
      .addCase(handleRemoveOrderByConfirmer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "خطاء في تاكيد الطلب";
      })
      .addCase(updateOrderStatusByDriver.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatusByDriver.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const updatedOrderIndex = state.orders.findIndex(
          (order) => order._id === action.payload._id,
        );
        if (updatedOrderIndex !== -1) {
          state.orders[updatedOrderIndex] = action.payload;
        }
      })
      .addCase(updateOrderStatusByDriver.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "خطاء في تاكيد الطلب";
      })
      .addCase(sendArrivalNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendArrivalNotification.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const updatedOrderIndex = state.orders.findIndex(
          (order) => order._id === action.payload._id,
        );
        console.log("the updatedOrderIndex "+updatedOrderIndex)
        if (updatedOrderIndex !== -1) {
          state.orders[updatedOrderIndex] = action.payload;
        }
      })
      .addCase(sendArrivalNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "خطاء في تاكيد الطلب";
      })
      .addCase(acceptOrderByDriver.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptOrderByDriver.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // make it on top of the list
        state.orders.unshift(action.payload);
      })
      .addCase(acceptOrderByDriver.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "خطاء في تاكيد الطلب";
      })

  },
});

export const {} = orderSlice.actions;
export default orderSlice.reducer;
