export type OfficePlan = "basic" | "premium" | "featured";
export type OfficeStatus = "active" | "pending" | "suspended";

export interface Office {
    id: string;
    initials: string;
    name: string;
    city: string;
    coverageArea: string;
    plan: OfficePlan;
    orders: number;
    rating: number; // 1-5
    status: OfficeStatus;
    joinedAt: string;
    email: string;
    phone: string;
}

export interface OfficesStats {
    total: number;
    verified: number;
    pendingReview: number;
    avgRating: number;
    monthTrend: number;
}

export interface AddOfficePayload {
    name: string;
    email: string;
    phone: string;
    city: string;
    coverageArea: string;
    plan: OfficePlan;
}
