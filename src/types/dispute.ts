export type DisputeStatus = "urgent" | "open" | "resolved";
export type DisputePartyType = "customer" | "driver" | "office";

export interface DisputeParty {
    name: string;
    type: DisputePartyType;
}

export interface Dispute {
    id: string;
    orderId: string;
    title: string;
    description: string;
    status: DisputeStatus;
    amountAtRisk: number;
    plaintiff: DisputeParty;
    defendant: DisputeParty;
    createdAt: string;
    releaseLabel: string;
}

export interface DisputesStats {
    open: number;
    urgent: number;
    resolvedThisMonth: number;
    avgResolveHours: number;
    amountAtRisk: number;
}
