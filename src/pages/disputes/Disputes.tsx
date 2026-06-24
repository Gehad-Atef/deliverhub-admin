import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../store";
import {
    fetchDisputes,
    refundCustomer,
    releaseToParty,
    setFilter,
} from "../../store/slices/disputesSlice";
import type {
    Dispute,
    DisputePartyType,
    DisputeStatus,
} from "../../types/dispute";
import { StatCard } from "../../components/shared/StatCard";
import { Badge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import {
    User,
    Bike,
    Store,
    AlertTriangle,
    CircleCheck,
    Coins,
    ArrowLeftRight,
    LockOpen,
    Smile,
    AlertCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusBadge: Record<
    DisputeStatus,
    React.ComponentProps<typeof Badge>["variant"]
> = {
    urgent: "red",
    open: "amber",
    resolved: "green",
};

const partyIcon: Record<DisputePartyType, LucideIcon> = {
    customer: User,
    driver: Bike,
    office: Store,
};

const partyTypeKey: Record<DisputePartyType, string> = {
    customer: "users.customer",
    driver: "users.driver",
    office: "offices.office",
};

// ─── Dispute Card ─────────────────────────────────────────────────────────────
interface DisputeCardProps {
    dispute: Dispute;
    isActing: boolean;
    onRefund: (id: string) => void;
    onRelease: (id: string) => void;
}

const DisputeCard: React.FC<DisputeCardProps> = ({
    dispute,
    isActing,
    onRefund,
    onRelease,
}) => {
    const { t } = useTranslation();
    const isResolved = dispute.status === "resolved";
    const isUrgent = dispute.status === "urgent";

    const PlaintiffIcon = partyIcon[dispute.plaintiff.type];
    const DefendantIcon = partyIcon[dispute.defendant.type];

    const statusLabel =
        dispute.status === "urgent"
            ? t("disputes.urgent")
            : dispute.status === "open"
              ? t("disputes.open")
              : t("disputes.resolved");

    return (
        <div
            className={`
                bg-[var(--bg-secondary)] border rounded-[10px] p-[1.1rem_1.15rem]
                transition-colors duration-150
                ${isUrgent ? "border-red-500/30" : ""}
                ${isResolved ? "border-[var(--border-color)] opacity-60" : !isUrgent ? "border-[var(--border-color)]" : ""}
            `}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-2.5">
                <span className="text-[13px] font-medium text-[var(--text-primary)]">
                    {dispute.orderId} — {dispute.title}
                </span>
                <Badge variant={statusBadge[dispute.status]}>
                    {statusLabel}
                </Badge>
            </div>

            {/* Body */}
            <p className="text-[12px] text-[var(--text-muted)] leading-relaxed mb-3">
                {dispute.description}
            </p>

            {/* Footer */}
            <div className="flex items-center gap-2 pt-2.5 border-t border-[var(--border-color)] flex-wrap">
                {/* Plaintiff */}
                <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                    <PlaintiffIcon size={13} />
                    {dispute.plaintiff.name} (
                    {t(partyTypeKey[dispute.plaintiff.type])})
                </span>

                <span className="text-[11px] text-[var(--text-muted)] opacity-50">
                    {t("disputes.vs")}
                </span>

                {/* Defendant */}
                <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                    <DefendantIcon size={13} />
                    {dispute.defendant.name} (
                    {t(partyTypeKey[dispute.defendant.type])})
                </span>

                {/* Amount */}
                <span className="text-[11px] text-[var(--text-muted)] opacity-60 ml-1">
                    · ${dispute.amountAtRisk.toFixed(2)} {t("disputes.atRisk")}
                </span>

                {/* Actions */}
                {!isResolved && (
                    <div className="ml-auto flex items-center gap-2">
                        {isActing ? (
                            <Spinner size="sm" />
                        ) : (
                            <>
                                <button
                                    onClick={() => onRefund(dispute.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 hover:bg-red-500/20 transition-colors"
                                >
                                    <ArrowLeftRight size={12} />
                                    {t("disputes.refundCustomer")}
                                </button>
                                <button
                                    onClick={() => onRelease(dispute.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors"
                                >
                                    <LockOpen size={12} />
                                    {dispute.releaseLabel}
                                </button>
                            </>
                        )}
                    </div>
                )}

                {isResolved && (
                    <div className="ml-auto flex items-center gap-1.5 text-[11px] text-green-600 dark:text-green-400/70">
                        <CircleCheck size={13} />
                        {t("disputes.resolved_label")}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Sk: React.FC<{ className?: string }> = ({ className = "" }) => (
    <div
        className={`bg-black/[0.06] dark:bg-white/[0.06] rounded-lg animate-pulse ${className}`}
    />
);

const DisputesSkeleton = () => (
    <div className="space-y-3">
        <Sk className="h-7 w-36" />
        <div className="grid grid-cols-3 gap-2.5">
            {[...Array(3)].map((_, i) => (
                <Sk key={i} className="h-[100px]" />
            ))}
        </div>
        {[...Array(3)].map((_, i) => (
            <Sk key={i} className="h-[140px]" />
        ))}
    </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const Disputes: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === "ar";

    const dispatch = useAppDispatch();
    const {
        disputes = [],
        stats = null,
        loading = false,
        actionLoading = null,
        error = null,
        filter = "all",
    } = useAppSelector((s) => s.disputes) ?? {};

    useEffect(() => {
        dispatch(fetchDisputes());
    }, [dispatch]);

    const filtered = useMemo(
        () => disputes.filter((d) => filter === "all" || d.status === filter),
        [disputes, filter],
    );

    const filterTabs = [
        { key: "all" as const, label: t("disputes.all") },
        { key: "urgent" as const, label: t("disputes.urgent") },
        { key: "open" as const, label: t("disputes.open") },
        { key: "resolved" as const, label: t("disputes.resolved") },
    ];

    if (loading && !disputes.length) return <DisputesSkeleton />;

    if (error && !disputes.length) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
                <AlertCircle size={32} className="text-red-400" />
                <p className="text-[var(--text-secondary)] text-sm">{error}</p>
                <button
                    onClick={() => dispatch(fetchDisputes())}
                    className="mt-1 px-4 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                >
                    {t("disputes.retry")}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-3" dir={isRTL ? "rtl" : "ltr"}>
            {/* ── Title ─────────────────────────────────────────────────────── */}
            <h1 className="font-['Syne',sans-serif] text-[18px] font-bold text-[var(--text-primary)]">
                {t("disputes.title")}
            </h1>

            {/* ── Stat cards ────────────────────────────────────────────────── */}
            {stats && (
                <div className="grid grid-cols-3 gap-2.5">
                    <StatCard
                        label={t("disputes.openDisputes")}
                        value={stats.open.toString()}
                        subText={`${stats.urgent} ${t("disputes.urgent")}`}
                        trend="down"
                        icon={AlertTriangle}
                    />
                    <StatCard
                        label={t("disputes.resolvedMonth")}
                        value={stats.resolvedThisMonth.toString()}
                        subText={`${t("disputes.avgResolveHoursLabel")} ${stats.avgResolveHours} ${t("disputes.avgResolveHours")}`}
                        trend="up"
                        icon={CircleCheck}
                    />
                    <StatCard
                        label={t("disputes.amountAtRisk")}
                        value={`$${stats.amountAtRisk.toLocaleString()}`}
                        subText={t("disputes.underReview")}
                        trend="neutral"
                        icon={Coins}
                    />
                </div>
            )}

            {/* ── Filter tabs ────────────────────────────────────────────────── */}
            <div className="flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.05] border border-[var(--border-color)] rounded-lg p-1 w-fit">
                {filterTabs.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => dispatch(setFilter(key))}
                        className={`
                            px-3 py-1.5 rounded-md text-[11.5px] transition-colors
                            ${
                                filter === key
                                    ? "bg-black/[0.08] dark:bg-white/[0.10] text-[var(--text-primary)]"
                                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                            }
                        `}
                    >
                        {label}
                        {key !== "all" && key !== "resolved" && stats && (
                            <span
                                className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] ${key === "urgent" ? "bg-red-500/20 text-red-500 dark:text-red-400" : "bg-amber-500/20 text-amber-600 dark:text-amber-400"}`}
                            >
                                {key === "urgent"
                                    ? stats.urgent
                                    : stats.open - stats.urgent}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Dispute cards ─────────────────────────────────────────────── */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-center bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[10px]">
                    <Smile
                        size={28}
                        className="text-[var(--text-muted)] opacity-40"
                    />
                    <p className="text-[13px] text-[var(--text-muted)]">
                        {t("disputes.noDisputes")}
                    </p>
                </div>
            ) : (
                <div className="space-y-2.5">
                    {filtered.map((d) => (
                        <DisputeCard
                            key={d.id}
                            dispute={d}
                            isActing={actionLoading === d.id}
                            onRefund={(id) => dispatch(refundCustomer(id))}
                            onRelease={(id) => dispatch(releaseToParty(id))}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Disputes;
