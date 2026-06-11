import type { Config } from "tailwindcss";

export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                syne: ["Syne", "sans-serif"],
                dm: ["DM Sans", "sans-serif"],
            },
            colors: {
                navy: {
                    DEFAULT: "#0b1120",
                    mid: "#131d2e",
                    light: "#1e2d44",
                },
            },
        },
    },
    plugins: [],
} satisfies Config;
