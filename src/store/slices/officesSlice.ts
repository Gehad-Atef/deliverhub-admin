import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type {
    Office,
    OfficesStats,
    AddOfficePayload,
    OfficeStatus,
} from "../../types/office";

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_OFFICES: Office[] = [
    {
        id: "o1",
        initials: "FA",
        name: "Fast Arrow",
        email: "fast@arrow.com",
        phone: "+20 100 111 2222",
        city: "Cairo",
        coverageArea: "Nasr City, Heliopolis",
        plan: "premium",
        orders: 1240,
        rating: 5.0,
        status: "active",
        joinedAt: "Jan 10, 2025",
    },
    {
        id: "o2",
        initials: "QD",
        name: "Quick Delivery",
        email: "quick@del.com",
        phone: "+20 101 222 3333",
        city: "Giza",
        coverageArea: "Dokki, Mohandessin",
        plan: "basic",
        orders: 620,
        rating: 4.0,
        status: "active",
        joinedAt: "Feb 3, 2025",
    },
    {
        id: "o3",
        initials: "SE",
        name: "Speed Express",
        email: "speed@express.com",
        phone: "+20 102 333 4444",
        city: "Alexandria",
        coverageArea: "Alexandria, Smouha",
        plan: "featured",
        orders: 890,
        rating: 4.0,
        status: "pending",
        joinedAt: "Mar 15, 2025",
    },
    {
        id: "o4",
        initials: "NR",
        name: "Nile Runners",
        email: "nile@runners.com",
        phone: "+20 103 444 5555",
        city: "Cairo",
        coverageArea: "Maadi, Zamalek",
        plan: "basic",
        orders: 310,
        rating: 3.5,
        status: "active",
        joinedAt: "Apr 1, 2025",
    },
    {
        id: "o5",
        initials: "DS",
        name: "Delta Ship",
        email: "delta@ship.com",
        phone: "+20 104 555 6666",
        city: "Mansoura",
        coverageArea: "Mansoura, Talkha",
        plan: "basic",
        orders: 180,
        rating: 3.0,
        status: "suspended",
        joinedAt: "Apr 20, 2025",
    },
    {
        id: "o6",
        initials: "BX",
        name: "Box & Go",
        email: "box@go.com",
        phone: "+20 105 666 7777",
        city: "Cairo",
        coverageArea: "New Cairo, 5th Settlement",
        plan: "premium",
        orders: 760,
        rating: 4.5,
        status: "pending",
        joinedAt: "May 5, 2025",
    },
];

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

// ─── Thunks ───────────────────────────────────────────────────────────────────
export const fetchOffices = createAsyncThunk(
    "offices/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            await delay();
            const stats: OfficesStats = {
                total: 64,
                verified: 58,
                pendingReview: 6,
                avgRating: 4.4,
                monthTrend: 3,
            };
            return { offices: MOCK_OFFICES, stats };
        } catch {
            return rejectWithValue("Failed to load offices");
        }
    },
);

export const addOffice = createAsyncThunk(
    "offices/add",
    async (payload: AddOfficePayload, { rejectWithValue }) => {
        try {
            await delay(400);
            const newOffice: Office = {
                id: `o${Date.now()}`,
                initials: payload.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase(),
                name: payload.name,
                email: payload.email,
                phone: payload.phone,
                city: payload.city,
                coverageArea: payload.coverageArea,
                plan: payload.plan,
                orders: 0,
                rating: 0,
                status: "pending",
                joinedAt: new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                }),
            };
            return newOffice;
        } catch {
            return rejectWithValue("Failed to add office");
        }
    },
);

export const approveOffice = createAsyncThunk(
    "offices/approve",
    async (id: string, { rejectWithValue }) => {
        try {
            await delay(300);
            return id;
        } catch {
            return rejectWithValue("Failed to approve office");
        }
    },
);

export const toggleOfficeStatus = createAsyncThunk(
    "offices/toggleStatus",
    async (
        { id, currentStatus }: { id: string; currentStatus: OfficeStatus },
        { rejectWithValue },
    ) => {
        try {
            await delay(300);
            const newStatus: OfficeStatus =
                currentStatus === "active" ? "suspended" : "active";
            return { id, newStatus };
        } catch {
            return rejectWithValue("Failed to update office status");
        }
    },
);

// ─── State ────────────────────────────────────────────────────────────────────
interface OfficesState {
    offices: Office[];
    stats: OfficesStats | null;
    loading: boolean;
    actionLoading: string | null;
    error: string | null;
    search: string;
    statusFilter: "all" | OfficeStatus;
}

const initialState: OfficesState = {
    offices: [],
    stats: null,
    loading: false,
    actionLoading: null,
    error: null,
    search: "",
    statusFilter: "all",
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const officesSlice = createSlice({
    name: "offices",
    initialState,
    reducers: {
        setSearch(state, action: PayloadAction<string>) {
            state.search = action.payload;
        },
        setStatusFilter(
            state,
            action: PayloadAction<OfficesState["statusFilter"]>,
        ) {
            state.statusFilter = action.payload;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // fetchOffices
        builder
            .addCase(fetchOffices.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOffices.fulfilled, (state, action) => {
                state.loading = false;
                state.offices = action.payload.offices;
                state.stats = action.payload.stats;
            })
            .addCase(fetchOffices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // addOffice
        builder
            .addCase(addOffice.pending, (state) => {
                state.actionLoading = "new";
            })
            .addCase(addOffice.fulfilled, (state, action) => {
                state.actionLoading = null;
                state.offices.unshift(action.payload);
                if (state.stats) {
                    state.stats.total += 1;
                    state.stats.pendingReview += 1;
                }
            })
            .addCase(addOffice.rejected, (state, action) => {
                state.actionLoading = null;
                state.error = action.payload as string;
            });

        // approveOffice
        builder
            .addCase(approveOffice.pending, (state, action) => {
                state.actionLoading = action.meta.arg;
            })
            .addCase(approveOffice.fulfilled, (state, action) => {
                state.actionLoading = null;
                const office = state.offices.find(
                    (o) => o.id === action.payload,
                );
                if (office) {
                    office.status = "active";
                    if (state.stats) {
                        state.stats.verified += 1;
                        state.stats.pendingReview -= 1;
                    }
                }
            })
            .addCase(approveOffice.rejected, (state, action) => {
                state.actionLoading = null;
                state.error = action.payload as string;
            });

        // toggleOfficeStatus
        builder
            .addCase(toggleOfficeStatus.pending, (state, action) => {
                state.actionLoading = action.meta.arg.id;
            })
            .addCase(toggleOfficeStatus.fulfilled, (state, action) => {
                state.actionLoading = null;
                const office = state.offices.find(
                    (o) => o.id === action.payload.id,
                );
                if (office) {
                    const wasSuspended = office.status === "suspended";
                    office.status = action.payload.newStatus;
                    if (state.stats) {
                        state.stats.verified += wasSuspended ? 1 : -1;
                    }
                }
            })
            .addCase(toggleOfficeStatus.rejected, (state, action) => {
                state.actionLoading = null;
                state.error = action.payload as string;
            });
    },
});

export const { setSearch, setStatusFilter, clearError } = officesSlice.actions;
export default officesSlice.reducer;
