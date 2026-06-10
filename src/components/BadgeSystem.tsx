/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { Award, Shield, Zap, Flame, Trees, Sparkles, CheckCircle2, Lock, Trophy, Heart, BadgeCheck, Compass } from "lucide-react";
import { FootprintSummary } from "../types";
import { motion } from "motion/react";

interface Badge {
  id: string;
  name: string;
  description: string;
  requirement: string;
  icon: React.ComponentType<any>;
  color: string;
  unlocked: boolean;
}

interface BadgeSystemProps {
  footprint: FootprintSummary;
  completedCount: number;
  annualCo2SavedTons: number;
  theme: "light" | "dark";
}

export default function BadgeSystem({ footprint, completedCount, annualCo2SavedTons, theme }: BadgeSystemProps) {
  // Derive current metrics
  const streakDays = (completedCount * 3) + 1;
  const saplingsCount = Math.max(0, Math.round(annualCo2SavedTons * 45));

  // Determine badges list dynamically based on user state
  const badges = useMemo<Badge[]>(() => [
    {
      id: "pioneer",
      name: "Pledge Pioneer",
      description: "Successfully submitted your first carbon ledger plan and pledged to track your emissions.",
      requirement: "Calculate footprint",
      icon: Compass,
      color: "from-blue-400 to-indigo-500",
      unlocked: footprint.total > 0, // Unlocked if they calculated footprint (non-zero or non-empty initial answers)
    },
    {
      id: "first-habit",
      name: "Eco Novice",
      description: "Take small actions. Committing to at least one daily habit to offset greenhouse footprint.",
      requirement: "1+ Commited Habit",
      icon: Heart,
      color: "from-teal-400 to-emerald-500",
      unlocked: completedCount >= 1,
    },
    {
      id: "habit-streak",
      name: "Habit Warrior",
      description: "Maintain a carbon-savvy active streak of 5 or more simulated days live.",
      requirement: "Streak >= 5 Days",
      icon: Flame,
      color: "from-amber-400 to-orange-500",
      unlocked: streakDays >= 5,
    },
    {
      id: "crusader",
      name: "Carbon Crusader",
      description: "Hit an annual carbon offset calculation rate of over 0.5 metric tons.",
      requirement: "Save >= 0.5 Tons/Yr",
      icon: Shield,
      color: "from-pink-500 to-rose-450",
      unlocked: annualCo2SavedTons >= 0.5,
    },
    {
      id: "champion",
      name: "Climate Champion",
      description: "Achieve significant direct savings of 1.5 tons of annual carbon offsets.",
      requirement: "Save >= 1.5 Tons/Yr",
      icon: Trophy,
      color: "from-yellow-400 to-amber-500",
      unlocked: annualCo2SavedTons >= 1.5,
    },
    {
      id: "forest-maker",
      name: "Forest Guardian",
      description: "Equivalent saving potential matches a young forest cluster of 40 or more growing saplings.",
      requirement: "Trees power >= 40/Yr",
      icon: Trees,
      color: "from-emerald-400 to-green-600",
      unlocked: saplingsCount >= 40,
    },
    {
      id: "green-titan",
      name: "Green Titan",
      description: "Ultimate milestone: At least 15 days active streak and 1.0 ton CO2e annual offsets.",
      requirement: "15+ Streak & 1.0T+ Saved",
      icon: Sparkles,
      color: "from-purple-500 to-violet-600",
      unlocked: streakDays >= 15 && annualCo2SavedTons >= 1.0,
    }
  ], [footprint, completedCount, annualCo2SavedTons, streakDays, saplingsCount]);

  const unlockedCount = useMemo(() => badges.filter(b => b.unlocked).length, [badges]);
  const progressPercent = Math.round((unlockedCount / badges.length) * 100);

  return (
    <div className={`p-6 rounded-3xl border transition-all duration-300 ${
      theme === "dark" 
        ? "bg-[#090f0c] border-[#10b981]/25 text-white shadow-[0_4px_30px_rgba(16,185,129,0.06)]" 
        : "bg-white border-slate-200 text-black shadow-lg"
    }`}>
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 mb-5 border-slate-200/55 dark:border-emerald-500/10">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Award className="w-4 h-4 text-emerald-400 animate-bounce" />
          </span>
          <div>
            <h4 className="text-sm font-black uppercase tracking-wider">Digital Badge Milestones</h4>
            <p className="text-[10px] text-slate-400 font-semibold uppercase leading-none">Sustainability Achievements</p>
          </div>
        </div>

        {/* Counter Badge */}
        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
          {unlockedCount} of {badges.length} Unlocked
        </span>
      </div>

      {/* Progress Bar for Badges */}
      <div className="mb-6 space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400">
          <span>Overall Badge Journey</span>
          <span className="text-emerald-400 font-black">{progressPercent}% Completed</span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-[#020403] rounded-full overflow-hidden border border-slate-200/50 dark:border-emerald-500/10">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
          />
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {badges.map((badge) => {
          const Icon = badge.icon;
          return (
            <div 
              key={badge.id}
              className={`relative p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                badge.unlocked 
                  ? theme === "dark"
                    ? "bg-gradient-to-b from-[#0e1612] to-[#090f0c] border-[#10b981]/35 shadow-[0_4px_20px_rgba(16,185,129,0.04)]"
                    : "bg-gradient-to-b from-white to-slate-50 border-emerald-400/30 shadow-md"
                  : theme === "dark"
                  ? "bg-[#040806]/60 border-slate-900 text-slate-500 opacity-60"
                  : "bg-slate-100/70 border-slate-200 text-slate-400 opacity-60"
              }`}
            >
              {/* Unlocked check badge on top right */}
              {badge.unlocked && (
                <span className="absolute top-3 right-3 text-emerald-400">
                  <BadgeCheck className="w-5 h-5 fill-emerald-500/10" />
                </span>
              )}

              <div className="space-y-3">
                {/* Badge Icon circle */}
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border shrink-0 ${
                    badge.unlocked 
                      ? `bg-gradient-to-br ${badge.color} text-white shadow-[0_0_12px_rgba(16,185,129,0.2)] border-white/10` 
                      : "bg-slate-200 dark:bg-[#020403] text-slate-400 border-slate-300 dark:border-slate-800"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className={`text-xs font-black uppercase tracking-wider ${badge.unlocked ? "text-slate-800 dark:text-white" : "text-slate-400"}`}>
                      {badge.name}
                    </h5>
                    <span className="block text-[8px] font-mono font-bold uppercase tracking-widest text-slate-400">
                      {badge.requirement}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] leading-relaxed font-medium text-slate-500 dark:text-slate-400">
                  {badge.description}
                </p>
              </div>

              {/* Status Indicator */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-emerald-500/5 flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                <span className={badge.unlocked ? "text-emerald-500" : "text-slate-400"}>
                  {badge.unlocked ? "Unlocked Badge" : "Locked Badge"}
                </span>
                {!badge.unlocked && <Lock className="w-3 h-3 text-slate-400" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
