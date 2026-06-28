import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type {
    VerificationRequest,
    VerificationStatus,
} from "../../types/Verification";
import { verificationService } from "../../services/Verification.service";

type FilterValue = "all" | VerificationStatus;

// ─── Thunks ───────────────────────────────────────────────────────────────────
export const fetchVerifications = createAsyncThunk(
    "verification/fetchAll",
    async (status: FilterValue = "all", { rejectWithValue }) => {
        try {
            return await verificationService.getAll(status);
        } catch (err: any) {
            return rejectWithValue(
                err.message || "Failed to load verification requests",
            );
        }
    },
);

export const reviewVerification = createAsyncThunk(
    "verification/review",
    async (
        { userId, status }: { userId: string; status: VerificationStatus },
        { rejectWithValue },
    ) => {
        try {
            await verificationService.reviewVerification(userId, status);
            return { userId, status };
        } catch (err: any) {
            return rejectWithValue(
                err.message || "Failed to review verification",
            );
        }
    },
);

// ─── State ────────────────────────────────────────────────────────────────────
interface VerificationState {
    requests: VerificationRequest[];
    loading: boolean;
    actionLoading: string | null;
    error: string | null;
    filter: FilterValue;
}

const initialState: VerificationState = {
    requests: [],
    loading: false,
    actionLoading: null,
    error: null,
    filter: "all",
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const verificationSlice = createSlice({
    name: "verification",
    initialState,
    reducers: {
        setFilter(state, action: PayloadAction<FilterValue>) {
            state.filter = action.payload;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchVerifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVerifications.fulfilled, (state, action) => {
                state.loading = false;
                state.requests = action.payload;
            })
            .addCase(fetchVerifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(reviewVerification.pending, (state, action) => {
                state.actionLoading = action.meta.arg.userId;
            })
            .addCase(reviewVerification.fulfilled, (state, action) => {
                state.actionLoading = null;
                if (state.filter === "all") {
                    const req = state.requests.find(
                        (r) => r.userId === action.payload.userId,
                    );
                    if (req) req.status = action.payload.status;
                } else {
                    state.requests = state.requests.filter(
                        (r) => r.userId !== action.payload.userId,
                    );
                }
            })
            .addCase(reviewVerification.rejected, (state, action) => {
                state.actionLoading = null;
                state.error = action.payload as string;
            });
    },
});

export const { setFilter, clearError } = verificationSlice.actions;
export default verificationSlice.reducer;
