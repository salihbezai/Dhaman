import api from "@/src/api/axios";
import { getErrorMessage } from "@/src/utils/errorHelper";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { teamMember } from "./userSlice";




export const addNewUser = createAsyncThunk<
  any,
  { formdata: any },
  { rejectValue: string }
>("users/addUser", async (formdata, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/users/add", formdata);

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

export const desactivateUser = createAsyncThunk<
  any,
  { id: string },
  { rejectValue: string }
>("users/desactivateUser", async ({ id }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/users/member/inactif/${id}`);
    return data.user;
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const activateUser = createAsyncThunk<
  any,
  { id: string },
  { rejectValue: string }
>("users/activateUser", async ({ id }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/users/member/actif/${id}`);
    return data.user;
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateMember = createAsyncThunk<
  any,
  { id: string, memberInfo: any },
  { rejectValue: string }
>("users/updateUser", async ({ id, memberInfo }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/users/member/update/${id}`, memberInfo);
    return data.user;
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error));
  }
});




export const updateUserProfileInfo = createAsyncThunk<
  any,
  { id: string, userInfo: any },
  { rejectValue: string }
>("users/updateUserInfo", async ({ id, userInfo }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/users/update/${id}`, userInfo);
    return data.user;
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error));
  }
});