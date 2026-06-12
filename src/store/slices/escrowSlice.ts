import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { escrowService } from "../../services/escrow.service";
import type { EscrowState } from "../../types/escrow";

const initialState: EscrowState = {
  transactions: [],
  stats: null,
  isLoading: false,
  error: null,
};

export const fetchEscrow = createAsyncThunk(
  "escrow/fetchAll",
  async (status: string, { rejectWithValue }) => {
    try {
      // TODO: ربط الـ backend هنا
      const response = await escrowService.getTransactions(status);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch escrow");
    }
  },
);

export const releaseEscrow = createAsyncThunk(
  "escrow/release",
  async (id: string, { rejectWithValue }) => {
    try {
      // TODO: ربط الـ backend هنا
      const response = await escrowService.releaseTransaction(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to release escrow");
    }
  },
);

export const refundEscrow = createAsyncThunk(
  "escrow/refund",
  async (id: string, { rejectWithValue }) => {
    try {
      // TODO: ربط الـ backend هنا
      const response = await escrowService.refundTransaction(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to refund escrow");
    }
  },
);

const escrowSlice = createSlice({
  name: "escrow",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEscrow.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEscrow.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.transactions;
        state.stats = action.payload.stats;
      })
      .addCase(fetchEscrow.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(releaseEscrow.fulfilled, (state, action) => {
        const index = state.transactions.findIndex(
          (t) => t.id === action.payload.id,
        );
        if (index !== -1) state.transactions[index] = action.payload;
      })
      .addCase(refundEscrow.fulfilled, (state, action) => {
        const index = state.transactions.findIndex(
          (t) => t.id === action.payload.id,
        );
        if (index !== -1) state.transactions[index] = action.payload;
      });
  },
});

export const { clearError } = escrowSlice.actions;
export default escrowSlice.reducer;
