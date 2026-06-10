/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { 
  Leaf, 
  Car, 
  Flame, 
  Utensils, 
  Trash2, 
  CheckCircle, 
  Activity, 
  Sparkles, 
  ArrowUp, 
  ArrowDown, 
  RefreshCw, 
  Globe, 
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  LogOut,
  User,
  Check
} from "lucide-react";
import { QuestionnaireAnswers, FootprintSummary, AIResult, CommittedAction } from "./types";
import { calculateFootprint, INITIAL_ANSWERS, INITIAL_ACTIONS } from "./utils";
import ThemeSelector, { ThemeMode } from "./components/ThemeSelector";
import AuthPage from "./components/AuthPage";
import VoiceAssistant from "./components/VoiceAssistant";
import WeeklyTrendChart from "./components/WeeklyTrendChart";
import BadgeSystem from "./components/BadgeSystem";
import { motion } from "motion/react";

// Performance-optimized falling flower petals / leaves animation component
function FallingFlowersBg() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const handleResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.width = canvasRef.current.offsetWidth;
        height = canvasRef.current.height = canvasRef.current.offsetHeight;
      }
    };
    window.addEventListener("resize", handleResize);

    // Initialise elements to look like organic cherry blossoms / circular flower petals / leaves
    interface OrganicPetal {
      x: number;
      y: number;
      size: number;
      spin: number;
      spinSpeed: number;
      speedY: number;
      speedX: number;
      hue: number;
      type: "leaf" | "petal";
    }

    const items: OrganicPetal[] = Array.from({ length: 24 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height - height,
      size: Math.random() * 5 + 3,
      spin: Math.random() * Math.PI * 2,
      spinSpeed: (Math.random() - 0.5) * 0.02,
      speedY: Math.random() * 0.4 + 0.2, // slow falling
      speedX: (Math.random() - 0.5) * 0.15,
      hue: Math.random() > 0.4 ? 142 : 160, // Emerald to mint green
      type: Math.random() > 0.5 ? "leaf" : "petal",
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      items.forEach((item) => {
        item.y += item.speedY;
        item.x += item.speedX;
        item.spin += item.spinSpeed;

        // Reset if goes off screen
        if (item.y > height) {
          item.y = -15;
          item.x = Math.random() * width;
        }
        if (item.x > width) item.x = 0;
        if (item.x < 0) item.x = width;

        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.spin);

        if (item.type === "petal") {
          // Draw simple translucent circular flower petal
          ctx.fillStyle = `hsla(${item.hue}, 70%, 75%, 0.14)`;
          ctx.beginPath();
          ctx.arc(0, 0, item.size, 0, Math.PI * 2);
          ctx.fill();

          // Core
          ctx.fillStyle = `hsla(${item.hue}, 80%, 50%, 0.18)`;
          ctx.beginPath();
          ctx.arc(1, 1, item.size / 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Draw pointed botanical leaf
          ctx.fillStyle = `hsla(${item.hue}, 65%, 45%, 0.16)`;
          ctx.beginPath();
          ctx.ellipse(0, 0, item.size, item.size / 1.8, 0, 0, Math.PI * 2);
          ctx.fill();

          // Simple leaf spine
          ctx.strokeStyle = `rgba(255, 255, 255, 0.12)`;
          ctx.beginPath();
          ctx.moveTo(-item.size, 0);
          ctx.lineTo(item.size, 0);
          ctx.stroke();
        }

        ctx.restore();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden" />;
}

export default function App() {
  // Theme state: light, dark (Natural Tones main), high-contrast
  const [theme, setTheme] = useState<ThemeMode>("dark");

  // User state: active logged-in profile
  const [user, setUser] = useState<{ email: string; name: string } | null>(() => {
    const cachedUser = localStorage.getItem("ecotrace_active_user");
    if (cachedUser) {
      try {
        return JSON.parse(cachedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [answers, setAnswers] = useState<QuestionnaireAnswers>(INITIAL_ANSWERS);
  const [committedActions, setCommittedActions] = useState<CommittedAction[]>(INITIAL_ACTIONS);
  const [customActionName, setCustomActionName] = useState("");
  const [customActionSavings, setCustomActionSavings] = useState(2);
  const [customActionCat, setCustomActionCat] = useState<"transport" | "energy" | "diet" | "waste">("energy");

  // Footprint calculation
  const footprint = useMemo(() => calculateFootprint(answers), [answers]);

  // AI Insights generation state
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // General Notification Alert banner
  const [alert, setAlert] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Active calculator tab
  const [activeTab, setActiveTab] = useState<"transport" | "energy" | "diet" | "waste">("transport");

  const triggerAlert = (message: string, type: "success" | "error" | "info" = "success") => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert(null);
    }, 4500);
  };

  // Change html root element class according to selected theme
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    
    if (theme === "light") {
      root.classList.add("light");
    } else if (theme === "dark") {
      root.classList.add("dark");
    }
  }, [theme]);

  // Load user data on login or session load
  useEffect(() => {
    if (!user) {
      setAnswers(INITIAL_ANSWERS);
      setCommittedActions(INITIAL_ACTIONS);
      setAiResult(null);
      return;
    }

    const email = user.email;

    // Load user answers
    const cachedAnswers = localStorage.getItem(`ecotrace_answers_${email}`);
    if (cachedAnswers) {
      try {
        setAnswers(JSON.parse(cachedAnswers));
      } catch (e) {
        setAnswers(INITIAL_ANSWERS);
      }
    } else {
      // standard fallback or initial
      const standardCached = localStorage.getItem("ecotrace_answers");
      if (standardCached) {
        try {
          const parsed = JSON.parse(standardCached);
          setAnswers(parsed);
          localStorage.setItem(`ecotrace_answers_${email}`, standardCached);
        } catch (e) {
          setAnswers(INITIAL_ANSWERS);
        }
      } else {
        setAnswers(INITIAL_ANSWERS);
      }
    }

    // Load user actions
    const cachedActions = localStorage.getItem(`ecotrace_actions_${email}`);
    if (cachedActions) {
      try {
        setCommittedActions(JSON.parse(cachedActions));
      } catch (e) {
        setCommittedActions(INITIAL_ACTIONS);
      }
    } else {
      const standardActions = localStorage.getItem("ecotrace_actions");
      if (standardActions) {
        try {
          const parsed = JSON.parse(standardActions);
          setCommittedActions(parsed);
          localStorage.setItem(`ecotrace_actions_${email}`, standardActions);
        } catch (e) {
          setCommittedActions(INITIAL_ACTIONS);
        }
      } else {
        setCommittedActions(INITIAL_ACTIONS);
      }
    }

    // Load user AI insights
    const cachedAi = localStorage.getItem(`ecotrace_ai_insights_${email}`);
    if (cachedAi) {
      try {
        setAiResult(JSON.parse(cachedAi));
      } catch (e) {
        setAiResult(null);
      }
    } else {
      const standardAi = localStorage.getItem("ecotrace_ai_insights");
      if (standardAi) {
        try {
          const parsed = JSON.parse(standardAi);
          setAiResult(parsed);
          localStorage.setItem(`ecotrace_ai_insights_${email}`, standardAi);
        } catch (e) {
          setAiResult(null);
        }
      } else {
        setAiResult(null);
      }
    }
  }, [user]);

  // Save changes to localStorage for local durability
  const handleAnswersChange = (newAnswers: QuestionnaireAnswers) => {
    setAnswers(newAnswers);
    if (user) {
      localStorage.setItem(`ecotrace_answers_${user.email}`, JSON.stringify(newAnswers));
    } else {
      localStorage.setItem("ecotrace_answers", JSON.stringify(newAnswers));
    }
  };

  const handleActionToggle = (actionId: string) => {
    const updated = committedActions.map((act) => 
      act.id === actionId ? { ...act, completed: !act.completed } : act
    );
    setCommittedActions(updated);
    if (user) {
      localStorage.setItem(`ecotrace_actions_${user.email}`, JSON.stringify(updated));
    } else {
      localStorage.setItem("ecotrace_actions", JSON.stringify(updated));
    }
    
    const triggeredAction = updated.find(a => a.id === actionId);
    if (triggeredAction) {
      if (triggeredAction.completed) {
        triggerAlert(`Committed to action! You are saving ${triggeredAction.co2SavedKg} kg CO2e daily.`, "success");
      } else {
        triggerAlert(`Cancelled commitment: ${triggeredAction.name}`, "info");
      }
    }
  };

  const handleAddCustomAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customActionName.trim()) {
      triggerAlert("Please write a name for the sustainable action.", "error");
      return;
    }

    const newAct: CommittedAction = {
      id: `custom-${Date.now()}`,
      name: customActionName,
      category: customActionCat,
      co2SavedKg: Number(customActionSavings) || 1,
      completed: true,
    };

    const updated = [...committedActions, newAct];
    setCommittedActions(updated);
    if (user) {
      localStorage.setItem(`ecotrace_actions_${user.email}`, JSON.stringify(updated));
    } else {
      localStorage.setItem("ecotrace_actions", JSON.stringify(updated));
    }
    setCustomActionName("");
    triggerAlert(`Custom Action "${newAct.name}" added and activated!`, "success");
  };

  const handleResetCalculator = () => {
    if (window.confirm("Are you sure you want to reset all inputs to defaults?")) {
      setAnswers(INITIAL_ANSWERS);
      setCommittedActions(INITIAL_ACTIONS);
      setAiResult(null);
      if (user) {
        localStorage.removeItem(`ecotrace_answers_${user.email}`);
        localStorage.removeItem(`ecotrace_actions_${user.email}`);
        localStorage.removeItem(`ecotrace_ai_insights_${user.email}`);
      } else {
        localStorage.removeItem("ecotrace_answers");
        localStorage.removeItem("ecotrace_actions");
        localStorage.removeItem("ecotrace_ai_insights");
      }
      triggerAlert("Carbon Trace calculator successfully restored to standard defaults.", "info");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("ecotrace_active_user");
    setUser(null);
    triggerAlert("You have logged out.", "info");
  };

  const handleLoginSuccess = (email: string, name: string, customAnswers?: QuestionnaireAnswers) => {
    const session = { email, name };
    setUser(session);
    localStorage.setItem("ecotrace_active_user", JSON.stringify(session));
    if (customAnswers) {
      setAnswers(customAnswers);
      localStorage.setItem(`ecotrace_answers_${email}`, JSON.stringify(customAnswers));
    }
    triggerAlert(`Welcome, ${name}! Your profile is fully loaded.`, "success");
  };

  // Generate real-time personalized assessment using Google Gemini 3.5 AI
  const fetchAiInsights = async () => {
    if (!user) return;
    setLoadingAI(true);
    setAiError(null);
    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          footprintSummary: footprint,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned error status ${response.status}`);
      }

      const data: AIResult = await response.json();
      setAiResult(data);
      localStorage.setItem(`ecotrace_ai_insights_${user.email}`, JSON.stringify(data));
      triggerAlert("Personalized actionable plan generated successfully by Gemini AI!", "success");
    } catch (e: any) {
      console.error(e);
      setAiError(e.message || "Failed to generate tips. Please make sure the backend server details are initialized.");
      triggerAlert(e.message || "Insights request failed.", "error");
    } finally {
      setLoadingAI(false);
    }
  };

  // Compute calculated values
  const completedActions = committedActions.filter((a) => a.completed);
  const completedCount = completedActions.length;
  const dailyCo2SavedKg = completedActions.reduce((total, a) => total + a.co2SavedKg, 0);
  const annualCo2SavedTons = (dailyCo2SavedKg * 365) / 1000;

  // Comparison metrics
  const US_AVERAGE_FOOTPRINT = 16.0; // metric tons CO2e/year
  const TARGET_SUSTAINABLE_FOOTPRINT = 3.0; // target global average to combat warming
  const percentComparedToAverage = Math.abs(Math.round(((US_AVERAGE_FOOTPRINT - footprint.total) / US_AVERAGE_FOOTPRINT) * 100));
  const isLowerThanAverage = footprint.total < US_AVERAGE_FOOTPRINT;

  // Render Theme Style Map Classes safely with highly attractive card aesthetics
  const themeStyles = {
    bg: "bg-white text-black",
    headerBg: "bg-emerald-950 text-white border-b border-emerald-900/50",
    cardBg: "bg-white border border-slate-200/85 text-black shadow-xl rounded-3xl",
    contrastBadge: "bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold",
    sidebarCard: "bg-slate-50 border border-slate-200 text-black rounded-2xl",
    buttonPrimary: "bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md",
    footerBg: "bg-slate-900 text-white border-t border-slate-800",
  };

  if (theme === "dark") {
    // Beautiful, ultra-premium light green and pitch-black combination theme for outstanding card attractiveness & readability
    themeStyles.bg = "bg-[#020403] text-slate-100";
    themeStyles.headerBg = "bg-[#040806]/95 border-b border-emerald-500/25 text-white backdrop-blur-md";
    themeStyles.cardBg = "bg-[#090f0c] border border-emerald-500/30 text-white shadow-[0_4px_30px_rgba(16,185,129,0.06)] hover:border-emerald-400/55 hover:shadow-[0_4px_35px_rgba(16,185,129,0.14)] transition-all duration-300 rounded-3xl";
    themeStyles.contrastBadge = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-extrabold shadow-[0_0_10px_rgba(16,185,129,0.1)]";
    themeStyles.sidebarCard = "bg-[#050806] border border-emerald-500/15 text-slate-100 rounded-2xl";
    themeStyles.buttonPrimary = "bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-350 hover:to-teal-350 text-[#020403] font-black shadow-lg shadow-emerald-500/10 scale-100 hover:scale-[1.02] active:scale-95 transition-all duration-200";
    themeStyles.footerBg = "bg-[#020403] border-t border-emerald-950/80 text-emerald-400";
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-all duration-300 ${themeStyles.bg}`}>
      
      {/* Alert banner */}
      {alert && (
        <div 
          className="fixed bottom-5 right-5 z-50 animate-bounce p-4 rounded-xl shadow-2xl flex items-center gap-3 border text-sm max-w-md bg-white dark:bg-slate-950 text-black dark:text-slate-100 border-emerald-500"
          role="alert"
        >
          <div className="text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>{alert.message}</div>
        </div>
      )}

      {/* HEADER SECTION - Carbon Trace Premium Nav bar with Slow Falling Flowers & Interactive triggers */}
      <header className={`relative overflow-hidden px-4 py-4 md:px-10 md:py-6 border-b flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-200 ${themeStyles.headerBg}`}>
        {/* Animated slow-falling leaves and flower petals background */}
        <FallingFlowersBg />

        <div className="flex items-center gap-3 relative z-10">
          {/* Unique Creative Logo representing Carbon Trace */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-11 h-11 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-650 rounded-2xl flex items-center justify-center shadow-md shadow-emerald-900/40 border-2 border-white/20 overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none"></div>
              <Activity className="absolute w-7 h-7 text-emerald-950/45 scale-125 translate-x-0.5 translate-y-1" />
              <Leaf className="w-5 h-5 text-white relative z-10 transition-transform duration-500 group-hover:rotate-45 group-hover:scale-110" />
              <div className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-cyan-300 border border-emerald-500 animate-pulse"></div>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight uppercase flex items-center gap-1.5 font-sans text-white">
              Carbon <span className="text-emerald-400">Trace</span>
            </h1>
            <p className="text-[10px] uppercase tracking-wider text-emerald-300 font-semibold">
              Understand, Track, & Reduce Your Carbon Footprint
            </p>
          </div>
        </div>

        {user && (
          <nav aria-label="Main Navigation" className="flex items-center gap-6 my-2 sm:my-0 relative z-10">
            <a 
              href="#calculator-section" 
              className="text-sm font-semibold hover:text-emerald-350 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 text-white group"
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-400 group-hover:animate-pulse transition-transform" />
              <span>Calculator</span>
            </a>
            <a 
              href="#action-tracker-section" 
              className="text-sm font-semibold hover:text-emerald-350 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 text-white group"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 group-hover:animate-bounce transition-transform" />
              <span>Action Tracker</span>
            </a>
          </nav>
        )}

        <div className="flex items-center gap-4 relative z-10">
          {/* Universal high contrast / mode settings component */}
          <ThemeSelector currentTheme={theme} onChangeTheme={setTheme} />
          
          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-150/15 dark:border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold leading-tight">{user.name}</p>
                <p className="text-[9px] text-emerald-400 font-semibold opacity-85 leading-none">{user.email}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-emerald-850 border-2 border-emerald-400 p-0.5 flex items-center justify-center transition-transform hover:rotate-12 cursor-help" title={`Welcome, ${user.name}`} aria-hidden="true">
                <div className="w-full h-full rounded-full bg-emerald-400 flex items-center justify-center text-[10px] font-bold text-emerald-950 select-none">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Sign out of Climate Profile"
                aria-label="Log Out Profile"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/25 select-none">
                Not Authenticated
              </span>
            </div>
          )}
        </div>
      </header>

      {/* RENDER VIEW ACCORDING TO AUTH GATING */}
      {!user ? (
        <AuthPage theme={theme} onLoginSuccess={handleLoginSuccess} />
      ) : (
        <>
          {/* CORE INFO BAR */}
          <div className="bg-emerald-50 dark:bg-emerald-950/20 py-2.5 text-center text-xs border-b border-emerald-200/50 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-medium px-4">
            <span>🌍 Climate Change Pledge: Your targeted carbon footprint to stop global temperature rise is <strong className="underline decoration-wavy decoration-emerald-500">{TARGET_SUSTAINABLE_FOOTPRINT} metric tons CO2e/year</strong>. Current average per citizen is {US_AVERAGE_FOOTPRINT} Tons.</span>
          </div>

          {/* DYNAMIC USER DASHBOARD PANEL METRICS */}
          <div className="w-full max-w-7xl mx-auto px-4 md:px-10 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* KPI Card 1: Annual Carbon Offset Savings */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`rounded-2xl p-4 border flex items-center gap-4 transition-all hover:scale-[1.02] ${themeStyles.cardBg}`}
              >
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
                  <Leaf className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Annual Offset Savings</p>
                  <p className="text-xl font-extrabold text-emerald-400">{(annualCo2SavedTons).toFixed(3)} Tons</p>
                  <p className="text-[10px] text-slate-400 font-medium">From checked actions</p>
                </div>
              </motion.div>

              {/* KPI Card 2: Active Habit Streak */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className={`rounded-2xl p-4 border flex items-center gap-4 transition-all hover:scale-[1.02] ${themeStyles.cardBg}`}
              >
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner">
                  <Activity className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Carbon-Savvy Streak</p>
                  <p className="text-xl font-extrabold text-amber-400">{(completedCount * 3) + 1} Days Live</p>
                  <p className="text-[10px] text-slate-400 font-medium">{completedCount} active habits</p>
                </div>
              </motion.div>

              {/* KPI Card 3: Climate Level / Status Badge */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className={`rounded-2xl p-4 border flex items-center gap-4 transition-all hover:scale-[1.02] ${themeStyles.cardBg}`}
              >
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-inner">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Your Climate Standing</p>
                  <p className="text-lg font-extrabold text-blue-400 leading-tight">
                    {footprint.total < 4 ? "Eco Gladiator" : footprint.total < 9 ? "Green Guardian" : "Active Reducer"}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">Updated in real-time</p>
                </div>
              </motion.div>

              {/* KPI Card 4: Equivalent Tree Power */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className={`rounded-2xl p-4 border flex items-center gap-4 transition-all hover:scale-[1.02] ${themeStyles.cardBg}`}
              >
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-inner">
                  <Lightbulb className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Absorbing Tree Power</p>
                  <p className="text-xl font-extrabold text-purple-400">{Math.max(1, Math.round(annualCo2SavedTons * 45))} Saplings/Yr</p>
                  <p className="text-[10px] text-slate-400 font-medium">Equivalent absorption rate</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* USER PROGRESS & CARBON TARGET TRACKER PANEL */}
          <div className="w-full max-w-7xl mx-auto px-4 md:px-10 pt-6">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className={`rounded-3xl p-6 border transition-all duration-300 ${themeStyles.cardBg}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                
                {/* Visual Carbon Tracker Target Gauge */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-[#10b981] dark:text-emerald-400">
                      🎯 Carbon Reduction Tracker
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500 dark:text-emerald-400">
                      Goal: {TARGET_SUSTAINABLE_FOOTPRINT} Tons/Yr
                    </span>
                  </div>

                  <div className="relative">
                    {(() => {
                      const maxEmissions = 16.0;
                      const minEmissions = 3.0;
                      // Ensure percentage bounds between 0 and 100
                      const scoreToPercent = Math.min(100, Math.max(0, 
                        ((maxEmissions - footprint.total) / (maxEmissions - minEmissions)) * 100
                      ));
                      
                      let standingText = "";
                      let standingColor = "";
                      if (footprint.total <= 3.0) {
                        standingText = "Climate Saint - Sustainable Zone attained!";
                        standingColor = "text-emerald-400";
                      } else if (footprint.total <= 6.0) {
                        standingText = "Excellent - Extremely close to pledge target!";
                        standingColor = "text-emerald-400 font-extrabold";
                      } else if (footprint.total <= 10.0) {
                        standingText = "Moderate Progress - Keep tracking utility inputs.";
                        standingColor = "text-amber-400 font-bold";
                      } else {
                        standingText = "Above Average Emissions - Need immediate offsets.";
                        standingColor = "text-rose-400 font-bold";
                      }

                      return (
                        <div className="space-y-2">
                          <div className="w-full h-3.5 bg-slate-100 dark:bg-[#020403] rounded-full border border-slate-200 dark:border-emerald-500/20 overflow-hidden relative shadow-inner">
                            {/* Target Milestone Line */}
                            <div className="absolute left-[81.25%] top-0 bottom-0 w-0.5 bg-cyan-400 z-10" title="Sustainable Line"></div>
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${scoreToPercent}%` }}
                              transition={{ duration: 1.2, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]"
                            />
                          </div>

                          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 font-bold">
                            <span>US Average: 16.0T</span>
                            <span className="text-cyan-400">Sustainable Target: 3.0T</span>
                            <span className="text-emerald-400">Your total score: {footprint.total.toFixed(1)}T</span>
                          </div>

                          <p className={`text-xs ml-0.5 ${standingColor}`}>
                            Status: {standingText}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Habits Milestones Action Progress Tracker */}
                <div className="space-y-3.5 border-t md:border-t-0 md:border-l border-slate-200/50 dark:border-emerald-500/20 md:pl-8 pt-4 md:pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-[#10b981] dark:text-emerald-400">
                      ⚡ Action Habit Tracker
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500 dark:text-emerald-400">
                      {completedCount} of {committedActions.length} Completed
                    </span>
                  </div>

                  {(() => {
                    const actionPercent = committedActions.length > 0 
                      ? Math.round((completedCount / committedActions.length) * 100) 
                      : 0;
                    
                    let milestoneRank = "";
                    let rankBadge = "";
                    if (completedCount === 0) {
                      milestoneRank = "Eco Aspirant - Check daily habits below to start!";
                      rankBadge = "🌱";
                    } else if (completedCount <= 2) {
                      milestoneRank = "Climate Advocate - Actively mitigating carbon.";
                      rankBadge = "🔥";
                    } else if (completedCount <= 4) {
                      milestoneRank = "Eco Sustainability Guardian - High offsets reached.";
                      rankBadge = "⭐";
                    } else {
                      milestoneRank = "Green Titan - Absolute Master of Carbon Reductions!";
                      rankBadge = "🏆";
                    }

                    return (
                      <div className="space-y-2.5">
                        <div className="w-full h-3.5 bg-slate-100 dark:bg-[#020403] rounded-full border border-slate-200 dark:border-emerald-500/20 overflow-hidden shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${actionPercent}%` }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_0_10px_rgba(52,211,153,0.4)]"
                          />
                        </div>

                        <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-350">
                          <span className="flex items-center gap-1.5">{rankBadge} {milestoneRank}</span>
                          <span className="font-mono text-emerald-400">{actionPercent}%</span>
                        </div>

                        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                          Your active offset commitments prevent <strong className="text-emerald-400 font-extrabold">{dailyCo2SavedKg.toFixed(1)} Kg</strong> of carbon daily, or <strong className="text-emerald-400 font-extrabold">{annualCo2SavedTons.toFixed(3)} Tons</strong> of heating gases annually.
                        </p>
                      </div>
                    );
                  })()}
                </div>

              </div>
            </motion.div>
          </div>

          {/* WEEKLY TREND LINE CHART SECTION */}
          <div className="w-full max-w-7xl mx-auto px-4 md:px-10 pt-6">
            <WeeklyTrendChart 
              footprint={footprint}
              committedActions={committedActions}
              theme={theme}
            />
          </div>

          {/* DIGITAL BADGES MILESTONES SECTION */}
          <div className="w-full max-w-7xl mx-auto px-4 md:px-10 pt-6">
            <BadgeSystem 
              footprint={footprint}
              completedCount={completedCount}
              annualCo2SavedTons={annualCo2SavedTons}
              theme={theme}
            />
          </div>

          {/* CONTENT GRID */}
          <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: VISUAL DASHBOARD & REALTIME RESULTS (4 columns) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Annual carbon evaluation card with Modern glassmorphism design */}
              <div className={`rounded-3xl p-6 md:p-8 flex flex-col items-center text-center transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:border-emerald-500/25 ${themeStyles.cardBg}`}>
                <span className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">
                  Your Annual Carbon Footprint
                </span>

                {/* INCREDIBLE CONCENTRIC EMISSIONS DIAL CHART */}
                <div className="relative w-44 h-44 mx-auto my-3 flex items-center justify-center">
                  <svg className="w-full h-full rotate-[-90deg]">
                    {/* Transport Ring - Blue */}
                    <circle
                      cx="88" cy="88" r="70"
                      className="stroke-slate-200/40 dark:stroke-emerald-950/60 fill-none"
                      strokeWidth="7"
                    />
                    <circle
                      cx="88" cy="88" r="70"
                      className="stroke-blue-400 fill-none transition-all duration-500"
                      strokeWidth="7"
                      strokeDasharray={`${2 * Math.PI * 70}`}
                      strokeDashoffset={`${2 * Math.PI * 70 * (1 - Math.min(1, footprint.transport / (footprint.total || 1)))}`}
                      strokeLinecap="round"
                    />

                    {/* Home Energy Ring - Amber */}
                    <circle
                      cx="88" cy="88" r="56"
                      className="stroke-slate-200/40 dark:stroke-emerald-950/60 fill-none"
                      strokeWidth="7"
                    />
                    <circle
                      cx="88" cy="88" r="56"
                      className="stroke-amber-400 fill-none transition-all duration-500"
                      strokeWidth="7"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - Math.min(1, footprint.energy / (footprint.total || 1)))}`}
                      strokeLinecap="round"
                    />

                    {/* Diet Ring - Green */}
                    <circle
                      cx="88" cy="88" r="42"
                      className="stroke-slate-200/40 dark:stroke-emerald-950/60 fill-none"
                      strokeWidth="7"
                    />
                    <circle
                      cx="88" cy="88" r="42"
                      className="stroke-emerald-400 fill-none transition-all duration-500"
                      strokeWidth="7"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - Math.min(1, footprint.diet / (footprint.total || 1)))}`}
                      strokeLinecap="round"
                    />

                    {/* Waste Ring - Purple */}
                    <circle
                      cx="88" cy="88" r="28"
                      className="stroke-slate-200/40 dark:stroke-emerald-950/60 fill-none"
                      strokeWidth="7"
                    />
                    <circle
                      cx="88" cy="88" r="28"
                      className="stroke-purple-400 fill-none transition-all duration-500"
                      strokeWidth="7"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - Math.min(1, footprint.waste / (footprint.total || 1)))}`}
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* Centered Text inside the circles */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
                    <span id="annual-emissions-score" className="text-3xl font-extrabold tracking-tight">
                      {footprint.total.toFixed(1)}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Tons CO2e
                    </span>
                  </div>
                </div>

                {/* Comparative assessment indicator */}
                <div className={`mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${themeStyles.contrastBadge}`}>
                  {isLowerThanAverage ? (
                    <>
                      <ArrowDown className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{percentComparedToAverage}% Lower than US baseline</span>
                    </>
                  ) : (
                    <>
                      <ArrowUp className="w-3.5 h-3.5 text-red-500" />
                      <span>{percentComparedToAverage}% Higher than US baseline</span>
                    </>
                  )}
                </div>

                {/* Dynamic Footprint Progress Bar */}
                <div className="w-full mt-5 bg-slate-200 dark:bg-slate-950 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-300 dark:border-slate-800">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (footprint.total / 25) * 100)}%` }}
                    aria-valuenow={footprint.total}
                    aria-valuemin={0}
                    aria-valuemax={25}
                  ></div>
                </div>
                
                <div className="w-full flex justify-between mt-2 text-[9px] font-mono uppercase tracking-widest opacity-70">
                  <span>0 Tons CO2e</span>
                  <span className="text-emerald-500 font-bold">Safe Goal: {TARGET_SUSTAINABLE_FOOTPRINT} Tons</span>
                  <span>25 Tons+</span>
                </div>

            {/* Categorized Footprint Breakdown */}
            <div className="w-full mt-6 pt-5 border-t border-slate-100/15 dark:border-slate-800 space-y-4">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-xs font-bold uppercase tracking-widest text-left opacity-70">
                  ⚡ Footprint Breakdown (Tons/Year)
                </h3>
                <span className="text-[9px] font-bold text-emerald-400 tracking-wider uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Hover or Focus for exact KG values
                </span>
              </div>
              
              {/* Transport */}
              <motion.div 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="space-y-1 relative group" 
                tabIndex={0} 
                aria-label={`Transport carbon emissions: ${footprint.transport.toFixed(2)} Tons, equivalent to ${(footprint.transport * 1000).toLocaleString()} kilograms CO2e per year`}
              >
                <div id="transport-breakdown-row" className="flex justify-between items-center text-xs font-semibold">
                  <span className="flex items-center gap-2">
                    <Car className="w-3.5 h-3.5 text-blue-400" /> Transport
                  </span>
                  <span>{footprint.transport.toFixed(2)} Tons ({(footprint.total > 0 ? (footprint.transport / footprint.total) * 100 : 0).toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-950/60 h-2.5 rounded-full overflow-hidden cursor-help transition relative border border-transparent hover:border-blue-400/50">
                  <motion.div 
                    className="bg-blue-400 h-full rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${(footprint.transport / (footprint.total || 1)) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                  ></motion.div>
                </div>
                {/* HTML Tooltip Bubble */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-14 z-30 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:scale-100 pointer-events-none transition-all duration-200 bg-slate-900 dark:bg-slate-950 border border-slate-700 dark:border-slate-850 text-white rounded-xl px-3.5 py-2 text-xs font-bold shadow-2xl flex flex-col items-center gap-0.5 min-w-48 text-center high-contrast:bg-black high-contrast:border-2 high-contrast:border-yellow-300 high-contrast:text-yellow-300">
                  <span className="text-blue-400 font-bold uppercase tracking-wider text-[9px] high-contrast:text-yellow-300">Transport Impact weight</span>
                  <span className="text-sm font-mono tracking-tight font-extrabold">{(footprint.transport * 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} kg CO2e / yr</span>
                  <span className="text-[10px] text-slate-300 font-normal high-contrast:text-white">({footprint.transport.toFixed(2)} Metric Tons/Year)</span>
                  <div className="w-2 h-2 bg-slate-900 dark:bg-slate-950 border-r border-b border-slate-700 dark:border-slate-850 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 high-contrast:bg-black high-contrast:border-yellow-300"></div>
                </div>
              </motion.div>

              {/* Home Energy */}
              <motion.div 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="space-y-1 relative group" 
                tabIndex={0} 
                aria-label={`Home Energy emissions: ${footprint.energy.toFixed(2)} Tons, equivalent to ${(footprint.energy * 1000).toLocaleString()} kilograms CO2e per year`}
              >
                <div id="energy-breakdown-row" className="flex justify-between items-center text-xs font-semibold">
                  <span className="flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-amber-400" /> Home Energy
                  </span>
                  <span>{footprint.energy.toFixed(2)} Tons ({(footprint.total > 0 ? (footprint.energy / footprint.total) * 100 : 0).toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-950/60 h-2.5 rounded-full overflow-hidden cursor-help transition relative border border-transparent hover:border-amber-400/50">
                  <motion.div 
                    className="bg-amber-400 h-full rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${(footprint.energy / (footprint.total || 1)) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                  ></motion.div>
                </div>
                {/* HTML Tooltip Bubble */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-14 z-30 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:scale-100 pointer-events-none transition-all duration-200 bg-slate-900 dark:bg-slate-950 border border-slate-700 dark:border-slate-850 text-white rounded-xl px-3.5 py-2 text-xs font-bold shadow-2xl flex flex-col items-center gap-0.5 min-w-48 text-center high-contrast:bg-black high-contrast:border-2 high-contrast:border-yellow-300 high-contrast:text-yellow-300">
                  <span className="text-amber-400 font-bold uppercase tracking-wider text-[9px] high-contrast:text-yellow-300">Utility Impact weight</span>
                  <span className="text-sm font-mono tracking-tight font-extrabold">{(footprint.energy * 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} kg CO2e / yr</span>
                  <span className="text-[10px] text-slate-300 font-normal high-contrast:text-white">({footprint.energy.toFixed(2)} Metric Tons/Year)</span>
                  <div className="w-2 h-2 bg-slate-900 dark:bg-slate-950 border-r border-b border-slate-700 dark:border-slate-850 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 high-contrast:bg-black high-contrast:border-yellow-300"></div>
                </div>
              </motion.div>

              {/* Diet */}
              <motion.div 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="space-y-1 relative group" 
                tabIndex={0} 
                aria-label={`Dietary emissions: ${footprint.diet.toFixed(2)} Tons, equivalent to ${(footprint.diet * 1000).toLocaleString()} kilograms CO2e per year`}
              >
                <div id="diet-breakdown-row" className="flex justify-between items-center text-xs font-semibold">
                  <span className="flex items-center gap-2">
                    <Utensils className="w-3.5 h-3.5 text-emerald-400" /> Food & Diet
                  </span>
                  <span>{footprint.diet.toFixed(2)} Tons ({(footprint.total > 0 ? (footprint.diet / footprint.total) * 100 : 0).toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-950/60 h-2.5 rounded-full overflow-hidden cursor-help transition relative border border-transparent hover:border-emerald-400/50">
                  <motion.div 
                    className="bg-emerald-400 h-full rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${(footprint.diet / (footprint.total || 1)) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                  ></motion.div>
                </div>
                {/* HTML Tooltip Bubble */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-14 z-30 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:scale-100 pointer-events-none transition-all duration-200 bg-slate-900 dark:bg-slate-950 border border-slate-700 dark:border-slate-850 text-white rounded-xl px-3.5 py-2 text-xs font-bold shadow-2xl flex flex-col items-center gap-0.5 min-w-48 text-center high-contrast:bg-black high-contrast:border-2 high-contrast:border-yellow-300 high-contrast:text-yellow-300">
                  <span className="text-emerald-400 font-bold uppercase tracking-wider text-[9px] high-contrast:text-yellow-300">Dietary Impact weight</span>
                  <span className="text-sm font-mono tracking-tight font-extrabold">{(footprint.diet * 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} kg CO2e / yr</span>
                  <span className="text-[10px] text-slate-300 font-normal high-contrast:text-white">({footprint.diet.toFixed(2)} Metric Tons/Year)</span>
                  <div className="w-2 h-2 bg-slate-900 dark:bg-slate-950 border-r border-b border-slate-700 dark:border-slate-850 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 high-contrast:bg-black high-contrast:border-yellow-300"></div>
                </div>
              </motion.div>

              {/* Waste */}
              <motion.div 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="space-y-1 relative group" 
                tabIndex={0} 
                aria-label={`Waste and shopping emissions: ${footprint.waste.toFixed(2)} Tons, equivalent to ${(footprint.waste * 1000).toLocaleString()} kilograms CO2e per year`}
              >
                <div id="waste-breakdown-row" className="flex justify-between items-center text-xs font-semibold">
                  <span className="flex items-center gap-2">
                    <Trash2 className="w-3.5 h-3.5 text-purple-400" /> Waste & Shopping
                  </span>
                  <span>{footprint.waste.toFixed(2)} Tons ({(footprint.total > 0 ? (footprint.waste / footprint.total) * 100 : 0).toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-950/60 h-2.5 rounded-full overflow-hidden cursor-help transition relative border border-transparent hover:border-purple-400/50">
                  <motion.div 
                    className="bg-purple-400 h-full rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${(footprint.waste / (footprint.total || 1)) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                  ></motion.div>
                </div>
                {/* HTML Tooltip Bubble */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-14 z-30 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:scale-100 pointer-events-none transition-all duration-200 bg-slate-900 dark:bg-slate-950 border border-slate-700 dark:border-slate-850 text-white rounded-xl px-3.5 py-2 text-xs font-bold shadow-2xl flex flex-col items-center gap-0.5 min-w-48 text-center high-contrast:bg-black high-contrast:border-2 high-contrast:border-yellow-300 high-contrast:text-yellow-300">
                  <span className="text-purple-400 font-bold uppercase tracking-wider text-[9px] high-contrast:text-yellow-300">Waste Impact weight</span>
                  <span className="text-sm font-mono tracking-tight font-extrabold">{(footprint.waste * 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} kg CO2e / yr</span>
                  <span className="text-[10px] text-slate-300 font-normal high-contrast:text-white">({footprint.waste.toFixed(2)} Metric Tons/Year)</span>
                  <div className="w-2 h-2 bg-slate-900 dark:bg-slate-950 border-r border-b border-slate-700 dark:border-slate-850 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 high-contrast:bg-black high-contrast:border-yellow-300"></div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* VOICE ASSISTANT COMPONENT */}
          <VoiceAssistant 
            footprint={footprint} 
            aiResult={aiResult} 
            userName={user.name} 
            theme={theme}
          />

          {/* AI Smart Action Advisor utilizing Google Gemini 3.5 */}
          <div className={`rounded-3xl p-6 transition-all duration-300 ${themeStyles.cardBg}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                <h3 className="font-bold text-base uppercase tracking-tight">
                  Gemini AI Advisor
                </h3>
              </div>
              <button
                onClick={fetchAiInsights}
                id="get-ai-insights-btn"
                disabled={loadingAI}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer transition ${themeStyles.buttonPrimary} disabled:opacity-50`}
              >
                {loadingAI ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Get Insights</span>
                  </>
                )}
              </button>
            </div>

            {aiError && (
              <div className="p-3 mb-4 rounded-xl text-xs bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/40 leading-relaxed">
                <p className="font-semibold flex items-center gap-1.5 mb-1">
                  <AlertCircle className="w-4 h-4" /> AI Evaluation Unavailable
                </p>
                {aiError}
              </div>
            )}

            {!aiResult && !loadingAI && !aiError && (
              <div className="text-center py-6 px-4 border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-350 mb-1">
                  Ready for AI recommendations!
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                  Tap &apos;Get Insights&apos; to query Gemini for an evaluation of your daily answers, lifestyle breakdown, and quick wins.
                </p>
              </div>
            )}

            {loadingAI && (
              <div className="space-y-4 animate-pulse py-4">
                <div className="h-3.5 bg-slate-200 dark:bg-emerald-950/80 rounded W-1/2"></div>
                <div className="h-12 bg-slate-200 dark:bg-emerald-950/80 rounded"></div>
                <div className="h-12 bg-slate-200 dark:bg-emerald-950/80 rounded"></div>
              </div>
            )}

            {aiResult && (
              <div className="space-y-4 text-xs">
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="italic bg-slate-50 dark:bg-emerald-950/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 leading-relaxed"
                >
                  &ldquo;{aiResult.summary}&rdquo;
                </motion.p>

                <div className="space-y-3">
                  <h4 className="font-semibold text-emerald-400 uppercase tracking-widest text-[10px]">
                    🎯 Recommended Smart Reductions
                  </h4>
                  {aiResult.insights?.slice(0, 3).map((ins, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.4, delay: i * 0.12 }}
                      className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800 leading-normal"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">
                          {ins.category}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                          ins.impact === "High" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {ins.impact} Impact
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 mb-1 font-medium">{ins.observation}</p>
                      <p className="text-[#10b981] dark:text-emerald-400 font-semibold">{ins.recommendation}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="space-y-2.5">
                  <h4 className="font-semibold text-emerald-400 uppercase tracking-widest text-[10px]">
                    💡 Suggested Quick Wins
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {aiResult.quickWins?.slice(0, 2).map((qw, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.35 + i * 0.1 }}
                        className="flex justify-between items-center p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30"
                      >
                        <span className="font-medium text-slate-700 dark:text-emerald-200 line-clamp-1">{qw.action}</span>
                        <span className="text-emerald-500 font-bold shrink-0">-{qw.reductionKg}kg CO2/yr</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: STEP-BY-STEP CALCULATOR AND COMMITMENT MATRICES (7 columns) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* CALCULATOR CONTAINER CARDS */}
          <section id="calculator-section" aria-label="Interactive Footprint Calculator" className={`rounded-3xl p-6 md:p-8 transition-all duration-300 ${themeStyles.cardBg}`}>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  📋 Interactive Carbon Assessment
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                  Customize the values below to evaluate your annual environmental footprint. Changes propagate instantly.
                </p>
              </div>
              <button
                onClick={handleResetCalculator}
                id="reset-calculator-btn"
                className="self-start text-xs border rounded-lg px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-semibold cursor-pointer text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                title="Reset all values to normal US defaults"
              >
                Reset Default Settings
              </button>
            </div>

            {/* Category selection tabs list */}
            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 mb-6" role="tablist">
              <button
                onClick={() => setActiveTab("transport")}
                id="tab-btn-transport"
                role="tab"
                aria-selected={activeTab === "transport"}
                className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer transition ${
                  activeTab === "transport"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/20"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Car className="w-4 h-4" />
                <span className="hidden sm:inline">Transport</span>
              </button>

              <button
                onClick={() => setActiveTab("energy")}
                id="tab-btn-energy"
                role="tab"
                aria-selected={activeTab === "energy"}
                className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer transition ${
                  activeTab === "energy"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/20"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Flame className="w-4 h-4" />
                <span className="hidden sm:inline">Energy</span>
              </button>

              <button
                onClick={() => setActiveTab("diet")}
                id="tab-btn-diet"
                role="tab"
                aria-selected={activeTab === "diet"}
                className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer transition ${
                  activeTab === "diet"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/20"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Utensils className="w-4 h-4" />
                <span className="hidden sm:inline">Diet</span>
              </button>

              <button
                onClick={() => setActiveTab("waste")}
                id="tab-btn-waste"
                role="tab"
                aria-selected={activeTab === "waste"}
                className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer transition ${
                  activeTab === "waste"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/20"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Waste</span>
              </button>
            </div>

            {/* TAB CONTENT CARDS */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-900">
              
              {/* TAB 1: TRANSPORTATION */}
              {activeTab === "transport" && (
                <div className="space-y-5" role="tabpanel" id="panel-transport">
                  <div className="mb-2">
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-emerald-500">
                      🚗 Commute & Travel Metrics
                    </h3>
                    <p className="text-xs text-slate-400 leading-normal mt-0.5">
                      Transportation average causes over 25% of household emissions output.
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                      <label htmlFor="commute-miles-range">Weekly Commute Distance</label>
                      <span className="text-emerald-500 font-mono text-sm">{answers.commuteMiles} miles / week</span>
                    </div>
                    <input
                      type="range"
                      id="commute-miles-range"
                      min="0"
                      max="1000"
                      step="10"
                      value={answers.commuteMiles}
                      onChange={(e) => handleAnswersChange({ ...answers, commuteMiles: parseInt(e.target.value) })}
                      className="w-full h-2 rounded-lg bg-slate-200 dark:bg-slate-800 appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
                      <span>0 miles (No vehicle transit)</span>
                      <span>500 miles</span>
                      <span>1,000 miles (Heavy commute)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="vehicle-type-select" className="block text-xs font-bold mb-1.5">Vehicle Energy Feed</label>
                      <select
                        id="vehicle-type-select"
                        value={answers.vehicleType}
                        onChange={(e) => handleAnswersChange({ ...answers, vehicleType: e.target.value as any })}
                        className="w-full px-3 py-2 text-sm rounded-lg border bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="gas">Standard gasoline gasoline vehicle</option>
                        <option value="hybrid">High-efficiency hybrid vehicle</option>
                        <option value="electric">Clean EV (Electric vehicle)</option>
                        <option value="none">No vehicle user / use public transit</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="mpg-input" className="block text-xs font-bold mb-1.5">Vehicle Economy (MPG)</label>
                      <input
                        type="number"
                        id="mpg-input"
                        min="1"
                        max="120"
                        value={answers.mpg}
                        disabled={answers.vehicleType === "none" || answers.vehicleType === "electric"}
                        onChange={(e) => handleAnswersChange({ ...answers, mpg: Math.max(1, parseInt(e.target.value) || 0) })}
                        className="w-full px-3 py-2 text-sm rounded-lg border bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-900">
                    <div>
                      <label htmlFor="short-flights-input" className="block text-xs font-bold mb-1">Short Flights (&lt;3 hrs flights)</label>
                      <span className="text-[10px] text-slate-400 block mb-1.5">Annual count of domestic flights</span>
                      <input
                        type="number"
                        id="short-flights-input"
                        min="0"
                        max="50"
                        value={answers.shortFlights}
                        onChange={(e) => handleAnswersChange({ ...answers, shortFlights: Math.max(0, parseInt(e.target.value) || 0) })}
                        className="w-full px-3 py-2 text-sm rounded-lg border bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="long-flights-input" className="block text-xs font-bold mb-1">Long Flights (&gt;3 hrs flights)</label>
                      <span className="text-[10px] text-slate-400 block mb-1.5">Annual international flight trips</span>
                      <input
                        type="number"
                        id="long-flights-input"
                        min="0"
                        max="30"
                        value={answers.longFlights}
                        onChange={(e) => handleAnswersChange({ ...answers, longFlights: Math.max(0, parseInt(e.target.value) || 0) })}
                        className="w-full px-3 py-2 text-sm rounded-lg border bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ENERGY */}
              {activeTab === "energy" && (
                <div className="space-y-5" role="tabpanel" id="panel-energy">
                  <div className="mb-2">
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-emerald-500">
                      ⚡ Home Energy & Utility Consumption
                    </h3>
                    <p className="text-xs text-slate-400 leading-normal mt-0.5">
                      Subscribing to renewable utility credits heavily drops home heating carbon outputs.
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                      <label htmlFor="electricity-bill-input">Average Monthly Electricity Cost</label>
                      <span className="text-emerald-500 font-mono text-sm">${answers.electricityBill} / month</span>
                    </div>
                    <input
                      type="range"
                      id="electricity-bill-input"
                      min="0"
                      max="600"
                      value={answers.electricityBill}
                      onChange={(e) => handleAnswersChange({ ...answers, electricityBill: parseInt(e.target.value) })}
                      className="w-full h-2 rounded-lg bg-slate-200 dark:bg-slate-800 appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
                      <span>$0 (Self-sustaining Solar)</span>
                      <span>$300</span>
                      <span>$600 (High-energy residence)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label htmlFor="thermostat-level-select" className="block text-xs font-bold mb-1.5">Thermostat Temperature Level</label>
                      <select
                        id="thermostat-level-select"
                        value={answers.thermostatLevel}
                        onChange={(e) => handleAnswersChange({ ...answers, thermostatLevel: e.target.value as any })}
                        className="w-full px-3 py-2 text-sm rounded-lg border bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="energy-saving">Energy Saving (+/- 2-3°F conservation)</option>
                        <option value="moderate">Moderate standard heating/cooling</option>
                        <option value="cool">Heavy air conditioning / summer ventilation</option>
                        <option value="warm">Heavy warm central gas heating</option>
                      </select>
                    </div>

                    <div className="flex flex-col justify-end space-y-3 pb-1">
                      <label className="flex items-start gap-2.5 cursor-pointer text-xs font-semibold select-none">
                        <input
                          type="checkbox"
                          checked={answers.cleanEnergy}
                          id="clean-energy-chk"
                          onChange={(e) => handleAnswersChange({ ...answers, cleanEnergy: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-200 text-emerald-500 focus:ring-emerald-500 accent-emerald-500 mt-0.5"
                        />
                        <div>
                          <span>Subscribed to Renewable/Clean Utilities</span>
                          <span className="block text-[10px] text-slate-400 font-normal">Sourcing from hydroelectric, wind, or private solar</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer text-xs font-semibold select-none">
                        <input
                          type="checkbox"
                          checked={answers.efficientAppliances}
                          id="efficient-appliances-chk"
                          onChange={(e) => handleAnswersChange({ ...answers, efficientAppliances: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-200 text-emerald-500 focus:ring-emerald-500 accent-emerald-500 mt-0.5"
                        />
                        <div>
                          <span>ENERGY STAR Efficient Appliances</span>
                          <span className="block text-[10px] text-slate-400 font-normal">Refrigerators and smart laundry systems</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: DIET */}
              {activeTab === "diet" && (
                <div className="space-y-5" role="tabpanel" id="panel-diet">
                  <div className="mb-2">
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-emerald-500">
                      🥗 Dietary & Agriculture Habits
                    </h3>
                    <p className="text-xs text-slate-400 leading-normal mt-0.5">
                      Animal-based agriculture produces heavy methane output. Sustainable vegan/veg diets reduce carbon foot footprint by up to 60%.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="diet-preference-select" className="block text-xs font-bold mb-1.5">Routine Food Preference</label>
                      <select
                        id="diet-preference-select"
                        value={answers.dietPreference}
                        onChange={(e) => handleAnswersChange({ ...answers, dietPreference: e.target.value as any })}
                        className="w-full px-3 py-2 text-sm rounded-lg border bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="heavy-meat">High meat routine (beef & pork daily)</option>
                        <option value="balanced">Balanced standard option (poultry/seafood/vegetables)</option>
                        <option value="vegetarian">Vegetarian (diary/eggs but no animal meat)</option>
                        <option value="vegan">Vegan (Strictly plant-based nutrition)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="local-food-select" className="block text-xs font-bold mb-1.5 font-sans">Organic & Local Sourcing</label>
                      <select
                        id="local-food-select"
                        value={answers.localFoodPreference}
                        onChange={(e) => handleAnswersChange({ ...answers, localFoodPreference: e.target.value as any })}
                        className="w-full px-3 py-2 text-sm rounded-lg border bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="always">Always local (farmers markets, backyard crops)</option>
                        <option value="sometimes">Sometimes (prefer local, but rely on imported goods)</option>
                        <option value="rarely">Rarely (standard globally imported cargo packages)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: WASTE */}
              {activeTab === "waste" && (
                <div className="space-y-5" role="tabpanel" id="panel-waste">
                  <div className="mb-2">
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-emerald-500">
                      ♻️ Consumer Consumption & Daily Waste
                    </h3>
                    <p className="text-xs text-slate-400 leading-normal mt-0.5">
                      Landfill garbage decomposition generates high amounts of carbon and nitrous gasses.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="shopping-habits-select" className="block text-xs font-bold mb-1.5">Goods Shopping Volume</label>
                      <select
                        id="shopping-habits-select"
                        value={answers.shoppingHabits}
                        onChange={(e) => handleAnswersChange({ ...answers, shoppingHabits: e.target.value as any })}
                        className="w-full px-3 py-2 text-sm rounded-lg border bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="eco-conscious">Eco-conscious selection (Upcycled, minimal packaging)</option>
                        <option value="average">Standard average consumer (regular packaging and shipments)</option>
                        <option value="high-consumption">High buying volume (fast fashion, high electronic updates)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="recycling-level-select" className="block text-xs font-bold mb-1.5">Recycling Habits</label>
                      <select
                        id="recycling-level-select"
                        value={answers.recyclingLevel}
                        onChange={(e) => handleAnswersChange({ ...answers, recyclingLevel: e.target.value as any })}
                        className="w-full px-3 py-2 text-sm rounded-lg border bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="consistent">Consistent (completely sort plastic/glass/aluminum)</option>
                        <option value="occasional">Occasional sorting (only bottles or paper occasionally)</option>
                        <option value="none">None (all trash joins single landfill containers)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs font-semibold select-none">
                      <input
                        type="checkbox"
                        checked={answers.composting}
                        id="composting-chk"
                        onChange={(e) => handleAnswersChange({ ...answers, composting: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-200 text-emerald-500 focus:ring-emerald-500 accent-emerald-500 mt-0.5"
                      />
                      <div>
                        <span>Track Organics today: Backyard Composting</span>
                        <span className="block text-[10px] text-slate-400 font-normal">Composting food scraps keeps methane elements stable in gardens</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ACTIVE ACTION TRACKER HUB CHECKLIST */}
          <section id="action-tracker-section" aria-label="Action Tracker Hub" className={`rounded-3xl p-6 md:p-8 transition-all duration-300 ${themeStyles.cardBg}`}>
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  🌱 Sustainable Action Tracker Hub
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                  Commit to specific daily tasks to estimate your prospective reductions in real-time.
                </p>
              </div>

              <div id="dynamic-savings-metrics" className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-center shrink-0 min-w-32">
                <span className="block text-[10px] uppercase font-bold tracking-widest leading-none">Your Daily Savings</span>
                <span className="text-2xl font-bold font-mono leading-none flex items-center justify-center gap-1 mt-1">
                  {dailyCo2SavedKg.toFixed(1)} <span className="text-xs uppercase font-semibold">Kg</span>
                </span>
                <span className="block text-[9px] text-slate-400 mt-0.5">~{annualCo2SavedTons.toFixed(2)} Tons Saved/Year</span>
              </div>
            </div>

            {/* Smart Add Custom Commitment Action Form */}
            <form onSubmit={handleAddCustomAction} className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6 p-4 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
              <div className="md:col-span-12">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  ⚡ Define custom personalized commitment
                </h4>
              </div>
              <div className="md:col-span-5">
                <input
                  type="text"
                  id="custom-action-name-input"
                  placeholder="e.g. Turn down hot water temperature heater today"
                  className="w-full px-3 py-1.5 text-sm rounded-lg border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  value={customActionName}
                  onChange={(e) => setCustomActionName(e.target.value)}
                />
              </div>
              
              <div className="md:col-span-4 grid grid-cols-2 gap-2">
                <select
                  id="custom-action-category-select"
                  value={customActionCat}
                  onChange={(e) => setCustomActionCat(e.target.value as any)}
                  className="w-full px-2 py-1.5 text-xs rounded-lg border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="transport">Transport</option>
                  <option value="energy">Energy</option>
                  <option value="diet">Diet & Food</option>
                  <option value="waste">Waste</option>
                </select>

                <div className="relative">
                  <input
                    type="number"
                    id="custom-action-savings-input"
                    className="w-full pr-7 pl-2 py-1.5 text-xs rounded-lg border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono text-center focus:outline-none focus:border-emerald-500"
                    placeholder="2.0"
                    min="0.1"
                    max="100"
                    step="0.5"
                    value={customActionSavings}
                    onChange={(e) => setCustomActionSavings(parseFloat(e.target.value) || 0)}
                  />
                  <span className="absolute right-2 top-2 text-[9px] text-slate-400 uppercase font-bold">Kg</span>
                </div>
              </div>

              <div className="md:col-span-3">
                <button
                  type="submit"
                  id="add-custom-action-btn"
                  className="w-full text-center py-2 rounded-lg text-xs font-bold uppercase text-emerald-700 bg-emerald-500/15 border border-emerald-500/25 dark:text-emerald-400 dark:bg-emerald-950/20 hover:bg-emerald-500/10 cursor-pointer transition"
                >
                  Create & Save
                </button>
              </div>
            </form>

            {/* List checklist of Actions */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <span>Active Environmental Actions Status</span>
                <span>Savings Impact Contribution</span>
              </div>

              <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
                {committedActions.map((act) => {
                  const textColor = theme === "light" 
                    ? "text-black" 
                    : (act.completed ? "text-emerald-300" : "text-slate-300");
                  const subTextColor = "text-slate-400";

                  return (
                    <div 
                      key={act.id} 
                      className={`flex justify-between items-center p-3.5 rounded-2xl border transition-all duration-200 ${
                        act.completed 
                          ? "bg-emerald-500/5 border-emerald-500/20" 
                          : "bg-slate-50/50 dark:bg-slate-950/40 border-slate-200/50 dark:border-slate-900/60"
                      }`}
                    >
                      <label 
                        onClick={() => handleActionToggle(act.id)}
                        className={`flex items-start gap-3 cursor-pointer text-sm font-semibold select-none flex-1 ${textColor}`}
                      >
                        <input
                          type="checkbox"
                          id={`action-chk-${act.id}`}
                          checked={act.completed}
                          onChange={() => {}} // toggled on label click
                          className="w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 accent-emerald-500 mt-0.5 shrink-0"
                        />
                        <div>
                          <span className={act.completed ? "line-through opacity-85" : ""}>
                            {act.name}
                          </span>
                          <span className={`block text-[9px] font-mono uppercase tracking-wider mt-0.5 ${subTextColor}`}>
                            Category: {act.category}
                          </span>
                        </div>
                      </label>

                      <div className="flex items-center gap-2 font-mono text-sm font-bold shrink-0">
                        <span className="text-emerald-600 dark:text-emerald-400">
                          -{act.co2SavedKg.toFixed(1)} Kg CO2e
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {completedCount === 0 && (
                <p className="text-xs text-center text-slate-500 dark:text-slate-400 py-2.5 italic">
                  💡 Tip: Checking active daily goals reduces your annual carbon footprints safely and quickly! Commit to some goals today.
                </p>
              )}
            </div>
          </section>

            </div>
          </main>

          {/* FOOTER SECTION */}
          <footer className={`mt-auto py-8 px-4 md:px-10 border-t transition-all duration-300 ${themeStyles.footerBg}`}>
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-wrap gap-6 text-[10px] font-bold tracking-widest uppercase opacity-70">
                <a href="#calculator-section" className="hover:text-emerald-400 transition">Interactive Calculator</a>
                <a href="#action-tracker-section" className="hover:text-emerald-400 transition">Habits Action Hub</a>
              </div>

              <div className="flex flex-col md:items-end text-center md:text-right gap-1 mr-4">
                <div className="flex items-center gap-2 justify-center md:justify-end">
                  <Globe className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: "12s" }} />
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                    CLOUD & PLATFORM SECURE
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                  Designed with strict light/dark contrast standards meeting WCAG 2.1 AAA recommendations.
                </p>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
