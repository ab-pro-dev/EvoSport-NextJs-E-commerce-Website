"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  variant?: "customer" | "admin";
}

export function ThemeToggle({ className = "", variant = "customer" }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
          variant === "admin"
            ? "border-neutral-800 bg-neutral-900 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900"
            : "border-gray-200 bg-white/80 text-[#0F1B2D]/60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
        } ${className}`}
        disabled
      >
        <span className="h-4 w-4" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  if (variant === "admin") {
    return (
      <button
        onClick={handleToggle}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all hover:scale-105 active:scale-95 ${
          isDark
            ? "border-neutral-800 bg-neutral-900 text-amber-400 hover:border-neutral-700 hover:bg-neutral-800"
            : "border-gray-200 bg-white text-rose-600 hover:border-gray-300 hover:bg-gray-50 shadow-sm"
        } ${className}`}
      >
        {isDark ? (
          <Sun className="h-4 w-4 transition-transform duration-300 rotate-0 hover:rotate-45" />
        ) : (
          <Moon className="h-4 w-4 transition-transform duration-300 rotate-0 hover:-rotate-12" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all hover:scale-105 active:scale-95 ${
        isDark
          ? "border-slate-800 bg-slate-900/90 text-amber-300 hover:border-[#B8FF00]/50 hover:bg-slate-800 shadow-sm"
          : "border-gray-200 bg-white text-[#0F1B2D] hover:border-[#B8FF00] hover:bg-[#F4F8FC] shadow-sm"
      } ${className}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 transition-transform duration-300 rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
}
