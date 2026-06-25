import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Office, OfficesStats, OfficeStatus } from "../../types/office";
import { officesService } from "../../services/Offices.service";

// ─── Thunks ───────────────────────────────────────────────────────────────────
export const fetchOffices = createAsyncThunk(
    "offices/fetchAll",
    async (
        params: {
            page?: number;
            limit?: number;
            search?: string;
            status?: string;
        } = {},
        { rejectWithValue },
    ) => {
        try {
            return await officesService.getOffices(params);
        } catch (err: any) {
            return rejectWithValue(err.message || "Failed to load offices");
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
            const newStatus: OfficeStatus =
                currentStatus === "active" ? "suspended" : "active";
            const result = await officesService.updateOfficeStatus(
                id,
                newStatus,
            );
            return { id: result.id, newStatus: result.status };
        } catch (err: any) {
            return rejectWithValue(err.message || "Failed to update status");
        }
    },
);

// ─── State ────────────────────────────────────────────────────────────────────
interface OfficesState {
    offices: Office[];
    stats: OfficesStats | null;
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    } | null;
    loading: boolean;
    actionLoading: string | null;
    error: string | null;
    search: string;
    statusFilter: "all" | OfficeStatus;
}

const initialState: OfficesState = {
    offices: [],
    stats: null,
    pagination: null,
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
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchOffices.rejected, (state, action) => {
                state.loading = false;
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
                    const prev = office.status;
                    office.status = action.payload.newStatus;
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
            .addCase(toggleOfficeStatus.rejected, (state, action) => {
                state.actionLoading = null;
                state.error = action.payload as string;
            });
    },
});

export const { setSearch, setStatusFilter, clearError } = officesSlice.actions;
export default officesSlice.reducer;
