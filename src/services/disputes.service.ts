import type { Dispute, DisputesStats } from "../types/dispute";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const getToken = () => localStorage.getItem("token");

interface GetDisputesResponse {
    disputes: Dispute[];
    stats: DisputesStats;
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

const mapDispute = (d: any): Dispute => ({
    id: d.id,
    ticketNumber: d.ticketNumber,
    orderId: d.orderId,
    title: d.title,
    description: d.description,
    status: d.status,
    amountAtRisk: d.amountAtRisk,
    plaintiff: d.plaintiff,
    defendant: d.defendant,
    createdAt: d.createdAt,
    releaseLabel: d.releaseLabel,
    driverId: d.driverId,
    shipmentId: d.shipmentId,
    category: d.category,
    resolvedAt: d.resolvedAt,
    messages: d.messages || [],
});

export const disputesService = {
    getDisputes: async (params: {
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<GetDisputesResponse> => {
        const query = new URLSearchParams();
        if (params.status && params.status !== "all")
            query.append("status", params.status);
        if (params.page) query.append("page", String(params.page));
        if (params.limit) query.append("limit", String(params.limit));

        const response = await fetch(`${BASE_URL}/admin/disputes?${query}`, {
            headers: { Authorization: `Bearer ${getToken()}` },
        });

        const data = await response.json();
        if (!response.ok)
            throw new Error(data.message || "Failed to fetch disputes");

        return {
            disputes: data.data.disputes.map(mapDispute),
            stats: data.data.stats,
            pagination: data.data.pagination,
        };
    },

    resolveDispute: async (
        id: string,
    ): Promise<{ id: string; status: string }> => {
        const response = await fetch(
            `${BASE_URL}/admin/disputes/${id}/resolve`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
            },
        );

        const data = await response.json();
        if (!response.ok)
            throw new Error(data.message || "Failed to resolve dispute");

        return data.data;
    },

    sendDisputeMessage: async (id: string, text: string): Promise<any> => {
        const response = await fetch(
            `${BASE_URL}/admin/disputes/${id}/messages`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({ text }),
            },
        );

        const data = await response.json();
        if (!response.ok)
            throw new Error(data.message || "Failed to send message");

        return data.data;
    },
};
