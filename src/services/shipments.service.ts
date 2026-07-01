import type { Shipment } from "../types/shipment";

const BASE_URL = "http://localhost:3000/api";
const getToken = () => localStorage.getItem("token");

// ── Helpers ──────────────────────────────────────────────────────────────────
// السائق ممكن يرجع من الباك اند تحت اسم captain أو driver حسب الـ endpoint،
// فبنتأكد من الاتنين بدل ما نفترض اسم واحد بس ونخلي العمود يفضل "غير معين" غلط.
const mapDriver = (s: any): Shipment["driver"] => {
  const raw = s.captain || s.driver;
  if (!raw) return undefined;

  const user = raw.user || raw;
  const name = user?.fullName || user?.name;
  const phone = user?.phone;

  if (!name && !phone) return undefined;

  return {
    id: raw._id || raw.id || "",
    name: name || "N/A",
    phone: phone || "N/A",
  };
};

// المدينة مش راجعة كـ field منفصل من الباك اند دلوقتي (مفيش غير عنوان كامل نصي)،
// فبنجرب ناخد أول جزء من العنوان (قبل أول فاصلة) كتقريب للمدينة، ولو مفيش عنوان أصلاً بنسيب فاضي.
const extractCity = (address: string): string => {
  if (!address) return "";
  const parts = address.split(",").map((p) => p.trim());
  return parts[0] || "";
};

export const shipmentsService = {
  getShipments: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) => {
    const query = new URLSearchParams();
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.search) query.append("search", params.search);
    if (params.status && params.status !== "all")
      query.append("status", params.status);

    const response = await fetch(`${BASE_URL}/shipments/admin/all?${query}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to fetch shipments");

    const shipments: Shipment[] = data.data.shipments.map((s: any) => ({
      id: s._id,
      trackingNumber: s.trackingNumber || "N/A",
      customer: {
        id: s.customer?._id || "",
        name: s.customer?.fullName || "N/A",
        phone: s.customer?.phone || "N/A",
      },
      driver: mapDriver(s),
      pickup: {
        address: s.pickupAddress || "",
        city: extractCity(s.pickupAddress || ""),
      },
      delivery: {
        address: s.deliveryAddress || "",
        city: extractCity(s.deliveryAddress || ""),
      },
      status: s.status,
      price: s.estimatedPriceMin || 0,
      commission: 0,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    return { shipments, total: data.data.total };
  },

  updateShipmentStatus: async (id: string, status: string) => {
    const response = await fetch(`${BASE_URL}/shipments/admin/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to update status");

    const s = data.data;
    const shipment: Shipment = {
      id: s._id,
      trackingNumber: s.trackingNumber || "N/A",
      customer: {
        id: s.customer?._id || "",
        name: s.customer?.fullName || "N/A",
        phone: s.customer?.phone || "N/A",
      },
      driver: mapDriver(s),
      pickup: {
        address: s.pickupAddress || "",
        city: extractCity(s.pickupAddress || ""),
      },
      delivery: {
        address: s.deliveryAddress || "",
        city: extractCity(s.deliveryAddress || ""),
      },
      status: s.status,
      price: s.estimatedPriceMin || 0,
      commission: 0,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };

    return shipment;
  },
};
