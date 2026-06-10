import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import driversReducer from "./slices/driversSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    drivers: driversReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
