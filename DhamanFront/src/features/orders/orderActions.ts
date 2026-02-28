import api from "@/src/api/axios";
import { getErrorMessage } from "@/src/utils/errorHelper";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Order } from "./orderSlice";

interface orderResponse {
  orders: Order[];
}

export const getConfirmerOrders = createAsyncThunk<
  orderResponse,
  void,
  { rejectValue: string }
>("orders/getConfirmerOrders", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/confirmer/orders");

    console.log("the data that we got " + JSON.stringify(data));
    return data;
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
    console.log(
        "cancleing "
    )
    const { data } = await api.put(`/confirmer/orders/${id}/cancel`);
    return data.order;
  } catch (error: any) {
    console.log("error "+error)
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
    console.log("from frontend sent ? id "+id)
    const { data } = await api.put(`/confirmer/orders/${id}/confirm`);
    console.log("data")
    return data.order;
  } catch (error: any) {
    console.log("SERVER ERROR MESSAGE:", error.response?.data); 
    return rejectWithValue(getErrorMessage(error));
  }
});


export const handleNoAnswerOrder = createAsyncThunk<
  Order,
  { id: string,newAttempts: number },
  { rejectValue: string }
>("orders/handleNoAnswer", async ({ id,newAttempts }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/confirmer/orders/${id}/no-answer`, {
      newAttempts
    });
    return data.order;
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error));
  }
});
