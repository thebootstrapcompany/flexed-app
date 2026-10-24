"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button
                variant="ghost"
                size="icon"
                className="size-9 rounded-full"
                aria-label="Toggle theme"
            />
        );
    }

    const isDark = resolvedTheme === "dark";

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="size-9 rounded-full"
            aria-label="Toggle theme"
        >
            {isDark ? (
                <Sun className="size-4.5" />
            ) : (
                <Moon className="size-4.5" />
            )}
        </Button>
    );
}