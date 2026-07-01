export type DisputeStatus = "urgent" | "open" | "resolved";
export type DisputePartyType = "customer" | "driver" | "office";

export interface DisputeParty {
    name: string;
    type: DisputePartyType;
    initials?: string;
}

export interface Dispute {
    id: string;
    ticketNumber: string;
    orderId: string;
    title: string;
    description: string;
    status: DisputeStatus;
    amountAtRisk: number;
    plaintiff: DisputeParty;
    defendant: DisputeParty;
    createdAt: string;
    releaseLabel: string;
    driverId: string | null;
    shipmentId: string | null;
    category: string;
    resolvedAt: string | null;
    messages?: {
        sender: "user" | "admin";
        senderName: string;
        text: string;
        createdAt: string;
    }[];
}

export interface DisputesStats {
    open: number;
    urgent: number;
    resolvedThisMonth: number;
    avgResolveHours: number;
    amountAtRisk: number;
}
