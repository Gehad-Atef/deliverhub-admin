import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import type { ShipmentsState } from "../../types/shipment";
import { shipmentsService } from "../../services/shipments.service";

const initialState: ShipmentsState = {
  shipments: [],
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
};

export const fetchShipments = createAsyncThunk(
  "shipments/fetchAll",
  async (
    params: { page?: number; limit?: number; search?: string; status?: string },
    { rejectWithValue },
  ) => {
    try {
      // TODO: ربط الـ backend هنا
      const response = await shipmentsService.getShipments(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch shipments");
    }
  },
);

export const updateShipmentStatus = createAsyncThunk(
  "shipments/updateStatus",
  async (payload: { id: string; status: string }, { rejectWithValue }) => {
    try {
      // TODO: ربط الـ backend هنا
      const response = await shipmentsService.updateShipmentStatus(
        payload.id,
        payload.status,
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to update shipment status",
      );
    }
  },
);

const shipmentsSlice = createSlice({
  name: "shipments",
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
      .addCase(fetchShipments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchShipments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shipments = action.payload.shipments;
        state.total = action.payload.total;
      })
      .addCase(fetchShipments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateShipmentStatus.fulfilled, (state, action) => {
        const index = state.shipments.findIndex(
          (s) => s.id === action.payload.id,
        );
        if (index !== -1) {
          state.shipments[index] = action.payload;
        }
      });
  },
});

export const { setPage, clearError } = shipmentsSlice.actions;
export default shipmentsSlice.reducer;
