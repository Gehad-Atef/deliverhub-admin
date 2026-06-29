import type { EscrowStats, EscrowTransaction } from "../types/escrow";

const BASE_URL = "http://localhost:3000/api";

const getToken = () => localStorage.getItem("token");

export const escrowService = {
  getTransactions: async (status: string) => {
    const query = new URLSearchParams();

    if (status && status !== "all") {
      query.append("status", status);
    }

    const response = await fetch(
      `${BASE_URL}/escrow/admin/all?${query}`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to fetch escrow transactions"
      );
    }

    const transactions: EscrowTransaction[] =
      data.data.transactions.map((t: any) => ({
        id: t._id,
        shipmentId: t.shipment?._id || t.shipment || "",
        trackingNumber:
          t.shipment?.trackingNumber || t.trackingNumber || "N/A",
        customerName:
          t.customer?.fullName || t.customer || "N/A",
        driverName:
          t.driver?.fullName || t.driver || "N/A",
        amount: t.amount,
        status: t.status,
        createdAt: t.createdAt,
        releasedAt: t.releasedAt || undefined,
      }));

    const stats: EscrowStats = data.data.stats;

    return {
      transactions,
      stats,
    };
  },


  releaseTransaction: async (id: string) => {
    const response = await fetch(
      `${BASE_URL}/escrow/admin/${id}/release`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to release escrow"
      );
    }


    const t = data.data;

    const transaction: EscrowTransaction = {
      id: t._id,

      shipmentId:
        t.shipment?._id ||
        t.shipment ||
        "",

      trackingNumber:
        t.shipment?.trackingNumber ||
        t.trackingNumber ||
        "N/A",

      customerName:
        t.customer?.fullName ||
        t.customer ||
        "N/A",

      driverName:
        t.driver?.fullName ||
        t.driver ||
        "N/A",

      amount: t.amount,

      status: t.status,

      createdAt: t.createdAt,

      releasedAt:
        t.releasedAt ||
        undefined,
    };


    return transaction;
  },


  refundTransaction: async (id: string) => {
    const response = await fetch(
      `${BASE_URL}/escrow/admin/${id}/refund`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );


    const data = await response.json();


    if (!response.ok) {
      throw new Error(
        data.message || "Failed to refund escrow"
      );
    }


    const t = data.data;


    const transaction: EscrowTransaction = {
      id: t._id,

      shipmentId:
        t.shipment?._id ||
        t.shipment ||
        "",

      trackingNumber:
        t.shipment?.trackingNumber ||
        t.trackingNumber ||
        "N/A",

      customerName:
        t.customer?.fullName ||
        t.customer ||
        "N/A",

      driverName:
        t.driver?.fullName ||
        t.driver ||
        "N/A",

      amount: t.amount,

      status: t.status,

      createdAt: t.createdAt,

      releasedAt:
        t.releasedAt ||
        undefined,
    };


    return transaction;
  },
};