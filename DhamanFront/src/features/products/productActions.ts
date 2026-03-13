import { createAsyncThunk } from "@reduxjs/toolkit";
import { Product } from "./productSlice";
import { getErrorMessage } from "@/src/utils/errorHelper";
import api from "@/src/api/axios";




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

