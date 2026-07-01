import React, { useEffect, useMemo, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../store";
import {
    fetchDisputes,
    closeDispute,
    setFilter,
    sendDisputeMessage,
} from "../../store/slices/disputesSlice";
import type { DisputePartyType, DisputeStatus, Dispute } from "../../types/dispute";
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
    X,
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
    dispute: Dispute;
    isActing: boolean;
    onClose: (id: string) => void;
    onOpenChat: (dispute: Dispute) => void;
    activeChatDisputeId: string | null;
}> = ({ dispute, isActing, onClose, onOpenChat, activeChatDisputeId }) => {
    const { t } = useTranslation();
    const isResolved = dispute.status === "resolved";
    const isUrgent = dispute.status === "urgent";

    const PlaintiffIcon = partyIcon[dispute.plaintiff.type];
    const DefendantIcon = partyIcon[dispute.defendant.type];

    const statusLabel =
        dispute.status === "urgent"
            ? t("disputes.urgent")
            : dispute.status === "resolved"
              ? t("disputes.resolved")
              : t("disputes.sent"); // "open" من الباك إند = sent عند الكاستومر

    const hasNewMessage = useMemo(() => {
        if (activeChatDisputeId === dispute.id) return false;
        if (!dispute.messages || dispute.messages.length === 0) return false;
        const lastMsg = dispute.messages[dispute.messages.length - 1];
        return lastMsg.sender === "user";
    }, [dispute.messages, activeChatDisputeId, dispute.id]);

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
                        onClick={() => onOpenChat(dispute)}
                        className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
                    >
                        <MessageSquare size={12} />
                        {t("disputes.chat")}
                        
                        {hasNewMessage && (
                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                        )}
                    </button>
                    {!isResolved && (
                        isActing ? (
                            <Spinner size="sm" />
                        ) : (
                            <button
                                onClick={() => onClose(dispute.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors"
                            >
                                <LockOpen size={12} />
                                {t("disputes.closeTicket")}
                            </button>
                        )
                    )}
                    {isResolved && (
                        <div className="flex items-center gap-1.5 text-[11px] text-green-600 dark:text-green-400/70 ml-1">
                            <CircleCheck size={13} />
                            {t("disputes.resolved_label")}
                        </div>
                    )}
                </div>
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

    const [activeChatDispute, setActiveChatDispute] = useState<Dispute | null>(null);
    const [chatInput, setChatInput] = useState("");
    const [sendingMessage, setSendingMessage] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const activeDisputeMessages = useMemo(() => {
        if (!activeChatDispute) return [];
        const currentDispute = disputes.find((d) => d.id === activeChatDispute.id);
        return currentDispute?.messages || [];
    }, [disputes, activeChatDispute]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (activeChatDispute) {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [activeDisputeMessages, activeChatDispute]);

    // Poll disputes every 7 seconds to get real-time updates and new message notifications
    useEffect(() => {
        const interval = setInterval(() => {
            dispatch(fetchDisputes({ page: 1, limit: 20 }));
        }, 7000);
        return () => clearInterval(interval);
    }, [dispatch]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || !activeChatDispute || sendingMessage) return;

        setSendingMessage(true);
        try {
            await dispatch(
                sendDisputeMessage({
                    id: activeChatDispute.id,
                    text: chatInput.trim(),
                })
            ).unwrap();
            setChatInput("");
        } catch (err) {
            console.error("Failed to send message:", err);
        } finally {
            setSendingMessage(false);
        }
    };

    // جلب أول مرة
    useEffect(() => {
        dispatch(fetchDisputes({ page: 1, limit: 20 }));
    }, [dispatch]);

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
                            onOpenChat={(dispute) => setActiveChatDispute(dispute)}
                            activeChatDisputeId={activeChatDispute?.id || null}
                        />
                    ))}
                </div>
            )}

            {/* Sliding Chat Drawer */}
            {activeChatDispute && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-all duration-300">
                    <div className="bg-[var(--bg-secondary)] border-l border-[var(--border-color)] max-w-md w-full h-full flex flex-col text-[var(--text-primary)] shadow-2xl relative" dir={isRTL ? "rtl" : "ltr"}>
                        
                        {/* Header */}
                        <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-secondary)]">
                            <div className="flex flex-col text-start">
                                <span className="text-sm font-bold">{t("disputes.supportChat")}</span>
                                <span className="text-[10px] text-[var(--text-muted)]">
                                    {activeChatDispute.orderId} • {activeChatDispute.title}
                                </span>
                            </div>
                            <button
                                onClick={() => setActiveChatDispute(null)}
                                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Message list */}
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[var(--bg-primary)]">
                            {activeDisputeMessages.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center text-[var(--text-muted)] text-xs">
                                    {t("disputes.noMessages")}
                                </div>
                            ) : (
                                activeDisputeMessages.map((msg: any, i: number) => {
                                    const isAdmin = msg.sender === "admin";
                                    return (
                                        <div
                                            key={msg.id || i}
                                            className={`flex flex-col max-w-[80%] ${
                                                isAdmin ? "self-end items-end" : "self-start items-start"
                                            }`}
                                        >
                                            <span className="text-[9px] text-[var(--text-muted)] mb-1 px-1">
                                                {isAdmin ? t("disputes.admin") : t("disputes.client")} ({msg.senderName})
                                            </span>
                                            <div
                                                className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                                                    isAdmin
                                                        ? "bg-blue-600 text-white rounded-br-none"
                                                        : "bg-black/[0.05] dark:bg-white/[0.05] border border-[var(--border-color)] rounded-bl-none"
                                                }`}
                                            >
                                                {msg.text}
                                            </div>
                                            <span className="text-[8px] text-[var(--text-muted)] mt-1 px-1">
                                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Footer */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex gap-2">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder={t("disputes.placeholder")}
                                className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={!chatInput.trim() || sendingMessage}
                                className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors focus:outline-none flex items-center justify-center disabled:opacity-50"
                            >
                                <Send size={14} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Disputes;
