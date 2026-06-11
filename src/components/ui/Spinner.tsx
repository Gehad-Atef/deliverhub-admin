import React from "react";

interface SpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizeMap = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };

export const Spinner: React.FC<SpinnerProps> = ({
    size = "md",
    className = "",
}) => (
    <div
        role="status"
        aria-label="Loading"
        className={`
      ${sizeMap[size]} rounded-full border-2
      border-white/10 border-t-blue-500
      animate-spin ${className}
    `}
    />
);
