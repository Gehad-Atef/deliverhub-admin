import type {
    VerificationRequest,
    VerificationStatus,
} from "../types/Verification";

const BASE_URL = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("token");

export const verificationService = {
    getAll: async (
        status: "all" | VerificationStatus = "all",
    ): Promise<VerificationRequest[]> => {
        const query = new URLSearchParams();
        if (status && status !== "all") query.append("status", status);
        const response = await fetch(
            `${BASE_URL}/captain/verification/all?${query}`,
            { headers: { Authorization: `Bearer ${getToken()}` } },
        );
        const data = await response.json();
        if (!response.ok)
            throw new Error(
                data.message || "Failed to fetch verification requests",
            );
        return data.data;
    },

    reviewVerification: async (
        userId: string,
        status: VerificationStatus,
        reviewNote?: string,
    ): Promise<{ id: string; status: VerificationStatus }> => {
        const response = await fetch(
            `${BASE_URL}/captain/verification/review`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({ userId, status, reviewNote }),
            },
        );
        const data = await response.json();
        if (!response.ok)
            throw new Error(data.message || "Failed to review verification");
        return data.data;
    },
};
