import { createAsyncThunk } from "@reduxjs/toolkit";
import { getErrorMessage } from "@/src/utils/errorHelper";
import api from "@/src/api/axios";
import { User } from "../auth/authSlice";
import { orderResponse } from "../orders/orderActions";
import { Order } from "../orders/orderSlice";



export const getTeamMembers = createAsyncThunk<
    User[],
    void,
    { rejectValue: string }
>("supervisor/getTeam", async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get("/supervisor/team");
        return data.team;
    } catch (error: unknown) {
        return rejectWithValue(getErrorMessage(error));
    }
});


export const getOrders = createAsyncThunk<
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