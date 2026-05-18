import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BarChart3, Clock, ArrowUpRight, TrendingUp, Sparkles, Plus, ChevronRight, User, Activity, Zap, Briefcase, CheckCircle2, ArrowRight, LayoutGrid, Fingerprint } from "lucide-react";
import { InterviewSession, UserProfile } from "../types";
import { format } from "date-fns";
import { GeminiService } from "../services/gemini";
import { useAuth } from "../lib/AuthContext";
import { cn } from "../lib/utils";

interface DashboardProps {
  history: InterviewSession[];
  onStartNew: () => void;
  profile: UserProfile | null;
  onOpenProfile: () => void;
}

export function Dashboard({ history, onStartNew, profile, onOpenProfile }: DashboardProps) {
  const [showToast, setShowToast] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  React.useEffect(() => {
    const fetchInsights = async () => {
      setLoadingInsights(true);
      try {
        const res = await GeminiService.getCareerInsights(history, profile);
        setInsights(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingInsights(false);
      }
    };
    fetchInsights();
  }, [history, profile]);

  const avgScore = history.length > 0 
    ? Math.round(history.reduce((acc, s) => acc + s.overallScore, 0) / history.length) 
    : 0;

  const { isGuest } = useAuth();

  return (
    <div className="max-w-7xl mx-auto py-24 px-8 md:px-20 relative min-h-screen">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-[1px] bg-white/5 z-40" />
      
      {isGuest && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-24 p-1 rounded-[3rem] bg-gradient-to-r from-amber-500/20 via-transparent to-amber-500/20"
        >
          <div className="bg-slate-950/80 backdrop-blur-3xl rounded-[2.9rem] p-12 flex flex-col md:flex-row items-center justify-between gap-12 border border-white/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                <Fingerprint className="h-64 w-64 text-amber-500" />
             </div>
             <div className="flex flex-col md:flex-row items-center gap-12 text-center md:text-left relative z-10">
                <div className="h-20 w-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center glow-amber shrink-0">
                   <Activity className="h-8 w-8 text-amber-400" />
                </div>
                <div>
                   <div className="flex items-center gap-4 mb-3 justify-center md:justify-start">
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.5em]">GUEST_ACCESS_ACTIVE</span>
                      <div className="h-1 w-1 rounded-full bg-amber-500 animate-pulse" />
                   </div>
                   <h3 className="text-3xl font-medium text-white tracking-tight mb-2 uppercase italic">Localized Logic Mode.</h3>
                   <p className="text-white/40 text-base max-w-lg leading-relaxed font-medium">Your simulation data is currently stored in local neural buffers. Synchronize with the cloud to preserve your legacy across all hardware arrays.</p>
                </div>
             </div>
             <div className="flex flex-col items-stretch gap-4 relative z-10 w-full md:w-auto">
                <div className="text-[10px] text-amber-500/60 font-black uppercase tracking-widest text-center mb-2 italic">Persistence_Warning</div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full w-2/3 bg-amber-500 rounded-full glow-amber" />
                </div>
             </div>
          </div>
        </motion.div>
      )}

      {(!profile && !isGuest) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-24 card-border p-12 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
            <div className="h-20 w-20 bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
              <User className="h-8 w-8 text-white/40" />
            </div>
            <div>
              <h3 className="text-2xl font-medium text-white mb-3 tracking-tight">Identity Configuration Needed</h3>
              <p className="text-white/40 text-sm max-w-sm">Define your professional parameters to optimize the neural assessment protocols.</p>
            </div>
          </div>
          <button 
            onClick={onOpenProfile}
            className="px-12 py-6 bg-white text-black font-medium text-xs tracking-[0.2em] uppercase hover:bg-white/90 transition-all shrink-0 shadow-2xl"
          >
            CONFIGURE PROFILE
          </button>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 mb-24">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="h-[1px] w-8 bg-[#6366F1]" />
             <span className="text-[10px] font-medium tracking-[0.4em] uppercase text-[#6366F1]">Performance Center</span>
          </div>
          <h2 className="text-6xl md:text-8xl font-medium text-white tracking-[-0.04em] leading-[0.9]">
            Dashboard.
          </h2>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartNew}
          className="group flex items-center gap-6 px-10 py-6 bg-white text-black font-medium text-sm tracking-widest uppercase shadow-2xl"
        >
          Initiate Simulation
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
        </motion.button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-[1px] bg-white/5 border border-white/5 mb-32">
        {[
          { label: "Overall Proficiency", value: `${avgScore}%`, trend: "+4% Expected" },
          { label: "Active Assessments", value: history.length, trend: "Status: Optimized" },
          { label: "Cognitive Nodes", value: "48", trend: "Sync: Complete" },
          { label: "Behavioral Peak", value: "92%", trend: "+2% Progress" }
        ].map((stat, idx) => (
          <div key={idx} className="bg-[#050505] p-12 space-y-8 flex flex-col justify-between">
            <span className="text-[10px] font-medium text-white/40 uppercase tracking-[0.3em]">{stat.label}</span>
            <div className="space-y-4">
               <div className="text-6xl font-medium text-white tracking-tighter">{stat.value}</div>
               <div className="text-[10px] font-medium text-[#6366F1] uppercase tracking-[0.2em]">{stat.trend}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-40">
        {/* Career Coach Section */}
        <div className="md:col-span-12 lg:col-span-5 space-y-12">
            <div className="flex flex-col gap-8 p-12 bg-white/[0.02] border border-white/10 relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-1 h-full bg-[#6366F1]" />
               <div className="flex items-center justify-between">
                  <div className="h-10 w-10 bg-white/5 flex items-center justify-center border border-white/10">
                     <Sparkles className="h-5 w-5 text-white/40" />
                  </div>
                  <span className="text-[9px] font-medium text-[#6366F1] uppercase tracking-[0.4em]">Neural Analysis</span>
               </div>
               
               <div className="space-y-6">
                  <h3 className="text-3xl font-medium text-white tracking-tight leading-tight">Performance Strategist</h3>
                  <div className="min-h-[80px]">
                    {loadingInsights ? (
                      <div className="space-y-3 pt-2">
                        <div className="h-[1px] w-full bg-white/10 animate-pulse" />
                        <div className="h-[1px] w-2/3 bg-white/10 animate-pulse" />
                      </div>
                    ) : (
                      <p className="text-white/60 text-lg font-light leading-relaxed tracking-tight">
                        {insights || "Establishing neural link for high-impact performance intelligence..."}
                      </p>
                    )}
                  </div>
               </div>

               <div className="pt-8 border-t border-white/5 flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]" />
                  <span className="text-[9px] font-medium text-white/20 uppercase tracking-[0.4em]">Intelligence Stream Active</span>
               </div>
            </div>
        </div>

        {/* Cognitive Breakdown Column */}
        <div className="md:col-span-12 lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8">
           {[
             { label: 'Fluency Index', val: '84%', desc: 'Semantic clarity and structural flow' },
             { label: 'Latency Node', val: 'Fast', desc: 'Real-time response processing speed' },
             { label: 'Confidence Score', val: '92/100', desc: 'Behavioral certainty assessment' },
             { label: 'Knowledge Base', val: '78%', desc: 'Technical depth and accuracy' }
           ].map((item, idx) => (
             <div key={idx} className="p-10 border border-white/5 flex flex-col justify-between group hover:bg-white/[0.01] transition-colors">
                <div className="space-y-4">
                   <span className="text-[10px] font-medium text-white/20 uppercase tracking-[0.3em]">{item.label}</span>
                   <div className="text-4xl font-medium text-white tracking-tight">{item.val}</div>
                </div>
                <p className="text-[10px] text-white/40 uppercase tracking-widest leading-loose mt-8">{item.desc}</p>
             </div>
           ))}
        </div>
      </div>

      {/* Modern List for History */}
      <div className="space-y-12">
        <div className="flex items-center justify-between border-b border-white/10 pb-8 px-4">
           <div className="flex items-center gap-6">
              <LayoutGrid className="h-4 w-4 text-white/20" />
              <h3 className="text-[10px] font-medium text-white/60 uppercase tracking-[0.4em]">Assessment Archive</h3>
           </div>
           <button className="text-[10px] font-medium text-white/40 uppercase tracking-[0.3em] hover:text-white transition-colors">
              Access Full History
           </button>
        </div>

        <div className="space-y-1">
          {history.length > 0 ? (
            history.map((session, idx) => (
              <motion.div 
                key={session.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="group flex flex-col md:flex-row items-start md:items-center justify-between gap-12 p-8 md:p-12 hover:bg-white/[0.02] transition-colors border-b border-white/5 cursor-pointer"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center gap-16">
                   <div className="text-[10px] font-mono text-white/20">00{idx + 1}</div>
                   <div>
                      <h4 className="text-3xl font-medium text-white group-hover:text-[#6366F1] transition-colors tracking-tight mb-2 uppercase">{session.role}</h4>
                      <div className="flex items-center gap-6 text-[10px] font-medium text-white/40 uppercase tracking-[0.2em]">
                         <span>{format(session.date, "MMM dd, yyyy")}</span>
                         <div className="h-1 w-1 rounded-full bg-white/10" />
                         <span>{session.difficulty} Level</span>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-16 w-full md:w-auto">
                   <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-[10px] font-medium text-white/20 uppercase tracking-widest">Score</span>
                      <span className="text-2xl font-medium text-white">{session.overallScore}%</span>
                   </div>
                   <div className="h-12 w-12 border border-white/10 flex items-center justify-center group-hover:border-[#6366F1] group-hover:bg-[#6366F1]/10 transition-all shrink-0">
                      <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-[#6366F1] transition-colors" />
                   </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-40 text-center flex flex-col items-center">
               <div className="h-1px w-12 bg-white/10 mb-8" />
               <p className="text-white/20 text-[10px] font-medium uppercase tracking-[0.5em]">No assessment records found</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-white text-black px-10 py-5 font-medium text-[10px] uppercase tracking-[0.4em] z-[100] shadow-2xl"
          >
            System Link Copied
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
