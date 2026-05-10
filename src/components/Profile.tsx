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
  Code2
} from 'lucide-react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';

interface ProfileProps {
  profile: UserProfile | null;
  onSave: (profile: UserProfile) => void;
  onClose: () => void;
}

export function Profile({ profile, onSave, onClose }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(!profile);
  const [formData, setFormData] = useState<UserProfile>(profile || {
    name: '',
    title: '',
    bio: '',
    skills: [],
    experience: '',
    socials: {
      linkedin: '',
      github: '',
      portfolio: ''
    }
  });
  const [skillInput, setSkillInput] = useState('');
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
        className="bg-slate-900 border border-slate-800 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col relative"
      >
        {/* Animated background grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
        
        {/* Header */}
        <div className="relative h-48 bg-gradient-to-r from-indigo-600/20 via-slate-900 to-indigo-600/20 border-b border-slate-800 flex-shrink-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.15),transparent)]" />
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-slate-950/50 border border-slate-800 text-slate-400 hover:text-white transition-all z-10"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="absolute -bottom-16 left-12 group">
            <div className="relative">
              <div className="h-32 w-32 rounded-3xl bg-slate-950 border-4 border-slate-900 shadow-2xl overflow-hidden flex items-center justify-center">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-slate-700" />
                )}
              </div>
              {isEditing && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-indigo-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"
                >
                  <Camera className="h-8 w-8 text-white" />
                </button>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 pt-20">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Alex Rivera"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Current Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Senior Creative Technologist"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Professional Bio</label>
                <textarea
                  required
                  rows={4}
                  value={formData.bio}
                  onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell your professional story..."
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Core Arsenal (Skills)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={addSkill}
                        placeholder="Type and press Enter..."
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700"
                      />
                      <Sparkles className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500/40" />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {formData.skills.map(skill => (
                        <span key={skill} className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold flex items-center gap-2 group">
                          {skill}
                          <button type="button" onClick={() => removeSkill(skill)} className="hover:text-white">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Legacy (Experience Years)</label>
                    <input
                      type="text"
                      value={formData.experience}
                      onChange={e => setFormData(p => ({ ...p, experience: e.target.value }))}
                      placeholder="e.g. 8+ years"
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Neural Links (Socials)</label>
                  <div className="space-y-4">
                    <div className="relative">
                      <Linkedin className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
                      <input
                        type="url"
                        value={formData.socials.linkedin}
                        onChange={e => setFormData(p => ({ ...p, socials: { ...p.socials, linkedin: e.target.value } }))}
                        placeholder="LinkedIn URL"
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-16 pr-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700"
                      />
                    </div>
                    <div className="relative">
                      <Github className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
                      <input
                        type="url"
                        value={formData.socials.github}
                        onChange={e => setFormData(p => ({ ...p, socials: { ...p.socials, github: e.target.value } }))}
                        placeholder="GitHub URL"
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-16 pr-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700"
                      />
                    </div>
                    <div className="relative">
                      <Globe className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
                      <input
                        type="url"
                        value={formData.socials.portfolio}
                        onChange={e => setFormData(p => ({ ...p, socials: { ...p.socials, portfolio: e.target.value } }))}
                        placeholder="Portfolio URL"
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-16 pr-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-8">
                <button
                  type="submit"
                  className="flex items-center gap-3 px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-500/20 transform hover:-translate-y-1 active:translate-y-0"
                >
                  <Save className="h-5 w-5" />
                  Synchronize Data
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-16">
              <div className="space-y-12">
                <div>
                  <h3 className="text-4xl font-bold text-white mb-2 tracking-tight">{formData.name}</h3>
                  <div className="text-indigo-400 font-bold uppercase tracking-[0.2em] text-xs mb-8 flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5" />
                    {formData.title}
                  </div>
                  <p className="text-slate-400 text-lg leading-relaxed font-medium italic">
                    "{formData.bio}"
                  </p>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] flex items-center gap-4">
                    <Code2 className="h-4 w-4 text-indigo-400" />
                    Specialized Arsenal
                    <div className="h-px flex-1 bg-slate-800/50" />
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {formData.skills.map(skill => (
                      <span key={skill} className="px-6 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 text-sm font-semibold shadow-inner">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-12">
                <div className="p-8 rounded-[2rem] bg-slate-950 border border-slate-800 shadow-inner">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Experience Nodes</h4>
                  <div className="text-2xl font-bold text-white flex items-center gap-3">
                    {formData.experience}
                    <span className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Total Tenure</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Neural Links</h4>
                  <div className="space-y-4">
                    {formData.socials.linkedin && (
                      <a href={formData.socials.linkedin} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 hover:bg-indigo-500/10 transition-colors group">
                        <div className="flex items-center gap-3">
                          <Linkedin className="h-5 w-5 text-indigo-400" />
                          <span className="text-sm font-bold text-slate-300 group-hover:text-white">LinkedIn</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-600" />
                      </a>
                    )}
                    {formData.socials.github && (
                      <a href={formData.socials.github} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/20 border border-slate-800 hover:bg-slate-800/40 transition-colors group">
                        <div className="flex items-center gap-3">
                          <Github className="h-5 w-5 text-slate-400" />
                          <span className="text-sm font-bold text-slate-300 group-hover:text-white">GitHub</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-600" />
                      </a>
                    )}
                    {formData.socials.portfolio && (
                      <a href={formData.socials.portfolio} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors group">
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-emerald-400" />
                          <span className="text-sm font-bold text-slate-300 group-hover:text-white">Portfolio</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-600" />
                      </a>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full py-4 rounded-2xl border border-slate-800 text-slate-500 font-bold text-xs uppercase tracking-widest hover:border-indigo-500/50 hover:text-indigo-400 transition-all"
                >
                  Edit Blueprint
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
