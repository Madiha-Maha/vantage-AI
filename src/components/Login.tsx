import React from 'react';
import { motion } from 'motion/react';
import { Logo } from './Logo';
import { useAuth } from '../lib/AuthContext';
import { Zap, Shield, Sparkles, Loader2 } from 'lucide-react';

export function Login() {
  const { signInAsGuest } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const handleEnter = async () => {
    setLoading(true);
    await signInAsGuest();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-950 font-sans selection:bg-indigo-500/30">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-indigo-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-emerald-600/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg"
      >
        <div className="bg-slate-900/40 border border-white/5 p-12 md:p-16 rounded-[4rem] shadow-2xl backdrop-blur-3xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="relative flex flex-col items-center text-center">
            <div className="mb-12">
              <Logo size="lg" />
            </div>
            
            <div className="space-y-4 mb-12">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white italic leading-tight">
                VANTAGE <span className="text-indigo-500">_OS</span>
              </h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.4em] leading-relaxed">
                Autonomous Performance <br/>
                Assessment Environment
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-12">
              <div className="flex flex-col items-start p-6 rounded-3xl bg-white/5 border border-white/5 text-left">
                 <Shield className="h-5 w-5 text-indigo-400 mb-3" />
                 <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Encrypted</div>
                 <div className="text-xs text-white font-medium">Session isolation active</div>
              </div>
              <div className="flex flex-col items-start p-6 rounded-3xl bg-white/5 border border-white/5 text-left">
                 <Sparkles className="h-5 w-5 text-emerald-400 mb-3" />
                 <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Neural</div>
                 <div className="text-xs text-white font-medium">Real-time biometrics</div>
              </div>
            </div>

            <button
              onClick={handleEnter}
              disabled={loading}
              className="w-full relative group overflow-hidden px-8 py-6 bg-white text-slate-950 rounded-3xl font-black text-sm uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity" />
              <span className="relative flex items-center justify-center gap-3">
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Initialize Session
                    <Zap className="h-4 w-4" fill="currentColor" />
                  </>
                )}
              </span>
            </button>

            <div className="mt-12 flex flex-col items-center gap-4">
              <div className="h-px w-12 bg-slate-800" />
              <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.5em]">
                Secure Protocol v4.0.0
              </p>
            </div>
          </div>
        </div>

        {/* Footer info to look pro */}
        <div className="mt-8 flex justify-between px-8 text-[9px] font-bold text-slate-700 uppercase tracking-widest">
           <span>System: Operational</span>
           <span>Uptime: 99.9%</span>
        </div>
      </motion.div>
    </div>
  );
}
