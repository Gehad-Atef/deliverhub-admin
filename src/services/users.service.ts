import type { Driver } from "../types/driver";

const BASE_URL = "http://localhost:3000/api";

const getToken = () => localStorage.getItem("token");

export const usersService = {
  getDrivers: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) => {
    const query = new URLSearchParams();
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.search) query.append("search", params.search);
    if (params.status) query.append("status", params.status);

    const response = await fetch(`${BASE_URL}/drivers/admin/all?${query}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to fetch drivers");

    // تحويل الشكل من الباك إند للشكل المتوقع في الفرونت
    const drivers: Driver[] = data.data.drivers.map((d: any) => ({
      id: d._id,
      name: d.user?.fullName || "",
      email: d.user?.email || "",
      phone: d.user?.phone || "",
      status: d.user?.status || "pending",
      vehicle: d.vehicle || { type: "car", plateNumber: "" },
      rating: d.rating || 0,
      totalDeliveries: d.totalDeliveries || 0,
      joinedAt: d.user?.createdAt || "",
    }));

    return { drivers, total: data.data.total };
  },

  updateDriverStatus: async (
    id: string,
    status: "active" | "inactive" | "suspended",
  ) => {
    const response = await fetch(`${BASE_URL}/drivers/admin/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to update status");

    const d = data.data;
    const driver: Driver = {
      id: d._id,
      name: d.user?.fullName || "",
      email: d.user?.email || "",
      phone: d.user?.phone || "",
      status: d.user?.status || status,
      vehicle: d.vehicle || { type: "car", plateNumber: "" },
      rating: d.rating || 0,
      totalDeliveries: d.totalDeliveries || 0,
      joinedAt: d.user?.createdAt || "",
    };

    return driver;
  },
};
