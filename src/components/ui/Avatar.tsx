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
        bg-black/[0.06] dark:bg-white/[0.08] border border-[var(--border-color)] font-medium text-[var(--text-secondary)]
        ${className}
      `}
        >
            {initials}
        </div>
    );
};
