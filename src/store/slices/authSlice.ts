import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { authService } from "../../services/auth.service";
import type { AuthState, LoginCredentials } from "../../types/auth";

const token = localStorage.getItem("token");
const adminData = localStorage.getItem("admin");

const initialState: AuthState = {
    admin: adminData ? JSON.parse(adminData) : null,
    token: token,
    isAuthenticated: !!token,
    isLoading: false,
    error: null,
};

export const login = createAsyncThunk(
    "auth/login",
    async (credentials: LoginCredentials, { rejectWithValue }) => {
        try {
            const response = await authService.login(credentials);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || "Login failed");
        }
    },
);

export const logout = createAsyncThunk("auth/logout", async () => {
    localStorage.removeItem("admin");
});

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.admin = action.payload.admin;
                state.token = action.payload.token;
                localStorage.setItem(
                    "admin",
                    JSON.stringify(action.payload.admin),
                );
                localStorage.setItem("token", action.payload.token); // ← ضيف الس طر ده
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(logout.fulfilled, (state) => {
                state.admin = null;
                state.token = null;
                state.isAuthenticated = false;
            });
    },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
