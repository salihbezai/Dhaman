import { createSlice } from "@reduxjs/toolkit";
import { getConfirmerOrders, handleCancelOrder, handleConfirmTheOrder, handleNoAnswerOrder, handlePostponeOrder, handleRemoveOrderByConfirmer, updateOrderByConfirmer } from "./orderActions";
import { getProducts } from "./productActions";

export interface Product {
    _id: string;
    name: string;
    sku: string;
    basePrice: number;
    stockQuantity: number;
    category?: string;
    isActive: boolean;
}

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(getProducts.pending, (state) => {
      state.loading = true;
      state.error = null;    
    }).addCase(getProducts.fulfilled, (state, action) => {
      state.loading = false;
      state.products = action.payload;
    }).addCase(getProducts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? "خطاء في جلب المنتجات";
    })

      
   
   
  
  },
});

export const {} = productSlice.actions;
export default productSlice.reducer;
