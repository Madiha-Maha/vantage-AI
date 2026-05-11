import React from "react";
import { motion } from "motion/react";
import { BarChart3, Clock, ArrowUpRight, TrendingUp, Sparkles, Plus, ChevronRight, User, Activity, Zap, Briefcase } from "lucide-react";
import { InterviewSession, UserProfile } from "../types";
import { format } from "date-fns";

interface DashboardProps {
  history: InterviewSession[];
  onStartNew: () => void;
  profile: UserProfile | null;
  onOpenProfile: () => void;
}

export function Dashboard({ history, onStartNew, profile, onOpenProfile }: DashboardProps) {
  const avgScore = history.length > 0 
    ? Math.round(history.reduce((acc, s) => acc + s.overallScore, 0) / history.length) 
    : 0;

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 md:px-12 relative">
      {!profile && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-16 glass p-8 md:p-12 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group shadow-2xl glow-indigo"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-8 relative z-10">
            <div className="h-20 w-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(79,70,229,0.5)]">
              <User className="h-10 w-10 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-white tracking-tighter italic">UPDATE PROFILE</h3>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">Personalize your training blueprint.</p>
            </div>
          </div>
          <button 
            onClick={onOpenProfile}
            className="px-10 py-6 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:scale-105 transition-all relative z-10 shadow-2xl active:scale-95"
          >
            CONFIGURE
          </button>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl font-black text-white tracking-tighter italic leading-none mb-4"
          >
            DASHBOARD <span className="text-indigo-500">_</span>
          </motion.h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px]">Real-time Performance Monitoring</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStartNew}
          className="flex items-center gap-4 px-10 py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] transition-all glass border-indigo-500/50"
        >
          <Plus className="h-5 w-5" />
          Start Training
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
        {[
          { icon: TrendingUp, label: "Proficiency", value: `${avgScore}%`, trend: "+4%", color: "text-indigo-400", bg: "bg-indigo-500/10" },
          { icon: Clock, label: "Assessments", value: history.length, trend: "Consistent", color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { icon: Sparkles, label: "Neural Nodes", value: "48", trend: "Optimized", color: "text-amber-400", bg: "bg-amber-500/10" },
          { icon: BarChart3, label: "Peak State", value: "92%", trend: "+2%", color: "text-fuchsia-400", bg: "bg-fuchsia-500/10" }
        ].map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass p-8 rounded-[2rem] hover:border-white/20 transition-all group"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className={`p-4 rounded-2xl ${stat.bg} border border-white/5 group-hover:scale-110 transition-transform`}>
                 <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
            </div>
            <div className="text-5xl font-black text-white tracking-tighter tabular-nums">{stat.value}</div>
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-4">
               {stat.trend} <span className="opacity-40">_DATA_STREAM</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="md:col-span-2 glass p-12 rounded-[3.5rem] relative overflow-hidden group shadow-2xl"
        >
          <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
            <Zap className="h-64 w-64 text-indigo-500" />
          </div>
          <div className="relative">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-8">Advanced Analytics</h3>
            <h4 className="text-5xl font-black text-white mb-16 leading-tight italic tracking-tighter">COGNITIVE <br/>INSIGHTS</h4>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
              {[
                { label: 'Avg Rating', value: '84%', trend: '+2%' },
                { label: 'Fluency', value: 'High', trend: 'Stable' },
                { label: 'Confidence', value: '92/100', trend: '+5%' },
                { label: 'Knowledge', value: '78%', trend: '+12%' }
              ].map((stat, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">{stat.label}</div>
                  <div className="text-2xl font-black text-white tracking-tight">{stat.value}</div>
                  <div className="flex items-center gap-1">
                     <div className="h-1 w-1 bg-emerald-500 rounded-full animate-pulse" />
                     <div className="text-[9px] font-black text-emerald-500 tracking-widest opacity-80">{stat.trend}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass p-12 rounded-[3.5rem] flex flex-col justify-between group shadow-2xl"
        >
           <div className="space-y-8">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-3xl font-black text-white italic tracking-tighter mb-4">TRAINING <br/>COACH</h4>
                <p className="text-slate-500 text-xs font-bold leading-relaxed tracking-wide uppercase opacity-80">
                  AI-driven performance parsing. Real-time biometric feedback active.
                </p>
              </div>
           </div>
           <motion.div 
             animate={{ opacity: [0.5, 1, 0.5] }}
             transition={{ duration: 2, repeat: Infinity }}
             className="pt-12 flex items-center gap-4"
           >
              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">ANALYSIS_LIVE</span>
           </motion.div>
        </motion.div>
      </div>

      {/* Session History with modern list */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-[3.5rem] overflow-hidden shadow-2xl mb-20"
      >
        <div className="px-12 py-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
           <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">LOG_HISTORY</h3>
           <button className="group flex items-center gap-3 text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors">
            ACCESS_ARCHIVE
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
        <div className="divide-y divide-white/5">
          {history.length > 0 ? (
            history.map((session, idx) => (
              <motion.div 
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-10 hover:bg-white/[0.03] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-10">
                   <div className="h-16 w-16 rounded-[1.5rem] bg-slate-900 border border-white/5 flex items-center justify-center group-hover:glow-indigo group-hover:border-indigo-500/30 transition-all shadow-inner">
                      <Briefcase className="h-8 w-8 text-slate-700 group-hover:text-indigo-400 transition-colors" />
                   </div>
                   <div>
                      <div className="text-3xl font-black text-white group-hover:text-indigo-400 transition-colors tracking-tighter italic uppercase">{session.role}</div>
                      <div className="text-[10px] font-bold text-slate-500 flex items-center gap-4 uppercase tracking-[0.2em] mt-3">
                         <span>{format(session.date, "MMM dd, yyyy")}</span>
                         <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                         <span>{session.difficulty} OPTIMIZATION</span>
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-12 w-full md:w-auto">
                   <div className="flex-1 md:w-56">
                      <div className="flex justify-between text-[10px] font-black text-slate-600 uppercase mb-3 tracking-widest">
                         <span>Score</span>
                         <span className="text-white">{session.overallScore}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${session.overallScore}%` }}
                           transition={{ duration: 1, delay: 0.5 }}
                           className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                         />
                      </div>
                   </div>
                   <div className="flex items-center gap-4 text-slate-500 group-hover:text-white transition-all transform group-hover:translate-x-2">
                      <span className="text-[10px] font-black uppercase tracking-widest">Open</span>
                      <div className="p-3 rounded-full border border-white/5 bg-slate-950 group-hover:border-indigo-500/50 group-hover:glow-indigo">
                        <ChevronRight className="h-5 w-5" />
                      </div>
                   </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-32 text-center">
              <div className="mx-auto h-24 w-24 rounded-[2rem] glass flex items-center justify-center mb-8 shadow-inner">
                 <Briefcase className="h-12 w-12 text-slate-800" />
              </div>
              <h4 className="text-white font-black text-2xl mb-4 tracking-tight uppercase">HISTORY_EMPTY</h4>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest opacity-60">Initialize your first assessment protocol.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Setup / Sharing grids with glass look */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { 
            title: "INSTALL_AI", 
            label: "App Deployment", 
            icon: Plus, 
            desc: "Use 'Add to Home Screen' for full-screen execution and native cache access.",
            accent: "text-indigo-400",
            tags: ["PWA_V4", "EDGE_CACHE"]
          },
          { 
            title: "SOCIAL_LINK", 
            label: "invite Others", 
            icon: ArrowUpRight, 
            desc: "Share high-performance benchmarks with colleagues. Secure data isolation active.",
            accent: "text-emerald-400",
            action: "Copy Link",
            tags: ["E2E_ENCRYPTED", "PRIVATE_SYNC"]
          }
        ].map((card, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ y: -10 }}
            className="glass p-12 rounded-[3.5rem] relative overflow-hidden group shadow-2xl"
          >
             <div className="absolute top-0 right-0 p-12 opacity-5 scale-125 group-hover:scale-150 transition-transform duration-700">
                <card.icon className={`h-32 w-32 ${card.accent}`} />
             </div>
             <h3 className={`text-[10px] font-black ${card.accent} uppercase tracking-[0.5em] mb-6`}>{card.label}</h3>
             <h4 className="text-4xl font-black text-white mb-8 italic tracking-tighter uppercase leading-none">{card.title}</h4>
             <p className="text-slate-500 text-sm font-bold leading-relaxed mb-10 tracking-wide uppercase">
               {card.desc}
             </p>
             <div className="flex flex-wrap gap-4">
                {card.tags.map(tag => (
                  <div key={tag} className="px-5 py-2 bg-slate-950/50 rounded-xl border border-white/5 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                    {tag}
                  </div>
                ))}
             </div>
             {card.action && (
               <button 
                 onClick={() => {
                   navigator.clipboard.writeText(window.location.href);
                   alert("Link Synchronized to Clipboard.");
                 }}
                 className="mt-10 w-full py-6 glass bg-emerald-600/10 border-emerald-500/30 text-emerald-400 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-emerald-600 hover:text-white transition-all shadow-xl active:scale-95"
               >
                 {card.action}
               </button>
             )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
