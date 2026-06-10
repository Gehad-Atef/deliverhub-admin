import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/shared/ProtectedRoute";
import AdminLayout from "../components/shared/AdminLayout";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import DriversPage from "../pages/drivers/Drivers";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "drivers",
            element: <DriversPage />,
          },
        ],
      },
    ],
  },
]);
