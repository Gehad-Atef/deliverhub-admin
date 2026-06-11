import type { RevenueRecord, RevenueStats } from "../types/revenue";

const generateRecords = (): RevenueRecord[] => [
  {
    id: "1",
    shipmentId: "s1",
    trackingNumber: "DH-001234",
    customerName: "Sara Ahmed",
    driverName: "Mohamed Ali",
    amount: 150,
    commission: 15,
    date: "2026-06-10T08:00:00Z",
  },
  {
    id: "2",
    shipmentId: "s2",
    trackingNumber: "DH-001235",
    customerName: "Omar Khaled",
    driverName: "Ahmed Hassan",
    amount: 80,
    commission: 8,
    date: "2026-06-10T09:00:00Z",
  },
  {
    id: "3",
    shipmentId: "s3",
    trackingNumber: "DH-001236",
    customerName: "Nour Samir",
    driverName: "Omar Khaled",
    amount: 200,
    commission: 20,
    date: "2026-06-09T10:00:00Z",
  },
  {
    id: "4",
    shipmentId: "s4",
    trackingNumber: "DH-001237",
    customerName: "Karim Nasser",
    driverName: "Karim Samir",
    amount: 90,
    commission: 9,
    date: "2026-06-09T11:00:00Z",
  },
  {
    id: "5",
    shipmentId: "s5",
    trackingNumber: "DH-001238",
    customerName: "Rana Mostafa",
    driverName: "Youssef Nasser",
    amount: 120,
    commission: 12,
    date: "2026-06-08T12:00:00Z",
  },
  {
    id: "6",
    shipmentId: "s6",
    trackingNumber: "DH-001239",
    customerName: "Youssef Ali",
    driverName: "Mohamed Ali",
    amount: 175,
    commission: 17.5,
    date: "2026-06-08T13:00:00Z",
  },
  {
    id: "7",
    shipmentId: "s7",
    trackingNumber: "DH-001240",
    customerName: "Mona Hassan",
    driverName: "Ahmed Hassan",
    amount: 95,
    commission: 9.5,
    date: "2026-06-07T14:00:00Z",
  },
];

const generateStats = (records: RevenueRecord[]): RevenueStats => {
  const totalRevenue = records.reduce((sum, r) => sum + r.amount, 0);
  const totalCommission = records.reduce((sum, r) => sum + r.commission, 0);

  const byDay: Record<string, { revenue: number; commission: number }> = {};
  records.forEach((r) => {
    const date = r.date.split("T")[0];
    if (!byDay[date]) byDay[date] = { revenue: 0, commission: 0 };
    byDay[date].revenue += r.amount;
    byDay[date].commission += r.commission;
  });

  const revenueByDay = Object.entries(byDay)
    .map(([date, vals]) => ({ date, ...vals }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalRevenue,
    totalCommission,
    totalShipments: records.length,
    avgOrderValue: records.length
      ? Math.round(totalRevenue / records.length)
      : 0,
    revenueByDay,
  };
};

export const revenueService = {
  getRevenue: async (period: "today" | "week" | "month" | "year") => {
    // TODO: استبدل بـ API call حقيقي
    // const response = await fetch(`${BASE_URL}/admin/revenue?period=${period}`, {
    //   headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    // });
    // return response.json();

    return new Promise<{ records: RevenueRecord[]; stats: RevenueStats }>(
      (resolve) => {
        setTimeout(() => {
          const records = generateRecords();
          const stats = generateStats(records);
          resolve({ records, stats });
        }, 600);
      },
    );
  },
};
