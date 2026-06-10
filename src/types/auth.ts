export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
