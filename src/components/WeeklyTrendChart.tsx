/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { FootprintSummary, CommittedAction } from "../types";
import { TrendingDown, HelpCircle, CheckCircle, Info, Flame, Trees } from "lucide-react";

interface WeeklyTrendChartProps {
  footprint: FootprintSummary;
  committedActions: CommittedAction[];
  theme: "light" | "dark";
}

export default function WeeklyTrendChart({ footprint, committedActions, theme }: WeeklyTrendChartProps) {
  const [chartType, setChartType] = useState<"line" | "area">("area");
  
  // Calculate daily avg category emissions in kg (1 metric ton = 1000 kg)
  const transportDailyAvg = (footprint.transport * 1000) / 365;
  const energyDailyAvg = (footprint.energy * 1000) / 365;
  const dietDailyAvg = (footprint.diet * 1000) / 365;
  const wasteDailyAvg = (footprint.waste * 1000) / 365;

  // Day factor mappings to simulate realistic weekly load (wavy curve)
  const daysConfig = [
    {
      day: "Mon",
      name: "Monday",
      factors: { transport: 1.2, energy: 0.9, diet: 1.0, waste: 1.0 },
      actionIds: ["act-1", "act-3", "act-4", "act-7"]
    },
    {
      day: "Tue",
      name: "Tuesday",
      factors: { transport: 1.1, energy: 0.9, diet: 1.0, waste: 1.0 },
      actionIds: ["act-3", "act-4", "act-5", "act-7"]
    },
    {
      day: "Wed",
      name: "Wednesday",
      factors: { transport: 1.25, energy: 0.9, diet: 1.0, waste: 1.0 },
      actionIds: ["act-1", "act-3", "act-4", "act-7", "act-8"]
    },
    {
      day: "Thu",
      name: "Thursday",
      factors: { transport: 1.15, energy: 0.9, diet: 1.0, waste: 1.0 },
      actionIds: ["act-3", "act-4", "act-5", "act-7"]
    },
    {
      day: "Fri",
      name: "Friday",
      factors: { transport: 1.3, energy: 1.0, diet: 1.1, waste: 1.0 },
      actionIds: ["act-1", "act-3", "act-4", "act-7"]
    },
    {
      day: "Sat",
      name: "Saturday",
      factors: { transport: 0.4, energy: 1.25, diet: 1.0, waste: 1.0 },
      actionIds: ["act-2", "act-3", "act-4", "act-6", "act-7", "act-8"]
    },
    {
      day: "Sun",
      name: "Sunday",
      factors: { transport: 0.6, energy: 1.25, diet: 1.0, waste: 1.0 },
      actionIds: ["act-2", "act-3", "act-4", "act-6", "act-7"]
    }
  ];

  // Memoized trend dataset based on actions and questionnaire answers
  const chartData = useMemo(() => {
    // Separate pre-defined actions and custom actions
    const completedCustomActions = committedActions.filter(
      (a) => a.completed && !a.id.startsWith("act-")
    );
    
    // Average daily savings for custom actions (divided equally across 7 days)
    const customDailySavings = completedCustomActions.reduce((sum, a) => sum + a.co2SavedKg, 0) / 7;

    return daysConfig.map((item) => {
      // Calculate baseline per category
      const transportBas = transportDailyAvg * item.factors.transport;
      const energyBas = energyDailyAvg * item.factors.energy;
      const dietBas = dietDailyAvg * item.factors.diet;
      const wasteBas = wasteDailyAvg * item.factors.waste;
      const totalBaseline = transportBas + energyBas + dietBas + wasteBas;

      // Find savings for active checked default actions on this day
      let daySavings = 0;
      committedActions.forEach((act) => {
        if (act.completed && item.actionIds.includes(act.id)) {
          daySavings += act.co2SavedKg;
        }
      });

      // Add custom actions distributed savings
      daySavings += customDailySavings;

      // Cap the actual emissions so it doesn't go below zero
      const totalActual = Math.max(0.8, totalBaseline - daySavings);
      const actualSaved = Math.max(0, totalBaseline - totalActual);

      return {
        day: item.day,
        name: item.name,
        "Baseline (Kg CO2e)": Number(totalBaseline.toFixed(1)),
        "Actual Remaining (Kg CO2e)": Number(totalActual.toFixed(1)),
        "CO2e Offset Saved (Kg)": Number(actualSaved.toFixed(1)),
      };
    });
  }, [footprint, committedActions]);

  // Aggregate weekly statistics
  const totals = useMemo(() => {
    let baseSum = 0;
    let actSum = 0;
    chartData.forEach((row) => {
      baseSum += row["Baseline (Kg CO2e)"];
      actSum += row["Actual Remaining (Kg CO2e)"];
    });
    const savedSum = Math.max(0, baseSum - actSum);
    const reductionPercent = baseSum > 0 ? Math.round((savedSum / baseSum) * 100) : 0;
    return {
      baselineWeekly: Number(baseSum.toFixed(1)),
      actualWeekly: Number(actSum.toFixed(1)),
      savedWeekly: Number(savedSum.toFixed(1)),
      reductionPercent,
    };
  }, [chartData]);

  // Colors based on current theme for charting
  const colors = {
    grid: theme === "dark" ? "rgba(16, 185, 129, 0.1)" : "rgba(226, 232, 240, 0.8)",
    baselineStroke: theme === "dark" ? "#ef4444" : "#dc2626", // Red for baseline high emissions
    actualStroke: theme === "dark" ? "#10b981" : "#059669", // Emerald for clean actual emissions
    tooltipBg: theme === "dark" ? "#090f0c" : "#ffffff",
    tooltipBorder: theme === "dark" ? "rgba(16, 185, 129, 0.3)" : "#e2e8f0",
    text: theme === "dark" ? "#94a3b8" : "#475569",
    fillBaseline: theme === "dark" ? "url(#baselineGradDark)" : "url(#baselineGradLight)",
    fillActual: theme === "dark" ? "url(#actualGradDark)" : "url(#actualGradLight)"
  };

  return (
    <div className={`p-6 rounded-3xl border transition-all duration-300 ${
      theme === "dark" 
        ? "bg-[#090f0c] border-[#10b981]/25 text-white shadow-[0_4px_30px_rgba(16,185,129,0.06)]" 
        : "bg-white border-slate-200 text-black shadow-lg"
    }`}>
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 mb-5 border-slate-200/55 dark:border-emerald-500/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
            </span>
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider">Weekly Emission Trends</h4>
              <p className="text-[10px] text-slate-400 font-semibold uppercase leading-none">Real-time Activity Simulator</p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#020403] rounded-xl p-1 border border-slate-200/50 dark:border-emerald-500/10 self-start sm:self-center">
          <button
            onClick={() => setChartType("area")}
            className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all cursor-pointer ${
              chartType === "area"
                ? "bg-emerald-500 text-white dark:bg-emerald-400 dark:text-black shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Area View
          </button>
          <button
            onClick={() => setChartType("line")}
            className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all cursor-pointer ${
              chartType === "line"
                ? "bg-emerald-500 text-white dark:bg-emerald-400 dark:text-black shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Line View
          </button>
        </div>
      </div>

      {/* Mini stats widgets above the chart */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#050806] border border-slate-100 dark:border-emerald-500/5">
          <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Weekly Baseline</p>
          <p className="text-sm font-black text-rose-500">{totals.baselineWeekly} Kg CO2e</p>
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#050806] border border-slate-100 dark:border-emerald-500/5">
          <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Weekly Actual</p>
          <p className="text-sm font-black text-emerald-500">{totals.actualWeekly} Kg CO2e</p>
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#050806] border border-slate-100 dark:border-emerald-500/5">
          <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Weekly Deficit</p>
          <p className="text-sm font-black text-emerald-400">-{totals.savedWeekly} Kg Saved</p>
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#050806] border border-slate-100 dark:border-emerald-500/5 flex items-center justify-between">
          <div>
            <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Reduction rate</p>
            <p className="text-sm font-black text-cyan-400">{totals.reductionPercent}% Off</p>
          </div>
          <div className="text-xs">
            {totals.reductionPercent > 20 ? "🏆" : "🌱"}
          </div>
        </div>
      </div>

      {/* Main Chart Stage */}
      <div className="h-64 sm:h-72 w-full pr-1">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "area" ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                {/* Dark Gradient */}
                <linearGradient id="baselineGradDark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="actualGradDark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>

                {/* Light Gradient */}
                <linearGradient id="baselineGradLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="actualGradLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
              <XAxis 
                dataKey="day" 
                stroke={colors.text} 
                fontSize={10} 
                tickLine={false} 
                fontFamily="Courier New, monospace" 
                fontWeight="bold"
              />
              <YAxis 
                stroke={colors.text} 
                fontSize={10} 
                tickLine={false}
                axisLine={false}
                fontFamily="Courier New, monospace" 
                fontWeight="bold"
                unit="k"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: colors.tooltipBg,
                  borderColor: colors.tooltipBorder,
                  borderRadius: "16px",
                  fontSize: "11px",
                  fontWeight: "bold",
                  color: theme === "dark" ? "#ffffff" : "#000000",
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={32} 
                iconType="circle"
                wrapperStyle={{ fontSize: "11px", fontWeight: "bold", fontFamily: "Courier New, monospace" }}
              />
              <Area 
                type="monotone" 
                dataKey="Baseline (Kg CO2e)" 
                stroke={colors.baselineStroke} 
                strokeWidth={2.5}
                fill={colors.fillBaseline} 
              />
              <Area 
                type="monotone" 
                dataKey="Actual Remaining (Kg CO2e)" 
                stroke={colors.actualStroke} 
                strokeWidth={2.5}
                fill={colors.fillActual} 
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
              <XAxis 
                dataKey="day" 
                stroke={colors.text} 
                fontSize={10} 
                tickLine={false} 
                fontFamily="Courier New, monospace" 
                fontWeight="bold"
              />
              <YAxis 
                stroke={colors.text} 
                fontSize={10} 
                tickLine={false}
                axisLine={false}
                fontFamily="Courier New, monospace" 
                fontWeight="bold"
                unit="k"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: colors.tooltipBg,
                  borderColor: colors.tooltipBorder,
                  borderRadius: "16px",
                  fontSize: "11px",
                  fontWeight: "bold",
                  color: theme === "dark" ? "#ffffff" : "#000000",
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={32} 
                iconType="circle"
                wrapperStyle={{ fontSize: "11px", fontWeight: "bold", fontFamily: "Courier New, monospace" }}
              />
              <Line 
                type="monotone" 
                dataKey="Baseline (Kg CO2e)" 
                stroke={colors.baselineStroke} 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 1 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="Actual Remaining (Kg CO2e)" 
                stroke={colors.actualStroke} 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 1 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Explanatory footer tag */}
      <div className="mt-4 flex items-start gap-2 text-[10px] text-slate-400 font-semibold leading-relaxed bg-slate-50 dark:bg-[#050806] border border-slate-100 dark:border-emerald-900/10 p-3 rounded-2xl">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <span>
          <strong>How this works:</strong> The red trend is your calculated weekly baseline based on your transport, energy, and diet questionnaire inputs. The green trend shows actual remaining daily emissions after applying live savings from checked habits. Toggle the actions in the right panel to watch your green trend slide downwards in real-time!
        </span>
      </div>
    </div>
  );
}
