import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type {
    DashboardStats,
    RecentOrder,
    RevenueSource,
    EscrowStatus,
    RecentUser,
} from "../../types/dashboard";

// ─── Mock API ────────────────────────────────────────────────────────────────
const mockDelay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

export const fetchDashboardData = createAsyncThunk(
    "dashboard/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            await mockDelay();
            return {
                stats: {
                    totalOrders: 3284,
                    totalOrdersTrend: 12,
                    registeredUsers: 1092,
                    registeredUsersTrend: 8,
                    activeDrivers: 147,
                    driversOnline: 38,
                    monthlyRevenue: 8410,
                    revenueTrend: 5,
                } satisfies DashboardStats,

                recentOrders: [
                    {
                        id: "#ORD-4821",
                        customer: "Ahmed K.",
                        timeAgo: "12 min ago",
                        status: "in_transit",
                    },
                    {
                        id: "#ORD-4820",
                        customer: "Sara M.",
                        timeAgo: "28 min ago",
                        status: "delivered",
                    },
                    {
                        id: "#ORD-4819",
                        customer: "Karim R.",
                        timeAgo: "45 min ago",
                        status: "pending_offer",
                    },
                    {
                        id: "#ORD-4818",
                        customer: "Nour A.",
                        timeAgo: "1 hr ago",
                        status: "dispute",
                    },
                    {
                        id: "#ORD-4817",
                        customer: "Omar F.",
                        timeAgo: "2 hrs ago",
                        status: "delivered",
                    },
                ] satisfies RecentOrder[],

                revenueSources: [
                    {
                        label: "Commission",
                        percentage: 72,
                        color: "var(--blue-light)",
                    },
                    {
                        label: "Subscriptions",
                        percentage: 18,
                        color: "var(--success)",
                    },
                    {
                        label: "Featured",
                        percentage: 10,
                        color: "var(--amber)",
                    },
                ] satisfies RevenueSource[],

                escrowStatuses: [
                    {
                        label: "Released",
                        amount: 5130,
                        percentage: 61,
                        color: "var(--success)",
                    },
                    {
                        label: "Frozen",
                        amount: 2440,
                        percentage: 29,
                        color: "var(--blue-light)",
                    },
                    {
                        label: "In review",
                        amount: 840,
                        percentage: 10,
                        color: "var(--red)",
                    },
                ] satisfies EscrowStatus[],

                recentUsers: [
                    {
                        initials: "AK",
                        name: "Ahmed Kamal",
                        email: "ahmed@email.com",
                        role: "customer",
                        orders: 24,
                        joined: "Jan 3, 2025",
                        status: "active",
                    },
                    {
                        initials: "SR",
                        name: "Sara Rami",
                        email: "sara@email.com",
                        role: "driver",
                        orders: 91,
                        joined: "Feb 14, 2025",
                        status: "active",
                    },
                    {
                        initials: "KF",
                        name: "Karim Fahmy",
                        email: "karim@email.com",
                        role: "customer",
                        orders: 7,
                        joined: "Mar 2, 2025",
                        status: "suspended",
                    },
                    {
                        initials: "NA",
                        name: "Nour Adel",
                        email: "nour@email.com",
                        role: "driver",
                        orders: 58,
                        joined: "Mar 19, 2025",
                        status: "active",
                    },
                ] satisfies RecentUser[],
            };
        } catch {
            return rejectWithValue("Failed to load dashboard data");
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
