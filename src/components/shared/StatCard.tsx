import React from "react";
import type { StatCardData } from "../../types/dashboard";

interface StatCardProps extends StatCardData {}

const trendClass = {
    up: "text-green-400",
    down: "text-red-400",
    neutral: "text-white/55",
};

export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    subText,
    trend,
    icon,
}) => (
    <div
        className="
    bg-[#131d2e] border border-white/[0.08] rounded-[10px] p-[0.95rem_1.1rem]
    hover:border-white/[0.14] transition-colors duration-150
  "
    >
        {/* Label row */}
        <div className="flex items-center gap-1.5 text-[11px] text-white/35 mb-[7px]">
            <i className={`${icon} text-[14px]`} />
            {label}
        </div>

        {/* Value */}
        <div className="font-['Syne',sans-serif] text-[23px] font-bold text-white leading-none">
            {value}
        </div>

        {/* Sub-text */}
        <div className={`text-[11px] mt-1 ${trendClass[trend]}`}>{subText}</div>
    </div>
);
