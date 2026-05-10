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
        className="bg-slate-900 border border-slate-800 w-full max-w-2xl overflow-hidden rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col relative"
      >
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />
        
        {/* Header */}
        <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-indigo-600/10 border border-indigo-500/20">
              <Cpu className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Vantage Control</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Neural Preference Terminal</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-500 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-10 space-y-10 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {/* Appearance */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <Sun className="h-4 w-4 text-amber-400" />
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Visual Interface</h4>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'dark', label: 'Eclipse', icon: Moon },
                { id: 'light', label: 'Radiance', icon: Sun },
                { id: 'system', label: 'Sync', icon: Monitor },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={cn(
                    "flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all",
                    config.theme === t.id 
                      ? "bg-indigo-600/10 border-indigo-500 text-white shadow-lg shadow-indigo-500/10" 
                      : "bg-slate-950/30 border-slate-800 text-slate-500 hover:border-slate-700"
                  )}
                >
                  <t.icon className="h-5 w-5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{t.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Privacy & Neural */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Privacy & Neural Analysis</h4>
            </div>
            <div className="space-y-4">
              {[
                { key: 'recordingEnabled', label: 'Cloud Session Persistence', icon: Video, desc: 'Securely archive assessments for historical benchmarking.' },
                { key: 'biometricAnalysis', label: 'Limbic Response Tracking', icon: Cpu, desc: 'Analyze micro-expressions and pulse variability via vision systems.' },
                { key: 'privacyMode', label: 'Stealth Presence (Privacy)', icon: Eye, desc: 'Obfuscate PII from global industry leadership boards.' },
                { key: 'notifications', label: 'Neural Uplink Notifications', icon: Bell, desc: 'Receive real-time assessment invites and proficiency alerts.' },
              ].map((item) => (
                <div 
                  key={item.key}
                  className="flex items-center justify-between p-6 rounded-3xl bg-slate-950/30 border border-slate-800 hover:border-slate-700 transition-colors group"
                >
                  <div className="flex items-center gap-5">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 group-hover:border-slate-700 transition-colors">
                      <item.icon className="h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white tracking-tight">{item.label}</div>
                      <div className="text-[10px] text-slate-600 mt-1 font-medium">{item.desc}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggle(item.key as keyof UserSettings)}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-all duration-300",
                      config[item.key as keyof UserSettings] ? "bg-indigo-600" : "bg-slate-800"
                    )}
                  >
                    <motion.div 
                      animate={{ x: config[item.key as keyof UserSettings] ? 26 : 4 }}
                      className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Security */}
          <section className="p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-600/10 to-transparent border border-indigo-500/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.1),transparent)]" />
            <div className="flex items-center gap-6 relative z-10">
              <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white tracking-tight">Security Protocol: Level 5</h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">End-to-End Neural Encryption Active</p>
              </div>
              <ChevronRight className="h-5 w-5 text-indigo-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
            </div>
          </section>
        </div>

        <div className="p-8 bg-slate-900/50 border-t border-slate-800 flex justify-between items-center shrink-0">
          <div className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.4em]">Axis Frame v4.0.2</div>
          <button
            onClick={onClose}
            className="px-10 py-4 bg-slate-950 border border-slate-800 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-900 transition-all"
          >
            Terminal Shutdown
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
