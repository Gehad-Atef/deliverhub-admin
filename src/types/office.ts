export type OfficeStatus = "active" | "suspended";

export interface Office {
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

export interface OfficesStats {
    total: number;
    active: number;
    suspended: number;
    avgRating: number;
    monthTrend: number;
}
