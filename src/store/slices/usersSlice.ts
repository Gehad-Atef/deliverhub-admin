import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type {
    User,
    UsersStats,
    AddUserPayload,
    UserStatus,
} from "../../types/user";

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_USERS: User[] = [
    {
        id: "u1",
        initials: "AK",
        name: "Ahmed Kamal",
        email: "ahmed@email.com",
        phone: "+20 100 123 4567",
        role: "customer",
        orders: 24,
        joined: "Jan 3, 2025",
        status: "active",
    },
    {
        id: "u2",
        initials: "SR",
        name: "Sara Rami",
        email: "sara@email.com",
        phone: "+20 101 234 5678",
        role: "driver",
        orders: 91,
        joined: "Feb 14, 2025",
        status: "active",
    },
    {
        id: "u3",
        initials: "KF",
        name: "Karim Fahmy",
        email: "karim@email.com",
        phone: "+20 102 345 6789",
        role: "customer",
        orders: 7,
        joined: "Mar 2, 2025",
        status: "suspended",
    },
    {
        id: "u4",
        initials: "NA",
        name: "Nour Adel",
        email: "nour@email.com",
        phone: "+20 103 456 7890",
        role: "driver",
        orders: 58,
        joined: "Mar 19, 2025",
        status: "active",
    },
    {
        id: "u5",
        initials: "MH",
        name: "Mohamed Hassan",
        email: "mhasan@email.com",
        phone: "+20 104 567 8901",
        role: "customer",
        orders: 33,
        joined: "Apr 5, 2025",
        status: "active",
    },
    {
        id: "u6",
        initials: "LF",
        name: "Layla Farouk",
        email: "layla@email.com",
        phone: "+20 105 678 9012",
        role: "customer",
        orders: 12,
        joined: "Apr 18, 2025",
        status: "active",
    },
    {
        id: "u7",
        initials: "TM",
        name: "Tarek Mostafa",
        email: "tarek@email.com",
        phone: "+20 106 789 0123",
        role: "driver",
        orders: 204,
        joined: "May 1, 2025",
        status: "active",
    },
    {
        id: "u8",
        initials: "RO",
        name: "Rania Omar",
        email: "rania@email.com",
        phone: "+20 107 890 1234",
        role: "customer",
        orders: 3,
        joined: "May 20, 2025",
        status: "suspended",
    },
];

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

// ─── Thunks ───────────────────────────────────────────────────────────────────
export const fetchUsers = createAsyncThunk(
    "users/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            await delay();
            const stats: UsersStats = {
                total: 1092,
                active: 984,
                suspended: 108,
                weekTrend: 8,
                newSuspendedThisWeek: 3,
            };
            return { users: MOCK_USERS, stats };
        } catch {
            return rejectWithValue("Failed to load users");
        }
    },
);

export const addUser = createAsyncThunk(
    "users/add",
    async (payload: AddUserPayload, { rejectWithValue }) => {
        try {
            await delay(400);
            const newUser: User = {
                id: `u${Date.now()}`,
                initials: payload.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase(),
                name: payload.name,
                email: payload.email,
                phone: payload.phone,
                role: payload.role,
                orders: 0,
                joined: new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                }),
                status: "active",
            };
            return newUser;
        } catch {
            return rejectWithValue("Failed to add user");
        }
    },
);

export const toggleUserStatus = createAsyncThunk(
    "users/toggleStatus",
    async (
        { id, currentStatus }: { id: string; currentStatus: UserStatus },
        { rejectWithValue },
    ) => {
        try {
            await delay(300);
            const newStatus: UserStatus =
                currentStatus === "active"
                    ? "suspended"
                    : currentStatus === "suspended"
                      ? "active"
                      : "active"; // inactive → active
            return { id, newStatus };
        } catch {
            return rejectWithValue("Failed to update user status");
        }
    },
);

// ─── State ────────────────────────────────────────────────────────────────────
interface UsersState {
    users: User[];
    stats: UsersStats | null;
    loading: boolean;
    actionLoading: string | null; // id of user being acted on
    error: string | null;
    search: string;
    roleFilter: "all" | "customer" | "driver";
}

const initialState: UsersState = {
    users: [],
    stats: null,
    loading: false,
    actionLoading: null,
    error: null,
    search: "",
    roleFilter: "all",
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        setSearch(state, action: PayloadAction<string>) {
            state.search = action.payload;
        },
        setRoleFilter(state, action: PayloadAction<UsersState["roleFilter"]>) {
            state.roleFilter = action.payload;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // fetchUsers
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.users;
                state.stats = action.payload.stats;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // addUser
        builder
            .addCase(addUser.pending, (state) => {
                state.actionLoading = "new";
            })
            .addCase(addUser.fulfilled, (state, action) => {
                state.actionLoading = null;
                state.users.unshift(action.payload);
                if (state.stats) state.stats.total += 1;
                if (state.stats) state.stats.active += 1;
            })
            .addCase(addUser.rejected, (state, action) => {
                state.actionLoading = null;
                state.error = action.payload as string;
            });

        // toggleUserStatus
        builder
            .addCase(toggleUserStatus.pending, (state, action) => {
                state.actionLoading = action.meta.arg.id;
            })
            .addCase(toggleUserStatus.fulfilled, (state, action) => {
                state.actionLoading = null;
                const user = state.users.find(
                    (u) => u.id === action.payload.id,
                );
                if (user) {
                    const prev = user.status;
                    user.status = action.payload.newStatus;
                    if (state.stats) {
                        if (prev === "active") state.stats.active -= 1;
                        if (prev === "suspended") state.stats.suspended -= 1;
                        if (action.payload.newStatus === "active")
                            state.stats.active += 1;
                        if (action.payload.newStatus === "suspended")
                            state.stats.suspended += 1;
                    }
                }
            })
            .addCase(toggleUserStatus.rejected, (state, action) => {
                state.actionLoading = null;
                state.error = action.payload as string;
            });
    },
});

export const { setSearch, setRoleFilter, clearError } = usersSlice.actions;
export default usersSlice.reducer;
