import type { EscrowStats, EscrowTransaction } from "../types/escrow";

const MOCK_TRANSACTIONS: EscrowTransaction[] = [
  {
    id: "1",
    shipmentId: "s1",
    trackingNumber: "DH-001234",
    customerName: "Sara Ahmed",
    driverName: "Mohamed Ali",
    amount: 150,
    status: "held",
    createdAt: "2026-06-10T08:00:00Z",
  },
  {
    id: "2",
    shipmentId: "s2",
    trackingNumber: "DH-001235",
    customerName: "Omar Khaled",
    driverName: "Ahmed Hassan",
    amount: 80,
    status: "released",
    createdAt: "2026-06-10T09:00:00Z",
    releasedAt: "2026-06-10T11:00:00Z",
  },
  {
    id: "3",
    shipmentId: "s3",
    trackingNumber: "DH-001236",
    customerName: "Nour Samir",
    driverName: "Omar Khaled",
    amount: 200,
    status: "held",
    createdAt: "2026-06-09T10:00:00Z",
  },
  {
    id: "4",
    shipmentId: "s4",
    trackingNumber: "DH-001237",
    customerName: "Karim Nasser",
    driverName: "Karim Samir",
    amount: 90,
    status: "refunded",
    createdAt: "2026-06-09T11:00:00Z",
    releasedAt: "2026-06-09T14:00:00Z",
  },
  {
    id: "5",
    shipmentId: "s5",
    trackingNumber: "DH-001238",
    customerName: "Rana Mostafa",
    driverName: "Youssef Nasser",
    amount: 120,
    status: "held",
    createdAt: "2026-06-08T12:00:00Z",
  },
  {
    id: "6",
    shipmentId: "s6",
    trackingNumber: "DH-001239",
    customerName: "Youssef Ali",
    driverName: "Mohamed Ali",
    amount: 175,
    status: "disputed",
    createdAt: "2026-06-08T13:00:00Z",
  },
];

const generateStats = (transactions: EscrowTransaction[]): EscrowStats => ({
  totalHeld: transactions
    .filter((t) => t.status === "held")
    .reduce((sum, t) => sum + t.amount, 0),
  totalReleased: transactions
    .filter((t) => t.status === "released")
    .reduce((sum, t) => sum + t.amount, 0),
  totalRefunded: transactions
    .filter((t) => t.status === "refunded")
    .reduce((sum, t) => sum + t.amount, 0),
  pendingCount: transactions.filter((t) => t.status === "held").length,
});

export const escrowService = {
  getTransactions: async (status: string) => {
    // TODO: استبدل بـ API call حقيقي
    // const response = await fetch(`${BASE_URL}/admin/escrow?status=${status}`, {
    //   headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    // });
    // return response.json();

    return new Promise<{
      transactions: EscrowTransaction[];
      stats: EscrowStats;
    }>((resolve) => {
      setTimeout(() => {
        const filtered =
          status === "all"
            ? MOCK_TRANSACTIONS
            : MOCK_TRANSACTIONS.filter((t) => t.status === status);
        resolve({
          transactions: filtered,
          stats: generateStats(MOCK_TRANSACTIONS),
        });
      }, 600);
    });
  },

  releaseTransaction: async (id: string) => {
    // TODO: استبدل بـ API call حقيقي
    // const response = await fetch(`${BASE_URL}/admin/escrow/${id}/release`, {
    //   method: "POST",
    //   headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    // });
    // return response.json();

    return new Promise<EscrowTransaction>((resolve) => {
      setTimeout(() => {
        const t = MOCK_TRANSACTIONS.find((t) => t.id === id)!;
        resolve({
          ...t,
          status: "released",
          releasedAt: new Date().toISOString(),
        });
      }, 400);
    });
  },

  refundTransaction: async (id: string) => {
    // TODO: استبدل بـ API call حقيقي
    // const response = await fetch(`${BASE_URL}/admin/escrow/${id}/refund`, {
    //   method: "POST",
    //   headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    // });
    // return response.json();

    return new Promise<EscrowTransaction>((resolve) => {
      setTimeout(() => {
        const t = MOCK_TRANSACTIONS.find((t) => t.id === id)!;
        resolve({
          ...t,
          status: "refunded",
          releasedAt: new Date().toISOString(),
        });
      }, 400);
    });
  },
};
