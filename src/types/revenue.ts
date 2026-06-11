export interface RevenueRecord {
  id: string;
  shipmentId: string;
  trackingNumber: string;
  customerName: string;
  driverName: string;
  amount: number;
  commission: number;
  date: string;
}

export interface RevenueStats {
  totalRevenue: number;
  totalCommission: number;
  totalShipments: number;
  avgOrderValue: number;
  revenueByDay: { date: string; revenue: number; commission: number }[];
}

export interface RevenueState {
  records: RevenueRecord[];
  stats: RevenueStats | null;
  isLoading: boolean;
  error: string | null;
  period: "today" | "week" | "month" | "year";
}
