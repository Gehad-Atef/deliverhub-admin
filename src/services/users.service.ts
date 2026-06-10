import type { Driver } from "../types/user";

const MOCK_DRIVERS: Driver[] = [
  {
    id: "1",
    name: "Mohamed Ali",
    email: "mohamed@example.com",
    phone: "+20 100 123 4567",
    status: "active",
    vehicle: { type: "motorcycle", plateNumber: "ABC 1234" },
    rating: 4.8,
    totalDeliveries: 234,
    joinedAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Ahmed Hassan",
    email: "ahmed@example.com",
    phone: "+20 101 234 5678",
    status: "active",
    vehicle: { type: "car", plateNumber: "XYZ 5678" },
    rating: 4.5,
    totalDeliveries: 189,
    joinedAt: "2024-02-20",
  },
  {
    id: "3",
    name: "Omar Khaled",
    email: "omar@example.com",
    phone: "+20 102 345 6789",
    status: "inactive",
    vehicle: { type: "van", plateNumber: "DEF 9012" },
    rating: 4.2,
    totalDeliveries: 98,
    joinedAt: "2024-03-10",
  },
  {
    id: "4",
    name: "Karim Samir",
    email: "karim@example.com",
    phone: "+20 103 456 7890",
    status: "suspended",
    vehicle: { type: "motorcycle", plateNumber: "GHI 3456" },
    rating: 3.9,
    totalDeliveries: 45,
    joinedAt: "2024-04-05",
  },
  {
    id: "5",
    name: "Youssef Nasser",
    email: "youssef@example.com",
    phone: "+20 104 567 8901",
    status: "active",
    vehicle: { type: "car", plateNumber: "JKL 7890" },
    rating: 4.9,
    totalDeliveries: 312,
    joinedAt: "2024-01-01",
  },
];

export const usersService = {
  getDrivers: async (params: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    // TODO: استبدل بـ API call حقيقي
    // const response = await fetch(`${BASE_URL}/admin/drivers?page=${params.page}&limit=${params.limit}&search=${params.search}`, {
    //   headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    // });
    // return response.json();

    return new Promise<{ drivers: Driver[]; total: number }>((resolve) => {
      setTimeout(() => {
        let filtered = MOCK_DRIVERS;
        if (params.search) {
          filtered = MOCK_DRIVERS.filter(
            (d) =>
              d.name.toLowerCase().includes(params.search!.toLowerCase()) ||
              d.email.toLowerCase().includes(params.search!.toLowerCase()),
          );
        }
        resolve({ drivers: filtered, total: filtered.length });
      }, 600);
    });
  },

  updateDriverStatus: async (
    id: string,
    status: "active" | "inactive" | "suspended",
  ) => {
    // TODO: استبدل بـ API call حقيقي
    // const response = await fetch(`${BASE_URL}/admin/drivers/${id}/status`, {
    //   method: "PATCH",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${localStorage.getItem("token")}`,
    //   },
    //   body: JSON.stringify({ status }),
    // });
    // return response.json();

    return new Promise<Driver>((resolve) => {
      setTimeout(() => {
        const driver = MOCK_DRIVERS.find((d) => d.id === id)!;
        resolve({ ...driver, status });
      }, 400);
    });
  },
};
