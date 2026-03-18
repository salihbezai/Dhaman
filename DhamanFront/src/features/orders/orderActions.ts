import api from "@/src/api/axios";
import { getErrorMessage } from "@/src/utils/errorHelper";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Order } from "./orderSlice";

export interface orderResponse {
  orders: Order[];
}

export const getOrders = createAsyncThunk<
  Order[],
  void,
  { rejectValue: string }
>("orders/getOrders", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/confirmer/orders");

    console.log("the data that we got " + JSON.stringify(data));
    return data.orders;
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const handleAddOrder = createAsyncThunk<
  Order,
  { formData: any },
  { rejectValue: string }
>("orders/handleAddOrder", async ({ formData }, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/confirmer/orders", formData);
    console.log("the new order is " + JSON.stringify(data));
    return data.newOrder;
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const handleCancelOrder = createAsyncThunk<
  Order,
  { id: string },
  { rejectValue: string }
>("orders/handleCancelOrder", async ({ id }, { rejectWithValue }) => {
  try {
    console.log("cancleing ");
    const { data } = await api.put(`/confirmer/orders/${id}/cancel`);
    return data.order;
  } catch (error: any) {
    console.log("error " + error);
    return rejectWithValue(getErrorMessage(error));
  }
});

export const handlePostponeOrder = createAsyncThunk<
  Order,
  { id: string; postponedDate: string },
  { rejectValue: string }
>(
  "orders/handlePostponeOrder",
  async ({ id, postponedDate }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/confirmer/orders/${id}/postpone`, {
        postponedDate,
      });
      return data.order;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const handleConfirmTheOrder = createAsyncThunk<
  Order,
  { id: string },
  { rejectValue: string }
>("orders/handleConfirmTheOrder", async ({ id }, { rejectWithValue }) => {
  try {
    console.log("from frontend sent ? id " + id);
    const { data } = await api.put(`/confirmer/orders/${id}/confirm`);
    console.log("data");
    return data.order;
  } catch (error: any) {
    console.log("SERVER ERROR MESSAGE:", error.response?.data);
    return rejectWithValue(getErrorMessage(error));
  }
});

export const handleNoAnswerOrder = createAsyncThunk<
  Order,
  { id: string; newAttempts: number },
  { rejectValue: string }
>("orders/handleNoAnswer", async ({ id, newAttempts }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/confirmer/orders/${id}/no-answer`, {
      newAttempts,
    });
    return data.order;
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// update order
export const updateOrderByConfirmer = createAsyncThunk<
  Order,
  { formData: any },
  { rejectValue: string }
>(
  "orders/updateOrderByConfirmer",
  async ({ formData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `/confirmer/orders/${formData._id}`,
        formData,
      );
      return data.order;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// remove order
export const handleRemoveOrderByConfirmer = createAsyncThunk<
  Order,
  { id: string },
  { rejectValue: string }
>(
  "orders/handleRemoveOrderByConfirmer",
  async ({ id }, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/confirmer/orders/${id}`);
      return data.order;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const geSupservisortOrders = createAsyncThunk<
  Order[],
  void,
  { rejectValue: string }
>("orders/getOrders", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/supervisor/orders");

    return data.orders;
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateOrderStatusByDriver = createAsyncThunk<
  Order,
  { id: string; status: string },
  { rejectValue: string }
>("orders/updateOrderStatusByDriver", async ({ id, status }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/driver/orders/${id}/status`, {
      status: status,
      note: "تحديث من قبل السائق عبر التطبيق",
    });
    return data.order;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});


// send notification on arrival
export const sendArrivalNotification = createAsyncThunk<
  Order,
  { id: string },
  { rejectValue: string }
>("orders/sendArrivalNotification", async ({ id }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/driver/orders/${id}/arrive`);
    return data.order;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
})

export const getDriverOrders = createAsyncThunk<
  Order[],
  void,
  { rejectValue: string }
>("orders/getDriverOrders", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/driver/orders");
    return data.orders;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

// accept order by driver
export const acceptOrderByDriver = createAsyncThunk<
  Order,
  { id: string },
  { rejectValue: string }
>("orders/acceptOrderByDriver", async ({ id }, { rejectWithValue }) => {
  try {
    console.log("the id we sent "+id)
    const { data } = await api.put(`/driver/orders/${id}/accept`);
    return data.order;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});