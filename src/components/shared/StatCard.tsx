import React from "react";
import type { LucideIcon } from "lucide-react";

interface StatCardData {
    label: string;
    value: string;
    subText: string;
    trend: "up" | "down" | "neutral";
    icon: LucideIcon;
}

const trendClass = {
    up: "text-green-600 dark:text-green-400",
    down: "text-red-500 dark:text-red-400",
    neutral: "text-[var(--text-muted)]",
};

export const StatCard: React.FC<StatCardData> = ({
    label,
    value,
    subText,
    trend,
    icon: Icon,
}) => (
    <div
        className="
            bg-[var(--bg-secondary)]
            border border-[var(--border-color)]
            hover:border-black/20 dark:hover:border-white/[0.14]
            rounded-[10px] p-[0.95rem_1.1rem]
            transition-colors duration-150
        "
    >
        {/* Label row */}
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] mb-[7px]">
            <Icon size={14} />
            {label}
        </div>

        {/* Value */}
        <div className="font-['Syne',sans-serif] text-[23px] font-bold text-[var(--text-primary)] leading-none">
            {value}
        </div>

        {/* Sub-text */}
        <div className={`text-[11px] mt-1 ${trendClass[trend]}`}>{subText}</div>
    </div>
);
