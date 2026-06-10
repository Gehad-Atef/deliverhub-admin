// import { LoginCredentials } from "../types/auth.ts";

import type { LoginCredentials } from "../types/auth";

// TODO: استبدل BASE_URL بالـ env variable لما الباكند يجهز
// const BASE_URL = import.meta.env.VITE_API_URL;

const MOCK_ADMIN = {
  admin: {
    id: "1",
    name: "Ahmed Admin",
    email: "admin@deliverhub.com",
  },
  token: "mock-jwt-token-123",
};

export const authService = {
  login: async (credentials: LoginCredentials) => {
    // TODO: استبدل الـ mock بده
    // const response = await fetch(`${BASE_URL}/auth/admin/login`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(credentials),
    // });
    // return response.json();

    return new Promise<typeof MOCK_ADMIN>((resolve, reject) => {
      setTimeout(() => {
        if (
          credentials.email === "admin@deliverhub.com" &&
          credentials.password === "admin123"
        ) {
          resolve(MOCK_ADMIN);
        } else {
          reject(new Error("Invalid email or password"));
        }
      }, 800);
    });
  },
};
