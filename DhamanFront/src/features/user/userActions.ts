import api from "@/src/api/axios";
import { getErrorMessage } from "@/src/utils/errorHelper";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { teamMember, User } from "./userSlice";




export const addNewUser = createAsyncThunk<
  any,
  { formdata: any },
  { rejectValue: string }
>("users/addUser", async (formdata, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/users/add", formdata);

    console.log("the data that we got " + JSON.stringify(data));
    return data.user;
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error));
  }
});





export const getTeamMembers = createAsyncThunk<
    teamMember[],
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