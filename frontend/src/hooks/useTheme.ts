import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem("theme") as Theme | null;

        if (saved) return saved;

        return window.matchMedia("(prefers-color-scheme: dark)")
            .matches
            ? "dark"
            : "light";
    });

    useEffect(() => {
        document.documentElement.setAttribute(
            "data-theme",
            theme
        );

        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev =>
            prev === "light" ? "dark" : "light"
        );
    };

    return {
        theme,
        toggleTheme,
    };
}