import api from "@/src/api/axios";
import { getErrorMessage } from "@/src/utils/errorHelper";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Product } from "./productSlice";

export interface ProductInsertBody {
  name: string;
  sku: string;
  basePrice: number;
  stockQuantity: number;
  category?: string;
}

export const getProducts = createAsyncThunk<
  Product[],
  void,
  { rejectValue: string }
>("products/getProducts", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/confirmer/products");
    return data.products;
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const getSupervisorProducts = createAsyncThunk<
  Product[],
  void,
  { rejectValue: string }
>("products/getSupervisorProducts", async (_, { rejectWithValue }) => {
  try {
    console.log("trying to run");
    const { data } = await api.get("/supervisor/products");
    return data.products;
  } catch (error: unknown) {
    console.log("the error that we are getting is this : " + error);
    return rejectWithValue(getErrorMessage(error));
  }
});

export const addProduct = createAsyncThunk<
  Product,
  { formdata: ProductInsertBody },
  { rejectValue: string }
>("products/addProduct", async ({ formdata }, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/supervisor/products", formdata);
    return data.newProduct;
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error));
  }
});
