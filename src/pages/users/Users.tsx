import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchUsers, toggleUserStatus } from "../../store/slices/usersSlice";
import type { UserStatus } from "../../types/user";
import { StatCard } from "../../components/shared/StatCard";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { Spinner } from "../../components/ui/Spinner";
import {
    Eye,
    Ban,
    RefreshCw,
    X,
    Search,
    Users as UsersIcon,
    UserCheck,
    UserX,
    AlertCircle,
} from "lucide-react";

// ─── Badge map ────────────────────────────────────────────────────────────────
const statusBadge: Record<
    UserStatus,
    React.ComponentProps<typeof Badge>["variant"]
> = {
    active: "green",
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
            <div
                className="
                    w-full sm:max-w-sm sm:mx-4
                    bg-[var(--bg-secondary)]
                    border border-[var(--border-color)]
                    rounded-t-2xl sm:rounded-2xl
                    shadow-2xl shadow-black/20
                "
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)]">
                    <h2 className="font-['Syne',sans-serif] text-[15px] font-semibold text-[var(--text-primary)]">
                        {t("users.userDetails")}
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
                        <div className="w-12 h-12 rounded-full bg-blue-600/15 border border-blue-500/25 flex items-center justify-center text-[15px] font-semibold text-blue-500 dark:text-blue-400">
                            {user.initials}
                        </div>
                        <div>
                            <p className="text-[14px] font-semibold text-[var(--text-primary)]">
                                {user.name}
                            </p>
                            <p className="text-[11.5px] text-[var(--text-muted)] mt-0.5">
                                {user.email}
                            </p>
                        </div>
                        <div className="ml-auto">
                            <Badge variant={statusBadge[user.status]}>
                                {t(`users.${user.status}`)}
                            </Badge>
                        </div>
                    </div>

                    <div className="border border-[var(--border-color)] rounded-xl overflow-hidden">
                        {[
                            { label: t("users.phone"), value: user.phone },
                            { label: t("users.orders"), value: user.orders },
                            { label: t("users.joined"), value: user.joined },
                        ].map(({ label, value }) => (
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
                        {t("users.close")}
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
    const { users, stats, pagination, loading, actionLoading, error } =
        useAppSelector((s) => s.users);

    const [viewUserId, setViewUserId] = useState<string | null>(null);
    const [localSearch, setLocalSearch] = useState("");

    // جلب أول مرة
    useEffect(() => {
        dispatch(fetchUsers({ page: 1, limit: 20 }));
    }, [dispatch]);

    // الـ search بيبعت للباك إند مع debounce
    useEffect(() => {
        const id = setTimeout(() => {
            dispatch(fetchUsers({ page: 1, limit: 20, search: localSearch }));
        }, 400);
        return () => clearTimeout(id);
    }, [localSearch, dispatch]);

    const handleToggle = (id: string, status: UserStatus) =>
        dispatch(toggleUserStatus({ id, currentStatus: status }));

    // ── Error ──
    if (error && !users.length) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
                <AlertCircle size={32} className="text-red-400" />
                <p className="text-[var(--text-secondary)] text-sm">{error}</p>
                <button
                    onClick={() => dispatch(fetchUsers({ page: 1, limit: 20 }))}
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
                    <h1 className="font-['Syne',sans-serif] text-[18px] font-bold text-[var(--text-primary)]">
                        {t("users.title")}
                    </h1>
                    {stats && (
                        <span className="text-[13px] text-[var(--text-muted)]">
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
                            icon={UsersIcon}
                        />
                        <StatCard
                            label={t("users.active")}
                            value={stats.active.toLocaleString()}
                            subText={`${Math.round((stats.active / stats.total) * 100)}% ${t("users.ofTotal")}`}
                            trend="neutral"
                            icon={UserCheck}
                        />
                        <StatCard
                            label={t("users.suspended")}
                            value={stats.suspended.toLocaleString()}
                            subText={`↑ ${stats.newSuspendedThisWeek} ${t("users.newThisWeek")}`}
                            trend="down"
                            icon={UserX}
                        />
                    </div>
                )}

                {/* ── Table ─────────────────────────────────────────────── */}
                <div
                    className="
                        bg-[var(--bg-secondary)]
                        border border-[var(--border-color)]
                        rounded-[10px] overflow-hidden
                    "
                >
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-[var(--border-color)]">
                        {/* Search */}
                        <div
                            className="
                                flex items-center gap-2
                                bg-black/[0.04] dark:bg-white/[0.05]
                                border border-[var(--border-color)]
                                rounded-lg px-3 py-[6px]
                                w-full sm:w-[220px]
                            "
                        >
                            <Search
                                size={14}
                                className="text-[var(--text-muted)] flex-shrink-0"
                            />
                            <input
                                type="text"
                                placeholder={t("users.searchPlaceholder")}
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

                        {/* Count */}
                        {pagination && (
                            <span className="text-[11.5px] text-[var(--text-muted)]">
                                {pagination.total}{" "}
                                {pagination.total !== 1
                                    ? t("users.results")
                                    : t("users.result")}
                            </span>
                        )}
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-[12.5px] min-w-[480px]">
                            <thead>
                                <tr className="bg-black/[0.02] dark:bg-white/[0.03]">
                                    {[
                                        t("users.user"),
                                        t("users.phone"),
                                        t("users.orders"),
                                        t("users.joined"),
                                        t("users.status"),
                                        t("users.actions"),
                                    ].map((col) => (
                                        <th
                                            key={col}
                                            className="px-3.5 py-2.5 text-left text-[10.5px] font-medium text-[var(--text-muted)] border-b border-[var(--border-color)] uppercase tracking-[0.05em]"
                                        >
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-12 text-center text-[13px] text-[var(--text-muted)]"
                                        >
                                            <UserX
                                                size={28}
                                                className="block mb-2 mx-auto opacity-40"
                                            />
                                            {t("users.noResults")}
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => {
                                        const isActing =
                                            actionLoading === user.id;
                                        return (
                                            <tr
                                                key={user.id}
                                                className="group hover:bg-black/[0.02] dark:hover:bg-white/[0.025] transition-colors"
                                            >
                                                {/* User */}
                                                <td className="px-3.5 py-2.5 border-b border-[var(--border-color)]">
                                                    <div className="flex items-center gap-2.5">
                                                        <Avatar
                                                            initials={
                                                                user.initials
                                                            }
                                                        />
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
                                                {/* Phone */}
                                                <td className="px-3.5 py-2.5 border-b border-[var(--border-color)] text-[var(--text-secondary)]">
                                                    {user.phone}
                                                </td>
                                                {/* Orders */}
                                                <td className="px-3.5 py-2.5 border-b border-[var(--border-color)] text-[var(--text-secondary)]">
                                                    {user.orders}
                                                </td>
                                                {/* Joined */}
                                                <td className="px-3.5 py-2.5 border-b border-[var(--border-color)] text-[var(--text-secondary)]">
                                                    {user.joined}
                                                </td>
                                                {/* Status */}
                                                <td className="px-3.5 py-2.5 border-b border-[var(--border-color)]">
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
                                                <td className="px-3.5 py-2.5 border-b border-[var(--border-color)]">
                                                    <div className="flex items-center gap-2">
                                                        {/* View */}
                                                        <button
                                                            onClick={() =>
                                                                setViewUserId(
                                                                    user.id,
                                                                )
                                                            }
                                                            title={t(
                                                                "users.viewDetails",
                                                            )}
                                                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/[0.06] dark:hover:bg-white/[0.07] transition-colors"
                                                        >
                                                            <Eye size={15} />
                                                        </button>

                                                        {/* Toggle */}
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
                                                                        user.id,
                                                                        user.status,
                                                                    )
                                                                }
                                                                title={t(
                                                                    "users.restore",
                                                                )}
                                                                className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-green-500 hover:bg-green-500/10 transition-colors"
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

                    {/* Pagination */}
                    {pagination && pagination.pages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-color)]">
                            <span className="text-[11.5px] text-[var(--text-muted)]">
                                {t("users.page")} {pagination.page} /{" "}
                                {pagination.pages}
                            </span>
                            <div className="flex gap-1.5">
                                <button
                                    disabled={pagination.page <= 1 || loading}
                                    onClick={() =>
                                        dispatch(
                                            fetchUsers({
                                                page: pagination.page - 1,
                                                limit: pagination.limit,
                                                search: localSearch,
                                            }),
                                        )
                                    }
                                    className="px-3 py-1.5 rounded-lg text-[11.5px] text-[var(--text-secondary)] bg-black/[0.04] dark:bg-white/[0.05] hover:bg-black/[0.07] dark:hover:bg-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    {t("users.prev")}
                                </button>
                                <button
                                    disabled={
                                        pagination.page >= pagination.pages ||
                                        loading
                                    }
                                    onClick={() =>
                                        dispatch(
                                            fetchUsers({
                                                page: pagination.page + 1,
                                                limit: pagination.limit,
                                                search: localSearch,
                                            }),
                                        )
                                    }
                                    className="px-3 py-1.5 rounded-lg text-[11.5px] text-[var(--text-secondary)] bg-black/[0.04] dark:bg-white/[0.05] hover:bg-black/[0.07] dark:hover:bg-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    {t("users.next")}
                                </button>
                            </div>
                        </div>
                    )}
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
