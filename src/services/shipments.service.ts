import type { Shipment } from "../types/shipment";

const MOCK_SHIPMENTS: Shipment[] = [
  {
    id: "1",
    trackingNumber: "DH-001234",
    customer: { id: "c1", name: "Sara Ahmed", phone: "+20 100 111 2222" },
    driver: { id: "d1", name: "Mohamed Ali", phone: "+20 100 123 4567" },
    pickup: { address: "123 Tahrir St", city: "Cairo" },
    delivery: { address: "45 Corniche Rd", city: "Alexandria" },
    status: "in_transit",
    price: 150,
    commission: 15,
    createdAt: "2026-06-10T08:00:00Z",
    updatedAt: "2026-06-10T10:00:00Z",
  },
  {
    id: "2",
    trackingNumber: "DH-001235",
    customer: { id: "c2", name: "Omar Khaled", phone: "+20 101 222 3333" },
    driver: { id: "d2", name: "Ahmed Hassan", phone: "+20 101 234 5678" },
    pickup: { address: "78 Mohandessin Ave", city: "Cairo" },
    delivery: { address: "12 Maadi St", city: "Cairo" },
    status: "delivered",
    price: 80,
    commission: 8,
    createdAt: "2026-06-10T07:00:00Z",
    updatedAt: "2026-06-10T09:30:00Z",
  },
  {
    id: "3",
    trackingNumber: "DH-001236",
    customer: { id: "c3", name: "Nour Samir", phone: "+20 102 333 4444" },
    driver: undefined,
    pickup: { address: "5 Nasr City Blvd", city: "Cairo" },
    delivery: { address: "99 Heliopolis Rd", city: "Cairo" },
    status: "pending",
    price: 60,
    commission: 6,
    createdAt: "2026-06-10T11:00:00Z",
    updatedAt: "2026-06-10T11:00:00Z",
  },
  {
    id: "4",
    trackingNumber: "DH-001237",
    customer: { id: "c4", name: "Karim Nasser", phone: "+20 103 444 5555" },
    driver: { id: "d3", name: "Omar Khaled", phone: "+20 102 345 6789" },
    pickup: { address: "33 Zamalek St", city: "Cairo" },
    delivery: { address: "77 Giza Square", city: "Giza" },
    status: "assigned",
    price: 90,
    commission: 9,
    createdAt: "2026-06-10T09:00:00Z",
    updatedAt: "2026-06-10T09:45:00Z",
  },
  {
    id: "5",
    trackingNumber: "DH-001238",
    customer: { id: "c5", name: "Rana Mostafa", phone: "+20 104 555 6666" },
    driver: { id: "d4", name: "Karim Samir", phone: "+20 103 456 7890" },
    pickup: { address: "21 Dokki Ave", city: "Giza" },
    delivery: { address: "55 New Cairo Blvd", city: "Cairo" },
    status: "cancelled",
    price: 120,
    commission: 12,
    createdAt: "2026-06-09T14:00:00Z",
    updatedAt: "2026-06-09T15:00:00Z",
  },
  {
    id: "6",
    trackingNumber: "DH-001239",
    customer: { id: "c6", name: "Youssef Ali", phone: "+20 105 666 7777" },
    driver: { id: "d5", name: "Youssef Nasser", phone: "+20 104 567 8901" },
    pickup: { address: "8 October Bridge", city: "Cairo" },
    delivery: { address: "14 Port Said St", city: "Port Said" },
    status: "picked_up",
    price: 200,
    commission: 20,
    createdAt: "2026-06-10T06:00:00Z",
    updatedAt: "2026-06-10T08:00:00Z",
  },
];

export const shipmentsService = {
  getShipments: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) => {
    // TODO: استبدل بـ API call حقيقي
    // const response = await fetch(
    //   `${BASE_URL}/admin/shipments?page=${params.page}&limit=${params.limit}&search=${params.search}&status=${params.status}`,
    //   { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    // );
    // return response.json();

    return new Promise<{ shipments: Shipment[]; total: number }>((resolve) => {
      setTimeout(() => {
        let filtered = MOCK_SHIPMENTS;

        if (params.search) {
          filtered = filtered.filter(
            (s) =>
              s.trackingNumber
                .toLowerCase()
                .includes(params.search!.toLowerCase()) ||
              s.customer.name
                .toLowerCase()
                .includes(params.search!.toLowerCase()),
          );
        }

        if (params.status && params.status !== "all") {
          filtered = filtered.filter((s) => s.status === params.status);
        }

        resolve({ shipments: filtered, total: filtered.length });
      }, 600);
    });
  },

  updateShipmentStatus: async (id: string, status: string) => {
    // TODO: استبدل بـ API call حقيقي
    // const response = await fetch(`${BASE_URL}/admin/shipments/${id}/status`, {
    //   method: "PATCH",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${localStorage.getItem("token")}`,
    //   },
    //   body: JSON.stringify({ status }),
    // });
    // return response.json();

    return new Promise<Shipment>((resolve) => {
      setTimeout(() => {
        const shipment = MOCK_SHIPMENTS.find((s) => s.id === id)!;
        resolve({ ...shipment, status: status as Shipment["status"] });
      }, 400);
    });
  },
};
