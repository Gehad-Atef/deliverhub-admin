import type { LoginCredentials } from "../types/auth";

const BASE_URL = "http://localhost:3000/api";

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await fetch(`${BASE_URL}/auth/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailOrPhone: credentials.email,
        password: credentials.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    return {
      admin: {
        id: data.data.user._id,
        name: data.data.user.fullName,
        email: data.data.user.email,
      },
      token: data.data.tokens.accessToken,
    };
  },
};
