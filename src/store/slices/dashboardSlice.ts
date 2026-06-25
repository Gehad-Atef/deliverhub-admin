import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dashboardService } from "../../services/dashboard.service";
import type {
    DashboardStats,
    RecentOrder,
    RevenueSource,
    EscrowStatus,
    RecentUser,
} from "../../types/dashboard";

// ─── Async thunk ─────────────────────────────────────────────────────────────
export const fetchDashboardData = createAsyncThunk(
    "dashboard/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const data = await dashboardService.getDashboardData();
            return data;
        } catch (error: any) {
            return rejectWithValue(
                error.message || "Failed to load dashboard data",
            );
        }
    },
);

// ─── State ───────────────────────────────────────────────────────────────────
interface DashboardState {
    stats: DashboardStats | null;
    recentOrders: RecentOrder[];
    revenueSources: RevenueSource[];
    escrowStatuses: EscrowStatus[];
    recentUsers: RecentUser[];
    loading: boolean;
    error: string | null;
}

const initialState: DashboardState = {
    stats: null,
    recentOrders: [],
    revenueSources: [],
    escrowStatuses: [],
    recentUsers: [],
    loading: false,
    error: null,
};

// ─── Slice ───────────────────────────────────────────────────────────────────
const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardData.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload.stats;
                state.recentOrders = action.payload.recentOrders;
                state.revenueSources = action.payload.revenueSources;
                state.escrowStatuses = action.payload.escrowStatuses;
                state.recentUsers = action.payload.recentUsers;
            })
            .addCase(fetchDashboardData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
