/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sun, Moon, Eye } from "lucide-react";

export type ThemeMode = "light" | "dark";

interface ThemeSelectorProps {
  currentTheme: ThemeMode;
  onChangeTheme: (theme: ThemeMode) => void;
}

export default function ThemeSelector({ currentTheme, onChangeTheme }: ThemeSelectorProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
      <button
        onClick={() => onChangeTheme("light")}
        id="theme-btn-light"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-250 cursor-pointer ${
          currentTheme === "light"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        }`}
        title="Light Mode"
        aria-label="Light Mode"
      >
        <Sun className="w-3.5 h-3.5" />
        <span className="hidden md:inline">Light</span>
      </button>

      <button
        onClick={() => onChangeTheme("dark")}
        id="theme-btn-dark"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-250 cursor-pointer ${
          currentTheme === "dark"
            ? "bg-slate-900 text-slate-100 dark:bg-slate-850 shadow-sm"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        }`}
        title="Dark Mode"
        aria-label="Dark Mode"
      >
        <Moon className="w-3.5 h-3.5" />
        <span className="hidden md:inline">Dark</span>
      </button>
    </div>
  );
}
