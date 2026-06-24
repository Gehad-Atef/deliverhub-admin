export type UserRole = "customer" | "driver";
export type UserStatus = "active" | "suspended";

export interface User {
    id: string;
    initials: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    orders: number;
    joined: string;
    status: UserStatus;
}

export interface UsersStats {
    total: number;
    active: number;
    suspended: number;
    weekTrend: number;
    newSuspendedThisWeek: number;
}

export interface AddUserPayload {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
}
