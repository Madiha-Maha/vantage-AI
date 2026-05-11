import React from "react";
import { motion } from "motion/react";
import { CheckCircle2, ChevronRight, BarChart3, TrendingUp, MessageSquare, AlertTriangle, Home } from "lucide-react";
import { InterviewQuestion } from "../types";
import { cn } from "../lib/utils";

interface AnalysisResultProps {
  questions: InterviewQuestion[];
  hasSaved: boolean;
  onSave: () => void;
  onFinish: () => void;
}

export function AnalysisResult({ questions, hasSaved, onSave, onFinish }: AnalysisResultProps) {
  const count = questions.length || 1;
  const overallScore = Math.round(questions.reduce((acc, q) => acc + (q.analysis?.score || 0), 0) / count);
  const avgConfidence = Math.round(questions.reduce((acc, q) => acc + (q.analysis?.confidence || 0), 0) / count);
  const avgPace = Math.round(questions.reduce((acc, q) => acc + (q.analysis?.speakingSpeed || 0), 0) / count);

  return (
    <div className="max-w-7xl mx-auto py-20 px-4 md:px-12">
      <div className="text-center mb-24">
        <div className="flex flex-col items-center gap-6 mb-12">
          <motion.div
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="inline-flex items-center gap-3 px-8 py-3 rounded-2xl glass text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 border-emerald-500/20 glow-emerald"
          >
            <CheckCircle2 className="h-4 w-4" />
            CORE_METRICS_COMPILED
          </motion.div>
          
          <button
            onClick={onSave}
            disabled={hasSaved}
            className={cn(
              "flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
              hasSaved 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 glow-emerald" 
                : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl glow-indigo"
            )}
          >
            {hasSaved ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                SNAPSHOT_PERSISTED
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4" />
                COMMIT_TO_HISTORY
              </>
            )}
          </button>
        </div>
        <h2 className="text-7xl font-black text-white mb-8 tracking-tighter uppercase italic leading-none">Assessment_Summary</h2>
        <p className="text-slate-500 text-lg max-w-3xl mx-auto font-bold leading-relaxed uppercase tracking-wider">
           Proprietary AI modeling has processed your session performance. Review the architectural breakdown of your professional delivery below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        {[
          { label: "META_PROFICIENCY", value: overallScore, color: "text-indigo-400", sub: "EXECUTIVE_TIER", icon: Trophy },
          { label: "CORE_RESONANCE", value: avgConfidence, color: "text-emerald-400", sub: "OPTIMAL_PRESENCE", icon: TrendingUp },
          { label: "CADENCE_VELOCITY", value: avgPace, color: "text-amber-400", sub: "SYNC_OPTIMIZED", icon: BarChart3 },
        ].map((stat, i) => (
          <div key={i} className="glass rounded-[3rem] p-12 text-center relative overflow-hidden group shadow-2xl transition-all hover:scale-[1.02]">
            <div className="absolute -top-6 -right-6 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform rotate-12">
              <stat.icon className="h-32 w-32 text-white" />
            </div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 leading-none">{stat.label}</div>
            <div className={cn("text-8xl font-black leading-none mb-6 tabular-nums italic", stat.color)}>{stat.value}<span className="text-2xl ml-2 opacity-50">%</span></div>
            <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="space-y-12">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] flex items-center gap-6 mb-12">
          <BarChart3 className="h-5 w-5 text-indigo-400" />
          COMPONENT_BREAKDOWN
          <div className="h-px flex-1 bg-white/[0.03]" />
        </h3>
        
        {questions.map((q, idx) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass rounded-[4rem] p-12 shadow-2xl relative overflow-hidden group transition-all"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
            
            <div className="flex flex-col lg:flex-row gap-16">
              <div className="flex-1 space-y-12">
                <div className="flex items-start gap-8">
                  <div className="h-16 w-16 rounded-[1.5rem] bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-xl font-black text-indigo-400 shadow-inner glow-indigo">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <h4 className="text-3xl font-black text-white tracking-tighter leading-tight italic uppercase">"{q.text}"</h4>
                </div>
                
                <div className="space-y-10">
                  <div className="space-y-6">
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-4">
                       LINGUISTIC_CAPTURE
                       <div className="h-px flex-1 bg-white/[0.03]" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 leading-relaxed bg-slate-950/40 p-8 rounded-[2rem] border border-white/5 font-mono italic uppercase tracking-wider shadow-inner">
                      "{q.transcript}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                     {[
                       { l: "SCORE", v: q.analysis?.score, c: "text-indigo-400" },
                       { l: "CONF", v: q.analysis?.confidence, c: "text-emerald-400" },
                       { l: "PACE", v: q.analysis?.speakingSpeed, c: "text-white" },
                       { l: "GAZE", v: q.analysis?.eyeContactScore, c: "text-amber-500" }
                     ].map((stat, i) => (
                       <div key={i} className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 shadow-inner">
                          <div className="text-[10px] font-black text-slate-600 uppercase mb-3 tracking-[0.2em] leading-none">{stat.l}</div>
                          <div className={cn("text-2xl font-black italic", stat.c)}>{stat.v}{stat.l !== 'PACE' && '%'}</div>
                       </div>
                     ))}
                  </div>
                </div>
              </div>

              <div className="lg:w-96 flex-shrink-0 space-y-10">
                <div className="p-10 rounded-[3rem] border border-indigo-500/20 bg-indigo-500/5 shadow-inner relative overflow-hidden group/tip">
                  <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover/tip:opacity-10 transition-opacity">
                    <TrendingUp className="h-20 w-20 text-indigo-400" />
                  </div>
                  <div className="flex items-center gap-4 mb-8">
                    <TrendingUp className="h-5 w-5 text-indigo-400" />
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.4em]">STRATEGIC_DELTA</span>
                  </div>
                  <ul className="space-y-6">
                    {q.analysis?.tips.map((tip, i) => (
                      <li key={i} className="text-[11px] font-bold text-slate-300 flex gap-4 leading-relaxed uppercase tracking-wide">
                        <div className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0 glow-indigo" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-10 rounded-[3rem] glass shadow-inner">
                  <div className="flex items-center gap-4 mb-8">
                    <MessageSquare className="h-5 w-5 text-slate-600" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">SEMANTIC_NODES</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {q.analysis?.keywordsFound.map((kw, i) => (
                      <span key={i} className="text-[9px] bg-white/5 text-slate-400 px-4 py-2 rounded-xl border border-white/5 font-black uppercase tracking-widest hover:text-white transition-colors cursor-default">#{kw}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-32 flex justify-center pt-20 border-t border-white/5">
        <button
          onClick={onFinish}
          className="flex items-center gap-6 px-12 py-6 glass rounded-[2.5rem] text-white font-black uppercase tracking-[0.4em] hover:bg-white/[0.05] transition-all hover:-translate-y-2 shadow-2xl active:translate-y-0 group italic"
        >
          <Home className="h-6 w-6 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          RETURN_TO_CORE
        </button>
      </div>
    </div>
  );
}

function Trophy({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
