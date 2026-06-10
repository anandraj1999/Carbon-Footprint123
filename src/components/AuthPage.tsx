/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Leaf, Mail, Lock, User, Sparkles, LogIn, UserPlus, ArrowRight, CheckCircle2, Activity } from "lucide-react";
import { ThemeMode } from "./ThemeSelector";
import { QuestionnaireAnswers, CommittedAction } from "../types";

interface AuthPageProps {
  theme: ThemeMode;
  onLoginSuccess: (email: string, name: string, customAnswers?: QuestionnaireAnswers, customActions?: CommittedAction[]) => void;
}

export default function AuthPage({ theme, onLoginSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Persona Presets
  const presets = [
    {
      name: "Olivia Green",
      title: "Eco-Enthusiast",
      email: "green@carbontrace.com",
      description: "Vegan vegan, EV vehicle owner, solar provider, and consistent recycler. Target sustainable carbon score.",
      badge: "🌱 Low Footprint (3.2T)",
      answers: {
        commuteMiles: 40,
        vehicleType: "electric" as const,
        mpg: 120,
        shortFlights: 0,
        longFlights: 0,
        electricityBill: 30,
        cleanEnergy: true,
        thermostatLevel: "energy-saving" as const,
        efficientAppliances: true,
        dietPreference: "vegan" as const,
        localFoodPreference: "always" as const,
        recyclingLevel: "consistent" as const,
        composting: true,
        shoppingHabits: "eco-conscious" as const,
      }
    },
    {
      name: "Robert Miller",
      title: "Average Citizen",
      email: "average@carbontrace.com",
      description: "Standard gasoline car, moderate bills, eats balanced meals, and occasionally recycles. Typical baseline.",
      badge: "🏠 Moderate Footprint (11.4T)",
      answers: {
        commuteMiles: 160,
        vehicleType: "gas" as const,
        mpg: 26,
        shortFlights: 1,
        longFlights: 1,
        electricityBill: 110,
        cleanEnergy: false,
        thermostatLevel: "moderate" as const,
        efficientAppliances: false,
        dietPreference: "balanced" as const,
        localFoodPreference: "sometimes" as const,
        recyclingLevel: "occasional" as const,
        composting: false,
        shoppingHabits: "average" as const,
      }
    },
    {
      name: "Victoria Sky",
      title: "Heavy Traveler",
      email: "traveler@carbontrace.com",
      description: "Drives heavy gas vehicle, frequent flier, eats heavy meat, high consumption shopping lifestyle.",
      badge: "✈️ High Footprint (27.8T)",
      answers: {
        commuteMiles: 380,
        vehicleType: "gas" as const,
        mpg: 14,
        shortFlights: 8,
        longFlights: 5,
        electricityBill: 280,
        cleanEnergy: false,
        thermostatLevel: "cool" as const,
        efficientAppliances: false,
        dietPreference: "heavy-meat" as const,
        localFoodPreference: "rarely" as const,
        recyclingLevel: "none" as const,
        composting: false,
        shoppingHabits: "high-consumption" as const,
      }
    }
  ];

  const handlePresetSelect = (preset: typeof presets[0]) => {
    // Automatically seed and log in
    localStorage.setItem(`ecotrace_answers_${preset.email}`, JSON.stringify(preset.answers));
    onLoginSuccess(preset.email, preset.name, preset.answers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all requested fields.");
      return;
    }

    if (!isLogin && !name.trim()) {
      setError("Please provide your full name to sign up.");
      return;
    }

    // Get current registered users
    const usersRaw = localStorage.getItem("ecotrace_registered_users");
    let users = usersRaw ? JSON.parse(usersRaw) : [];

    if (isLogin) {
      // Find user
      const foundUser = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (foundUser) {
        if (foundUser.password !== password) {
          setError("Incorrect password details. Try another.");
          return;
        }
        setSuccess(`Welcome back, ${foundUser.name}!`);
        setTimeout(() => {
          onLoginSuccess(foundUser.email, foundUser.name);
        }, 800);
      } else {
        // Fallback checks for predefined presets
        const matchedPreset = presets.find(p => p.email.toLowerCase() === email.toLowerCase());
        if (matchedPreset && password === "demo") {
          setSuccess(`Welcome back, ${matchedPreset.name}!`);
          setTimeout(() => {
            handlePresetSelect(matchedPreset);
          }, 800);
          return;
        }
        setError("User account not found. Click 'Register' or use the Quick Persona Presets below.");
      }
    } else {
      // Register new user
      const alreadyExists = users.some((u: any) => u.email.toLowerCase() === email.toLowerCase()) || 
                            presets.some(p => p.email.toLowerCase() === email.toLowerCase());
      if (alreadyExists) {
        setError("An account with this email is already registered.");
        return;
      }

      const newUser = {
        email: email.toLowerCase(),
        password,
        name
      };

      users.push(newUser);
      localStorage.setItem("ecotrace_registered_users", JSON.stringify(users));
      setSuccess("Account registered successfully! Logging you in...");
      setTimeout(() => {
        onLoginSuccess(newUser.email, newUser.name);
      }, 1000);
    }
  };

  // Modern Card and Typography Styling matching theme
  const cardStyle = theme === "dark" 
    ? "bg-black/80 border border-emerald-500/30 text-white backdrop-blur-xl shadow-[0_0_30px_rgba(16,185,129,0.15)]" 
    : "bg-white border border-slate-200 text-slate-800 shadow-xl";

  const presetCardStyle = theme === "dark"
    ? "bg-[#080d0a] hover:bg-[#0c120e] border border-emerald-500/20 text-white shadow-[0_2px_12px_rgba(16,185,129,0.05)] hover:border-emerald-400/50"
    : "bg-slate-50 hover:bg-slate-100 border border-slate-200/80";

  const inputStyle = theme === "dark"
    ? "bg-black/60 border border-emerald-500/30 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-white placeholder-slate-500"
    : "bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 text-slate-900";

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-16 max-w-7xl mx-auto w-full">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Visual Welcome & Intro Info */}
        <div className="lg:col-span-5 flex flex-col justify-center h-full text-left space-y-6">
          <div className="flex items-center gap-3">
            {/* Unique Creative Logo representing Carbon Trace */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-650 rounded-2xl flex items-center justify-center shadow-md shadow-emerald-900/40 border-2 border-white/20 overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none"></div>
                <Activity className="absolute w-8 h-8 text-emerald-950/45 scale-125 translate-x-0.5 translate-y-1" />
                <Leaf className="w-6 h-6 text-white relative z-10 transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-cyan-300 border border-emerald-500 animate-pulse"></div>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight uppercase text-white leading-none">
                Carbon <span className="text-emerald-400">Trace</span>
              </h1>
              <p className="text-xs uppercase tracking-wider text-emerald-300 font-semibold mt-1">
                Climate Tracking Network
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-white dark:text-emerald-100">
              Personalized Carbon Assessment Profiles
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Unlock historical carbon ledger records, active daily performance trackers, and dynamic AI-powered reduction insights customized for your exact lifestyle.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-950/50 border border-emerald-800/50 space-y-3.5 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" /> Why register/sign in?
            </h3>
            <ul className="space-y-2.5 text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Isolated Records</strong>: Keep your personal transportation and utility metrics separate from other members.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Instant Switching</strong>: Load, view, and test different household profiles with a single-click.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Durable Offsets</strong>: Securely maintain your commitments even if you refresh or switch browsers.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Portal Cards & Presets block */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Auth Card Component */}
          <div className={`p-6 md:p-8 rounded-3xl border ${cardStyle} transition-all duration-300`}>
            
            <div className="flex border-b border-slate-100/10 pb-4 mb-6 justify-between items-center">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => { setIsLogin(true); setError(null); }}
                  className={`text-base font-bold pb-1 relative transition-all ${
                    isLogin 
                      ? "text-emerald-400 border-b-2 border-emerald-400" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setIsLogin(false); setError(null); }}
                  className={`text-base font-bold pb-1 relative transition-all ${
                    !isLogin 
                      ? "text-emerald-400 border-b-2 border-emerald-400" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Register Account
                </button>
              </div>
              <div className="text-[10px] uppercase font-mono tracking-wider opacity-65">
                {isLogin ? "Existing Ledger" : "New Climate Record"}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/15 border border-red-500/50 text-red-100 text-xs rounded-xl flex items-center gap-2">
                <span className="font-semibold block">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/50 text-emerald-100 text-xs rounded-xl flex items-center gap-2">
                <span className="font-semibold block">{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold uppercase tracking-wider block opacity-85">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition ${inputStyle}`}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold uppercase tracking-wider block opacity-85">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition ${inputStyle}`}
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider block opacity-85">Password</label>
                  {isLogin && (
                    <span className="text-[10px] text-emerald-400 opacity-80 select-none">Presets password: &apos;demo&apos;</span>
                  )}
                </div>
                <div className="relative font-sans">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition ${inputStyle}`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-4 rounded-xl font-bold uppercase tracking-wider transition duration-200 cursor-pointer text-xs flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-900/30"
              >
                {isLogin ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Access Footprint Ledger</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Free Climate Profile</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Interactive Persona Selector Block */}
          <div className="space-y-3.5">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#10b981] dark:text-emerald-400">
                ⚡ Test with Persona Presets (Instant Sign In)
              </h3>
              <span className="text-[9px] uppercase font-bold text-slate-400">Click to load answers</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {presets.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between hover:scale-[1.02] cursor-pointer transition-all duration-200 ${presetCardStyle}`}
                >
                  <div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 block w-max uppercase mb-2">
                      {preset.title}
                    </span>
                    <h4 className="text-xs font-bold text-white dark:text-slate-100 flex items-center gap-1">
                      {preset.name} <ArrowRight className="w-3 h-3 text-emerald-400" />
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-normal mt-1 min-h-[36px]">
                      {preset.description}
                    </p>
                  </div>
                  <div className="mt-2 text-[10px] font-semibold text-emerald-400 font-mono">
                    {preset.badge}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
