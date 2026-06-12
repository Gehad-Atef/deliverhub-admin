import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Dispute, DisputesStats } from "../../types/dispute";

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_DISPUTES: Dispute[] = [
    {
        id: "d1",
        orderId: "#ORD-4818",
        title: "Order not received",
        description:
            "Customer claims order was never delivered. Driver marked as delivered 1 hr ago. $42.00 order value + $6.00 fee held in escrow.",
        status: "urgent",
        amountAtRisk: 48.0,
        createdAt: "1 hr ago",
        plaintiff: { name: "Nour A.", type: "customer" },
        defendant: { name: "Tarek M.", type: "driver" },
        releaseLabel: "Release to driver",
    },
    {
        id: "d2",
        orderId: "#ORD-4802",
        title: "Wrong items delivered",
        description:
            "Customer received incorrect items. Office accepted the complaint. Partial refund being negotiated. $18.00 order value at stake.",
        status: "open",
        amountAtRisk: 18.0,
        createdAt: "3 hrs ago",
        plaintiff: { name: "Layla S.", type: "customer" },
        defendant: { name: "Fast Arrow", type: "office" },
        releaseLabel: "Release to office",
    },
    {
        id: "d3",
        orderId: "#ORD-4791",
        title: "Late delivery — item damaged",
        description:
            "Package arrived 4 hours late with visible damage. Customer requesting full refund of delivery fee and item cost.",
        status: "open",
        amountAtRisk: 32.5,
        createdAt: "5 hrs ago",
        plaintiff: { name: "Omar F.", type: "customer" },
        defendant: { name: "Sara R.", type: "driver" },
        releaseLabel: "Release to driver",
    },
    {
        id: "d4",
        orderId: "#ORD-4780",
        title: "Driver unreachable during delivery",
        description:
            "Customer unable to contact driver for 2 hours after order accepted. Order eventually cancelled.",
        status: "urgent",
        amountAtRisk: 22.0,
        createdAt: "8 hrs ago",
        plaintiff: { name: "Ahmed K.", type: "customer" },
        defendant: { name: "Khaled M.", type: "driver" },
        releaseLabel: "Release to driver",
    },
];

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

// ─── Thunks ───────────────────────────────────────────────────────────────────
export const fetchDisputes = createAsyncThunk(
    "disputes/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            await delay();
            const stats: DisputesStats = {
                open: 4,
                urgent: 2,
                resolvedThisMonth: 31,
                avgResolveHours: 18,
                amountAtRisk: 840,
            };
            return { disputes: MOCK_DISPUTES, stats };
        } catch {
            return rejectWithValue("Failed to load disputes");
        }
    },
);

export const refundCustomer = createAsyncThunk(
    "disputes/refund",
    async (id: string, { rejectWithValue }) => {
        try {
            await delay(400);
            return id;
        } catch {
            return rejectWithValue("Failed to process refund");
        }
    },
);

export const releaseToParty = createAsyncThunk(
    "disputes/release",
    async (id: string, { rejectWithValue }) => {
        try {
            await delay(400);
            return id;
        } catch {
            return rejectWithValue("Failed to release funds");
        }
    },
);

// ─── State ────────────────────────────────────────────────────────────────────
interface DisputesState {
    disputes: Dispute[];
    stats: DisputesStats | null;
    loading: boolean;
    actionLoading: string | null;
    error: string | null;
    filter: "all" | "urgent" | "open" | "resolved";
}

const initialState: DisputesState = {
    disputes: [],
    stats: null,
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
        builder
            .addCase(fetchDisputes.pending, (s) => {
                s.loading = true;
                s.error = null;
            })
            .addCase(fetchDisputes.fulfilled, (s, a) => {
                s.loading = false;
                s.disputes = a.payload.disputes;
                s.stats = a.payload.stats;
            })
            .addCase(fetchDisputes.rejected, (s, a) => {
                s.loading = false;
                s.error = a.payload as string;
            });

        // Both refund and release mark dispute as resolved
        const resolveCase = (s: DisputesState, a: { payload: string }) => {
            s.actionLoading = null;
            const d = s.disputes.find((x) => x.id === a.payload);
            if (d) {
                d.status = "resolved";
                if (s.stats) {
                    s.stats.open = Math.max(0, s.stats.open - 1);
                    s.stats.resolvedThisMonth += 1;
                }
            }
        };

        builder
            .addCase(refundCustomer.pending, (s, a) => {
                s.actionLoading = a.meta.arg;
            })
            .addCase(refundCustomer.fulfilled, resolveCase)
            .addCase(refundCustomer.rejected, (s, a) => {
                s.actionLoading = null;
                s.error = a.payload as string;
            });

        builder
            .addCase(releaseToParty.pending, (s, a) => {
                s.actionLoading = a.meta.arg;
            })
            .addCase(releaseToParty.fulfilled, resolveCase)
            .addCase(releaseToParty.rejected, (s, a) => {
                s.actionLoading = null;
                s.error = a.payload as string;
            });
    },
});

export const { setFilter, clearError } = disputesSlice.actions;
export default disputesSlice.reducer;
