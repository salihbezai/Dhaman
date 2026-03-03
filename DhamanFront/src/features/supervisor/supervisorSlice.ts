import { createSlice } from "@reduxjs/toolkit";
import { User } from "../auth/authSlice";
import { getOrders, getTeamMembers } from "./supervisorActions";
import { Order } from "../orders/orderSlice";

export interface SuperVisorState {
    team: User[];
    orders: Order[];
    loading: boolean;
    error: string | null;
}


const initialState: SuperVisorState = {
  team: [],
  orders: [],
  loading: false,
  error: null,
};

const superVisorSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
 
    builder.addCase(getTeamMembers.pending, (state) => {
      state.loading = true;
      state.error = null;
    }).addCase(getTeamMembers.fulfilled, (state, action) => {
      state.loading = false;
      state.team = action.payload;
    }).addCase(getTeamMembers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? "خطاء في جلب الموظفين";
    })

    .addCase(getOrders.pending, (state) => {
      state.loading = true;
      state.error = null;
    }).addCase(getOrders.fulfilled, (state, action) => {
      state.loading = false;
      state.orders = action.payload;
    }).addCase(getOrders.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? "خطاء في جلب الطلبات";
    })
      
   
   
  
  },
});

export const {} = superVisorSlice.actions;
export default superVisorSlice.reducer;
