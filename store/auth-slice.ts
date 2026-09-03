import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  user: AuthUser | null;
  businessId: string | null;
  membershipId: string | null;
  roleId: string | null;
  permissions: string[];
  storeIds: string[];
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  businessId: null,
  membershipId: null,
  roleId: null,
  permissions: [],
  storeIds: [],
  isAuthenticated: false,
  loading: true,
  error: null,
};

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (!data.success) return rejectWithValue(data.error);
      return data.data;
    } catch {
      return rejectWithValue("Failed to fetch user");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      return true;
    } catch {
      return rejectWithValue("Failed to logout");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    resetAuth() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCurrentUser.fulfilled,
        (
          state,
          action: PayloadAction<{
            user: AuthUser;
            businessId: string;
            membershipId: string;
            roleId: string;
            permissions: string[];
            storeIds: string[];
          }>
        ) => {
          state.user = action.payload.user;
          state.businessId = action.payload.businessId;
          state.membershipId = action.payload.membershipId;
          state.roleId = action.payload.roleId;
          state.permissions = action.payload.permissions;
          state.storeIds = action.payload.storeIds;
          state.isAuthenticated = true;
          state.loading = false;
        }
      )
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutUser.fulfilled, () => {
        return initialState;
      });
  },
});

export const { clearError, resetAuth } = authSlice.actions;
export default authSlice.reducer;
