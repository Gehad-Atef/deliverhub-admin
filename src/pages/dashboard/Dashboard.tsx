import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchDashboardData } from "../../store/slices/dashboardSlice";
import { StatCard } from "../../components/shared/StatCard";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";

import type {
    RecentOrder,
    RevenueSource,
    EscrowStatus,
    RecentUser,
} from "../../types/dashboard";

const orderStatusMap: Record<
    RecentOrder["status"],
    { label: string; variant: React.ComponentProps<typeof Badge>["variant"] }
> = {
    in_transit: { label: "In transit", variant: "blue" },
    delivered: { label: "Delivered", variant: "green" },
    pending_offer: { label: "Pending offer", variant: "amber" },
    dispute: { label: "Dispute", variant: "red" },
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
        <span className="text-[11.5px] text-white/55 w-[90px] flex-shrink-0">
            {label}
        </span>
        <div className="flex-1 h-[6px] bg-white/[0.06] rounded-full overflow-hidden">
            <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${fill}%`, background: color }}
            />
        </div>
        <span className="text-[11px] text-white/55 w-[42px] text-right">
            {valueText}
        </span>
    </div>
);

const OrderRow: React.FC<{ order: RecentOrder }> = ({ order }) => {
    const { label, variant } = orderStatusMap[order.status];
    return (
        <div className="flex items-center justify-between py-[7.5px] border-b border-white/[0.08] last:border-none">
            <div>
                <p className="text-[12.5px] font-medium text-white">
                    {order.id}
                </p>
                <p className="text-[11px] text-white/35 mt-[1px]">
                    {order.customer} · {order.timeAgo}
                </p>
            </div>
            <Badge variant={variant}>{label}</Badge>
        </div>
    );
};

const UserRow: React.FC<{ user: RecentUser }> = ({ user }) => (
    <tr className="group">
        <td className="px-3.5 py-2.5 border-b border-white/[0.08] group-last:border-none">
            <div className="flex items-center gap-2.5">
                <Avatar initials={user.initials} />
                <div>
                    <p className="text-[12.5px] text-white">{user.name}</p>
                    <p className="text-[10.5px] text-white/35">{user.email}</p>
                </div>
            </div>
        </td>
        <td className="px-3.5 py-2.5 border-b border-white/[0.08] group-last:border-none">
            <Badge variant={userRoleMap[user.role]}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Badge>
        </td>
        {/* Orders & Joined hidden on small screens */}
        <td className="hidden sm:table-cell px-3.5 py-2.5 border-b border-white/[0.08] group-last:border-none text-[12.5px] text-white/85">
            {user.orders}
        </td>
        <td className="hidden md:table-cell px-3.5 py-2.5 border-b border-white/[0.08] group-last:border-none text-[12.5px] text-white/85">
            {user.joined}
        </td>
        <td className="px-3.5 py-2.5 border-b border-white/[0.08] group-last:border-none">
            <Badge variant={userStatusMap[user.status]}>
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </Badge>
        </td>
    </tr>
);

const SkeletonBlock: React.FC<{ className?: string }> = ({
    className = "",
}) => (
    <div className={`bg-white/[0.06] rounded-lg animate-pulse ${className}`} />
);

const DashboardSkeleton: React.FC = () => (
    <div className="space-y-4">
        {/* 4 cols on lg, 2 on sm, 1 on xs */}
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
                <i className="ti ti-alert-circle text-[32px] text-red-400" />
                <p className="text-white/70 text-sm">{error}</p>
                <button
                    onClick={() => dispatch(fetchDashboardData())}
                    className="mt-1 px-4 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-500 text-white transition-colors duration-150"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (loading || !stats) return <DashboardSkeleton />;

    const statCards = [
        {
            label: "Total orders",
            value: stats.totalOrders.toLocaleString(),
            subText: `↑ ${stats.totalOrdersTrend}% this week`,
            trend: "up" as const,
            icon: "ti ti-package",
        },
        {
            label: "Registered users",
            value: stats.registeredUsers.toLocaleString(),
            subText: `↑ ${stats.registeredUsersTrend}% this week`,
            trend: "up" as const,
            icon: "ti ti-users",
        },
        {
            label: "Active drivers",
            value: stats.activeDrivers.toLocaleString(),
            subText: `${stats.driversOnline} online now`,
            trend: "neutral" as const,
            icon: "ti ti-bike",
        },
        {
            label: "Revenue (month)",
            value: `$${stats.monthlyRevenue.toLocaleString()}`,
            subText: `↑ ${stats.revenueTrend}% vs last month`,
            trend: "up" as const,
            icon: "ti ti-coin",
        },
    ];

    return (
        <div className="space-y-3">
            {/* ── Stat cards: 1 col → 2 col → 4 col ───────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {statCards.map((card) => (
                    <StatCard key={card.label} {...card} />
                ))}
            </div>

            {/* ── Two-column row: stacked on mobile, side-by-side on lg+ ───── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
                {/* Recent orders */}
                <div className="bg-[#131d2e] border border-white/[0.08] rounded-[10px] p-[1.1rem_1.15rem]">
                    <div className="flex items-center justify-between mb-4">
                        <span className="font-['Syne',sans-serif] text-[13px] font-semibold text-white">
                            Recent orders
                        </span>
                        <button className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors">
                            See all →
                        </button>
                    </div>
                    {recentOrders.map((o) => (
                        <OrderRow key={o.id} order={o} />
                    ))}
                </div>

                {/* Revenue by source + Escrow status */}
                <div className="bg-[#131d2e] border border-white/[0.08] rounded-[10px] p-[1.1rem_1.15rem] flex flex-col gap-5">
                    <div>
                        <p className="font-['Syne',sans-serif] text-[13px] font-semibold text-white mb-3">
                            Revenue by source
                        </p>
                        <div className="flex flex-col gap-2.5">
                            {revenueSources.map((src: RevenueSource) => (
                                <BarRow
                                    key={src.label}
                                    label={src.label}
                                    fill={src.percentage}
                                    valueText={`${src.percentage}%`}
                                    color={src.color}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-white/[0.08]" />

                    <div>
                        <p className="font-['Syne',sans-serif] text-[13px] font-semibold text-white mb-3">
                            Escrow status
                        </p>
                        <div className="flex flex-col gap-2.5">
                            {escrowStatuses.map((esc: EscrowStatus) => (
                                <BarRow
                                    key={esc.label}
                                    label={esc.label}
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
            <div className="bg-[#131d2e] border border-white/[0.08] rounded-[10px] overflow-hidden">
                <div className="flex items-center justify-between px-[1.1rem] py-[0.85rem] border-b border-white/[0.08]">
                    <span className="font-['Syne',sans-serif] text-[13px] font-semibold text-white">
                        Recent users
                    </span>
                    <button className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors">
                        View all users →
                    </button>
                </div>

                {/* Scrollable wrapper on small screens */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-[12.5px] min-w-[480px]">
                        <thead>
                            <tr className="bg-white/[0.03]">
                                {[
                                    "User",
                                    "Role",
                                    "Orders",
                                    "Joined",
                                    "Status",
                                ].map((col, i) => (
                                    <th
                                        key={col}
                                        className={`
                                                px-3.5 py-2.5 text-left text-[10.5px] font-medium
                                                text-white/35 border-b border-white/[0.08]
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
