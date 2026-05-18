import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Camera, 
  Mail, 
  Linkedin, 
  Github, 
  Globe, 
  Save, 
  X, 
  Briefcase, 
  Sparkles,
  ChevronRight,
  Code2,
  Heart,
  Fingerprint
} from 'lucide-react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';

interface ProfileProps {
  profile: UserProfile | null;
  onSave: (profile: UserProfile) => void;
  onClose: () => void;
}

export function Profile({ profile, onSave, onClose }: ProfileProps) {
  const { isGuest } = useAuth();
  const [isEditing, setIsEditing] = useState(!profile);
  const [formData, setFormData] = useState<UserProfile>(profile || {
    name: '',
    title: '',
    bio: '',
    skills: [],
    interests: [],
    experience: '',
    socials: {
      linkedin: '',
      github: '',
      portfolio: ''
    }
  });
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!formData.skills.includes(skillInput.trim())) {
        setFormData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
  };

  const addInterest = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && interestInput.trim()) {
      e.preventDefault();
      if (!(formData.interests || []).includes(interestInput.trim())) {
        setFormData(prev => ({ ...prev, interests: [...(prev.interests || []), interestInput.trim()] }));
      }
      setInterestInput('');
    }
  };

  const removeInterest = (interestToRemove: string) => {
    setFormData(prev => ({ ...prev, interests: (prev.interests || []).filter(i => i !== interestToRemove) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-2xl"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="glass border border-white/5 w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col relative backdrop-blur-xl"
      >
        {/* Animated background grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
        
        {/* Header */}
        <div className="relative h-64 bg-gradient-to-r from-indigo-600/10 via-slate-950/40 to-indigo-600/10 border-b border-white/5 flex-shrink-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.15),transparent)]" />
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-3 rounded-2xl bg-slate-950/50 border border-white/5 text-slate-500 hover:text-white hover:border-white/20 transition-all z-10"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="absolute -bottom-20 left-16 group">
            <div className="relative">
              <div className="h-40 w-40 rounded-[2.5rem] bg-slate-950 border-4 border-slate-950 shadow-2xl overflow-hidden flex items-center justify-center glow-indigo relative">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-16 w-16 text-slate-800" />
                )}
                {isGuest && (
                  <div className="absolute top-2 right-2 p-1.5 bg-amber-500 rounded-lg shadow-lg border border-amber-400/20 z-20">
                    <Fingerprint className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              {isEditing && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-indigo-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]"
                >
                  <Camera className="h-10 w-10 text-white" />
                </button>
              )}
            </div>
            {isGuest && (
              <div className="absolute -bottom-10 left-0 text-[8px] font-black text-amber-500 uppercase tracking-[0.4em] bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20 whitespace-nowrap glow-amber">
                TEMPORARY_AGENT_PROFILE
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-16 pt-24 custom-scrollbar">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">SUBJECT_IDENTITY</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Alex Rivera"
                    className="w-full bg-slate-950/40 border border-white/5 rounded-2xl px-8 py-5 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 focus:glow-indigo transition-all placeholder:text-slate-800 uppercase tracking-widest italic"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">DESIGNATED_TITLE</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Senior Creative Technologist"
                    className="w-full bg-slate-950/40 border border-white/5 rounded-2xl px-8 py-5 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 focus:glow-indigo transition-all placeholder:text-slate-800 uppercase tracking-widest italic"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">CORE_NARRATIVE</label>
                <textarea
                  required
                  rows={4}
                  value={formData.bio}
                  onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell your professional story..."
                  className="w-full bg-slate-950/40 border border-white/5 rounded-[2rem] px-8 py-6 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 focus:glow-indigo transition-all placeholder:text-slate-800 resize-none uppercase tracking-wider italic"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">SPECIALIZED_ARSENAL</label>
                    <div className="relative group">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={addSkill}
                        placeholder="INPUT_NODE..."
                        className="w-full bg-slate-950/40 border border-white/5 rounded-2xl px-8 py-5 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 focus:glow-indigo transition-all placeholder:text-slate-800 uppercase tracking-widest italic"
                      />
                      <Sparkles className="absolute right-8 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500/40" />
                    </div>
                    <div className="flex flex-wrap gap-3 mt-6">
                      {formData.skills.map(skill => (
                        <span key={skill} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/5 text-indigo-400 text-[10px] font-black flex items-center gap-3 group uppercase tracking-widest">
                          {skill}
                          <button type="button" onClick={() => removeSkill(skill)} className="hover:text-white transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">LEGACY_TENURE</label>
                    <input
                      type="text"
                      value={formData.experience}
                      onChange={e => setFormData(p => ({ ...p, experience: e.target.value }))}
                      placeholder="e.g. 8+ years"
                      className="w-full bg-slate-950/40 border border-white/5 rounded-2xl px-8 py-5 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 focus:glow-indigo transition-all placeholder:text-slate-800 uppercase tracking-widest italic"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">DOMAIN_INTERESTS</label>
                    <div className="relative group">
                      <input
                        type="text"
                        value={interestInput}
                        onChange={e => setInterestInput(e.target.value)}
                        onKeyDown={addInterest}
                        placeholder="ADD_INTEREST..."
                        className="w-full bg-slate-950/40 border border-white/5 rounded-2xl px-8 py-5 text-sm font-bold text-white focus:outline-none focus:border-rose-500/50 focus:glow-rose transition-all placeholder:text-slate-800 uppercase tracking-widest italic"
                      />
                      <Heart className="absolute right-8 top-1/2 -translate-y-1/2 h-5 w-5 text-rose-500/40" />
                    </div>
                    <div className="flex flex-wrap gap-3 mt-6">
                      {(formData.interests || []).map(interest => (
                        <span key={interest} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/5 text-rose-400 text-[10px] font-black flex items-center gap-3 group uppercase tracking-widest">
                          {interest}
                          <button type="button" onClick={() => removeInterest(interest)} className="hover:text-white transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-10">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">SYNAPSE_LINKS</label>
                  <div className="space-y-6">
                    {[
                      { icon: Linkedin, field: 'linkedin', label: 'LINKEDIN_URI' },
                      { icon: Github, field: 'github', label: 'GITHUB_URI' },
                      { icon: Globe, field: 'portfolio', label: 'PORTFOLIO_URI' }
                    ].map((link) => (
                      <div key={link.field} className="relative group/link">
                        <link.icon className="absolute left-8 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-700 group-focus-within/link:text-indigo-400 transition-colors" />
                        <input
                          type="url"
                          value={formData.socials[link.field as keyof typeof formData.socials]}
                          onChange={e => setFormData(p => ({ ...p, socials: { ...p.socials, [link.field]: e.target.value } }))}
                          placeholder={link.label}
                          className="w-full bg-slate-950/40 border border-white/5 rounded-2xl pl-16 pr-8 py-5 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 focus:glow-indigo transition-all placeholder:text-slate-800 uppercase tracking-widest italic shadow-inner"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-8">
                <button
                  type="submit"
                  className="flex items-center gap-4 px-16 py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-3xl transition-all shadow-xl glow-indigo group active:scale-95 italic uppercase tracking-[0.4em]"
                >
                  <Save className="h-6 w-6" />
                  SYNC_SYSTEM_DATA
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-20">
              <div className="space-y-16">
                <div>
                  <h3 className="text-6xl font-black text-white mb-4 tracking-tighter uppercase italic leading-none">{formData.name}</h3>
                  <div className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] mb-10 flex items-center gap-3">
                    <Briefcase className="h-4 w-4" />
                    {formData.title}
                  </div>
                  <p className="text-slate-400 text-xl leading-relaxed font-bold italic uppercase tracking-wider bg-white/[0.01] p-10 rounded-[3rem] border border-white/5 shadow-inner">
                    "{formData.bio}"
                  </p>
                </div>

                <div className="space-y-8">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] flex items-center gap-6">
                    <Code2 className="h-5 w-5 text-indigo-400" />
                    CORE_ARSENAL
                    <div className="h-px flex-1 bg-white/[0.03]" />
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {formData.skills.map(skill => (
                      <span key={skill} className="px-8 py-3 rounded-2xl bg-white/[0.02] border border-white/5 text-slate-300 text-[11px] font-black shadow-inner uppercase tracking-widest hover:text-white transition-colors cursor-default">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-16">
                <div className="p-10 rounded-[3rem] bg-slate-950/40 border border-white/5 shadow-inner backdrop-blur-md">
                  <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-8 leading-none">TENURE_NODES</h4>
                  <div className="text-4xl font-black text-white flex items-center gap-4 italic">
                    {formData.experience}
                    <span className="text-[10px] text-slate-600 uppercase tracking-widest font-black italic">Legacy_Runtime</span>
                  </div>
                </div>

                <div className="space-y-8">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] flex items-center gap-6">
                    <Heart className="h-5 w-5 text-rose-400" />
                    DOMAIN_INTERESTS
                    <div className="h-px flex-1 bg-white/[0.03]" />
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {(formData.interests || []).map(interest => (
                      <span key={interest} className="px-8 py-3 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-rose-300 text-[11px] font-black shadow-inner uppercase tracking-widest hover:text-white transition-colors cursor-default">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-2">SYNAPSE_LINKS</h4>
                  <div className="space-y-4">
                    {[
                      { icon: Linkedin, url: formData.socials.linkedin, label: 'LinkedIn', color: 'text-indigo-400', bg: 'bg-indigo-500/5', border: 'border-indigo-500/10' },
                      { icon: Github, url: formData.socials.github, label: 'GitHub', color: 'text-slate-400', bg: 'bg-white/5', border: 'border-white/5' },
                      { icon: Globe, url: formData.socials.portfolio, label: 'Portfolio', color: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10' }
                    ].map((link) => link.url && (
                      <a key={link.label} href={link.url} target="_blank" rel="noreferrer" className={cn("flex items-center justify-between p-6 rounded-[2rem] transition-all group", link.bg, link.border, "hover:scale-[1.02]")}>
                        <div className="flex items-center gap-4">
                          <link.icon className={cn("h-6 w-6", link.color)} />
                          <span className="text-[10px] font-black text-slate-400 group-hover:text-white uppercase tracking-[0.2em]">{link.label}</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-700 group-hover:text-white transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full py-6 rounded-[2rem] border border-white/5 text-slate-600 font-black text-[10px] uppercase tracking-[0.4em] hover:border-indigo-500/50 hover:text-indigo-400 transition-all italic hover:glow-indigo"
                >
                  DECODE_BLUEPRINT
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
