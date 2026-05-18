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
    <div className="max-w-5xl mx-auto py-20 px-4 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-[4rem] p-12 md:p-16 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
        <h2 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase italic leading-none">Configure_Session</h2>
        <p className="text-slate-500 mb-16 font-bold uppercase tracking-wider max-w-2xl">Define your target trajectory to initialize industry-specific performance modeling.</p>

        <div className="space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-1">TARGET_ROLE</label>
              <div className="relative group">
                <input
                  type="text"
                  value={config.role}
                  onChange={(e) => setConfig({ ...config, role: e.target.value })}
                  placeholder="e.g. Senior Product Designer"
                  className="w-full bg-slate-950/40 border border-white/5 rounded-2xl px-6 py-5 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 focus:glow-indigo transition-all placeholder:text-slate-800 uppercase tracking-widest shadow-inner"
                />
                <div className="absolute top-1/2 -translate-y-1/2 right-6 p-2 rounded-lg bg-white/5 opacity-0 group-focus-within:opacity-100 transition-opacity">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-1">INDUSTRY_VERTICAL</label>
              <input
                type="text"
                value={config.industry}
                onChange={(e) => setConfig({ ...config, industry: e.target.value })}
                placeholder="e.g. Fintech, E-commerce"
                className="w-full bg-slate-950/40 border border-white/5 rounded-2xl px-6 py-5 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 focus:glow-indigo transition-all placeholder:text-slate-800 uppercase tracking-widest shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-8">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-1">COMPLEXITY_LEVEL</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {difficulties.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setConfig({ ...config, difficulty: d.id })}
                  className={cn(
                    "relative flex flex-col items-center text-center p-10 rounded-[2.5rem] border transition-all duration-500 group",
                    config.difficulty === d.id
                      ? "bg-indigo-500/5 border-indigo-500 glow-indigo"
                      : "bg-white/[0.02] border-white/5 hover:border-white/20"
                  )}
                >
                  <div className={cn(
                    "p-5 rounded-2xl mb-6 transition-all",
                    config.difficulty === d.id ? "bg-indigo-500/10 text-indigo-400" : "bg-white/5 text-slate-600 group-hover:text-slate-400"
                  )}>
                    <d.icon className="h-8 w-8" />
                  </div>
                  <div className="font-black text-white uppercase italic tracking-[0.2em] mb-2">{d.id}</div>
                  <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest leading-relaxed">{d.desc}</div>
                  {config.difficulty === d.id && (
                    <motion.div
                      layoutId="choice-indicator"
                      className="absolute inset-x-0 bottom-0 h-1.5 bg-indigo-500 rounded-full glow-indigo shadow-[0_0_20px_rgba(99,102,241,0.8)]"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-10">
            <button
              onClick={() => onStart(config)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-8 rounded-[2.5rem] flex items-center justify-center gap-4 transition-all shadow-xl glow-indigo group active:scale-95 italic uppercase tracking-[0.4em]"
            >
              EXECUTE_SESSION
              <ChevronRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "AI_SCENARIOS", val: "10,000+", icon: Sparkles },
          { label: "GLOBAL_BENCHMARKS", val: "50+", icon: Target },
          { label: "CORE_LEADERSHIP", val: "SUPPORTED", icon: Zap },
        ].map((stat, i) => (
          <div key={i} className="flex items-center gap-6 p-8 rounded-[2.5rem] glass border-white/5 shadow-2xl transition-all hover:scale-105">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:glow-indigo">
              <stat.icon className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <div className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] mb-1">{stat.label}</div>
              <div className="text-2xl font-black text-white uppercase italic tracking-tighter">{stat.val}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
