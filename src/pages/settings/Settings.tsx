import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { Bell, ShieldCheck, Settings2 } from "lucide-react";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const getToken = () => localStorage.getItem("token");

// ─── Types ────────────────────────────────────────────────────────────────────
interface PlatformSettings {
    commissionRate: number;
    subscriptionFee: number;
    featuredListingFee: number;
}
interface NotificationSettings {
    newDisputeAlerts: boolean;
    newOfficeRegistrations: boolean;
    dailyRevenueReport: boolean;
}
interface AdminAccount {
    id: string;
    initials: string;
    name: string;
    email: string;
    role: "admin"; // الموديل دلوقتي فيه رول واحد بس للأدمن
    isYou: boolean;
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({
    checked,
    onChange,
}) => (
    <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 flex-shrink-0
      ${checked ? "bg-blue-600" : "bg-black/[0.12] dark:bg-white/[0.12]"}`}
    >
        <span
            className={`absolute top-[3px] w-4 h-4 bg-white rounded-full shadow-md transition-all duration-200
      ${checked ? "right-[3px]" : "left-[3px]"}`}
        />
    </button>
);

// ─── Number Input ─────────────────────────────────────────────────────────────
const NumInput: React.FC<{
    value: number;
    onChange: (v: number) => void;
    prefix?: string;
    suffix?: string;
    min?: number;
    max?: number;
}> = ({ value, onChange, prefix, suffix, min, max }) => (
    <div className="flex items-center gap-2">
        {prefix && (
            <span className="text-[13px] text-[var(--text-muted)] font-medium">
                {prefix}
            </span>
        )}
        <input
            type="number"
            value={value}
            min={min}
            max={max}
            onChange={(e) => {
                const raw = Number(e.target.value);
                let next = Number.isFinite(raw) ? raw : 0;
                if (min !== undefined && next < min) next = min;
                if (max !== undefined && next > max) next = max;
                onChange(next);
            }}
            className="
        w-[88px] bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg
        px-3 py-2 text-[13px] text-[var(--text-primary)] text-right
        outline-none focus:border-blue-500/60 focus:bg-[var(--bg-secondary)] transition-all
        font-['DM_Sans',sans-serif]
        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
        [&::-webkit-inner-spin-button]:appearance-none
      "
        />
        {suffix && (
            <span className="text-[13px] text-[var(--text-muted)] font-medium">
                {suffix}
            </span>
        )}
    </div>
);

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader = ({
    icon: Icon,
    title,
    desc,
}: {
    icon: React.ElementType;
    title: string;
    desc: string;
}) => (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border-color)]">
        <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/20 flex items-center justify-center">
            <Icon size={18} className="text-blue-500 dark:text-blue-400" />
        </div>
        <div>
            <p className="text-[13.5px] font-semibold text-[var(--text-primary)]">
                {title}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                {desc}
            </p>
        </div>
    </div>
);

// ─── Setting Row ──────────────────────────────────────────────────────────────
const SettingRow: React.FC<{
    label: string;
    desc: string;
    control: React.ReactNode;
}> = ({ label, desc, control }) => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-[var(--border-color)] last:border-none hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
        <div className="min-w-0">
            <p className="text-[13px] text-[var(--text-primary)]">{label}</p>
            <p className="text-[11.5px] text-[var(--text-muted)] mt-0.5 leading-relaxed">
                {desc}
            </p>
        </div>
        <div className="flex-shrink-0">{control}</div>
    </div>
);

// ─── Card ─────────────────────────────────────────────────────────────────────
const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden">
        {children}
    </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
const SaveToast: React.FC<{ visible: boolean; message: string }> = ({
    visible,
    message,
}) => (
    <div
        className={`
    fixed bottom-6 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap
    flex items-center gap-2 px-4 py-2.5 rounded-xl
    bg-[var(--bg-secondary)] border border-green-500/30 shadow-2xl shadow-black/20 dark:shadow-black/50
    text-[12.5px] text-green-600 dark:text-green-400 font-medium transition-all duration-300
    ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"}
  `}
    >
        <i className="ti ti-circle-check text-[15px]" />
        {message}
    </div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
    <div
        className={`bg-black/[0.06] dark:bg-white/[0.06] rounded-lg animate-pulse ${className}`}
    />
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const Settings: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === "ar";

    const [platform, setPlatform] = useState<PlatformSettings>({
        commissionRate: 0,
        subscriptionFee: 0,
        featuredListingFee: 0,
    });
    const [notifications, setNotifications] = useState<NotificationSettings>({
        newDisputeAlerts: false,
        newOfficeRegistrations: false,
        dailyRevenueReport: false,
    });
    const [admins, setAdmins] = useState<AdminAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [toastVisible, setToastVisible] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ── جلب الـ settings والـ admins ─────────────────────────────────────────
    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            setError(null);
            try {
                const [settingsRes, adminsRes] = await Promise.all([
                    fetch(`${BASE_URL}/admin/settings`, {
                        headers: { Authorization: `Bearer ${getToken()}` },
                    }),
                    fetch(`${BASE_URL}/admin/settings/admins`, {
                        headers: { Authorization: `Bearer ${getToken()}` },
                    }),
                ]);

                const settingsData = await settingsRes.json();
                const adminsData = await adminsRes.json();

                if (!settingsRes.ok) throw new Error(settingsData.message);
                if (!adminsRes.ok) throw new Error(adminsData.message);

                const s = settingsData.data;
                setPlatform({
                    commissionRate: s.commissionRate ?? 0,
                    subscriptionFee: s.subscriptionFee ?? 0,
                    featuredListingFee: s.featuredListingFee ?? 0,
                });
                setNotifications({
                    newDisputeAlerts: s.newDisputeAlerts ?? false,
                    newOfficeRegistrations: s.newOfficeRegistrations ?? false,
                    dailyRevenueReport: s.dailyRevenueReport ?? false,
                });

                const tokenPayload = JSON.parse(
                    atob(getToken()!.split(".")[1]),
                );
                const currentAdminId = tokenPayload.id || tokenPayload._id;

                setAdmins(
                    (adminsData.data || []).map((a: any) => ({
                        id: a._id,
                        initials: (a.fullName || "?")
                            .split(" ")
                            .filter(Boolean)
                            .map((w: string) => w[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase(),
                        name: a.fullName || "—",
                        email: a.email,
                        role: "admin" as const,
                        isYou: String(a._id) === String(currentAdminId),
                    })),
                );
            } catch (err: any) {
                setError(err.message || t("settings.loadError"));
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    // ── Save ──────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const response = await fetch(`${BASE_URL}/admin/settings`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({ ...platform, ...notifications }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            setToastVisible(true);
            setTimeout(() => setToastVisible(false), 2500);
        } catch (err: any) {
            setError(err.message || t("settings.saveError"));
        } finally {
            setSaving(false);
        }
    };

    // ── Remove admin ──────────────────────────────────────────────────────────
    const handleRemoveAdmin = async (id: string) => {
        setRemovingId(id);
        setError(null);
        try {
            const response = await fetch(
                `${BASE_URL}/admin/settings/admins/${id}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${getToken()}` },
                },
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            setAdmins((prev) => prev.filter((a) => a.id !== id));
        } catch (err: any) {
            setError(err.message || t("settings.removeAdminError"));
        } finally {
            setRemovingId(null);
        }
    };

    const toggleNotif = (k: keyof NotificationSettings) =>
        setNotifications((p) => ({ ...p, [k]: !p[k] }));

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="w-full space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Skeleton className="h-[260px]" />
                    <Skeleton className="h-[260px]" />
                    <Skeleton className="h-[180px]" />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="w-full space-y-6" dir={isRTL ? "rtl" : "ltr"}>
                {/* ── Page title ────────────────────────────────────────────── */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-['Syne',sans-serif] text-[20px] font-bold text-[var(--text-primary)]">
                            {t("settings.title")}
                        </h1>
                        <p className="text-[12.5px] text-[var(--text-muted)] mt-0.5">
                            {t("settings.subtitle")}
                        </p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-medium
              bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed
              text-white transition-colors"
                    >
                        {saving ? (
                            <>
                                <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                                {t("settings.saving")}
                            </>
                        ) : (
                            <>
                                <i className="ti ti-device-floppy text-[15px]" />
                                {t("settings.saveChanges")}
                            </>
                        )}
                    </button>
                </div>

                {/* ── Error ─────────────────────────────────────────────────── */}
                {error && (
                    <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-[12.5px] text-red-500">
                        {error}
                    </div>
                )}

                {/* ── Grid ──────────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* ── Platform ──────────────────────────────────────────── */}
                    <Card>
                        <SectionHeader
                            icon={Settings2}
                            title={t("settings.platform")}
                            desc={t("settings.platformDesc")}
                        />
                        <SettingRow
                            label={t("settings.commissionRate")}
                            desc={t("settings.commissionRateDesc")}
                            control={
                                <NumInput
                                    value={platform.commissionRate}
                                    onChange={(v) =>
                                        setPlatform({
                                            ...platform,
                                            commissionRate: v,
                                        })
                                    }
                                    suffix="%"
                                    min={0}
                                    max={100}
                                />
                            }
                        />
                        <SettingRow
                            label={t("settings.subscriptionFee")}
                            desc={t("settings.subscriptionFeeDesc")}
                            control={
                                <NumInput
                                    value={platform.subscriptionFee}
                                    onChange={(v) =>
                                        setPlatform({
                                            ...platform,
                                            subscriptionFee: v,
                                        })
                                    }
                                    prefix="$"
                                    min={0}
                                />
                            }
                        />
                        <SettingRow
                            label={t("settings.featuredListingFee")}
                            desc={t("settings.featuredListingFeeDesc")}
                            control={
                                <NumInput
                                    value={platform.featuredListingFee}
                                    onChange={(v) =>
                                        setPlatform({
                                            ...platform,
                                            featuredListingFee: v,
                                        })
                                    }
                                    prefix="$"
                                    min={0}
                                />
                            }
                        />
                    </Card>

                    {/* ── Notifications ─────────────────────────────────────── */}
                    <Card>
                        <SectionHeader
                            icon={Bell}
                            title={t("settings.notifications")}
                            desc={t("settings.notificationsDesc")}
                        />
                        <SettingRow
                            label={t("settings.newDisputeAlerts")}
                            desc={t("settings.newDisputeAlertsDesc")}
                            control={
                                <Toggle
                                    checked={notifications.newDisputeAlerts}
                                    onChange={() =>
                                        toggleNotif("newDisputeAlerts")
                                    }
                                />
                            }
                        />
                        <SettingRow
                            label={t("settings.newOfficeRegistrations")}
                            desc={t("settings.newOfficeRegistrationsDesc")}
                            control={
                                <Toggle
                                    checked={
                                        notifications.newOfficeRegistrations
                                    }
                                    onChange={() =>
                                        toggleNotif("newOfficeRegistrations")
                                    }
                                />
                            }
                        />
                        <SettingRow
                            label={t("settings.dailyRevenueReport")}
                            desc={t("settings.dailyRevenueReportDesc")}
                            control={
                                <Toggle
                                    checked={notifications.dailyRevenueReport}
                                    onChange={() =>
                                        toggleNotif("dailyRevenueReport")
                                    }
                                />
                            }
                        />
                    </Card>

                    {/* ── Admin accounts ────────────────────────────────────── */}
                    <Card>
                        <SectionHeader
                            icon={ShieldCheck}
                            title={t("settings.adminAccounts")}
                            desc={t("settings.adminAccountsDesc")}
                        />
                        {admins.length === 0 ? (
                            <p className="px-5 py-4 text-[12.5px] text-[var(--text-muted)]">
                                {t("settings.noAdmins")}
                            </p>
                        ) : (
                            admins.map((admin) => (
                                <div
                                    key={admin.id}
                                    className="flex items-center justify-between px-5 py-4
                  border-b border-[var(--border-color)] last:border-none hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Avatar
                                            initials={admin.initials}
                                            size="md"
                                        />
                                        <div className="min-w-0">
                                            <p className="text-[13px] text-[var(--text-primary)]">
                                                {admin.name}
                                            </p>
                                            <p className="text-[11px] text-[var(--text-muted)] mt-0.5 truncate">
                                                {admin.email} ·{" "}
                                                {t("settings.admin")}
                                            </p>
                                        </div>
                                    </div>
                                    {admin.isYou ? (
                                        <Badge variant="blue">
                                            {t("settings.you")}
                                        </Badge>
                                    ) : removingId === admin.id ? (
                                        <span className="w-4 h-4 rounded-full border-2 border-[var(--border-color)] border-t-red-500 animate-spin" />
                                    ) : (
                                        <button
                                            onClick={() =>
                                                handleRemoveAdmin(admin.id)
                                            }
                                            title={t("settings.removeAdmin")}
                                            className="w-7 h-7 flex items-center justify-center rounded-lg
                      text-[var(--text-muted)] hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                                        >
                                            <i className="ti ti-trash text-[15px]" />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </Card>
                </div>
            </div>

            <SaveToast
                visible={toastVisible}
                message={t("settings.savedSuccess")}
            />
        </>
    );
};

export default Settings;
