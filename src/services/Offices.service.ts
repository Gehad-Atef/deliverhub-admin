import type { Office, OfficesStats, OfficeStatus } from "../types/office";

const BASE_URL = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("token");

interface BackendOffice {
    id: string;
    initials: string;
    name: string;
    email: string;
    phone: string;
    address: string | null;
    status: OfficeStatus;
    rating: number;
    orders: number;
    joinedAt: string;
}

interface GetOfficesResponse {
    offices: Office[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

const mapOffice = (o: BackendOffice): Office => ({
    id: o.id,
    initials: o.initials,
    name: o.name,
    email: o.email,
    phone: o.phone,
    address: o.address,
    status: o.status,
    rating: o.rating,
    orders: o.orders,
    joinedAt: o.joinedAt,
});

export const officesService = {
    getOffices: async (params: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
    }): Promise<GetOfficesResponse> => {
        const query = new URLSearchParams();
        if (params.page) query.append("page", String(params.page));
        if (params.limit) query.append("limit", String(params.limit));
        if (params.search) query.append("search", params.search);
        if (params.status && params.status !== "all")
            query.append("status", params.status);

        const response = await fetch(`${BASE_URL}/admin/offices?${query}`, {
            headers: { Authorization: `Bearer ${getToken()}` },
        });

        const data = await response.json();
        if (!response.ok)
            throw new Error(data.message || "Failed to fetch offices");

        return {
            offices: data.data.offices.map(mapOffice),
            pagination: data.data.pagination,
        };
    },

    // مستقلة عن فلتر/بحث الجدول — بتتنادى مرة واحدة بس عند تحميل الصفحة
    getStats: async (): Promise<OfficesStats> => {
        const response = await fetch(`${BASE_URL}/admin/offices/stats`, {
            headers: { Authorization: `Bearer ${getToken()}` },
        });

        const data = await response.json();
        if (!response.ok)
            throw new Error(data.message || "Failed to fetch office stats");

        return data.data;
    },

    getOfficeById: async (id: string): Promise<Office> => {
        const response = await fetch(`${BASE_URL}/admin/offices/${id}`, {
            headers: { Authorization: `Bearer ${getToken()}` },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Office not found");

        return mapOffice(data.data);
    },

    updateOfficeStatus: async (
        id: string,
        status: OfficeStatus,
    ): Promise<{ id: string; status: OfficeStatus }> => {
        const response = await fetch(`${BASE_URL}/admin/offices/${id}/status`, {
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

        return { id: data.data.id, status: data.data.status };
    },
};
