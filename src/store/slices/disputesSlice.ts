import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Dispute, DisputesStats } from "../../types/dispute";
import { disputesService } from "../../services/disputes.service";

// ─── Thunks ───────────────────────────────────────────────────────────────────
export const fetchDisputes = createAsyncThunk(
    "disputes/fetchAll",
    async (
        params: { status?: string; page?: number; limit?: number } = {},
        { rejectWithValue },
    ) => {
        try {
            return await disputesService.getDisputes(params);
        } catch (err: any) {
            return rejectWithValue(err.message || "Failed to load disputes");
        }
    },
);

export const closeDispute = createAsyncThunk(
    "disputes/close",
    async (id: string, { rejectWithValue }) => {
        try {
            return await disputesService.resolveDispute(id);
        } catch (err: any) {
            return rejectWithValue(err.message || "Failed to close dispute");
        }
    },
);

export const sendDisputeMessage = createAsyncThunk(
    "disputes/sendMessage",
    async (
        { id, text }: { id: string; text: string },
        { rejectWithValue }
    ) => {
        try {
            return await disputesService.sendDisputeMessage(id, text);
        } catch (err: any) {
            return rejectWithValue(err.message || "Failed to send message");
        }
    }
);

// ─── State ────────────────────────────────────────────────────────────────────
interface DisputesState {
    disputes: Dispute[];
    stats: DisputesStats | null;
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    } | null;
    loading: boolean;
    actionLoading: string | null;
    error: string | null;
    filter: "all" | "urgent" | "resolved";
}

const initialState: DisputesState = {
    disputes: [],
    stats: null,
    pagination: null,
    loading: false,
    actionLoading: null,
    error: null,
    filter: "all",
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const disputesSlice = createSlice({
    name: "disputes",
    initialState,
    reducers: {
        setFilter(state, action: PayloadAction<DisputesState["filter"]>) {
            state.filter = action.payload;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // fetchDisputes
        builder
            .addCase(fetchDisputes.pending, (s) => {
                s.loading = true;
                s.error = null;
            })
            .addCase(fetchDisputes.fulfilled, (s, a) => {
                s.loading = false;
                s.disputes = a.payload.disputes;
                s.stats = a.payload.stats;
                s.pagination = a.payload.pagination;
            })
            .addCase(fetchDisputes.rejected, (s, a) => {
                s.loading = false;
                s.error = a.payload as string;
            });

        // closeDispute
        builder
            .addCase(closeDispute.pending, (s, a) => {
                s.actionLoading = a.meta.arg;
            })
            .addCase(closeDispute.fulfilled, (s, a) => {
                s.actionLoading = null;
                const d = s.disputes.find((x) => x.id === a.payload.id);
                if (d) {
                    d.status = "resolved";
                    if (s.stats) {
                        s.stats.open = Math.max(0, s.stats.open - 1);
                        s.stats.resolvedThisMonth += 1;
                    }
                }
            })
            .addCase(closeDispute.rejected, (s, a) => {
                s.actionLoading = null;
                s.error = a.payload as string;
            });

        // sendDisputeMessage
        builder
            .addCase(sendDisputeMessage.fulfilled, (s, a) => {
                const disputeId = a.meta.arg.id;
                const d = s.disputes.find((x) => x.id === disputeId);
                if (d) {
                    if (!d.messages) d.messages = [];
                    d.messages.push(a.payload);
                }
            });
    },
});

export const { setFilter, clearError } = disputesSlice.actions;
export default disputesSlice.reducer;
