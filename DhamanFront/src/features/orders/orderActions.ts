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




