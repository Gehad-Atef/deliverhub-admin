export interface EscrowTransaction {
  id: string;
  shipmentId: string;
  trackingNumber: string;
  customerName: string;
  driverName: string;
  amount: number;
  status: "held" | "released" | "refunded" | "disputed";
  createdAt: string;
  releasedAt?: string;
}

export interface EscrowStats {
  totalHeld: number;
  totalReleased: number;
  totalRefunded: number;
  pendingCount: number;
}

export interface EscrowState {
  transactions: EscrowTransaction[];
  stats: EscrowStats | null;
  isLoading: boolean;
  error: string | null;
}
