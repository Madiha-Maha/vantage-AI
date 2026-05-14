/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Logo } from './components/Logo';
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { InterviewSetup } from './components/InterviewSetup';
import { InterviewRoom } from './components/InterviewRoom';
import { AnalysisResult } from './components/AnalysisResult';
import { Dashboard } from './components/Dashboard';
import { InterviewConfig, InterviewSession, InterviewQuestion, UserProfile, UserSettings } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Profile } from './components/Profile';
import { SettingsModal } from './components/SettingsModal';
import { useAuth } from './lib/AuthContext';
import { Login } from './components/Login';
import { subscribeToHistory, saveSession } from './lib/firestoreService';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { user, isGuest, profile, settings, loading, updateProfile, updateSettings } = useAuth();
  const [activeTab, setActiveTab] = useState('landing');
  const [history, setHistory] = useState<InterviewSession[]>([]);
  const [currentConfig, setCurrentConfig] = useState<InterviewConfig | null>(null);
  const [currentResults, setCurrentResults] = useState<InterviewQuestion[] | null>(null);
  const [hasSavedCurrent, setHasSavedCurrent] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load history from Store (Cloud or Local)
  useEffect(() => {
    const userId = user?.uid || (isGuest ? 'guest' : null);
    if (!userId) {
      setHistory([]);
      return;
    }
    const unsubscribe = subscribeToHistory(userId, setHistory);
    return () => unsubscribe();
  }, [user, isGuest]);

  const handleSaveProfile = async (newProfile: UserProfile) => {
    await updateProfile(newProfile);
  };

  const handleSaveSettings = async (newSettings: UserSettings) => {
    await updateSettings(newSettings);
  };

  const saveToHistory = async (questions: InterviewQuestion[]) => {
    const userId = user?.uid || (isGuest ? 'guest' : null);
    if (!currentConfig || !userId) return;

    const overallScore = Math.round(questions.reduce((acc, q) => acc + (q.analysis?.score || 0), 0) / (questions.length || 1));
    
    await saveSession(userId, {
      date: new Date(),
      role: currentConfig.role,
      difficulty: currentConfig.difficulty,
      questions,
      overallScore,
      feedback: "Great job on your assessment. Focus on keyword density in future sessions.",
    });
  };

  const handleStartInterview = (config: InterviewConfig) => {
    setCurrentConfig(config);
    setActiveTab('room');
  };

  const handleInterviewComplete = (results: InterviewQuestion[]) => {
    setCurrentResults(results);
    setHasSavedCurrent(false);
    setActiveTab('result');
  };

  const handleManualSave = () => {
    if (currentResults && !hasSavedCurrent) {
      saveToHistory(currentResults);
      setHasSavedCurrent(true);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'landing':
        return <Hero onStart={() => setActiveTab('setup')} />;
      case 'setup':
        return <InterviewSetup onStart={handleStartInterview} />;
      case 'room':
        return currentConfig ? (
          <InterviewRoom 
            config={currentConfig} 
            onComplete={handleInterviewComplete} 
          />
        ) : <Hero onStart={() => setActiveTab('setup')} />;
      case 'result':
        return currentResults ? (
          <AnalysisResult 
            questions={currentResults} 
            role={currentConfig?.role || "Candidate"}
            hasSaved={hasSavedCurrent}
            onSave={handleManualSave}
            onFinish={() => {
              if (!hasSavedCurrent) handleManualSave();
              setCurrentResults(null);
              setCurrentConfig(null);
              setActiveTab('dashboard');
            }} 
          />
        ) : <Hero onStart={() => setActiveTab('setup')} />;
      case 'dashboard':
      case 'history':
        return <Dashboard 
          history={history} 
          onStartNew={() => setActiveTab('setup')} 
          profile={profile}
          onOpenProfile={() => setIsProfileOpen(true)}
        />;
      default:
        return <Hero onStart={() => setActiveTab('setup')} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8">
        <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-6" />
        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Synchronizing Neural Identity</div>
      </div>
    );
  }

  if (!user && !isGuest) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30 relative">
      {isGuest && (
        <>
          <div className="guest-scanline" />
          <div className="scanline-move" />
        </>
      )}
      {activeTab !== 'landing' && (
        <Navbar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          profile={profile} 
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}
      
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {isProfileOpen && (
            <Profile 
              profile={profile} 
              onSave={handleSaveProfile} 
              onClose={() => setIsProfileOpen(false)} 
            />
          )}
          {isSettingsOpen && settings && (
            <SettingsModal 
              settings={settings}
              onSave={handleSaveSettings}
              onClose={() => setIsSettingsOpen(false)}
            />
          )}
        </AnimatePresence>
      </main>

      <footer className="py-20 border-t border-slate-800 mt-20">
        <div className="mx-auto max-w-7xl px-8 flex flex-col md:flex-row justify-between items-center gap-12">
          <Logo size="sm" />
          <div className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">
            © 2026 Vantage. Neural Assessment Framework.
          </div>
          <div className="flex items-center gap-8 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
             <a href="#" className="hover:text-white transition-colors">Privacy Protocal</a>
             <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
             <a href="#" className="hover:text-white transition-colors">Global Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

