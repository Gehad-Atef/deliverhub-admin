import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { usersService } from "../../services/users.service";
import type { DriversState } from "../../types/user";

const initialState: DriversState = {
  drivers: [],
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
};

export const fetchDrivers = createAsyncThunk(
  "drivers/fetchAll",
  async (
    params: { page?: number; limit?: number; search?: string },
    { rejectWithValue },
  ) => {
    try {
      // TODO: ربط الـ backend هنا
      const response = await usersService.getDrivers(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch drivers");
    }
  },
);

export const updateDriverStatus = createAsyncThunk(
  "drivers/updateStatus",
  async (
    payload: { id: string; status: "active" | "inactive" | "suspended" },
    { rejectWithValue },
  ) => {
    try {
      // TODO: ربط الـ backend هنا
      const response = await usersService.updateDriverStatus(
        payload.id,
        payload.status,
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update driver status");
    }
  },
);

const driversSlice = createSlice({
  name: "drivers",
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDrivers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.drivers = action.payload.drivers;
        state.total = action.payload.total;
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateDriverStatus.fulfilled, (state, action) => {
        const index = state.drivers.findIndex(
          (d) => d.id === action.payload.id,
        );
        if (index !== -1) {
          state.drivers[index] = action.payload;
        }
      });
  },
});

export const { setPage, clearError } = driversSlice.actions;
export default driversSlice.reducer;
