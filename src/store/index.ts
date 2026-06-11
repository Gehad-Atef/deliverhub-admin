import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import driversReducer from "./slices/driversSlice";
import shipmentsReducer from "./slices/shipmentsSlice";
import revenueReducer from "./slices/revenueSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    drivers: driversReducer,
    shipments: shipmentsReducer,
    revenue: revenueReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
