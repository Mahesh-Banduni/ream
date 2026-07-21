"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — only render after mount
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "grid size-8 place-items-center rounded-lg border border-border/60 bg-card",
          className
        )}
        aria-hidden
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      id="theme-toggle"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "cursor-pointer group relative grid size-8 place-items-center overflow-hidden rounded-lg border border-border/60 bg-card text-muted-foreground transition-all duration-200 hover:border-primary/30 hover:bg-primary/8 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        className
      )}
    >
      {/* Sun icon — shown in light mode */}
      <Sun
        className={cn(
          "absolute size-4 transition-all duration-300",
          isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
        )}
      />
      {/* Moon icon — shown in dark mode */}
      <Moon
        className={cn(
          "absolute size-4 transition-all duration-300",
          isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
        )}
      />
    </button>
  );
}
