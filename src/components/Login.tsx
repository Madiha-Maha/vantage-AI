import React from 'react';
import { motion } from 'motion/react';
import { Logo } from './Logo';
import { useAuth } from '../lib/AuthContext';
import { Zap, Shield, Sparkles, Loader2, AlertCircle } from 'lucide-react';

export function Login() {
  const { signInWithGoogle, signInAsGuest } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleEnter = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError("Sign-in cancelled. Use guest mode if you prefer.");
      } else if (err.code === 'auth/popup-blocked') {
        setError("Popup blocked! Use guest mode or enable popups.");
      } else if (err.code === 'auth/unauthorized-domain') {
        setError(`Unauthorized Domain! Automatically entering LOCAL GUEST MODE...`);
        // Auto-fallback for unauthorized domains to avoid exhausting the user
        setTimeout(() => {
          signInAsGuest();
        }, 1500);
      } else {
        setError(err.message || "Initialization failure. Switching to Local Mode...");
        setTimeout(() => {
          signInAsGuest();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 font-sans selection:bg-indigo-500/30 overflow-hidden">
      {/* Decorative noise/grain overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none mix-blend-overlay" />
      
      {/* Abstract Background Shapes */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-indigo-600/10 blur-[150px] rounded-full" 
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.1, 0.15, 0.1],
          rotate: [0, -90, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-emerald-600/10 blur-[150px] rounded-full" 
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-xl"
      >
        {/* The Card */}
        <div className="glass p-12 md:p-20 rounded-[3rem] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden group">
          {/* Animated accent lines */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          
          <div className="relative flex flex-col items-center">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-12 relative"
            >
              <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Logo size="lg" />
            </motion.div>
            
            <div className="text-center space-y-6 mb-16">
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-6xl md:text-7xl font-black tracking-tighter text-white italic leading-none"
              >
                VANTAGE <span className="text-indigo-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">AI</span>
              </motion.h1>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.6em]"
              >
                Cognitive Performance <br className="md:hidden" /> Enhancement System
              </motion.p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full mb-16">
              {[
                { icon: Shield, label: "Private", desc: "Local Sync", color: "text-indigo-400" },
                { icon: Sparkles, label: "Neural", desc: "Live Edge", color: "text-emerald-400" }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="flex flex-col items-center p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-colors group/item"
                >
                  <item.icon className={`h-5 w-5 ${item.color} mb-3 group-hover/item:scale-110 transition-transform`} />
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">{item.label}</div>
                  <div className="text-[10px] text-white font-medium opacity-60">{item.desc}</div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="w-full space-y-4"
            >
              <button
                onClick={handleEnter}
                disabled={loading}
                className="w-full group relative overflow-hidden px-8 py-8 bg-white text-slate-950 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-98 disabled:opacity-50 glow-indigo"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                <span className="relative flex items-center justify-center gap-4">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      Execute Cloud Authentication
                      <Zap className="h-5 w-5 text-indigo-600" fill="currentColor" />
                    </>
                  )}
                </span>
              </button>

              <button
                onClick={signInAsGuest}
                className="w-full px-8 py-6 bg-slate-900 border border-white/10 text-white rounded-[2rem] font-bold text-[10px] uppercase tracking-[0.4em] transition-all hover:bg-slate-800 hover:border-white/20 active:scale-98"
              >
                Continue as Guest (Local Mode)
              </button>
            </motion.div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 w-full"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </div>
        </div>

        {/* System Status Display */}
        <div className="mt-12 flex items-center justify-between px-12 text-[10px] font-mono font-bold tracking-widest">
           <div className="flex items-center gap-3 text-emerald-500/50">
              <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              SYSTEM_READY
           </div>
           <div className="text-slate-600">
              BUILD_ID: 242114040527
           </div>
           <div className="text-indigo-500/50">
              VANTAGE_CORE_v4
           </div>
        </div>
      </motion.div>
    </div>
  );
}
