import React, { useEffect, useMemo } from "react";
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusBadge: Record<
    DisputeStatus,
    React.ComponentProps<typeof Badge>["variant"]
> = {
    urgent: "red",
    open: "amber",
    resolved: "green",
};

const partyIcon: Record<DisputePartyType, string> = {
    customer: "ti ti-user",
    driver: "ti ti-bike",
    office: "ti ti-building-store",
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
    const isResolved = dispute.status === "resolved";
    const isUrgent = dispute.status === "urgent";

    return (
        <div
            className={`
      bg-[#131d2e] border rounded-[10px] p-[1.1rem_1.15rem]
      transition-colors duration-150
      ${isUrgent ? "border-red-500/30" : ""}
      ${isResolved ? "border-white/[0.05] opacity-60" : "border-white/[0.08]"}
    `}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-2.5">
                <span className="text-[13px] font-medium text-white">
                    {dispute.orderId} — {dispute.title}
                </span>
                <Badge variant={statusBadge[dispute.status]}>
                    {dispute.status.charAt(0).toUpperCase() +
                        dispute.status.slice(1)}
                </Badge>
            </div>

            {/* Body */}
            <p className="text-[12px] text-white/55 leading-relaxed mb-3">
                {dispute.description}
            </p>

            {/* Footer */}
            <div className="flex items-center gap-2 pt-2.5 border-t border-white/[0.08] flex-wrap">
                {/* Plaintiff */}
                <span className="text-[11px] text-white/35 flex items-center gap-1">
                    <i
                        className={`${partyIcon[dispute.plaintiff.type]} text-[13px]`}
                    />
                    {dispute.plaintiff.name} ({dispute.plaintiff.type})
                </span>

                <span className="text-[11px] text-white/20">vs</span>

                {/* Defendant */}
                <span className="text-[11px] text-white/35 flex items-center gap-1">
                    <i
                        className={`${partyIcon[dispute.defendant.type]} text-[13px]`}
                    />
                    {dispute.defendant.name} ({dispute.defendant.type})
                </span>

                {/* Amount */}
                <span className="text-[11px] text-white/25 ml-1">
                    · ${dispute.amountAtRisk.toFixed(2)} at risk
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
                                    className="
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium
                    bg-red-500/10 border border-red-500/20 text-red-400
                    hover:bg-red-500/20 transition-colors
                  "
                                >
                                    <i className="ti ti-arrow-back-up text-[12px]" />
                                    Refund customer
                                </button>
                                <button
                                    onClick={() => onRelease(dispute.id)}
                                    className="
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium
                    bg-green-500/10 border border-green-500/20 text-green-400
                    hover:bg-green-500/20 transition-colors
                  "
                                >
                                    <i className="ti ti-lock-open text-[12px]" />
                                    {dispute.releaseLabel}
                                </button>
                            </>
                        )}
                    </div>
                )}

                {isResolved && (
                    <div className="ml-auto flex items-center gap-1.5 text-[11px] text-green-400/70">
                        <i className="ti ti-circle-check text-[13px]" />
                        Resolved
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Sk: React.FC<{ className?: string }> = ({ className = "" }) => (
    <div className={`bg-white/[0.06] rounded-lg animate-pulse ${className}`} />
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

    if (loading && !disputes.length) return <DisputesSkeleton />;

    if (error && !disputes.length) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
                <i className="ti ti-alert-circle text-[32px] text-red-400" />
                <p className="text-white/70 text-sm">{error}</p>
                <button
                    onClick={() => dispatch(fetchDisputes())}
                    className="mt-1 px-4 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* ── Title ─────────────────────────────────────────────────────── */}
            <h1 className="font-['Syne',sans-serif] text-[18px] font-bold text-white">
                Disputes
            </h1>

            {/* ── Stat cards ────────────────────────────────────────────────── */}
            {stats && (
                <div className="grid grid-cols-3 gap-2.5">
                    <StatCard
                        label="Open disputes"
                        value={stats.open.toString()}
                        subText={`${stats.urgent} urgent`}
                        trend="down"
                        icon="ti ti-alert-triangle"
                    />
                    <StatCard
                        label="Resolved (month)"
                        value={stats.resolvedThisMonth.toString()}
                        subText={`Avg. ${stats.avgResolveHours}hrs to resolve`}
                        trend="up"
                        icon="ti ti-circle-check"
                    />
                    <StatCard
                        label="Amount at risk"
                        value={`$${stats.amountAtRisk.toLocaleString()}`}
                        subText="Under review"
                        trend="neutral"
                        icon="ti ti-coin"
                    />
                </div>
            )}

            {/* ── Filter tabs ────────────────────────────────────────────────── */}
            <div className="flex items-center gap-1 bg-white/[0.05] border border-white/[0.08] rounded-lg p-1 w-fit">
                {(["all", "urgent", "open", "resolved"] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => dispatch(setFilter(f))}
                        className={`
              px-3 py-1.5 rounded-md text-[11.5px] capitalize transition-colors
              ${filter === f ? "bg-white/[0.10] text-white" : "text-white/40 hover:text-white/70"}
            `}
                    >
                        {f === "all" ? "All" : f}
                        {f !== "all" && f !== "resolved" && stats && (
                            <span
                                className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] ${f === "urgent" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}`}
                            >
                                {f === "urgent"
                                    ? stats.urgent
                                    : stats.open - stats.urgent}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Dispute cards ─────────────────────────────────────────────── */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-center bg-[#131d2e] border border-white/[0.08] rounded-[10px]">
                    <i className="ti ti-mood-happy text-[28px] text-white/20" />
                    <p className="text-[13px] text-white/30">
                        No disputes in this category
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
