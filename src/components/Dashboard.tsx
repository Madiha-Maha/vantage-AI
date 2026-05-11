import React from "react";
import { motion } from "motion/react";
import { BarChart3, Clock, ArrowUpRight, TrendingUp, Sparkles, Plus, ChevronRight, User, Activity, Zap } from "lucide-react";
import { InterviewSession } from "../types";
import { format } from "date-fns";

import { UserProfile } from "../types";

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
    <div className="max-w-7xl mx-auto py-12 px-4 md:px-8">
      {!profile && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 p-8 rounded-[2.5rem] bg-gradient-to-r from-indigo-600/20 to-transparent border border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.1),transparent)]" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight italic">Initialize Your Professional Identity</h3>
              <p className="text-slate-400 text-sm font-medium mt-1">Complete your profile blueprint to refine performance assessment precision.</p>
            </div>
          </div>
          <button 
            onClick={onOpenProfile}
            className="px-8 py-4 bg-white text-slate-950 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-indigo-50 hover:scale-105 transition-all relative z-10 shadow-xl"
          >
            Construct Profile
          </button>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div>
          <h2 className="text-4xl font-bold text-white tracking-tight">Executive Control</h2>
          <p className="text-slate-500 mt-2 font-medium">Monitoring your professional evolution trajectory.</p>
        </div>
        <button
          onClick={onStartNew}
          className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Initialize Session
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
               <TrendingUp className="h-5 w-5 text-indigo-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Proficiency</span>
          </div>
          <div className="text-4xl font-bold text-white tabular-nums">{avgScore}%</div>
          <div className="text-xs text-slate-600 mt-2 flex items-center gap-1.5 font-medium">
             <ArrowUpRight className="h-3 w-3 text-emerald-500" />
             <span className="text-emerald-500">+4%</span> vs baseline
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
               <Clock className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Assessments</span>
          </div>
          <div className="text-4xl font-bold text-white tabular-nums">{history.length}</div>
          <div className="text-xs text-slate-600 mt-2 font-medium uppercase tracking-tighter">Consistency: High</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
               <Sparkles className="h-5 w-5 text-amber-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Total Nodes</span>
          </div>
          <div className="text-4xl font-bold text-white tabular-nums">42</div>
          <div className="text-xs text-slate-600 mt-2 font-medium uppercase tracking-tighter">Refinement logic active</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl bg-gradient-to-br from-indigo-500/[0.03] to-transparent">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
               <BarChart3 className="h-5 w-5 text-indigo-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Peak State</span>
          </div>
          <div className="text-4xl font-bold text-white tabular-nums">92%</div>
          <div className="text-xs text-slate-600 mt-2 font-medium uppercase tracking-tighter">Confidence ceiling hit</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap className="h-48 w-48 text-indigo-500" />
          </div>
          <div className="relative">
            <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.4em] mb-6">System Insight</h3>
            <h4 className="text-3xl font-bold text-white italic mb-10 leading-tight">Neural Performance <br/>Architect</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: 'Avg Rating', value: '84.2%', trend: '+2.4%' },
                { label: 'Fluency', value: 'High', trend: 'Stable' },
                { label: 'Confidence', value: '92/100', trend: '+5.1%' },
                { label: 'Keyword Hit', value: '78%', trend: '+12%' }
              ].map((stat, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                  <div className="text-[9px] font-bold text-emerald-400">{stat.trend}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 flex flex-col justify-between group shadow-2xl">
           <div>
              <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.4em] mb-6">Active Protocol</h3>
              <h4 className="text-2xl font-bold text-white italic mb-4">Vantage Pulse</h4>
              <p className="text-slate-500 text-xs font-medium leading-relaxed">
                Biometric observation enabled. Voice modulation and facial micro-expressions are tracked for deep sentiment parsing.
              </p>
           </div>
           <div className="pt-8 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Core Sync Active</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 overflow-hidden relative group shadow-2xl">
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Plus className="h-24 w-24 text-indigo-500 rotate-45" />
           </div>
           <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.4em] mb-4">Deployment Protocol</h3>
           <h4 className="text-2xl font-bold text-white mb-6 italic">Secure Device Installation</h4>
           <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed max-w-sm">
             To install the Vantage Assessment Terminal on your mobile or desktop device, use your browser's <span className="text-white font-bold">"Add to Home Screen"</span> feature. This enables full-screen execution and native protocol access.
           </p>
           <div className="flex gap-4">
              <div className="px-4 py-2 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest">PWA Ready</div>
              <div className="px-4 py-2 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Offline Cache</div>
           </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 overflow-hidden relative group shadow-2xl">
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <ArrowUpRight className="h-24 w-24 text-emerald-500" />
           </div>
           <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.4em] mb-4">Neural Sharing</h3>
           <h4 className="text-2xl font-bold text-white mb-6 italic">Broadcast Link</h4>
           <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed max-w-sm">
             Share the Vantage Terminal URL with others to collaborate or track team benchmarks. Each session is uniquely isolated and encrypted.
           </p>
           <button 
             onClick={() => {
               navigator.clipboard.writeText(window.location.href);
               alert("Terminal Access Link Copied to Clipboard.");
             }}
             className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
           >
             Copy Access Link
           </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Session History</h3>
           <button className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors font-bold group flex items-center gap-2">
            Historical Data
            <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
           </button>
        </div>
        <div className="divide-y divide-slate-800">
          {history.length > 0 ? (
            history.map((session) => (
              <div key={session.id} className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-slate-800/20 transition-colors cursor-pointer group">
                <div className="flex items-center gap-6">
                   <div className="h-12 w-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:border-indigo-500/50 transition-colors shadow-inner">
                      <Briefcase className="h-6 w-6 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                   </div>
                   <div>
                      <div className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors tracking-tight italic font-light">"{session.role}"</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-3 font-bold uppercase tracking-widest mt-1">
                         <span>{format(session.date, "MMM dd, yyyy")}</span>
                         <div className="h-1 w-1 rounded-full bg-slate-800" />
                         <span>{session.difficulty} Optimization</span>
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-10 w-full md:w-auto">
                   <div className="flex-1 md:w-40">
                      <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase mb-2 tracking-widest">
                         <span>Core Proficiency</span>
                         <span className="text-white">{session.overallScore}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                         <div className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${session.overallScore}%` }} />
                      </div>
                   </div>
                   <div className="flex items-center gap-3 text-slate-500 group-hover:text-white transition-all transform group-hover:translate-x-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest">Logs</span>
                      <div className="p-2 rounded-full border border-slate-800 bg-slate-950 group-hover:border-indigo-500/50">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                   </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-20 text-center">
              <div className="mx-auto h-20 w-20 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-6 shadow-inner">
                 <Briefcase className="h-10 w-10 text-slate-800" />
              </div>
              <h4 className="text-white font-bold text-xl mb-2 tracking-tight">System Idle</h4>
              <p className="text-slate-500 font-medium text-sm">Initialize your first assessment trajectory to begin tracking performance nodes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Briefcase({ className }: { className?: string }) {
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
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
