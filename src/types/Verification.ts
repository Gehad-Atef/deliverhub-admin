export type VerificationStatus = "pending" | "approved" | "rejected";

export type DocumentType =
    | "national_id"
    | "driving_license"
    | "vehicle_license"
    | "commercial_register";

export interface VerificationDocument {
    documentType: DocumentType;
    documentUrl: string;
    uploadedAt: string;
}

export interface VerificationRequest {
    id: string;
    userId: string;
    name: string;
    email: string;
    phone: string;
    role: "driver" | "office";
    status: VerificationStatus;
    documents: VerificationDocument[];
    reviewNote: string | null;
    createdAt: string;
}
