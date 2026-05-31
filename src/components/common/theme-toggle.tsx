"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme, type Theme } from "@/components/providers/theme-provider";

const ORDER: Theme[] = ["light", "dark", "system"];

const LABELS: Record<Theme, string> = {
  light: "Thème clair",
  dark: "Thème sombre",
  system: "Thème système"
};

function ThemeIcon({ theme, className }: { theme: Theme; className?: string }) {
  if (theme === "light") return <Sun className={className} strokeWidth={2} aria-hidden />;
  if (theme === "dark") return <Moon className={className} strokeWidth={2} aria-hidden />;
  return <Monitor className={className} strokeWidth={2} aria-hidden />;
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const cycle = () => {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
    setTheme(next);
  };

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={LABELS[theme]}
      title={mounted ? LABELS[theme] : "Thème"}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50",
        className
      )}
    >
      <ThemeIcon theme={mounted ? theme : "light"} className="h-4 w-4" />
    </button>
  );
}

export function ThemeSegmented({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const active = mounted ? theme : "light";

  return (
    <div
      role="radiogroup"
      aria-label="Choix du thème"
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-border bg-muted/60 p-1",
        className
      )}
    >
      {ORDER.map((option) => {
        const isActive = active === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setTheme(option)}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "bg-card text-foreground shadow-ride-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ThemeIcon theme={option} className="h-4 w-4" />
            <span>{option === "light" ? "Clair" : option === "dark" ? "Sombre" : "Système"}</span>
          </button>
        );
      })}
    </div>
  );
}
