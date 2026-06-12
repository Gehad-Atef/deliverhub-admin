import React, { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
    fetchOffices,
    addOffice,
    approveOffice,
    toggleOfficeStatus,
    setSearch,
    setStatusFilter,
} from "../../store/slices/officesSlice";
import type {
    AddOfficePayload,
    OfficePlan,
    OfficeStatus,
} from "../../types/office";
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

// ─── Add Office Modal ─────────────────────────────────────────────────────────
const EMPTY: AddOfficePayload = {
    name: "",
    email: "",
    phone: "",
    city: "",
    coverageArea: "",
    plan: "basic",
};

interface AddOfficeModalProps {
    onClose: () => void;
    onSubmit: (p: AddOfficePayload) => void;
    saving: boolean;
}

const AddOfficeModal: React.FC<AddOfficeModalProps> = ({
    onClose,
    onSubmit,
    saving,
}) => {
    const [form, setForm] = useState<AddOfficePayload>(EMPTY);
    const [errors, setErrors] = useState<
        Partial<Record<keyof AddOfficePayload, string>>
    >({});

    const validate = () => {
        const e: typeof errors = {};
        if (!form.name.trim()) e.name = "Name is required";
        if (!form.email.trim()) e.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
        if (!form.phone.trim()) e.phone = "Phone is required";
        if (!form.city.trim()) e.city = "City is required";
        if (!form.coverageArea.trim())
            e.coverageArea = "Coverage area is required";
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
        const h = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [onClose]);

    const set = (k: keyof AddOfficePayload, v: string) => {
        setForm({ ...form, [k]: v });
        setErrors({ ...errors, [k]: undefined });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="w-full max-w-md mx-4 bg-[#131d2e] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
                    <h2 className="font-['Syne',sans-serif] text-[15px] font-semibold text-white">
                        Add new office
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
                    <Field label="Office name" error={errors.name}>
                        <input
                            value={form.name}
                            onChange={(e) => set("name", e.target.value)}
                            placeholder="e.g. Fast Arrow"
                            className={inputCls(!!errors.name)}
                        />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Email" error={errors.email}>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => set("email", e.target.value)}
                                placeholder="office@email.com"
                                className={inputCls(!!errors.email)}
                            />
                        </Field>
                        <Field label="Phone" error={errors.phone}>
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) => set("phone", e.target.value)}
                                placeholder="+20 100 000 0000"
                                className={inputCls(!!errors.phone)}
                            />
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="City" error={errors.city}>
                            <input
                                value={form.city}
                                onChange={(e) => set("city", e.target.value)}
                                placeholder="e.g. Cairo"
                                className={inputCls(!!errors.city)}
                            />
                        </Field>
                        <Field
                            label="Coverage area"
                            error={errors.coverageArea}
                        >
                            <input
                                value={form.coverageArea}
                                onChange={(e) =>
                                    set("coverageArea", e.target.value)
                                }
                                placeholder="e.g. Nasr City"
                                className={inputCls(!!errors.coverageArea)}
                            />
                        </Field>
                    </div>

                    {/* Plan selector */}
                    <Field label="Plan">
                        <div className="flex gap-2">
                            {(
                                ["basic", "premium", "featured"] as OfficePlan[]
                            ).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => set("plan", p)}
                                    className={`
                    flex-1 py-2 rounded-lg border text-[12px] font-medium capitalize transition-colors
                    ${
                        form.plan === p
                            ? "bg-blue-600/20 border-blue-500/50 text-blue-400"
                            : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:border-white/20 hover:text-white/80"
                    }
                  `}
                                >
                                    {p}
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
                        {saving ? "Adding…" : "Add office"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── View Office Modal ────────────────────────────────────────────────────────
const ViewOfficeModal: React.FC<{ officeId: string; onClose: () => void }> = ({
    officeId,
    onClose,
}) => {
    const office = useAppSelector((s) =>
        s.offices.offices.find((o) => o.id === officeId),
    );
    if (!office) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="w-full max-w-sm mx-4 bg-[#131d2e] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
                    <h2 className="font-['Syne',sans-serif] text-[15px] font-semibold text-white">
                        Office details
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/[0.07] transition-colors"
                    >
                        <i className="ti ti-x text-[16px]" />
                    </button>
                </div>

                <div className="px-5 py-5">
                    {/* Header */}
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
                                {office.status.charAt(0).toUpperCase() +
                                    office.status.slice(1)}
                            </Badge>
                            <Badge variant={planBadge[office.plan]}>
                                {office.plan.charAt(0).toUpperCase() +
                                    office.plan.slice(1)}
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-0 border border-white/[0.07] rounded-xl overflow-hidden">
                        {[
                            { label: "Email", value: office.email },
                            { label: "Phone", value: office.phone },
                            {
                                label: "Coverage area",
                                value: office.coverageArea,
                            },
                            {
                                label: "Total orders",
                                value: office.orders.toLocaleString(),
                            },
                            {
                                label: "Rating",
                                value: <StarRating rating={office.rating} />,
                            },
                            { label: "Joined", value: office.joinedAt },
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
  ${hasError ? "border-red-500/60 focus:border-red-500" : "border-white/[0.08] focus:border-blue-500/60"}
`;

const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
    <div className={`bg-white/[0.06] rounded-lg animate-pulse ${className}`} />
);

const OfficesSkeleton = () => (
    <div className="space-y-3">
        <Skeleton className="h-7 w-44" />
        <div className="grid grid-cols-3 gap-2.5">
            {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[100px]" />
            ))}
        </div>
        <Skeleton className="h-[380px]" />
    </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const Offices: React.FC = () => {
    const dispatch = useAppDispatch();
    const {
        offices,
        stats,
        loading,
        actionLoading,
        error,
        search,
        statusFilter,
    } = useAppSelector((s) => s.offices);

    const [showAddModal, setShowAddModal] = useState(false);
    const [viewOfficeId, setViewOfficeId] = useState<string | null>(null);
    const [localSearch, setLocalSearch] = useState("");

    useEffect(() => {
        dispatch(fetchOffices());
    }, [dispatch]);

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

    const handleAdd = (p: AddOfficePayload) =>
        dispatch(addOffice(p))
            .unwrap()
            .then(() => setShowAddModal(false));
    const handleApprove = (id: string) => dispatch(approveOffice(id));
    const handleToggle = (id: string, s: OfficeStatus) =>
        dispatch(toggleOfficeStatus({ id, currentStatus: s }));

    if (loading && !offices.length) return <OfficesSkeleton />;

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

    return (
        <>
            <div className="space-y-3">
                {/* ── Title ───────────────────────────────────────────────────── */}
                <div className="flex items-baseline gap-2">
                    <h1 className="font-['Syne',sans-serif] text-[18px] font-bold text-white">
                        Delivery offices
                    </h1>
                    {stats && (
                        <span className="text-[13px] text-white/35">
                            — {stats.total} total
                        </span>
                    )}
                </div>

                {/* ── Stat cards ──────────────────────────────────────────────── */}
                {stats && (
                    <div className="grid grid-cols-3 gap-2.5">
                        <StatCard
                            label="Total offices"
                            value={stats.total.toString()}
                            subText={`↑ ${stats.monthTrend} this month`}
                            trend="up"
                            icon="ti ti-building-store"
                        />
                        <StatCard
                            label="Verified"
                            value={stats.verified.toString()}
                            subText={`${stats.pendingReview} pending review`}
                            trend="neutral"
                            icon="ti ti-circle-check"
                        />
                        <StatCard
                            label="Avg. rating"
                            value={stats.avgRating.toFixed(1)}
                            subText="Platform average"
                            trend="neutral"
                            icon="ti ti-star"
                        />
                    </div>
                )}

                {/* ── Table ───────────────────────────────────────────────────── */}
                <div className="bg-[#131d2e] border border-white/[0.08] rounded-[10px] overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.08]">
                        {/* Search */}
                        <div className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-[6px] w-[220px]">
                            <i className="ti ti-search text-[15px] text-white/35 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Search offices…"
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
                            {(
                                [
                                    "all",
                                    "active",
                                    "pending",
                                    "suspended",
                                ] as const
                            ).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => dispatch(setStatusFilter(s))}
                                    className={`
                    px-3 py-1 rounded-md text-[11.5px] capitalize transition-colors
                    ${statusFilter === s ? "bg-white/[0.10] text-white" : "text-white/40 hover:text-white/70"}
                  `}
                                >
                                    {s === "all" ? "All" : s}
                                </button>
                            ))}
                        </div>

                        <span className="text-[11.5px] text-white/30 ml-1">
                            {filtered.length} result
                            {filtered.length !== 1 ? "s" : ""}
                        </span>

                        <button
                            onClick={() => setShowAddModal(true)}
                            className="ml-auto flex items-center gap-1.5 px-4 py-[6px] rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-medium transition-colors"
                        >
                            <i className="ti ti-plus text-[14px]" />
                            Add office
                        </button>
                    </div>

                    {/* Table */}
                    <table className="w-full border-collapse text-[12.5px]">
                        <thead>
                            <tr className="bg-white/[0.03]">
                                {[
                                    "Office",
                                    "Coverage area",
                                    "Plan",
                                    "Orders",
                                    "Rating",
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
                                        <i className="ti ti-building-off text-[28px] block mb-2 mx-auto" />
                                        No offices match your search
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
                                                        planBadge[office.plan]
                                                    }
                                                >
                                                    {office.plan
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        office.plan.slice(1)}
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
                                                    {office.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        office.status.slice(1)}
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
                                                    ) : office.status ===
                                                      "pending" ? (
                                                        /* Approve */
                                                        <button
                                                            onClick={() =>
                                                                handleApprove(
                                                                    office.id,
                                                                )
                                                            }
                                                            title="Approve office"
                                                            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-green-400 hover:bg-green-500/10 transition-colors"
                                                        >
                                                            <i className="ti ti-circle-check text-[15px]" />
                                                        </button>
                                                    ) : office.status ===
                                                      "active" ? (
                                                        /* Suspend */
                                                        <button
                                                            onClick={() =>
                                                                handleToggle(
                                                                    office.id,
                                                                    office.status,
                                                                )
                                                            }
                                                            title="Suspend office"
                                                            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                        >
                                                            <i className="ti ti-ban text-[15px]" />
                                                        </button>
                                                    ) : (
                                                        /* Restore */
                                                        <button
                                                            onClick={() =>
                                                                handleToggle(
                                                                    office.id,
                                                                    office.status,
                                                                )
                                                            }
                                                            title="Restore office"
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

            {/* ── Modals ──────────────────────────────────────────────────────── */}
            {showAddModal && (
                <AddOfficeModal
                    onClose={() => setShowAddModal(false)}
                    onSubmit={handleAdd}
                    saving={actionLoading === "new"}
                />
            )}
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
