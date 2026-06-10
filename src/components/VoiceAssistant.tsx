/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX, Sparkles, HelpCircle, CornerDownRight, Play, Square, MessageSquare, AlertCircle } from "lucide-react";
import { FootprintSummary, AIResult } from "../types";

interface VoiceAssistantProps {
  footprint: FootprintSummary;
  aiResult: AIResult | null;
  userName: string;
  theme: "light" | "dark";
}

export default function VoiceAssistant({ footprint, aiResult, userName, theme }: VoiceAssistantProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [assistantText, setAssistantText] = useState("");
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize Web Speech APIs
  useEffect(() => {
    synthRef.current = window.speechSynthesis;

    // Check compatibility
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
        setRecognitionError(null);
        setTranscript("Listening for your command...");
      };

      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        setTranscript(resultText);
        processCommand(resultText);
      };

      rec.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setRecognitionError("Microphone access blocked. Click a preset command or enable browser mic permissions.");
        } else if (event.error === "no-speech") {
          setRecognitionError("No speech detected. Please speak clearly into the microphone.");
        } else {
          setRecognitionError(`Assistant voice error: ${event.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    } else {
      // Partially supported (TTS works but STT recognition is absent)
      setIsSupported(false);
    }

    // Welcoming text
    setAssistantText(`Hello ${userName}! I am Carbon Trace Assistant. You can command me to read your scores, suggest saving tips, or read AI insights.`);

    return () => {
      stopSpeaking();
    };
  }, [userName]);

  const speakText = (text: string) => {
    if (!synthRef.current) return;
    
    // Stop prior speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05; // Friendly warm pitch

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    utterRef.current = utterance;
    synthRef.current.speak(utterance);
    setAssistantText(text);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      stopSpeaking();
      try {
        recognitionRef.current?.start();
      } catch (err) {
        setRecognitionError("Unable to start listening. Use the preset commands below.");
      }
    }
  };

  // Logic to respond to various commands
  const processCommand = (rawCommand: string) => {
    const cmd = rawCommand.toLowerCase();
    
    if (cmd.includes("score") || cmd.includes("footprint") || cmd.includes("how much")) {
      const resp = `Your current total estimated carbon footprint is ${footprint.total.toFixed(1)} metric tons per year. That breaks down into ${footprint.transport.toFixed(1)} tons for transportation, ${footprint.energy.toFixed(1)} tons for utilities, ${footprint.diet.toFixed(1)} tons for diet, and ${footprint.waste.toFixed(1)} tons for waste.`;
      speakText(resp);
    } else if (cmd.includes("insight") || cmd.includes("read summary") || cmd.includes("ai")) {
      if (aiResult && aiResult.summary) {
        speakText(`Here is your custom carbon insight. ${aiResult.summary}`);
      } else {
        speakText("Please calculate your scores first or request AI insights in the ledger panel, so that I have personalized carbon ledger data to analyze.");
      }
    } else if (cmd.includes("tip") || cmd.includes("save") || cmd.includes("reduce") || cmd.includes("help")) {
      const randomTips = [
        "Replacing standard lightbulbs with energy smart LEDs can offset about seventy kilograms of carbon per year.",
        "Choosing plant based vegan meals once or twice a week significantly reduces methane and transport footprint.",
        "Subscribing to a clean electric utility renewable scheme lowers housing grid emission impact to virtually zero.",
        "Always dry your clothes on a drying rack instead of a heated tumble dryer to instantly save electricity bill amounts.",
        "Combine grocery runs into a single optimized travel trip to preserve vehicle MPG savings."
      ];
      const tip = randomTips[Math.floor(Math.random() * randomTips.length)];
      speakText(`Here is a special green carbon tip: ${tip}`);
    } else if (cmd.includes("hello") || cmd.includes("hi ") || cmd.includes("hey")) {
      speakText(`Hi ${userName}! I am here to assist your climate tracking. Ask me 'what is my score' or 'read insights' to begin!`);
    } else {
      speakText(`I heard: "${rawCommand}". Command not clearly matched. Ask me "what is my score", "read insights", or "give me a tip".`);
    }
  };

  // Safe manual triggers
  const executePreset = (commandStr: string) => {
    setTranscript(`[Triggered]: ${commandStr}`);
    processCommand(commandStr);
  };

  return (
    <div className={`p-6 rounded-3xl border transition-all duration-300 ${
      theme === "dark" 
        ? "bg-[#0c120e] border-emerald-500/30 text-white shadow-[0_0_15px_rgba(16,185,129,0.06)]" 
        : "bg-white border-slate-200 text-black shadow-lg"
    }`}>
      <div className="flex items-center justify-between border-b pb-3 mb-4 border-slate-700/10 dark:border-emerald-500/20">
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${isSpeaking ? "bg-emerald-400 animate-ping" : "bg-emerald-500"}`}></span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
              <Volume2 className="w-4 h-4 animate-pulse text-emerald-400" />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-extrabold uppercase tracking-wider">Voice Assistant</h4>
            <p className="text-[10px] text-slate-400 font-semibold uppercase leading-none">Personalized Speech Console</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isSpeaking && (
            <button 
              onClick={stopSpeaking}
              className="px-2.5 py-1 text-[10px] rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition cursor-pointer flex items-center gap-1 font-bold uppercase"
              title="Stop Speech"
            >
              <Square className="w-3 h-3 fill-current" /> Stop
            </button>
          )}

          {isSupported && (
            <button
              onClick={toggleListening}
              className={`p-1.5 rounded-xl transition-all cursor-pointer border ${
                isListening 
                  ? "bg-red-500 text-white border-red-400 animate-pulse scale-105" 
                  : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20"
              }`}
              title={isListening ? "Stop listening for voice command" : "Ask by speaking"}
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main feedback box */}
      <div className="rounded-2xl p-4 bg-slate-500/5 dark:bg-emerald-950/20 border border-slate-700/5 dark:border-emerald-500/10 relative overflow-hidden min-h-[90px] flex flex-col justify-between">
        {/* Animated equalizer bars when speaking to look extremely attractive */}
        {isSpeaking && (
          <div className="absolute right-4 bottom-4 flex items-end gap-1 h-6">
            <div className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite] h-4"></div>
            <div className="w-1 bg-emerald-300 rounded-full animate-[bounce_0.8s_infinite_0.15s] h-6"></div>
            <div className="w-1 bg-emerald-500 rounded-full animate-[bounce_0.7s_infinite_0.3s] h-3"></div>
            <div className="w-1 bg-teal-400 rounded-full animate-[bounce_0.9s_infinite_0.45s] h-5"></div>
          </div>
        )}

        <p className="text-xs italic leading-relaxed text-slate-300">
          &ldquo;{assistantText}&rdquo;
        </p>

        {transcript && (
          <div className="mt-3 pt-3 border-t border-slate-700/10 dark:border-emerald-500/10 flex items-start gap-2">
            <MessageSquare className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
            <p className="text-[11px] font-mono leading-tight text-slate-400 break-words">
              {transcript}
            </p>
          </div>
        )}
      </div>

      {recognitionError && (
        <div className="mt-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-[10px] flex items-start gap-2 leading-relaxed">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
          <span>{recognitionError}</span>
        </div>
      )}

      {/* Manual Quick Action preset triggers - acts as voice assistant fallback commands! */}
      <div className="mt-4 pt-1.5 border-t border-slate-700/10 dark:border-emerald-500/20">
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Voice Controls / Quick Triggers</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => executePreset("what is my score")}
            className="px-2.5 py-1.5 text-[10px] text-left text-slate-300 font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 border border-slate-200 dark:border-emerald-700/20 rounded-xl transition-all cursor-pointer flex items-center justify-between"
          >
            <span>What is my score?</span>
            <Play className="w-3 h-3 text-emerald-400" />
          </button>
          
          <button
            type="button"
            onClick={() => executePreset("give me a tip")}
            className="px-2.5 py-1.5 text-[10px] text-left text-slate-300 font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 border border-slate-200 dark:border-emerald-700/20 rounded-xl transition-all cursor-pointer flex items-center justify-between"
          >
            <span>Give me a tip</span>
            <Play className="w-3 h-3 text-emerald-400" />
          </button>

          <button
            type="button"
            onClick={() => executePreset("read insights")}
            className="px-2.5 py-1.5 text-[10px] text-left text-slate-300 font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 border border-slate-200 dark:border-emerald-700/20 rounded-xl transition-all cursor-pointer flex items-center justify-between"
          >
            <span>Read AI Insights</span>
            <Play className="w-3 h-3 text-emerald-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
