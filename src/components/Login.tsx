import React from 'react';
import { motion } from 'motion/react';
import { Logo } from './Logo';
import { useAuth } from '../lib/AuthContext';
import { Zap, Shield, Sparkles } from 'lucide-react';

export function Login() {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-950">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 p-12 rounded-[3rem] shadow-2xl backdrop-blur-xl"
      >
        <div className="flex flex-col items-center text-center space-y-8">
          <Logo size="lg" />
          
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-white italic">Neural Gateway</h1>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest leading-relaxed">
              Login to access your <br/>
              <span className="text-indigo-400">Professional Assessment Terminal</span>
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 w-full py-6">
            <div className="flex items-center gap-4 text-left p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
               <Shield className="h-5 w-5 text-indigo-400" />
               <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Security</div>
                  <div className="text-xs text-white font-medium mt-1">Encrypted Personal Storage</div>
               </div>
            </div>
            <div className="flex items-center gap-4 text-left p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
               <Sparkles className="h-5 w-5 text-emerald-400" />
               <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">AI Engine</div>
                  <div className="text-xs text-white font-medium mt-1">Vantage Real-time Analysis</div>
               </div>
            </div>
          </div>

          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-4 px-8 py-5 bg-white text-slate-950 rounded-2xl font-bold transition-all hover:bg-slate-200 active:scale-95 group shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="h-5 w-5" />
            <span>Link with Neural ID</span>
            <Zap className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" />
          </button>

          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] pt-4">
            Authorized Personnel Only
          </p>
        </div>
      </motion.div>
    </div>
  );
}
