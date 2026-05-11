import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Moon, 
  Sun, 
  Bell, 
  ShieldCheck, 
  Eye, 
  Video, 
  Cpu, 
  ChevronRight,
  Monitor,
  Lock
} from 'lucide-react';
import { UserSettings } from '../types';
import { cn } from '../lib/utils';

interface SettingsModalProps {
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
  onClose: () => void;
}

export function SettingsModal({ settings, onSave, onClose }: SettingsModalProps) {
  const [config, setConfig] = React.useState<UserSettings>(settings);

  const toggle = (key: keyof UserSettings) => {
    if (typeof config[key] === 'boolean') {
      const next = { ...config, [key]: !config[key] };
      setConfig(next);
      onSave(next);
    }
  };

  const setTheme = (theme: UserSettings['theme']) => {
    const next = { ...config, theme };
    setConfig(next);
    onSave(next);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-3xl"
    >
      <motion.div
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        className="glass border border-white/5 w-full max-w-2xl overflow-hidden rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col relative"
      >
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />
        
        {/* Header */}
        <div className="p-10 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="p-3 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 glow-indigo">
              <Cpu className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tighter uppercase italic leading-none">Settings_Panel</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Profile & Logic Preferences</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-all outline-none"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-12 space-y-12 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {/* Appearance */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <Sun className="h-5 w-5 text-indigo-400" />
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">VISUAL_INTERFACE</h4>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {[
                { id: 'dark', label: 'ECLIPSE', icon: Moon },
                { id: 'light', label: 'RADIANCE', icon: Sun },
                { id: 'system', label: 'SYNC', icon: Monitor },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={cn(
                    "flex flex-col items-center gap-4 p-8 rounded-3xl border transition-all group",
                    config.theme === t.id 
                      ? "bg-indigo-600/10 border-indigo-500 text-white shadow-xl glow-indigo" 
                      : "bg-white/[0.02] border-white/5 text-slate-600 hover:border-white/20"
                  )}
                >
                  <t.icon className={cn("h-6 w-6 transition-colors", config.theme === t.id ? "text-indigo-400" : "text-slate-700 group-hover:text-slate-500")} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Privacy & AI */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">PRIVACY_&_AI_LOGIC</h4>
            </div>
            <div className="space-y-6">
              {[
                { key: 'recordingEnabled', label: 'CLOUD_SESSION_PERSISTENCE', icon: Video, desc: 'Securely archive assessments for historical benchmarking.' },
                { key: 'biometricAnalysis', label: 'AI_RESPONSE_TRACKING', icon: Cpu, desc: 'Analyze micro-expressions and gaze stability via vision systems.' },
                { key: 'privacyMode', label: 'STEALTH_PRESENCE', icon: Eye, desc: 'Obfuscate PII from global industry leadership boards.' },
                { key: 'notifications', label: 'SYSTEM_SYNC_ALERTS', icon: Bell, desc: 'Receive real-time assessment invites and core proficiency alerts.' },
              ].map((item) => (
                <div 
                  key={item.key}
                  className="flex items-center justify-between p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group shadow-inner"
                >
                  <div className="flex items-center gap-6">
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 group-hover:border-indigo-500/20 transition-all">
                      <item.icon className="h-6 w-6 text-slate-600 group-hover:text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-white tracking-widest leading-none mb-2 italic">{item.label}</div>
                      <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">{item.desc}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggle(item.key as keyof UserSettings)}
                    className={cn(
                      "w-14 h-7 rounded-full relative transition-all duration-500 ring-4 ring-black/20 shadow-inner",
                      config[item.key as keyof UserSettings] ? "bg-indigo-600 glow-indigo" : "bg-slate-800"
                    )}
                  >
                    <motion.div 
                      animate={{ x: config[item.key as keyof UserSettings] ? 30 : 6 }}
                      className="absolute top-1.5 left-0 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Security */}
          <section className="p-10 rounded-[3rem] bg-gradient-to-br from-indigo-600/10 to-transparent border border-indigo-500/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.08),transparent)]" />
            <div className="flex items-center gap-8 relative z-10">
              <div className="h-16 w-16 rounded-[1.25rem] bg-indigo-600 flex items-center justify-center shadow-2xl glow-indigo group-hover:scale-110 transition-transform">
                <Lock className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-black text-white tracking-widest italic leading-none mb-2">SECURITY_PROTOCOL: LEVEL_5</h3>
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">End-to-End Encryption System Active</p>
              </div>
              <ChevronRight className="h-6 w-6 text-indigo-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-3 transition-all" />
            </div>
          </section>
        </div>

        <div className="p-10 glass border-t border-white/5 flex justify-between items-center shrink-0">
          <div className="text-[10px] text-slate-700 font-black uppercase tracking-[0.5em] italic">Axis_Frame_v4.0.2</div>
          <button
            onClick={onClose}
            className="px-12 py-5 bg-white/5 border border-white/5 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all italic hover:glow-red"
          >
            DISCONNECT_SESSION
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
