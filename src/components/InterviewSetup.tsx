import React, { useState } from "react";
import { motion } from "motion/react";
import { Briefcase, GraduationCap, Trophy, ChevronRight, Sparkles, Target, Zap } from "lucide-react";
import { InterviewConfig, InterviewDifficulty } from "../types";
import { cn } from "../lib/utils";

export function InterviewSetup({ onStart }: { onStart: (config: InterviewConfig) => void }) {
  const [config, setConfig] = useState<InterviewConfig>({
    role: "Frontend Developer",
    industry: "Technology",
    difficulty: InterviewDifficulty.MEDIUM,
  });

  const difficulties = [
    { id: InterviewDifficulty.EASY, icon: GraduationCap, desc: "Entry level positions" },
    { id: InterviewDifficulty.MEDIUM, icon: Briefcase, desc: "Mid-level experience" },
    { id: InterviewDifficulty.HARD, icon: Trophy, desc: "Senior & Executive roles" },
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-2xl backdrop-blur-md"
      >
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Configure Your Session</h2>
        <p className="text-slate-500 mb-10 font-medium">Define your target trajectory to initialize industry-specific performance modeling.</p>

        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Target Role</label>
              <input
                type="text"
                value={config.role}
                onChange={(e) => setConfig({ ...config, role: e.target.value })}
                placeholder="e.g. Senior Product Designer"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Industry Vertical</label>
              <input
                type="text"
                value={config.industry}
                onChange={(e) => setConfig({ ...config, industry: e.target.value })}
                placeholder="e.g. Fintech, E-commerce"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700"
              />
            </div>
          </div>

          <div className="space-y-6">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Complexity Level</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {difficulties.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setConfig({ ...config, difficulty: d.id })}
                  className={cn(
                    "relative flex flex-col items-center text-center p-8 rounded-2xl border transition-all duration-300",
                    config.difficulty === d.id
                      ? "bg-indigo-500/5 border-indigo-500 shadow-lg shadow-indigo-500/10"
                      : "bg-slate-950/30 border-slate-800 hover:border-slate-700"
                  )}
                >
                  <d.icon className={cn("h-8 w-8 mb-4", config.difficulty === d.id ? "text-indigo-400" : "text-slate-600")} />
                  <div className="font-bold text-white tracking-wide">{d.id}</div>
                  <div className="text-[10px] text-slate-500 mt-2 font-medium leading-relaxed uppercase tracking-tighter">{d.desc}</div>
                  {config.difficulty === d.id && (
                    <motion.div
                      layoutId="choice-indicator"
                      className="absolute inset-x-0 bottom-0 h-1 bg-indigo-500 rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={() => onStart(config)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-500/20 transform hover:-translate-y-1 active:translate-y-0"
            >
              Initialize Assessment
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Neural Scenarios", val: "10,000+", icon: Sparkles },
          { label: "Global Benchmarks", val: "50+", icon: Target },
          { label: "Real-time Metrics", val: "Enabled", icon: Zap },
        ].map((stat, i) => (
          <div key={i} className="flex items-center gap-5 px-8 py-5 rounded-2xl bg-slate-900 border border-slate-800/50">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <stat.icon className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stat.label}</div>
              <div className="text-xl font-bold text-white">{stat.val}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
