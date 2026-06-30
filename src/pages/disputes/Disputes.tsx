import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../store";
import {
    fetchDisputes,
    closeDispute,
    setFilter,
    addLocalMessage,
} from "../../store/slices/disputesSlice";
import { disputesService } from "../../services/disputes.service";
import { io } from "socket.io-client";
import type { DisputePartyType, DisputeStatus } from "../../types/dispute";
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
    LockOpen,
    Smile,
    AlertCircle,
    MessageSquare,
    Send,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusBadge: Record<
    DisputeStatus,
    React.ComponentProps<typeof Badge>["variant"]
> = {
    urgent: "red",
    open: "amber", // بيجي من الباك إند كـ open (اللي مش urgent)
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
const DisputeCard: React.FC<{
    dispute: import("../../types/dispute").Dispute;
    isActing: boolean;
    onClose: (id: string) => void;
}> = ({ dispute, isActing, onClose }) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const isResolved = dispute.status === "resolved";
    const isUrgent = dispute.status === "urgent";

    const [expanded, setExpanded] = useState(false);
    const [reply, setReply] = useState("");
    const [submittingReply, setSubmittingReply] = useState(false);

    const PlaintiffIcon = partyIcon[dispute.plaintiff.type];
    const DefendantIcon = partyIcon[dispute.defendant.type];

    const statusLabel =
        dispute.status === "urgent"
            ? t("disputes.urgent")
            : dispute.status === "resolved"
              ? t("disputes.resolved")
              : t("disputes.sent"); // "open" من الباك إند = sent عند الكاستومر

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
                {dispute.amountAtRisk > 0 && (
                    <span className="text-[11px] text-[var(--text-muted)] opacity-60 ml-1">
                        · ${dispute.amountAtRisk.toFixed(2)}{" "}
                        {t("disputes.atRisk")}
                    </span>
                )}

                {/* Actions */}
                <div className="ml-auto flex items-center gap-2">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
                    >
                        <MessageSquare size={12} />
                        {expanded ? t("disputes.hideChat") : t("disputes.liveChat")}
                    </button>
                    
                    {!isResolved && (
                        <>
                            {isActing ? (
                                <Spinner size="sm" />
                            ) : (
                                <button
                                    onClick={() => onClose(dispute.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors"
                                >
                                    <LockOpen size={12} />
                                    {t("disputes.closeTicket")}
                                </button>
                            )}
                        </>
                    )}

                    {isResolved && (
                        <div className="flex items-center gap-1.5 text-[11px] text-green-600 dark:text-green-400/70">
                            <CircleCheck size={13} />
                            {t("disputes.resolved_label")}
                        </div>
                    )}
                </div>
            </div>

            {/* Expanded Live Chat Panel */}
            {expanded && (
                <div className="mt-4 pt-3 border-t border-[var(--border-color)]">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 text-start">
                        {t("disputes.liveChatHistory")}
                    </h4>
                    <div className="p-3 bg-black/10 dark:bg-black/20 rounded-lg border border-[var(--border-color)] max-h-60 overflow-y-auto flex flex-col gap-2.5 text-start">
                        {dispute.messages && dispute.messages.length > 0 ? (
                            dispute.messages.map((msg, i) => {
                                const isUserSender = msg.sender === "user";
                                return (
                                    <div
                                        key={i}
                                        className={`flex flex-col max-w-[85%] ${
                                            isUserSender ? "self-start items-start" : "self-end items-end"
                                        }`}
                                    >
                                        <div className="text-[9px] text-[var(--text-muted)] px-1 mb-0.5 font-medium">
                                            {msg.senderName}
                                        </div>
                                        <div
                                            className={`px-3 py-1.5 rounded-xl text-[11.5px] leading-relaxed ${
                                                isUserSender
                                                    ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-tl-none border border-zinc-700/40"
                                                    : "bg-blue-600 text-white rounded-tr-none"
                                            }`}
                                        >
                                            {msg.text}
                                        </div>
                                        <span className="text-[8px] text-[var(--text-muted)] mt-0.5 px-1">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-[11px] text-[var(--text-muted)] text-center py-4">
                                {t("disputes.noMessages")}
                            </div>
                        )}
                    </div>

                    {!isResolved && (
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                if (!reply.trim()) return;
                                setSubmittingReply(true);
                                try {
                                    const newMsg = await disputesService.sendDisputeMessage(dispute.id, reply.trim());
                                    dispatch(addLocalMessage({ ticketId: dispute.id, message: newMsg }));
                                    setReply("");
                                } catch (err) {
                                    console.error("Failed to send reply:", err);
                                } finally {
                                    setSubmittingReply(false);
                                }
                            }}
                            className="mt-3 flex gap-2"
                        >
                            <input
                                type="text"
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                placeholder={t("disputes.replyPlaceholder")}
                                className="flex-1 bg-black/20 dark:bg-white/5 border border-[var(--border-color)] rounded-lg px-3 py-2 text-[11.5px] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                            />
                            <button
                                type="submit"
                                disabled={submittingReply || !reply.trim()}
                                className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-colors flex items-center justify-center"
                            >
                                <Send size={13} />
                            </button>
                        </form>
                    )}
                </div>
            )}
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

    // جلب أول مرة
    useEffect(() => {
        dispatch(fetchDisputes({ page: 1, limit: 20 }));
    }, [dispatch]);

    // Real-time socket updates for disputes chat
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token || !disputes.length) return;

        const socket = io("http://localhost:3000", {
            auth: { token },
            transports: ["websocket"],
        });

        socket.on("connect", () => {
            console.log("Admin connected to real-time disputes socket");
        });

        // Listen to live message events for each loaded dispute ticket
        disputes.forEach((d) => {
            socket.on(`ticket:${d.id}:message`, (message: any) => {
                dispatch(addLocalMessage({ ticketId: d.id, message }));
            });
        });

        return () => {
            socket.disconnect();
        };
    }, [disputes, dispatch]);

    // فلترة على الفرونت بدون reload
    const handleFilter = (key: "all" | "urgent" | "resolved") => {
        dispatch(setFilter(key));
    };

    const filtered = useMemo(
        () =>
            filter === "all"
                ? disputes
                : disputes.filter((d) => d.status === filter),
        [disputes, filter],
    );

    const filterTabs = [
        { key: "all" as const, label: t("disputes.all") },
        { key: "urgent" as const, label: t("disputes.urgent") },
        { key: "resolved" as const, label: t("disputes.resolved") },
    ];

    if (loading && !disputes.length) return <DisputesSkeleton />;

    if (error && !disputes.length) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
                <AlertCircle size={32} className="text-red-400" />
                <p className="text-[var(--text-secondary)] text-sm">{error}</p>
                <button
                    onClick={() =>
                        dispatch(fetchDisputes({ page: 1, limit: 20 }))
                    }
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
                        onClick={() => handleFilter(key)}
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
                        {key === "urgent" && stats && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-500 dark:text-red-400">
                                {stats.urgent}
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
                            onClose={(id) => dispatch(closeDispute(id))}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Disputes;
