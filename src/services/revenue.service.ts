import type { RevenueRecord, RevenueStats } from "../types/revenue";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const getToken = () => localStorage.getItem("token");

export const revenueService = {
    getRevenue: async (period: "today" | "week" | "month" | "year") => {
        const response = await fetch(
            `${BASE_URL}/revenue/admin?period=${period}`,
            {
                headers: { Authorization: `Bearer ${getToken()}` },
            },
        );

        const data = await response.json();
        if (!response.ok)
            throw new Error(data.message || "Failed to fetch revenue");

        const records: RevenueRecord[] = data.data.records.map((r: any) => ({
            id: r.id,
            shipmentId: r.id,
            trackingNumber: r.trackingNumber,
            customerName: r.customerName,
            driverName: r.driverName,
            amount: r.amount,
            commission: r.commission,
            date: r.date,
        }));

        const stats: RevenueStats = {
            totalRevenue: data.data.stats.totalRevenue,
            totalCommission: data.data.stats.totalCommission,
            totalShipments: data.data.stats.totalShipments,
            avgOrderValue: data.data.stats.avgOrderValue,
            revenueByDay: data.data.stats.revenueByDay,
        };

        return { records, stats };
    },
};
