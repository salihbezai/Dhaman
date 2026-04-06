import { createSlice } from "@reduxjs/toolkit";
import {
  addProduct,
  getProducts,
  getSupervisorProducts,
} from "./productActions";

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
  loadingAddingProduct: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  loading: false,
  loadingAddingProduct: false,
  error: null,
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "خطاء في جلب المنتجات";
      })
      .addCase(getSupervisorProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSupervisorProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(getSupervisorProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "خطاء في جلب المنتجات";
      })
      .addCase(addProduct.pending, (state) => {
        state.loadingAddingProduct = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loadingAddingProduct = false;
        state.products.push(action.payload);
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loadingAddingProduct = false;
        state.error = action.payload ?? "خطاء في إضافة المنتج";
      });
  },
});

export const {} = productSlice.actions;
export default productSlice.reducer;
