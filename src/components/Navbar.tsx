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
    { id: "setup", label: "New Interview", icon: Rocket },
  ];

  return (
    <nav className={cn("sticky top-0 z-50 w-full glass border-b border-white/5 bg-slate-950/40 backdrop-blur-2xl px-4 md:px-12", className)}>
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between">
        <div className="flex items-center gap-12">
          <Logo size="sm" onClick={() => onTabChange('landing')} className="cursor-pointer hover:scale-110 transition-transform" />
          
          <div className="hidden md:flex items-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "relative flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                  activeTab === tab.id ? "text-white bg-white/5" : "text-slate-500 hover:text-slate-200"
                )}
              >
                <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-indigo-400" : "text-slate-600")} />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute inset-0 border border-white/10 rounded-2xl bg-white/[0.02]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="h-10 w-[1px] bg-white/5 hidden md:block" />
          
          <div className="flex items-center gap-3">
            <button 
              onClick={onOpenSettings}
              className="rounded-xl glass p-3 text-slate-500 hover:text-white hover:border-white/20 transition-all"
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button 
              onClick={logout}
              className="rounded-xl glass p-3 text-slate-500 hover:text-rose-400 hover:border-rose-500/20 transition-all"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>

          <button 
            onClick={onOpenProfile}
            className="flex items-center gap-4 group px-2 py-2 rounded-2xl border border-transparent hover:glass transition-all"
          >
            <div className="h-12 w-12 rounded-xl bg-slate-800 border border-white/5 overflow-hidden group-hover:border-indigo-500/50 group-hover:glow-indigo transition-all shadow-inner">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <User className="h-6 w-6 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                </div>
              )}
            </div>
            <div className="hidden lg:block text-left pr-4">
               <div className="text-[10px] font-black text-white uppercase tracking-widest">{profile?.name || "IDENTITY_PENDING"}</div>
               <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-tight">ACTIVE_SESSION</div>
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}
