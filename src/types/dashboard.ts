export interface StatCardData {
    label: string;
    value: string;
    subText: string;
    trend: "up" | "down" | "neutral";
    icon: string;
}

export interface RecentOrder {
    id: string;
    customer: string;
    timeAgo: string;
    status: "in_transit" | "delivered" | "pending_offer" | "dispute";
}

export interface RevenueSource {
    label: string;
    percentage: number;
    color: string;
}

export interface EscrowStatus {
    label: string;
    amount: number;
    percentage: number;
    color: string;
}

export interface RecentUser {
    initials: string;
    name: string;
    email: string;
    role: "customer" | "driver";
    orders: number;
    joined: string;
    status: "active" | "suspended";
}

export interface DashboardStats {
    totalOrders: number;
    totalOrdersTrend: number;
    registeredUsers: number;
    registeredUsersTrend: number;
    openDisputes: number;
    urgentDisputes: number;
    disputeRate: number;
    monthlyRevenue: number;
    revenueTrend: number;
}
