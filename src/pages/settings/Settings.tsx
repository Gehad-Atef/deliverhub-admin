import React, { useState } from "react";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { Bell, ShieldCheck, Settings2 } from "lucide-react";

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
    role: "super_admin" | "moderator";
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
      ${checked ? "bg-blue-600" : "bg-white/[0.12]"}`}
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
            <span className="text-[13px] text-white/40 font-medium">
                {prefix}
            </span>
        )}
        <input
            type="number"
            value={value}
            min={min}
            max={max}
            onChange={(e) => onChange(Number(e.target.value))}
            className="
        w-[88px] bg-[#0b1120] border border-white/[0.10] rounded-lg
        px-3 py-2 text-[13px] text-white text-right
        outline-none focus:border-blue-500/60 focus:bg-[#0f1827] transition-all
        font-['DM_Sans',sans-serif]
        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
        [&::-webkit-inner-spin-button]:appearance-none
      "
        />
        {suffix && (
            <span className="text-[13px] text-white/40 font-medium">
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
    <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.07]">
        <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/20 flex items-center justify-center">
            <Icon size={18} className="text-blue-400" />
        </div>

        <div>
            <p className="text-[13.5px] font-semibold text-white">{title}</p>
            <p className="text-[11px] text-white/35 mt-0.5">{desc}</p>
        </div>
    </div>
);

// ─── Setting Row ──────────────────────────────────────────────────────────────
const SettingRow: React.FC<{
    label: string;
    desc: string;
    control: React.ReactNode;
}> = ({ label, desc, control }) => (
    <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3
    px-5 py-4 border-b border-white/[0.06] last:border-none hover:bg-white/[0.02] transition-colors"
    >
        <div className="min-w-0">
            <p className="text-[13px] text-white/90">{label}</p>
            <p className="text-[11.5px] text-white/35 mt-0.5 leading-relaxed">
                {desc}
            </p>
        </div>
        <div className="flex-shrink-0">{control}</div>
    </div>
);

// ─── Card wrapper ─────────────────────────────────────────────────────────────
const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-[#131d2e] border border-white/[0.08] rounded-xl overflow-hidden">
        {children}
    </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
const SaveToast: React.FC<{ visible: boolean }> = ({ visible }) => (
    <div
        className={`
    fixed bottom-6 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap
    flex items-center gap-2 px-4 py-2.5 rounded-xl
    bg-[#131d2e] border border-green-500/30 shadow-2xl shadow-black/50
    text-[12.5px] text-green-400 font-medium transition-all duration-300
    ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"}
  `}
    >
        <i className="ti ti-circle-check text-[15px]" />
        Changes saved successfully
    </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const INITIAL_ADMINS: AdminAccount[] = [
    {
        id: "a1",
        initials: "AD",
        name: "Admin",
        email: "admin@deliverhub.com",
        role: "super_admin",
        isYou: true,
    },
    {
        id: "a2",
        initials: "MH",
        name: "Mohamed Hassan",
        email: "m.hassan@deliverhub.com",
        role: "moderator",
        isYou: false,
    },
];

const Settings: React.FC = () => {
    const [platform, setPlatform] = useState<PlatformSettings>({
        commissionRate: 7,
        subscriptionFee: 49,
        featuredListingFee: 19,
    });
    const [notifications, setNotifications] = useState<NotificationSettings>({
        newDisputeAlerts: true,
        newOfficeRegistrations: false,
        dailyRevenueReport: false,
    });
    const [admins, setAdmins] = useState<AdminAccount[]>(INITIAL_ADMINS);
    const [saving, setSaving] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);

    const toggleNotif = (k: keyof NotificationSettings) =>
        setNotifications((p) => ({ ...p, [k]: !p[k] }));
    const removeAdmin = (id: string) =>
        setAdmins((p) => p.filter((a) => a.id !== id));
    const handleSave = async () => {
        setSaving(true);
        await new Promise((r) => setTimeout(r, 600));
        setSaving(false);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2500);
    };

    return (
        <>
            <div className="w-full space-y-6">
                {/* ── Page title ──────────────────────────────────────────────── */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-['Syne',sans-serif] text-[20px] font-bold text-white">
                            Settings
                        </h1>
                        <p className="text-[12.5px] text-white/35 mt-0.5">
                            Manage platform configuration and preferences
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
                                Saving…
                            </>
                        ) : (
                            <>
                                <i className="ti ti-device-floppy text-[15px]" />
                                Save changes
                            </>
                        )}
                    </button>
                </div>

                {/* ── Two-column grid on lg+ ────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* ── Platform ──────────────────────────────────────────────── */}
                    <Card>
                        <SectionHeader
                            icon={Settings2}
                            title="Platform"
                            desc="Fees and commission settings"
                        />
                        <SettingRow
                            label="Commission rate"
                            desc="Percentage taken from each delivery fee"
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
                                    min={1}
                                    max={20}
                                />
                            }
                        />
                        <SettingRow
                            label="Office subscription fee"
                            desc="Monthly fee for offices on the platform"
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
                                />
                            }
                        />
                        <SettingRow
                            label="Featured listing fee"
                            desc="One-time fee to appear at top of results"
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
                                />
                            }
                        />
                    </Card>

                    {/* ── Notifications ─────────────────────────────────────────── */}
                    <Card>
                        <SectionHeader
                            icon={Bell}
                            title="Notifications"
                            desc="Control what alerts you receive"
                        />
                        <SettingRow
                            label="New dispute alerts"
                            desc="Notify admin when a new dispute is opened"
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
                            label="New office registrations"
                            desc="Notify when a new office requests approval"
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
                            label="Daily revenue report"
                            desc="Send daily summary at midnight"
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

                    {/* ── Admin accounts ────────────────────────────────────────── */}
                    <Card>
                        <SectionHeader
                            icon={ShieldCheck}
                            title="Admin Accounts"
                            desc="Manage who has admin access"
                        />
                        {admins.map((admin) => (
                            <div
                                key={admin.id}
                                className="flex items-center justify-between px-5 py-4
                  border-b border-white/[0.06] last:border-none hover:bg-white/[0.02] transition-colors"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <Avatar
                                        initials={admin.initials}
                                        size="md"
                                    />
                                    <div className="min-w-0">
                                        <p className="text-[13px] text-white/90">
                                            {admin.name}
                                        </p>
                                        <p className="text-[11px] text-white/35 mt-0.5 truncate">
                                            {admin.email} ·{" "}
                                            {admin.role === "super_admin"
                                                ? "Super admin"
                                                : "Moderator"}
                                        </p>
                                    </div>
                                </div>
                                {admin.isYou ? (
                                    <Badge variant="blue">You</Badge>
                                ) : (
                                    <button
                                        onClick={() => removeAdmin(admin.id)}
                                        title="Remove admin"
                                        className="w-7 h-7 flex items-center justify-center rounded-lg
                      text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                                    >
                                        <i className="ti ti-trash text-[15px]" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </Card>
                </div>
            </div>

            <SaveToast visible={toastVisible} />
        </>
    );
};

export default Settings;
