import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchDashboardData } from "../../store/slices/dashboardSlice";
import { StatCard } from "../../components/shared/StatCard";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { Package, Users, Bike, Coins, AlertCircle } from "lucide-react";

import type {
    RecentOrder,
    RevenueSource,
    EscrowStatus,
    RecentUser,
} from "../../types/dashboard";

const revenueSourceLabelMap: Record<string, string> = {
    Commission: "revenue.commission",
    Subscriptions: "revenue.subscriptions",
    Featured: "offices.featured",
};

const escrowLabelMap: Record<string, string> = {
    Released: "escrow.released",
    Frozen: "escrow.held",
    "In review": "escrow.disputed",
    Held: "escrow.held",
    Refunded: "escrow.refunded",
    Disputed: "escrow.disputed",
};

const orderStatusMap: Record<
    RecentOrder["status"],
    { labelKey: string; variant: React.ComponentProps<typeof Badge>["variant"] }
> = {
    in_transit: { labelKey: "shipments.inTransit", variant: "blue" },
    delivered: { labelKey: "shipments.delivered", variant: "green" },
    pending_offer: { labelKey: "shipments.pending", variant: "amber" },
    dispute: { labelKey: "disputes.title", variant: "red" },
};

const userStatusMap: Record<
    RecentUser["status"],
    React.ComponentProps<typeof Badge>["variant"]
> = {
    active: "green",
    suspended: "red",
};

const userRoleMap: Record<
    RecentUser["role"],
    React.ComponentProps<typeof Badge>["variant"]
> = {
    customer: "blue",
    driver: "amber",
};

const BarRow: React.FC<{
    label: string;
    fill: number;
    valueText: string;
    color: string;
}> = ({ label, fill, valueText, color }) => (
    <div className="flex items-center gap-2">
        <span className="text-[11.5px] text-[var(--text-muted)] w-[90px] flex-shrink-0">
            {label}
        </span>
        <div className="flex-1 h-[6px] bg-black/[0.06] dark:bg-white/[0.06] rounded-full overflow-hidden">
            <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${fill}%`, background: color }}
            />
        </div>
        <span className="text-[11px] text-[var(--text-muted)] w-[42px] text-right">
            {valueText}
        </span>
    </div>
);

const OrderRow: React.FC<{ order: RecentOrder }> = ({ order }) => {
    const { t } = useTranslation();
    const { labelKey, variant } = orderStatusMap[order.status];
    return (
        <div className="flex items-center justify-between py-[7.5px] border-b border-[var(--border-color)] last:border-none">
            <div>
                <p className="text-[12.5px] font-medium text-[var(--text-primary)]">
                    {order.id}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] mt-[1px]">
                    {order.customer} · {order.timeAgo}
                </p>
            </div>
            <Badge variant={variant}>{t(labelKey)}</Badge>
        </div>
    );
};

const UserRow: React.FC<{ user: RecentUser }> = ({ user }) => {
    const { t } = useTranslation();
    return (
        <tr className="group hover:bg-black/[0.02] dark:hover:bg-white/[0.025] transition-colors">
            <td className="px-3.5 py-2.5 border-b border-[var(--border-color)] group-last:border-none">
                <div className="flex items-center gap-2.5">
                    <Avatar initials={user.initials} />
                    <div>
                        <p className="text-[12.5px] text-[var(--text-primary)]">
                            {user.name}
                        </p>
                        <p className="text-[10.5px] text-[var(--text-muted)]">
                            {user.email}
                        </p>
                    </div>
                </div>
            </td>
            <td className="px-3.5 py-2.5 border-b border-[var(--border-color)] group-last:border-none">
                <Badge variant={userRoleMap[user.role]}>
                    {user.role === "customer"
                        ? t("users.customer")
                        : t("users.driver")}
                </Badge>
            </td>
            <td className="hidden sm:table-cell px-3.5 py-2.5 border-b border-[var(--border-color)] group-last:border-none text-[12.5px] text-[var(--text-secondary)]">
                {user.orders}
            </td>
            <td className="hidden md:table-cell px-3.5 py-2.5 border-b border-[var(--border-color)] group-last:border-none text-[12.5px] text-[var(--text-secondary)]">
                {user.joined}
            </td>
            <td className="px-3.5 py-2.5 border-b border-[var(--border-color)] group-last:border-none">
                <Badge variant={userStatusMap[user.status]}>
                    {user.status === "active"
                        ? t("users.active")
                        : t("users.suspended")}
                </Badge>
            </td>
        </tr>
    );
};

const SkeletonBlock: React.FC<{ className?: string }> = ({
    className = "",
}) => (
    <div
        className={`bg-black/[0.06] dark:bg-white/[0.06] rounded-lg animate-pulse ${className}`}
    />
);

const DashboardSkeleton: React.FC = () => (
    <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {[...Array(4)].map((_, i) => (
                <SkeletonBlock key={i} className="h-[100px]" />
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
            <SkeletonBlock className="h-[240px]" />
            <SkeletonBlock className="h-[240px]" />
        </div>
        <SkeletonBlock className="h-[220px]" />
    </div>
);

const Dashboard: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === "ar";
    const dispatch = useAppDispatch();
    const {
        stats,
        recentOrders,
        revenueSources,
        escrowStatuses,
        recentUsers,
        loading,
        error,
    } = useAppSelector((s) => s.dashboard);

    useEffect(() => {
        dispatch(fetchDashboardData());
    }, [dispatch]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
                <AlertCircle size={32} className="text-red-400" />
                <p className="text-[var(--text-secondary)] text-sm">{error}</p>
                <button
                    onClick={() => dispatch(fetchDashboardData())}
                    className="mt-1 px-4 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-500 text-white transition-colors duration-150"
                >
                    {t("common.loading")}
                </button>
            </div>
        );
    }

    if (loading || !stats) return <DashboardSkeleton />;

    const statCards = [
        {
            label: t("shipments.totalShipments"),
            value: stats.totalOrders.toLocaleString(),
            subText: `↑ ${stats.totalOrdersTrend}% ${t("users.thisWeek")}`,
            trend: "up" as const,
            icon: Package,
        },
        {
            label: t("users.totalUsers"),
            value: stats.registeredUsers.toLocaleString(),
            subText: `↑ ${stats.registeredUsersTrend}% ${t("users.thisWeek")}`,
            trend: "up" as const,
            icon: Users,
        },
        {
            label: t("drivers.onlineNow"),
            value: stats.activeDrivers.toLocaleString(),
            subText: `${stats.driversOnline} ${t("drivers.onlineNow").toLowerCase()}`,
            trend: "neutral" as const,
            icon: Bike,
        },
        {
            label: t("revenue.totalRevenue"),
            value: `$${stats.monthlyRevenue.toLocaleString()}`,
            subText: `↑ ${stats.revenueTrend}%`,
            trend: "up" as const,
            icon: Coins,
        },
    ];

    const tableColumns = [
        t("users.user"),
        t("users.role"),
        t("users.orders"),
        t("users.joined"),
        t("users.status"),
    ];

    return (
        <div className="space-y-3" dir={isRTL ? "rtl" : "ltr"}>
            {/* ── Stat cards ───────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {statCards.map((card) => (
                    <StatCard key={card.label} {...card} />
                ))}
            </div>

            {/* ── Two-column row ────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
                {/* Recent orders */}
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[10px] p-[1.1rem_1.15rem]">
                    <div className="flex items-center justify-between mb-4">
                        <span className="font-['Syne',sans-serif] text-[13px] font-semibold text-[var(--text-primary)]">
                            {t("shipments.title")}
                        </span>
                        <button className="text-[11px] text-blue-500 hover:text-blue-400 transition-colors">
                            {isRTL ? "← عرض الكل" : "See all →"}
                        </button>
                    </div>
                    {recentOrders.map((o) => (
                        <OrderRow key={o.id} order={o} />
                    ))}
                </div>

                {/* Revenue by source + Escrow status */}
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[10px] p-[1.1rem_1.15rem] flex flex-col gap-5">
                    <div>
                        <p className="font-['Syne',sans-serif] text-[13px] font-semibold text-[var(--text-primary)] mb-3">
                            {t("revenue.revenueBreakdown")}
                        </p>
                        <div className="flex flex-col gap-2.5">
                            {revenueSources.map((src: RevenueSource) => (
                                <BarRow
                                    key={src.label}
                                    label={
                                        revenueSourceLabelMap[src.label]
                                            ? t(
                                                  revenueSourceLabelMap[
                                                      src.label
                                                  ],
                                              )
                                            : src.label
                                    }
                                    fill={src.percentage}
                                    valueText={`${src.percentage}%`}
                                    color={src.color}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-[var(--border-color)]" />

                    <div>
                        <p className="font-['Syne',sans-serif] text-[13px] font-semibold text-[var(--text-primary)] mb-3">
                            {t("escrow.title")}
                        </p>
                        <div className="flex flex-col gap-2.5">
                            {escrowStatuses.map((esc: EscrowStatus) => (
                                <BarRow
                                    key={esc.label}
                                    label={
                                        escrowLabelMap[esc.label]
                                            ? t(escrowLabelMap[esc.label])
                                            : esc.label
                                    }
                                    fill={esc.percentage}
                                    valueText={`$${esc.amount.toLocaleString()}`}
                                    color={esc.color}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Recent users table ────────────────────────────────────────── */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[10px] overflow-hidden">
                <div className="flex items-center justify-between px-[1.1rem] py-[0.85rem] border-b border-[var(--border-color)]">
                    <span className="font-['Syne',sans-serif] text-[13px] font-semibold text-[var(--text-primary)]">
                        {t("users.title")}
                    </span>
                    <button className="text-[11px] text-blue-500 hover:text-blue-400 transition-colors">
                        {isRTL
                            ? `← ${t("users.viewDetails")}`
                            : `${t("users.viewDetails")} →`}
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-[12.5px] min-w-[480px]">
                        <thead>
                            <tr className="bg-black/[0.02] dark:bg-white/[0.03]">
                                {tableColumns.map((col, i) => (
                                    <th
                                        key={col}
                                        className={`
                                            px-3.5 py-2.5 text-${isRTL ? "right" : "left"} text-[10.5px] font-medium
                                            text-[var(--text-muted)] border-b border-[var(--border-color)]
                                            uppercase tracking-[0.05em]
                                            ${i === 2 ? "hidden sm:table-cell" : ""}
                                            ${i === 3 ? "hidden md:table-cell" : ""}
                                        `}
                                    >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {recentUsers.map((u) => (
                                <UserRow key={u.email} user={u} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
