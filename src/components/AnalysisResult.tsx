import React, { memo, useState, useEffect } from "react";
import { motion } from "motion/react";
import { CheckCircle2, ChevronRight, BarChart3, TrendingUp, MessageSquare, AlertTriangle, Home, Sparkles, Trophy, Zap } from "lucide-react";
import { InterviewQuestion } from "../types";
import { GeminiService } from "../services/gemini";
import { cn } from "../lib/utils";

import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer 
} from "recharts";

interface AnalysisResultProps {
  questions: InterviewQuestion[];
  role: string;
  hasSaved: boolean;
  onSave: () => void;
  onFinish: () => void;
}

export const AnalysisResult = memo(({ questions, role, hasSaved, onSave, onFinish }: AnalysisResultProps) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [growthPlan, setGrowthPlan] = useState<string[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        const [summaryText, plan] = await Promise.all([
          GeminiService.getSessionSummary(questions, role),
          GeminiService.getGrowthPlan(questions, role)
        ]);
        setSummary(summaryText);
        setGrowthPlan(plan);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSummary(false);
      }
    };
    fetchAnalysisData();
  }, [questions, role]);
  const count = questions.length || 1;
  const overallScore = Math.round(questions.reduce((acc, q) => acc + (q.analysis?.score || 0), 0) / count);
  const avgConfidence = Math.round(questions.reduce((acc, q) => acc + (q.analysis?.confidence || 0), 0) / count);
  const avgPace = Math.round(questions.reduce((acc, q) => acc + (q.analysis?.speakingSpeed || 0), 0) / count);

  const radarData = [
    { subject: "CLARITY", A: overallScore, fullMark: 100 },
    { subject: "CONFIDENCE", A: avgConfidence, fullMark: 100 },
    { subject: "LOGIC", A: Math.round(overallScore * 0.9 + avgConfidence * 0.1), fullMark: 100 },
    { subject: "DENSITY", A: Math.round(overallScore * 0.8 + avgPace * 0.2), fullMark: 100 },
    { subject: "PURPOSE", A: Math.round(overallScore * 0.95), fullMark: 100 },
  ];

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

      {/* Professional Summary & Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 glass rounded-[3rem] p-12 relative overflow-hidden border border-indigo-500/20 shadow-2xl h-full"
        >
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] scale-150">
            <Sparkles className="h-64 w-64 text-indigo-400" />
          </div>
          
          <div className="flex flex-col md:flex-row gap-12 items-start relative z-10">
            <div className="h-20 w-20 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 glow-indigo">
               <Trophy className="h-10 w-10 text-indigo-400" />
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                 <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em]">EXECUTIVE_PERFORMANCE_DEBRIEF</span>
                 <div className="h-px w-12 bg-indigo-500/20" />
              </div>
              {loadingSummary ? (
                <div className="space-y-4">
                  <div className="h-4 w-full bg-white/5 animate-pulse rounded-full" />
                  <div className="h-4 w-3/4 bg-white/5 animate-pulse rounded-full" />
                </div>
              ) : (
                <p className="text-2xl font-medium text-white/90 leading-relaxed italic tracking-tight">
                  "{summary}"
                </p>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-[3rem] p-8 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group h-full"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05),transparent)] opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8">COGNITIVE_DIMENSIONS</span>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8, fontWeight: 900, letterSpacing: '0.1em' }} 
                />
                <Radar
                  name="Performance"
                  dataKey="A"
                  stroke="#6366F1"
                  fill="#6366F1"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
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

      {/* 7-Day Growth Protocol */}
      <section className="mb-24">
        <div className="flex items-center gap-6 mb-12">
           <Zap className="h-6 w-6 text-amber-400 glow-amber" />
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">7-DAY_COGNITIVE_UPGRADE_PROTOCOL</h3>
           <div className="h-px flex-1 bg-white/[0.03]" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(growthPlan.length > 0 ? growthPlan : [
            "Synthesize core technical domains into high-density verbal frameworks.",
            "Calibrate semantic delivery for 15% increase in structural clarity.",
            "Optimize neural recall through targeted articulation simulations."
          ]).map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 text-4xl font-black text-white/[0.02] italic tracking-tighter group-hover:text-amber-500/[0.05] transition-colors">
                0{i + 1}
              </div>
              <div className="space-y-6 relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                   <ChevronRight className="h-6 w-6 text-amber-400" />
                </div>
                <p className="text-white/80 text-lg font-medium leading-relaxed tracking-tight italic">
                  "{step}"
                </p>
                <div className="flex items-center gap-4 pt-4">
                   <div className="h-1 w-12 bg-amber-500 rounded-full glow-amber" />
                   <span className="text-[8px] font-black text-amber-500/40 uppercase tracking-widest">Active_Simulation_Required</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="space-y-12">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] flex items-center gap-6 mb-12">
          <BarChart3 className="h-5 w-5 text-indigo-400" />
          COMPONENT_BREAKDOWN
          <div className="h-px flex-1 bg-white/[0.03]" />
        </h3>
        
        {questions.map((q, idx) => (
          <motion.div
            key={q.id}
            initial={idx < 5 ? { opacity: 0, y: 30 } : { opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx < 5 ? idx * 0.1 : 0 }}
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
});
