import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import driversReducer from "./slices/driversSlice";
import shipmentsReducer from "./slices/shipmentsSlice";
import uiReducer from "./slices/uiSlice";
import dashboardReducer from "./slices/dashboardSlice";
import usersReducer from "./slices/usersSlice";
import officesReducer from "./slices/officesSlice";
import {
    useDispatch,
    useSelector,
    type TypedUseSelectorHook,
} from "react-redux";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        drivers: driversReducer,
        shipments: shipmentsReducer,
        ui: uiReducer,
        dashboard: dashboardReducer,
        users: usersReducer,
        offices: officesReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
