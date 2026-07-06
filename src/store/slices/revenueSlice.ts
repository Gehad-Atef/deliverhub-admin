import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import type { RevenueState } from "../../types/revenue";
import { revenueService } from "../../services/revenue.service";

const initialState: RevenueState = {
  records: [],
  stats: null,
  isLoading: false,
  error: null,
  period: "month",
};

export const fetchRevenue = createAsyncThunk(
  "revenue/fetchAll",
  async (period: "today" | "week" | "month" | "year", { rejectWithValue }) => {
    try {
      const response = await revenueService.getRevenue(period);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch revenue");
    }
  },
);

const revenueSlice = createSlice({
  name: "revenue",
  initialState,
  reducers: {
    setPeriod: (state, action) => {
      state.period = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRevenue.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRevenue.fulfilled, (state, action) => {
        state.isLoading = false;
        state.records = action.payload.records;
        state.stats = action.payload.stats;
      })
      .addCase(fetchRevenue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setPeriod, clearError } = revenueSlice.actions;
export default revenueSlice.reducer;
