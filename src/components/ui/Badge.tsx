import React from "react";

type Variant = "blue" | "green" | "amber" | "red" | "gray" | "purple";

interface BadgeProps {
    variant: Variant;
    children: React.ReactNode;
    className?: string;
}

const variantClasses: Record<Variant, string> = {
    blue: "bg-[rgba(37,99,235,0.12)]   text-blue-400   border border-[rgba(37,99,235,0.25)]",
    green: "bg-[rgba(34,197,94,0.12)]   text-green-400  border border-[rgba(34,197,94,0.25)]",
    amber: "bg-[rgba(245,158,11,0.12)]  text-amber-400  border border-[rgba(245,158,11,0.25)]",
    red: "bg-[rgba(248,113,113,0.12)] text-red-400    border border-[rgba(248,113,113,0.25)]",
    gray: "bg-white/[0.07]             text-white/55   border border-white/10",
    purple: "bg-[rgba(139,92,246,0.12)]  text-purple-400 border border-[rgba(139,92,246,0.25)]",
};

export const Badge: React.FC<BadgeProps> = ({
    variant,
    children,
    className = "",
}) => (
    <span
        className={`
      inline-flex items-center px-2 py-0.5 rounded-md
      text-[10.5px] font-medium whitespace-nowrap
      ${variantClasses[variant]} ${className}
    `}
    >
        {children}
    </span>
);
