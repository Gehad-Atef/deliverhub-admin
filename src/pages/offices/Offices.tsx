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
            <i
                key={star}
                className="ti ti-star-filled text-[12px]"
                style={{
                    color:
                        star <= Math.round(rating)
                            ? "var(--amber, #f59e0b)"
                            : "rgba(255,255,255,0.12)",
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
            <div className="w-full sm:max-w-sm sm:mx-4 bg-[#131d2e] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-black/60">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
                    <h2 className="font-['Syne',sans-serif] text-[15px] font-semibold text-white">
                        {t("offices.officeDetails")}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/[0.07] transition-colors"
                    >
                        <i className="ti ti-x text-[16px]" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 py-5">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/25 flex items-center justify-center text-[15px] font-semibold text-blue-400">
                            {office.initials}
                        </div>
                        <div>
                            <p className="text-[14px] font-semibold text-white">
                                {office.name}
                            </p>
                            <p className="text-[11.5px] text-white/40 mt-0.5">
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

                    <div className="border border-white/[0.07] rounded-xl overflow-hidden">
                        {fields.map(({ label, value }) => (
                            <div
                                key={label}
                                className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07] last:border-none"
                            >
                                <span className="text-[11.5px] text-white/40">
                                    {label}
                                </span>
                                <span className="text-[12.5px] text-white">
                                    {value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="px-5 pb-5">
                    <button
                        onClick={onClose}
                        className="w-full py-2 rounded-lg text-[12.5px] text-white/55 hover:text-white bg-white/[0.05] hover:bg-white/[0.09] transition-colors"
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
    <div className={`bg-white/[0.06] rounded-lg animate-pulse ${className}`} />
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

    // Debounced search
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

    // ── Status filter tabs ──
    const statusTabs = [
        { key: "all" as const, label: t("offices.all") },
        { key: "active" as const, label: t("offices.active") },
        { key: "pending" as const, label: t("offices.pending") },
        { key: "suspended" as const, label: t("offices.suspended") },
    ];

    // ── Table columns ──
    const tableColumns = [
        t("offices.office"),
        t("offices.coverageArea"),
        t("offices.plan"),
        t("offices.orders"),
        t("offices.rating"),
        t("offices.status"),
        t("offices.actions"),
    ];

    // ── Error state ──
    if (error && !offices.length) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
                <i className="ti ti-alert-circle text-[32px] text-red-400" />
                <p className="text-white/70 text-sm">{error}</p>
                <button
                    onClick={() => dispatch(fetchOffices())}
                    className="mt-1 px-4 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    // ── Loading state ──
    if (loading && !offices.length) return <OfficesSkeleton />;

    return (
        <>
            <div className="space-y-3" dir={isRTL ? "rtl" : "ltr"}>
                {/* ── Title ─────────────────────────────────────────────── */}
                <div className="flex items-baseline gap-2">
                    <h1 className="font-['Syne',sans-serif] text-[18px] font-bold text-white">
                        {t("offices.title")}
                    </h1>
                    {stats && (
                        <span className="text-[13px] text-white/35">
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
                            icon="ti ti-building-store"
                        />
                        <StatCard
                            label={t("offices.verified")}
                            value={stats.verified.toString()}
                            subText={`${stats.pendingReview} ${t("offices.pendingReview")}`}
                            trend="neutral"
                            icon="ti ti-circle-check"
                        />
                        <StatCard
                            label={t("offices.avgRating")}
                            value={stats.avgRating.toFixed(1)}
                            subText={t("offices.platformAverage")}
                            trend="neutral"
                            icon="ti ti-star"
                        />
                    </div>
                )}

                {/* ── Table ─────────────────────────────────────────────── */}
                <div className="bg-[#131d2e] border border-white/[0.08] rounded-[10px] overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-white/[0.08]">
                        {/* Search */}
                        <div className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-[6px] w-full sm:w-[220px]">
                            <i className="ti ti-search text-[15px] text-white/35 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder={t("offices.searchPlaceholder")}
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                className="bg-transparent border-none outline-none text-[12.5px] text-white placeholder:text-white/30 w-full font-['DM_Sans',sans-serif]"
                            />
                            {localSearch && (
                                <button
                                    onClick={() => setLocalSearch("")}
                                    className="text-white/30 hover:text-white/60"
                                >
                                    <i className="ti ti-x text-[13px]" />
                                </button>
                            )}
                        </div>

                        {/* Status filter */}
                        <div className="flex items-center gap-1 bg-white/[0.05] border border-white/[0.08] rounded-lg p-1">
                            {statusTabs.map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() =>
                                        dispatch(setStatusFilter(key))
                                    }
                                    className={`px-3 py-1 rounded-md text-[11.5px] transition-colors
                                        ${statusFilter === key ? "bg-white/[0.10] text-white" : "text-white/40 hover:text-white/70"}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <span className="text-[11.5px] text-white/30">
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
                                <tr className="bg-white/[0.03]">
                                    {tableColumns.map((col) => (
                                        <th
                                            key={col}
                                            className={`px-3.5 py-2.5 text-${isRTL ? "right" : "left"} text-[10.5px] font-medium text-white/35 border-b border-white/[0.08] uppercase tracking-[0.05em]`}
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
                                            className="px-4 py-12 text-center text-[13px] text-white/30"
                                        >
                                            <i className="ti ti-building-off text-[28px] block mb-2 mx-auto" />
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
                                                className="group hover:bg-white/[0.025] transition-colors"
                                            >
                                                {/* Office */}
                                                <td className="px-3.5 py-2.5 border-b border-white/[0.08]">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-[6px] flex-shrink-0 flex items-center justify-center bg-[#1e2d44] border border-white/[0.08] text-[10px] font-medium text-white/55">
                                                            {office.initials}
                                                        </div>
                                                        <div>
                                                            <p className="text-[12.5px] text-white">
                                                                {office.name}
                                                            </p>
                                                            <p className="text-[10.5px] text-white/35">
                                                                {office.city}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Coverage */}
                                                <td className="px-3.5 py-2.5 border-b border-white/[0.08] text-white/85">
                                                    {office.coverageArea}
                                                </td>
                                                {/* Plan */}
                                                <td className="px-3.5 py-2.5 border-b border-white/[0.08]">
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
                                                <td className="px-3.5 py-2.5 border-b border-white/[0.08] text-white/85">
                                                    {office.orders.toLocaleString()}
                                                </td>
                                                {/* Rating */}
                                                <td className="px-3.5 py-2.5 border-b border-white/[0.08]">
                                                    <StarRating
                                                        rating={office.rating}
                                                    />
                                                </td>
                                                {/* Status */}
                                                <td className="px-3.5 py-2.5 border-b border-white/[0.08]">
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
                                                <td className="px-3.5 py-2.5 border-b border-white/[0.08]">
                                                    <div className="flex items-center gap-2">
                                                        {/* View */}
                                                        <button
                                                            onClick={() =>
                                                                setViewOfficeId(
                                                                    office.id,
                                                                )
                                                            }
                                                            title={t(
                                                                "offices.viewDetails",
                                                            )}
                                                            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/[0.07] transition-colors"
                                                        >
                                                            <i className="ti ti-eye text-[15px]" />
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
                                                                className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-green-400 hover:bg-green-500/10 transition-colors"
                                                            >
                                                                <i className="ti ti-circle-check text-[15px]" />
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
                                                                className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                            >
                                                                <i className="ti ti-ban text-[15px]" />
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
                                                                className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                                                            >
                                                                <i className="ti ti-refresh text-[15px]" />
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

            {/* View modal */}
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
