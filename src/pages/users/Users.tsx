import React, { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
    fetchUsers,
    addUser,
    toggleUserStatus,
    setSearch,
    setRoleFilter,
} from "../../store/slices/usersSlice";
import type { AddUserPayload, UserRole, UserStatus } from "../../types/user";
import { StatCard } from "../../components/shared/StatCard";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { Spinner } from "../../components/ui/Spinner";

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

// ─── Add User Modal ────────────────────────────────────────────────────────────
interface AddUserModalProps {
    onClose: () => void;
    onSubmit: (payload: AddUserPayload) => void;
    saving: boolean;
}

const EMPTY_FORM: AddUserPayload = {
    name: "",
    email: "",
    phone: "",
    role: "customer",
};

const AddUserModal: React.FC<AddUserModalProps> = ({
    onClose,
    onSubmit,
    saving,
}) => {
    const [form, setForm] = useState<AddUserPayload>(EMPTY_FORM);
    const [errors, setErrors] = useState<
        Partial<Record<keyof AddUserPayload, string>>
    >({});

    const validate = () => {
        const e: typeof errors = {};
        if (!form.name.trim()) e.name = "Name is required";
        if (!form.email.trim()) e.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
        if (!form.phone.trim()) e.phone = "Phone is required";
        return e;
    };

    const handleSubmit = () => {
        const e = validate();
        if (Object.keys(e).length) {
            setErrors(e);
            return;
        }
        onSubmit(form);
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            {/*
             * On mobile: sheet slides up from bottom (rounded top corners only).
             * On sm+: centred modal with rounded corners all around.
             */}
            <div
                className="
                    w-full sm:max-w-md sm:mx-4
                    bg-[#131d2e] border border-white/[0.08]
                    rounded-t-2xl sm:rounded-2xl
                    shadow-2xl shadow-black/60
                    animate-[fadeSlideUp_.2s_ease]
                "
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
                    <h2 className="font-['Syne',sans-serif] text-[15px] font-semibold text-white">
                        Add new user
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/[0.07] transition-colors"
                    >
                        <i className="ti ti-x text-[16px]" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 py-5 space-y-4">
                    <Field label="Full name" error={errors.name}>
                        <input
                            type="text"
                            placeholder="e.g. Ahmed Kamal"
                            value={form.name}
                            onChange={(e) => {
                                setForm({ ...form, name: e.target.value });
                                setErrors({ ...errors, name: undefined });
                            }}
                            className={inputCls(!!errors.name)}
                        />
                    </Field>

                    <Field label="Email address" error={errors.email}>
                        <input
                            type="email"
                            placeholder="user@email.com"
                            value={form.email}
                            onChange={(e) => {
                                setForm({ ...form, email: e.target.value });
                                setErrors({ ...errors, email: undefined });
                            }}
                            className={inputCls(!!errors.email)}
                        />
                    </Field>

                    <Field label="Phone number" error={errors.phone}>
                        <input
                            type="tel"
                            placeholder="+20 100 000 0000"
                            value={form.phone}
                            onChange={(e) => {
                                setForm({ ...form, phone: e.target.value });
                                setErrors({ ...errors, phone: undefined });
                            }}
                            className={inputCls(!!errors.phone)}
                        />
                    </Field>

                    <Field label="Role">
                        <div className="flex gap-2">
                            {(["customer", "driver"] as UserRole[]).map((r) => (
                                <button
                                    key={r}
                                    onClick={() =>
                                        setForm({ ...form, role: r })
                                    }
                                    className={`
                                        flex-1 py-2 rounded-lg border text-[12.5px] font-medium capitalize transition-colors
                                        ${
                                            form.role === r
                                                ? "bg-blue-600/20 border-blue-500/50 text-blue-400"
                                                : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:border-white/20 hover:text-white/80"
                                        }
                                    `}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </Field>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2.5 px-5 py-4 border-t border-white/[0.08]">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-[12.5px] text-white/55 hover:text-white bg-white/[0.05] hover:bg-white/[0.09] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg text-[12.5px] font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white transition-colors"
                    >
                        {saving && <Spinner size="sm" />}
                        {saving ? "Adding…" : "Add user"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Field wrapper ─────────────────────────────────────────────────────────────
const Field: React.FC<{
    label: string;
    error?: string;
    children: React.ReactNode;
}> = ({ label, error, children }) => (
    <div className="space-y-1.5">
        <label className="block text-[11.5px] text-white/55 font-medium">
            {label}
        </label>
        {children}
        {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
);

const inputCls = (hasError: boolean) => `
  w-full bg-white/[0.05] border rounded-lg px-3 py-2
  text-[12.5px] text-white placeholder:text-white/30
  outline-none transition-colors font-['DM_Sans',sans-serif]
  ${
      hasError
          ? "border-red-500/60 focus:border-red-500"
          : "border-white/[0.08] focus:border-blue-500/60"
  }
`;

// ─── View User Modal ────────────────────────────────────────────────────────────
const ViewUserModal: React.FC<{ userId: string; onClose: () => void }> = ({
    userId,
    onClose,
}) => {
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
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
                    <h2 className="font-['Syne',sans-serif] text-[15px] font-semibold text-white">
                        User details
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/[0.07] transition-colors"
                    >
                        <i className="ti ti-x text-[16px]" />
                    </button>
                </div>

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
                            <Badge
                                variant={
                                    user.status === "active" ? "green" : "red"
                                }
                            >
                                {user.status === "active"
                                    ? "Active"
                                    : "Suspended"}
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-0 border border-white/[0.07] rounded-xl overflow-hidden">
                        {[
                            { label: "Phone", value: user.phone },
                            {
                                label: "Role",
                                value: (
                                    <Badge variant={roleBadge[user.role]}>
                                        {user.role.charAt(0).toUpperCase() +
                                            user.role.slice(1)}
                                    </Badge>
                                ),
                            },
                            { label: "Orders", value: user.orders },
                            { label: "Joined", value: user.joined },
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
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Skeleton ──────────────────────────────────────────────────────────────────
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

// ─── Main Page ─────────────────────────────────────────────────────────────────
const Users: React.FC = () => {
    const dispatch = useAppDispatch();
    const { users, stats, loading, actionLoading, error, search, roleFilter } =
        useAppSelector((s) => s.users);

    const [showAddModal, setShowAddModal] = useState(false);
    const [viewUserId, setViewUserId] = useState<string | null>(null);
    const [localSearch, setLocalSearch] = useState("");

    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    useEffect(() => {
        const id = setTimeout(() => dispatch(setSearch(localSearch)), 250);
        return () => clearTimeout(id);
    }, [localSearch, dispatch]);

    const filtered = useMemo(() => {
        return users.filter((u) => {
            const matchRole = roleFilter === "all" || u.role === roleFilter;
            const matchSearch =
                !search ||
                u.name.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase()) ||
                u.phone.includes(search);
            return matchRole && matchSearch;
        });
    }, [users, search, roleFilter]);

    const handleAddUser = (payload: AddUserPayload) => {
        dispatch(addUser(payload))
            .unwrap()
            .then(() => setShowAddModal(false));
    };

    const handleToggle = (id: string, status: "active" | "suspended") => {
        dispatch(toggleUserStatus({ id, currentStatus: status }));
    };

    if (loading && !users.length) return <UsersSkeleton />;

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

    return (
        <>
            <div className="space-y-3">
                {/* ── Page title ──────────────────────────────────────────────── */}
                <div className="flex items-baseline gap-2">
                    <h1 className="font-['Syne',sans-serif] text-[18px] font-bold text-white">
                        Users
                    </h1>
                    {stats && (
                        <span className="text-[13px] text-white/35">
                            — {stats.total.toLocaleString()} registered
                        </span>
                    )}
                </div>

                {/* ── Stat cards: 1 col → 3 cols ──────────────────────────────── */}
                {stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <StatCard
                            label="Total users"
                            value={stats.total.toLocaleString()}
                            subText={`↑ ${stats.weekTrend}% this week`}
                            trend="up"
                            icon="ti ti-users"
                        />
                        <StatCard
                            label="Active"
                            value={stats.active.toLocaleString()}
                            subText={`${Math.round((stats.active / stats.total) * 100)}% of total`}
                            trend="neutral"
                            icon="ti ti-user-check"
                        />
                        <StatCard
                            label="Suspended"
                            value={stats.suspended.toLocaleString()}
                            subText={`↑ ${stats.newSuspendedThisWeek} this week`}
                            trend="down"
                            icon="ti ti-user-off"
                        />
                    </div>
                )}

                {/* ── Table ───────────────────────────────────────────────────── */}
                <div className="bg-[#131d2e] border border-white/[0.08] rounded-[10px] overflow-hidden">
                    {/* Toolbar — wraps on small screens */}
                    <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-white/[0.08]">
                        {/* Search */}
                        <div className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-[6px] w-full sm:w-[220px]">
                            <i className="ti ti-search text-[15px] text-white/35 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Search users…"
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
                                        className={`
                                            px-3 py-1 rounded-md text-[11.5px] capitalize transition-colors
                                            ${
                                                roleFilter === r
                                                    ? "bg-white/[0.10] text-white"
                                                    : "text-white/40 hover:text-white/70"
                                            }
                                        `}
                                    >
                                        {r === "all" ? "All roles" : r}
                                    </button>
                                ),
                            )}
                        </div>

                        {/* Result count */}
                        <span className="text-[11.5px] text-white/30">
                            {filtered.length} result
                            {filtered.length !== 1 ? "s" : ""}
                        </span>

                        {/* Add user — pushed right on sm+, full-width on xs */}
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="sm:ml-auto w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-[6px] rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-medium transition-colors"
                        >
                            <i className="ti ti-plus text-[14px]" />
                            Add user
                        </button>
                    </div>

                    {/* Table — scrollable on small screens */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-[12.5px] min-w-[560px]">
                            <thead>
                                <tr className="bg-white/[0.03]">
                                    {[
                                        "User",
                                        "Phone",
                                        "Role",
                                        "Orders",
                                        "Joined",
                                        "Status",
                                        "Actions",
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
                                            No users match your search
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
                                                <td className="px-3.5 py-2.5 border-b border-white/[0.08] text-white/85">
                                                    {user.phone}
                                                </td>
                                                <td className="px-3.5 py-2.5 border-b border-white/[0.08]">
                                                    <Badge
                                                        variant={
                                                            roleBadge[user.role]
                                                        }
                                                    >
                                                        {user.role
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            user.role.slice(1)}
                                                    </Badge>
                                                </td>
                                                <td className="px-3.5 py-2.5 border-b border-white/[0.08] text-white/85">
                                                    {user.orders}
                                                </td>
                                                <td className="px-3.5 py-2.5 border-b border-white/[0.08] text-white/85">
                                                    {user.joined}
                                                </td>
                                                <td className="px-3.5 py-2.5 border-b border-white/[0.08]">
                                                    <Badge
                                                        variant={
                                                            statusBadge[
                                                                user.status
                                                            ]
                                                        }
                                                    >
                                                        {user.status
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            user.status.slice(
                                                                1,
                                                            )}
                                                    </Badge>
                                                </td>
                                                <td className="px-3.5 py-2.5 border-b border-white/[0.08]">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                setViewUserId(
                                                                    user.id,
                                                                )
                                                            }
                                                            title="View details"
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
                                                                title="Suspend user"
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
                                                                title="Activate user"
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
                                                                title="Restore user"
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

            {showAddModal && (
                <AddUserModal
                    onClose={() => setShowAddModal(false)}
                    onSubmit={handleAddUser}
                    saving={actionLoading === "new"}
                />
            )}
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
