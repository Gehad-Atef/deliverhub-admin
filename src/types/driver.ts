export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: "active" | "inactive" | "suspended";
  vehicle: {
    type: "motorcycle" | "car" | "van" | "truck";
    plateNumber: string;
  };
  rating: number;
  totalDeliveries: number;
  joinedAt: string;
}

export interface DriversState {
  drivers: Driver[];
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
}
