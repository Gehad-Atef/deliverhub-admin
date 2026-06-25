import type {
    DashboardStats,
    RecentOrder,
    RevenueSource,
    EscrowStatus,
    RecentUser,
} from "../types/dashboard";

const BASE_URL = "http://localhost:3000/api";

export interface DashboardData {
    stats: DashboardStats;
    recentOrders: RecentOrder[];
    revenueSources: RevenueSource[];
    escrowStatuses: EscrowStatus[];
    recentUsers: RecentUser[];
}

export const dashboardService = {
    getDashboardData: async (): Promise<DashboardData> => {
        const token = localStorage.getItem("token");

        const response = await fetch(`${BASE_URL}/admin/dashboard`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to load dashboard data");
        }

        return data.data as DashboardData;
    },
};
