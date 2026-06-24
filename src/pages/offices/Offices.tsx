import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../store";
import {
    fetchOffices,
    approveOffice,
    toggleOfficeStatus,
    setSearch,
    setStatusFilter,
} from "../../store/slices/officesSlice";
import type { OfficeStatus, OfficePlan } from "../../types/office";
import { StatCard } from "../../components/shared/StatCard";
import { Badge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import {
    Eye,
    Ban,
    RefreshCw,
    CircleCheck,
    Search,
    X,
    Store,
    Star,
    AlertCircle,
    Building2,
} from "lucide-react";

// ─── Badge maps ───────────────────────────────────────────────────────────────
const planBadge: Record<
    OfficePlan,
    React.ComponentProps<typeof Badge>["variant"]
> = {
    basic: "gray",
    premium: "blue",
    featured: "amber",
};

const statusBadge: Record<
    OfficeStatus,
    React.ComponentProps<typeof Badge>["variant"]
> = {
    active: "green",
    pending: "amber",
    suspended: "red",
};

// ─── Star Rating ──────────────────────────────────────────────────────────────
const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center gap-[2px]">
        {[1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                size={12}
                style={{
                    fill:
                        star <= Math.round(rating) ? "#f59e0b" : "transparent",
                    color:
                        star <= Math.round(rating)
                            ? "#f59e0b"
                            : "var(--border-color)",
                }}
            />
        ))}
    </div>
);

// ─── View Office Modal ────────────────────────────────────────────────────────
const ViewOfficeModal: React.FC<{ officeId: string; onClose: () => void }> = ({
    officeId,
    onClose,
}) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === "ar";
    const office = useAppSelector((s) =>
        s.offices.offices.find((o) => o.id === officeId),
    );
    if (!office) return null;

    const fields = [
        { label: t("auth.email"), value: office.email },
        { label: t("users.phone"), value: office.phone },
        { label: t("offices.coverageArea"), value: office.coverageArea },
        { label: t("users.orders"), value: office.orders.toLocaleString() },
        {
            label: t("offices.rating"),
            value: <StarRating rating={office.rating} />,
        },
        { label: t("users.joined"), value: office.joinedAt },
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
            dir={isRTL ? "rtl" : "ltr"}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="w-full sm:max-w-sm sm:mx-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-black/20">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)]">
                    <h2 className="font-['Syne',sans-serif] text-[15px] font-semibold text-[var(--text-primary)]">
                        {t("offices.officeDetails")}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/[0.06] dark:hover:bg-white/[0.07] transition-colors"
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 py-5">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/25 flex items-center justify-center text-[15px] font-semibold text-blue-500 dark:text-blue-400">
                            {office.initials}
                        </div>
                        <div>
                            <p className="text-[14px] font-semibold text-[var(--text-primary)]">
                                {office.name}
                            </p>
                            <p className="text-[11.5px] text-[var(--text-muted)] mt-0.5">
                                {office.city}
                            </p>
                        </div>
                        <div className="ml-auto flex flex-col items-end gap-1">
                            <Badge variant={statusBadge[office.status]}>
                                {t(`offices.${office.status}`)}
                            </Badge>
                            <Badge variant={planBadge[office.plan]}>
                                {t(`offices.${office.plan}`)}
                            </Badge>
                        </div>
                    </div>

                    <div className="border border-[var(--border-color)] rounded-xl overflow-hidden">
                        {fields.map(({ label, value }) => (
                            <div
                                key={label}
                                className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] last:border-none"
                            >
                                <span className="text-[11.5px] text-[var(--text-muted)]">
                                    {label}
                                </span>
                                <span className="text-[12.5px] text-[var(--text-primary)]">
                                    {value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="px-5 pb-5">
                    <button
                        onClick={onClose}
                        className="w-full py-2 rounded-lg text-[12.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-black/[0.04] dark:bg-white/[0.05] hover:bg-black/[0.07] dark:hover:bg-white/[0.09] transition-colors"
                    >
                        {t("offices.close")}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
    <div
        className={`bg-black/[0.06] dark:bg-white/[0.06] rounded-lg animate-pulse ${className}`}
    />
);

const OfficesSkeleton = () => (
    <div className="space-y-3">
        <Skeleton className="h-7 w-44" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[100px]" />
            ))}
        </div>
        <Skeleton className="h-[380px]" />
    </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const Offices: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === "ar";

    const dispatch = useAppDispatch();
    const {
        offices = [],
        stats = null,
        loading = false,
        actionLoading = null,
        error = null,
        search = "",
        statusFilter = "all",
    } = useAppSelector((s) => s.offices) ?? {};

    const [viewOfficeId, setViewOfficeId] = useState<string | null>(null);
    const [localSearch, setLocalSearch] = useState("");

    useEffect(() => {
        dispatch(fetchOffices());
    }, [dispatch]);

    useEffect(() => {
        const id = setTimeout(() => dispatch(setSearch(localSearch)), 250);
        return () => clearTimeout(id);
    }, [localSearch, dispatch]);

    const filtered = useMemo(
        () =>
            offices.filter((o) => {
                const matchStatus =
                    statusFilter === "all" || o.status === statusFilter;
                const matchSearch =
                    !search ||
                    o.name.toLowerCase().includes(search.toLowerCase()) ||
                    o.city.toLowerCase().includes(search.toLowerCase()) ||
                    o.coverageArea.toLowerCase().includes(search.toLowerCase());
                return matchStatus && matchSearch;
            }),
        [offices, search, statusFilter],
    );

    const handleApprove = (id: string) => dispatch(approveOffice(id));
    const handleToggle = (id: string, s: OfficeStatus) =>
        dispatch(toggleOfficeStatus({ id, currentStatus: s }));

    const statusTabs = [
        { key: "all" as const, label: t("offices.all") },
        { key: "active" as const, label: t("offices.active") },
        { key: "pending" as const, label: t("offices.pending") },
        { key: "suspended" as const, label: t("offices.suspended") },
    ];

    const tableColumns = [
        t("offices.office"),
        t("offices.coverageArea"),
        t("offices.plan"),
        t("offices.orders"),
        t("offices.rating"),
        t("offices.status"),
        t("offices.actions"),
    ];

    if (error && !offices.length) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
                <AlertCircle size={32} className="text-red-400" />
                <p className="text-[var(--text-secondary)] text-sm">{error}</p>
                <button
                    onClick={() => dispatch(fetchOffices())}
                    className="mt-1 px-4 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (loading && !offices.length) return <OfficesSkeleton />;

    return (
        <>
            <div className="space-y-3" dir={isRTL ? "rtl" : "ltr"}>
                {/* ── Title ─────────────────────────────────────────────── */}
                <div className="flex items-baseline gap-2">
                    <h1 className="font-['Syne',sans-serif] text-[18px] font-bold text-[var(--text-primary)]">
                        {t("offices.title")}
                    </h1>
                    {stats && (
                        <span className="text-[13px] text-[var(--text-muted)]">
                            — {stats.total} {t("offices.total")}
                        </span>
                    )}
                </div>

                {/* ── Stat cards ────────────────────────────────────────── */}
                {stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <StatCard
                            label={t("offices.totalOffices")}
                            value={stats.total.toString()}
                            subText={`↑ ${stats.monthTrend} ${t("offices.thisMonth")}`}
                            trend="up"
                            icon={Store}
                        />
                        <StatCard
                            label={t("offices.verified")}
                            value={stats.verified.toString()}
                            subText={`${stats.pendingReview} ${t("offices.pendingReview")}`}
                            trend="neutral"
                            icon={CircleCheck}
                        />
                        <StatCard
                            label={t("offices.avgRating")}
                            value={stats.avgRating.toFixed(1)}
                            subText={t("offices.platformAverage")}
                            trend="neutral"
                            icon={Star}
                        />
                    </div>
                )}

                {/* ── Table ─────────────────────────────────────────────── */}
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[10px] overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-[var(--border-color)]">
                        {/* Search */}
                        <div className="flex items-center gap-2 bg-black/[0.04] dark:bg-white/[0.05] border border-[var(--border-color)] rounded-lg px-3 py-[6px] w-full sm:w-[220px]">
                            <Search
                                size={14}
                                className="text-[var(--text-muted)] flex-shrink-0"
                            />
                            <input
                                type="text"
                                placeholder={t("offices.searchPlaceholder")}
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                className="bg-transparent border-none outline-none text-[12.5px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] w-full font-['DM_Sans',sans-serif]"
                            />
                            {localSearch && (
                                <button
                                    onClick={() => setLocalSearch("")}
                                    className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>

                        {/* Status filter */}
                        <div className="flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.05] border border-[var(--border-color)] rounded-lg p-1">
                            {statusTabs.map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() =>
                                        dispatch(setStatusFilter(key))
                                    }
                                    className={`px-3 py-1 rounded-md text-[11.5px] transition-colors
                                        ${
                                            statusFilter === key
                                                ? "bg-black/[0.08] dark:bg-white/[0.10] text-[var(--text-primary)]"
                                                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                                        }`}
                                >
                                    {label}
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

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-[12.5px] min-w-[600px]">
                            <thead>
                                <tr className="bg-black/[0.02] dark:bg-white/[0.03]">
                                    {tableColumns.map((col) => (
                                        <th
                                            key={col}
                                            className={`px-3.5 py-2.5 text-${isRTL ? "right" : "left"} text-[10.5px] font-medium text-[var(--text-muted)] border-b border-[var(--border-color)] uppercase tracking-[0.05em]`}
                                        >
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-4 py-12 text-center text-[13px] text-[var(--text-muted)]"
                                        >
                                            <Building2
                                                size={28}
                                                className="block mb-2 mx-auto opacity-40"
                                            />
                                            {t("offices.noResults")}
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((office) => {
                                        const isActing =
                                            actionLoading === office.id;
                                        return (
                                            <tr
                                                key={office.id}
                                                className="group hover:bg-black/[0.02] dark:hover:bg-white/[0.025] transition-colors"
                                            >
                                                {/* Office */}
                                                <td className="px-3.5 py-2.5 border-b border-[var(--border-color)]">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-[6px] flex-shrink-0 flex items-center justify-center bg-black/[0.05] dark:bg-white/[0.06] border border-[var(--border-color)] text-[10px] font-medium text-[var(--text-secondary)]">
                                                            {office.initials}
                                                        </div>
                                                        <div>
                                                            <p className="text-[12.5px] text-[var(--text-primary)]">
                                                                {office.name}
                                                            </p>
                                                            <p className="text-[10.5px] text-[var(--text-muted)]">
                                                                {office.city}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Coverage */}
                                                <td className="px-3.5 py-2.5 border-b border-[var(--border-color)] text-[var(--text-secondary)]">
                                                    {office.coverageArea}
                                                </td>
                                                {/* Plan */}
                                                <td className="px-3.5 py-2.5 border-b border-[var(--border-color)]">
                                                    <Badge
                                                        variant={
                                                            planBadge[
                                                                office.plan
                                                            ]
                                                        }
                                                    >
                                                        {t(
                                                            `offices.${office.plan}`,
                                                        )}
                                                    </Badge>
                                                </td>
                                                {/* Orders */}
                                                <td className="px-3.5 py-2.5 border-b border-[var(--border-color)] text-[var(--text-secondary)]">
                                                    {office.orders.toLocaleString()}
                                                </td>
                                                {/* Rating */}
                                                <td className="px-3.5 py-2.5 border-b border-[var(--border-color)]">
                                                    <StarRating
                                                        rating={office.rating}
                                                    />
                                                </td>
                                                {/* Status */}
                                                <td className="px-3.5 py-2.5 border-b border-[var(--border-color)]">
                                                    <Badge
                                                        variant={
                                                            statusBadge[
                                                                office.status
                                                            ]
                                                        }
                                                    >
                                                        {t(
                                                            `offices.${office.status}`,
                                                        )}
                                                    </Badge>
                                                </td>
                                                {/* Actions */}
                                                <td className="px-3.5 py-2.5 border-b border-[var(--border-color)]">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                setViewOfficeId(
                                                                    office.id,
                                                                )
                                                            }
                                                            title={t(
                                                                "offices.viewDetails",
                                                            )}
                                                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/[0.06] dark:hover:bg-white/[0.07] transition-colors"
                                                        >
                                                            <Eye size={15} />
                                                        </button>

                                                        {isActing ? (
                                                            <Spinner
                                                                size="sm"
                                                                className="mx-1"
                                                            />
                                                        ) : office.status ===
                                                          "pending" ? (
                                                            <button
                                                                onClick={() =>
                                                                    handleApprove(
                                                                        office.id,
                                                                    )
                                                                }
                                                                title={t(
                                                                    "offices.approve",
                                                                )}
                                                                className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-green-500 hover:bg-green-500/10 transition-colors"
                                                            >
                                                                <CircleCheck
                                                                    size={15}
                                                                />
                                                            </button>
                                                        ) : office.status ===
                                                          "active" ? (
                                                            <button
                                                                onClick={() =>
                                                                    handleToggle(
                                                                        office.id,
                                                                        office.status,
                                                                    )
                                                                }
                                                                title={t(
                                                                    "offices.suspend",
                                                                )}
                                                                className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                                            >
                                                                <Ban
                                                                    size={15}
                                                                />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() =>
                                                                    handleToggle(
                                                                        office.id,
                                                                        office.status,
                                                                    )
                                                                }
                                                                title={t(
                                                                    "offices.restore",
                                                                )}
                                                                className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                                                            >
                                                                <RefreshCw
                                                                    size={15}
                                                                />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {viewOfficeId && (
                <ViewOfficeModal
                    officeId={viewOfficeId}
                    onClose={() => setViewOfficeId(null)}
                />
            )}
        </>
    );
};

export default Offices;
