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
  const overallScore = Math.round(questions.reduce((acc, q) => acc + (q.analysis?.score || 0), 0) / questions.length);
  const avgConfidence = Math.round(questions.reduce((acc, q) => acc + (q.analysis?.confidence || 0), 0) / questions.length);
  const avgPace = Math.round(questions.reduce((acc, q) => acc + (q.analysis?.speakingSpeed || 0), 0) / questions.length);

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="text-center mb-16">
        <div className="flex flex-col items-center gap-4 mb-8">
          <motion.div
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="inline-flex items-center gap-2 px-6 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/10"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Neural Assessment Compiled
          </motion.div>
          
          <button
            onClick={onSave}
            disabled={hasSaved}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
              hasSaved 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
            )}
          >
            {hasSaved ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                Snapshot Persisted
              </>
            ) : (
              <>
                <TrendingUp className="h-3 w-3" />
                Commit to History
              </>
            )}
          </button>
        </div>
        <h2 className="text-5xl font-bold text-white mb-6 tracking-tight">Performance Summary</h2>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
          Proprietary neural modeling has processed your session metrics. Review the architectural breakdown of your communication delivery below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center relative overflow-hidden group shadow-2xl">
          <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform rotate-12">
            <Trophy className="h-32 w-32 text-white" />
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Meta Proficiency</div>
          <div className="text-7xl font-bold text-indigo-400 leading-none mb-6 tabular-nums">{overallScore}<span className="text-2xl ml-1 opacity-50">%</span></div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Industry Benchmark: A+</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center shadow-2xl">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Core Resonance</div>
          <div className="text-7xl font-bold text-emerald-400 leading-none mb-6 tabular-nums">{avgConfidence}<span className="text-2xl ml-1 opacity-50">%</span></div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">High Executive Presence</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center shadow-2xl">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Cadence Velocity</div>
          <div className="text-7xl font-bold text-amber-400 leading-none mb-6 tabular-nums">{avgPace}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Syllabic Sync Optimization</div>
        </div>
      </div>

      <div className="space-y-10">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em] flex items-center gap-4 mb-2">
          <BarChart3 className="h-4 w-4 text-indigo-400" />
          Component Analysis
          <div className="h-px flex-1 bg-slate-800/50" />
        </h3>
        
        {questions.map((q, idx) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-xl group hover:border-slate-700 transition-colors"
          >
            <div className="flex flex-col md:flex-row gap-12">
              <div className="flex-1">
                <div className="flex items-center gap-5 mb-8">
                  <div className="h-10 w-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xs font-bold text-indigo-400 shadow-inner">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <h4 className="text-xl font-bold text-white tracking-tight leading-snug italic font-light">"{q.text}"</h4>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 ml-1">Linguistic Input</div>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium bg-slate-950/50 p-6 rounded-2xl border border-slate-800 font-mono italic">
                      "{q.transcript}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                     <div className="p-5 rounded-2xl bg-slate-950/30 border border-slate-800/50">
                        <div className="text-[9px] font-bold text-slate-600 uppercase mb-2 tracking-widest">Proficiency</div>
                        <div className="text-xl font-bold text-indigo-400">{q.analysis?.score}%</div>
                     </div>
                     <div className="p-5 rounded-2xl bg-slate-950/30 border border-slate-800/50">
                        <div className="text-[9px] font-bold text-slate-600 uppercase mb-2 tracking-widest">Resonance</div>
                        <div className="text-xl font-bold text-emerald-400">{q.analysis?.confidence}%</div>
                     </div>
                     <div className="p-5 rounded-2xl bg-slate-950/30 border border-slate-800/50">
                        <div className="text-[9px] font-bold text-slate-600 uppercase mb-2 tracking-widest">Velocity</div>
                        <div className="text-xl font-bold text-white">{q.analysis?.speakingSpeed}</div>
                     </div>
                     <div className="p-5 rounded-2xl bg-slate-950/30 border border-slate-800/50">
                        <div className="text-[9px] font-bold text-slate-600 uppercase mb-2 tracking-widest">Visual Link</div>
                        <div className="text-xl font-bold text-amber-500">{q.analysis?.eyeContactScore}%</div>
                     </div>
                  </div>
                </div>
              </div>

              <div className="md:w-80 flex-shrink-0 space-y-6">
                <div className="p-6 rounded-3xl border border-indigo-500/20 bg-indigo-500/5 shadow-inner">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-4 w-4 text-indigo-400" />
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Refinement Vector</span>
                  </div>
                  <ul className="space-y-4">
                    {q.analysis?.tips.map((tip, i) => (
                      <li key={i} className="text-xs text-slate-300 flex gap-3 leading-relaxed">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 rounded-3xl border border-slate-800 bg-slate-950/30">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="h-4 w-4 text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Semantic Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {q.analysis?.keywordsFound.map((kw, i) => (
                      <span key={i} className="text-[9px] bg-slate-800 text-slate-400 px-3 py-1 rounded-lg border border-slate-700 font-bold uppercase tracking-tighter">#{kw}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 flex justify-center pt-10 border-t border-slate-800">
        <button
          onClick={onFinish}
          className="flex items-center gap-3 px-10 py-5 bg-slate-900 border border-slate-800 rounded-2xl text-white font-bold hover:bg-slate-800 transition-all hover:-translate-y-1 shadow-2xl active:translate-y-0 group"
        >
          <Home className="h-5 w-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          Primary Terminal
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
