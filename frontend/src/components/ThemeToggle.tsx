"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-10 w-10 rounded-xl border-2 border-slate-900 bg-amber-100 shadow-[2px_2px_0px_#0f172a]"></div>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Switch to Day Mode ☀️" : "Switch to Night Mode 🌙"}
      className="cartoon-btn h-10 w-10 p-0 bg-amber-300 hover:bg-amber-200 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-slate-900 dark:text-amber-300"
    >
      {isDark ? (
        <Sun className="h-5 w-5 animate-spin-slow transition-transform hover:rotate-45" />
      ) : (
        <Moon className="h-5 w-5 transition-transform hover:-rotate-12" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
