import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { activateUser, addNewUser, desactivateUser, getTeamMembers, updateMember } from "./userActions";

export interface User {
  id: string;
  username: string;
  email: string;
  profileImageUrl?: string;
  phone: string;
  role: string;
}
export interface teamMember {
  _id: string;
  username: string;
  email: string;
  profileImageUrl?: string;
  phone: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  team: teamMember[];
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  team: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addNewUser.pending, (state, action) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addNewUser.fulfilled, (state, action) => {
        state.loading = false;
        state.team.push(action.payload);
        state.error = null;
      })
      .addCase(addNewUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "خطاء في اضافة المستخدم";
      })

      .addCase(getTeamMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTeamMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.team = action.payload;
      })
      .addCase(getTeamMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "خطاء في جلب الموظفين";
      })
      .addCase(desactivateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(desactivateUser.fulfilled, (state, action) => {
        state.loading = false;
        // we are going to get the updated team member from the action payload
        const updatedMember = action.payload;
        const updatedMemberIndex = state.team.findIndex(
          (member) => member._id === updatedMember._id,
        );
        state.team.splice(
          updatedMemberIndex,
          1,
          updatedMember,
        )
        state.error = null;
      })
      .addCase(desactivateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "خطاء في حذف الموظف";
      })
      .addCase(activateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(activateUser.fulfilled, (state, action) => {
        state.loading = false;
        // we are going to get the updated team member from the action payload
        const updatedMember = action.payload;
        const updatedMemberIndex = state.team.findIndex(
          (member) => member._id === updatedMember._id,
        );
        state.team.splice(
          updatedMemberIndex,
          1,
          updatedMember,
        )
        state.error = null;
      })
      .addCase(activateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "خطاء في تفعيل الموظف";
      })

      .addCase(updateMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMember.fulfilled, (state, action) => {
        state.loading = false;
        // we are going to get the updated team member from the action payload
        const updatedMember = action.payload;
        const updatedMemberIndex = state.team.findIndex(
          (member) => member._id === updatedMember._id,
        );
        state.team.splice(
          updatedMemberIndex,
          1,
          updatedMember,
        )
        state.error = null;
      })
      .addCase(updateMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "خطاء في تعديل الموظف";
      })
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
