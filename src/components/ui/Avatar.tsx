import React from "react";

interface AvatarProps {
    initials: string;
    size?: "sm" | "md";
    className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
    initials,
    size = "sm",
    className = "",
}) => {
    const sizeClass =
        size === "sm" ? "w-7 h-7 text-[10px]" : "w-8 h-8 text-[11px]";
    return (
        <div
            className={`
        ${sizeClass} rounded-full flex-shrink-0 flex items-center justify-center
        bg-[#1e2d44] border border-white/[0.08] font-medium text-white/55
        ${className}
      `}
        >
            {initials}
        </div>
    );
};
