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

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [history, setHistory] = useState<InterviewSession[]>([]);
  const [currentConfig, setCurrentConfig] = useState<InterviewConfig | null>(null);
  const [currentResults, setCurrentResults] = useState<InterviewQuestion[] | null>(null);
  const [hasSavedCurrent, setHasSavedCurrent] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'dark',
    notifications: true,
    recordingEnabled: true,
    privacyMode: false,
    biometricAnalysis: true
  });

  // Load history & profile from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('interview_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.map((s: any) => ({ ...s, date: new Date(s.date) })));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }

    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error("Failed to load profile", e);
      }
    }

    const savedSettings = localStorage.getItem('user_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }
  }, []);

  const handleSaveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('user_profile', JSON.stringify(profile));
  };

  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    localStorage.setItem('user_settings', JSON.stringify(newSettings));
  };

  const saveToHistory = (questions: InterviewQuestion[]) => {
    if (!currentConfig) return;

    const overallScore = Math.round(questions.reduce((acc, q) => acc + (q.analysis?.score || 0), 0) / questions.length);
    
    const newSession: InterviewSession = {
      id: Math.random().toString(36).substring(7),
      date: new Date(),
      role: currentConfig.role,
      difficulty: currentConfig.difficulty,
      questions,
      overallScore,
      feedback: "Great job on your assessment. Focus on keyword density in future sessions.",
    };

    const newHistory = [newSession, ...history];
    setHistory(newHistory);
    localStorage.setItem('interview_history', JSON.stringify(newHistory));
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
          profile={userProfile}
          onOpenProfile={() => setIsProfileOpen(true)}
        />;
      default:
        return <Hero onStart={() => setActiveTab('setup')} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      {activeTab !== 'landing' && (
        <Navbar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          profile={userProfile} 
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
              profile={userProfile} 
              onSave={handleSaveProfile} 
              onClose={() => setIsProfileOpen(false)} 
            />
          )}
          {isSettingsOpen && (
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

