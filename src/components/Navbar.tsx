import { Logo } from "./Logo";
import { motion } from "motion/react";
import { User, Settings, LayoutDashboard, Rocket, LogOut } from "lucide-react";
import { cn } from "../lib/utils";
import { UserProfile } from "../types";
import { useAuth } from "../lib/AuthContext";

interface NavbarProps {
  className?: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  profile: UserProfile | null;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
}

export function Navbar({ className, activeTab, onTabChange, profile, onOpenProfile, onOpenSettings }: NavbarProps) {
  const { logout } = useAuth();
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "interview", label: "New Interview", icon: Rocket },
  ];

  return (
    <nav className={cn("sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md", className)}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo size="sm" onClick={() => onTabChange('landing')} className="cursor-pointer" />

        <div className="hidden md:flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors",
                activeTab === tab.id ? "text-white" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={onOpenSettings}
            className="rounded-full bg-slate-900 p-2 text-slate-500 hover:text-slate-200 border border-slate-800 transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>
          <button 
            onClick={logout}
            className="rounded-full bg-slate-900 p-2 text-slate-500 hover:text-rose-400 border border-slate-800 transition-colors"
            title="Neural Terminate"
          >
            <LogOut className="h-5 w-5" />
          </button>
          <button 
            onClick={onOpenProfile}
            className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden hover:border-indigo-500/50 transition-all group shadow-inner"
          >
            {profile?.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <User className="h-5 w-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
              </div>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
