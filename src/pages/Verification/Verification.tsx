import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../store";
import {
    fetchVerifications,
    reviewVerification,
    setFilter,
} from "../../store/slices/Verificationslice";
import { Badge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import {
    Check,
    X,
    AlertCircle,
    FileText,
    Mail,
    Phone,
    Smile,
    Search,
} from "lucide-react";
import type {
    VerificationRequest,
    VerificationStatus,
} from "../../types/Verification";

const documentTypeKey: Record<string, string> = {
    national_id: "verification.nationalId",
    driving_license: "verification.drivingLicense",
    vehicle_license: "verification.vehicleLicense",
    commercial_register: "verification.commercialRegister",
};

const roleBadge: Record<
    VerificationRequest["role"],
    React.ComponentProps<typeof Badge>["variant"]
> = {
    driver: "amber",
    office: "blue",
};

type FilterValue = "all" | VerificationStatus;

const FILTERS: { key: FilterValue; label: string }[] = [
    { key: "all", label: "common.all" },
    { key: "pending", label: "verification.pending" },
    { key: "approved", label: "verification.approved" },
    { key: "rejected", label: "verification.rejected" },
];

// ─── Verification Card ─────────────────────────────────────────────────────────
const VerificationCard: React.FC<{
    request: VerificationRequest;
    isActing: boolean;
    onApprove: (userId: string) => void;
    onReject: (userId: string) => void;
}> = ({ request, isActing, onApprove, onReject }) => {
    const { t } = useTranslation();

    const statusColors: Record<VerificationStatus, string> = {
        pending: "bg-amber-500/10 border-amber-500/20 text-amber-500",
        approved: "bg-green-500/10 border-green-500/20 text-green-500",
        rejected: "bg-red-500/10  border-red-500/20  text-red-500",
    };

    return (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[10px] p-[1.1rem_1.15rem]">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-blue-600/15 border border-blue-500/25 flex items-center justify-center text-[13px] font-semibold text-blue-500 dark:text-blue-400">
                        {request.name
                            ?.split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                    </div>
                    <div>
                        <p className="text-[13px] font-medium text-[var(--text-primary)]">
                            {request.name}
                        </p>
                        <Badge variant={roleBadge[request.role]}>
                            {request.role === "driver"
                                ? t("users.driver")
                                : t("offices.office")}
                        </Badge>
                    </div>
                </div>
                <span
                    className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full border ${statusColors[request.status]}`}
                >
                    {t(`verification.${request.status}`)}
                </span>
            </div>

            {/* Contact */}
            <div className="flex flex-col gap-1.5 mb-4 text-[11.5px] text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5">
                    <Mail size={12} /> {request.email}
                </span>
                <span className="flex items-center gap-1.5">
                    <Phone size={12} /> {request.phone}
                </span>
            </div>

            {/* Documents */}
            <div className="flex flex-col gap-2.5 mb-4">
                {request.documents.map((doc, i) => (
                    <a
                        key={i}
                        href={doc.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 p-2 rounded-lg border border-[var(--border-color)] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
                    >
                        <img
                            src={doc.documentUrl}
                            alt={doc.documentType}
                            className="w-14 h-14 rounded-md object-cover border border-[var(--border-color)] flex-shrink-0"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                    "none";
                            }}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                                <FileText size={12} />
                                {documentTypeKey[doc.documentType]
                                    ? t(documentTypeKey[doc.documentType])
                                    : doc.documentType}
                            </p>
                            <p className="text-[10.5px] text-[var(--text-muted)] mt-0.5">
                                {new Date(doc.uploadedAt).toLocaleDateString(
                                    "en-US",
                                    {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    },
                                )}
                            </p>
                        </div>
                    </a>
                ))}
            </div>

            {/* Review Note */}
            {request.reviewNote && (
                <p className="text-[11px] text-red-400 mb-3 px-2 py-1.5 rounded-lg bg-red-500/10 border border-red-500/15">
                    {request.reviewNote}
                </p>
            )}

            {/* Actions — pending فقط */}
            {request.status === "pending" && (
                <div className="flex items-center gap-2 pt-2.5 border-t border-[var(--border-color)]">
                    {isActing ? (
                        <div className="w-full flex justify-center py-1">
                            <Spinner size="sm" />
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => onApprove(request.userId)}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-medium bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors"
                            >
                                <Check size={13} /> {t("verification.approve")}
                            </button>
                            <button
                                onClick={() => onReject(request.userId)}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-medium bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 hover:bg-red-500/20 transition-colors"
                            >
                                <X size={13} /> {t("verification.reject")}
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Skeleton ──────────────────────────────────────────────────────────────────
const Sk: React.FC<{ className?: string }> = ({ className = "" }) => (
    <div
        className={`bg-black/[0.06] dark:bg-white/[0.06] rounded-lg animate-pulse ${className}`}
    />
);
const VerificationSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {[...Array(3)].map((_, i) => (
            <Sk key={i} className="h-[280px]" />
        ))}
    </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
const Verification: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === "ar";
    const dispatch = useAppDispatch();

    const { requests, loading, actionLoading, error, filter } = useAppSelector(
        (s) => s.verification,
    );

    const [search, setSearch] = useState("");

    useEffect(() => {
        dispatch(fetchVerifications(filter));
    }, [dispatch, filter]);

    const handleFilterChange = (f: FilterValue) => {
        setSearch("");
        dispatch(setFilter(f));
    };

    const handleApprove = (userId: string) =>
        dispatch(reviewVerification({ userId, status: "approved" }));
    const handleReject = (userId: string) =>
        dispatch(reviewVerification({ userId, status: "rejected" }));

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return requests;
        return requests.filter(
            (r) =>
                r.name?.toLowerCase().includes(q) ||
                r.email?.toLowerCase().includes(q),
        );
    }, [requests, search]);

    if (error && !requests.length) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
                <AlertCircle size={32} className="text-red-400" />
                <p className="text-[var(--text-secondary)] text-sm">{error}</p>
                <button
                    onClick={() => dispatch(fetchVerifications(filter))}
                    className="mt-1 px-4 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                >
                    {t("disputes.retry")}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-3" dir={isRTL ? "rtl" : "ltr"}>
            {/* Header */}
            <div className="flex items-baseline gap-2">
                <h1 className="font-['Syne',sans-serif] text-[18px] font-bold text-[var(--text-primary)]">
                    {t("verification.title")}
                </h1>
                <span className="text-[13px] text-[var(--text-muted)]">
                    — {filtered.length} {t("verification.pendingCount")}
                </span>
            </div>

            {/* ── Toolbar (search + filter) ── */}
            <div className="flex flex-wrap items-center gap-2">
                {/* Search — نفس ستايل Offices */}
                <div className="flex items-center gap-2 bg-black/[0.04] dark:bg-white/[0.05] border border-[var(--border-color)] rounded-lg px-3 py-[6px] w-full sm:w-[220px]">
                    <Search
                        size={14}
                        className="text-[var(--text-muted)] flex-shrink-0"
                    />
                    <input
                        type="text"
                        placeholder={t("verification.searchPlaceholder")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent border-none outline-none text-[12.5px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] w-full font-['DM_Sans',sans-serif]"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>

                {/* Filter tabs — نفس ستايل Offices */}
                <div className="flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.05] border border-[var(--border-color)] rounded-lg p-1">
                    {FILTERS.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => handleFilterChange(key)}
                            className={`px-3 py-1 rounded-md text-[11.5px] transition-colors ${
                                filter === key
                                    ? "bg-black/[0.08] dark:bg-white/[0.10] text-[var(--text-primary)]"
                                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                            }`}
                        >
                            {t(label)}
                        </button>
                    ))}
                </div>

                <span className="text-[11.5px] text-[var(--text-muted)]">
                    {filtered.length}{" "}
                    {filtered.length !== 1
                        ? t("offices.results")
                        : t("offices.result")}
                </span>
            </div>

            {/* Content */}
            {loading && !requests.length ? (
                <VerificationSkeleton />
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-center bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[10px]">
                    <Smile
                        size={28}
                        className="text-[var(--text-muted)] opacity-40"
                    />
                    <p className="text-[13px] text-[var(--text-muted)]">
                        {t("verification.noRequests")}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {filtered.map((req) => (
                        <VerificationCard
                            key={req.id}
                            request={req}
                            isActing={actionLoading === req.userId}
                            onApprove={handleApprove}
                            onReject={handleReject}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Verification;
