import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../store";
import {
    fetchUsers,
    toggleUserStatus,
    setSearch,
    setRoleFilter,
} from "../../store/slices/usersSlice";
import type { UserRole, UserStatus } from "../../types/user";
import { StatCard } from "../../components/shared/StatCard";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { Spinner } from "../../components/ui/Spinner";

// ─── Badge maps ───────────────────────────────────────────────────────────────
const roleBadge: Record<
    UserRole,
    React.ComponentProps<typeof Badge>["variant"]
> = {
    customer: "blue",
    driver: "amber",
};

const statusBadge: Record<
    UserStatus,
    React.ComponentProps<typeof Badge>["variant"]
> = {
    active: "green",
    inactive: "gray",
    suspended: "red",
};

// ─── View User Modal ──────────────────────────────────────────────────────────
const ViewUserModal: React.FC<{ userId: string; onClose: () => void }> = ({
    userId,
    onClose,
}) => {
    const { t } = useTranslation();
    const user = useAppSelector((s) =>
        s.users.users.find((u) => u.id === userId),
    );
    if (!user) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="w-full sm:max-w-sm sm:mx-4 bg-[#131d2e] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-black/60">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
                    <h2 className="font-['Syne',sans-serif] text-[15px] font-semibold text-white">
                        {t("users.userDetails")}
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
                        <div className="w-12 h-12 rounded-full bg-blue-600/15 border border-blue-500/25 flex items-center justify-center text-[15px] font-semibold text-blue-400">
                            {user.initials}
                        </div>
                        <div>
                            <p className="text-[14px] font-semibold text-white">
                                {user.name}
                            </p>
                            <p className="text-[11.5px] text-white/40 mt-0.5">
                                {user.email}
                            </p>
                        </div>
                        <div className="ml-auto">
                            <Badge variant={statusBadge[user.status]}>
                                {t(`users.${user.status}`)}
                            </Badge>
                        </div>
                    </div>

                    <div className="border border-white/[0.07] rounded-xl overflow-hidden">
                        {[
                            { label: t("users.phone"), value: user.phone },
                            {
                                label: t("users.role"),
                                value: (
                                    <Badge variant={roleBadge[user.role]}>
                                        {t(`users.${user.role}`)}
                                    </Badge>
                                ),
                            },
                            { label: t("users.orders"), value: user.orders },
                            { label: t("users.joined"), value: user.joined },
                        ].map(({ label, value }) => (
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
                        {t("users.close")}
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

const UsersSkeleton = () => (
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
const Users: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { users, stats, loading, actionLoading, error, search, roleFilter } =
        useAppSelector((s) => s.users);

    const [viewUserId, setViewUserId] = useState<string | null>(null);
    const [localSearch, setLocalSearch] = useState("");

    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    useEffect(() => {
        const id = setTimeout(() => dispatch(setSearch(localSearch)), 250);
        return () => clearTimeout(id);
    }, [localSearch, dispatch]);

    const filtered = useMemo(
        () =>
            users.filter((u) => {
                const matchRole = roleFilter === "all" || u.role === roleFilter;
                const matchSearch =
                    !search ||
                    u.name.toLowerCase().includes(search.toLowerCase()) ||
                    u.email.toLowerCase().includes(search.toLowerCase()) ||
                    u.phone.includes(search);
                return matchRole && matchSearch;
            }),
        [users, search, roleFilter],
    );

    const handleToggle = (id: string, status: UserStatus) =>
        dispatch(toggleUserStatus({ id, currentStatus: status }));

    // ── Error ──
    if (error && !users.length) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
                <i className="ti ti-alert-circle text-[32px] text-red-400" />
                <p className="text-white/70 text-sm">{error}</p>
                <button
                    onClick={() => dispatch(fetchUsers())}
                    className="mt-1 px-4 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    // ── Loading ──
    if (loading && !users.length) return <UsersSkeleton />;

    return (
        <>
            <div className="space-y-3">
                {/* ── Title ─────────────────────────────────────────────── */}
                <div className="flex items-baseline gap-2">
                    <h1 className="font-['Syne',sans-serif] text-[18px] font-bold text-white">
                        {t("users.title")}
                    </h1>
                    {stats && (
                        <span className="text-[13px] text-white/35">
                            — {stats.total.toLocaleString()}{" "}
                            {t("users.registered")}
                        </span>
                    )}
                </div>

                {/* ── Stat cards ────────────────────────────────────────── */}
                {stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <StatCard
                            label={t("users.totalUsers")}
                            value={stats.total.toLocaleString()}
                            subText={`↑ ${stats.weekTrend}% ${t("users.thisWeek")}`}
                            trend="up"
                            icon="ti ti-users"
                        />
                        <StatCard
                            label={t("users.active")}
                            value={stats.active.toLocaleString()}
                            subText={`${Math.round((stats.active / stats.total) * 100)}% ${t("users.ofTotal")}`}
                            trend="neutral"
                            icon="ti ti-user-check"
                        />
                        <StatCard
                            label={t("users.suspended")}
                            value={stats.suspended.toLocaleString()}
                            subText={`↑ ${stats.newSuspendedThisWeek} ${t("users.newThisWeek")}`}
                            trend="down"
                            icon="ti ti-user-off"
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
                                placeholder={t("users.searchPlaceholder")}
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

                        {/* Role filter */}
                        <div className="flex items-center gap-1 bg-white/[0.05] border border-white/[0.08] rounded-lg p-1">
                            {(["all", "customer", "driver"] as const).map(
                                (r) => (
                                    <button
                                        key={r}
                                        onClick={() =>
                                            dispatch(setRoleFilter(r))
                                        }
                                        className={`px-3 py-1 rounded-md text-[11.5px] capitalize transition-colors
                                        ${roleFilter === r ? "bg-white/[0.10] text-white" : "text-white/40 hover:text-white/70"}`}
                                    >
                                        {r === "all"
                                            ? t("users.allRoles")
                                            : t(`users.${r}`)}
                                    </button>
                                ),
                            )}
                        </div>

                        {/* Count */}
                        <span className="text-[11.5px] text-white/30">
                            {filtered.length}{" "}
                            {filtered.length !== 1
                                ? t("users.results")
                                : t("users.result")}
                        </span>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-[12.5px] min-w-[560px]">
                            <thead>
                                <tr className="bg-white/[0.03]">
                                    {[
                                        t("users.user"),
                                        t("users.phone"),
                                        t("users.role"),
                                        t("users.orders"),
                                        t("users.joined"),
                                        t("users.status"),
                                        t("users.actions"),
                                    ].map((col) => (
                                        <th
                                            key={col}
                                            className="px-3.5 py-2.5 text-left text-[10.5px] font-medium text-white/35 border-b border-white/[0.08] uppercase tracking-[0.05em]"
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
                                            <i className="ti ti-users-off text-[28px] block mb-2 mx-auto" />
                                            {t("users.noResults")}
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((user) => {
                                        const isActing =
                                            actionLoading === user.id;
                                        return (
                                            <tr
                                                key={user.id}
                                                className="group hover:bg-white/[0.025] transition-colors"
                                            >
                                                {/* User */}
                                                <td className="px-3.5 py-2.5 border-b border-white/[0.08]">
                                                    <div className="flex items-center gap-2.5">
                                                        <Avatar
                                                            initials={
                                                                user.initials
                                                            }
                                                        />
                                                        <div>
                                                            <p className="text-[12.5px] text-white">
                                                                {user.name}
                                                            </p>
                                                            <p className="text-[10.5px] text-white/35">
                                                                {user.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Phone */}
                                                <td className="px-3.5 py-2.5 border-b border-white/[0.08] text-white/85">
                                                    {user.phone}
                                                </td>
                                                {/* Role */}
                                                <td className="px-3.5 py-2.5 border-b border-white/[0.08]">
                                                    <Badge
                                                        variant={
                                                            roleBadge[user.role]
                                                        }
                                                    >
                                                        {t(
                                                            `users.${user.role}`,
                                                        )}
                                                    </Badge>
                                                </td>
                                                {/* Orders */}
                                                <td className="px-3.5 py-2.5 border-b border-white/[0.08] text-white/85">
                                                    {user.orders}
                                                </td>
                                                {/* Joined */}
                                                <td className="px-3.5 py-2.5 border-b border-white/[0.08] text-white/85">
                                                    {user.joined}
                                                </td>
                                                {/* Status */}
                                                <td className="px-3.5 py-2.5 border-b border-white/[0.08]">
                                                    <Badge
                                                        variant={
                                                            statusBadge[
                                                                user.status
                                                            ]
                                                        }
                                                    >
                                                        {t(
                                                            `users.${user.status}`,
                                                        )}
                                                    </Badge>
                                                </td>
                                                {/* Actions */}
                                                <td className="px-3.5 py-2.5 border-b border-white/[0.08]">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                setViewUserId(
                                                                    user.id,
                                                                )
                                                            }
                                                            title={t(
                                                                "users.viewDetails",
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
                                                        ) : user.status ===
                                                          "active" ? (
                                                            <button
                                                                onClick={() =>
                                                                    handleToggle(
                                                                        user.id,
                                                                        user.status,
                                                                    )
                                                                }
                                                                title={t(
                                                                    "users.suspend",
                                                                )}
                                                                className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                            >
                                                                <i className="ti ti-ban text-[15px]" />
                                                            </button>
                                                        ) : user.status ===
                                                          "inactive" ? (
                                                            <button
                                                                onClick={() =>
                                                                    handleToggle(
                                                                        user.id,
                                                                        user.status,
                                                                    )
                                                                }
                                                                title={t(
                                                                    "users.activate",
                                                                )}
                                                                className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                                                            >
                                                                <i className="ti ti-player-play text-[15px]" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() =>
                                                                    handleToggle(
                                                                        user.id,
                                                                        user.status,
                                                                    )
                                                                }
                                                                title={t(
                                                                    "users.restore",
                                                                )}
                                                                className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-green-400 hover:bg-green-500/10 transition-colors"
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

            {viewUserId && (
                <ViewUserModal
                    userId={viewUserId}
                    onClose={() => setViewUserId(null)}
                />
            )}
        </>
    );
};

export default Users;
