import { motion } from "motion/react";
import { ArrowRight, ChevronDown, Rocket, Sparkles, Target, Zap } from "lucide-react";
import { Logo } from "./Logo";

export function Hero({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative min-h-screen flex flex-col justify-center bg-[#050505] overflow-hidden">
      {/* Noise Texture */}
      <div className="absolute inset-0 noise-bg pointer-events-none" />
      
      {/* Structural Lines */}
      <div className="absolute inset-0 flex justify-between px-10 md:px-20 pointer-events-none opacity-20">
        <div className="w-[1px] h-full bg-white/10" />
        <div className="w-[1px] h-full bg-white/10 hidden md:block" />
        <div className="w-[1px] h-full bg-white/10 hidden md:block" />
        <div className="w-[1px] h-full bg-white/10" />
      </div>

      <div className="max-w-7xl mx-auto w-full px-8 md:px-20 relative z-10 py-20">
        <div className="flex flex-col items-start max-w-5xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-4 mb-16 overflow-hidden">
               <div className="h-[1px] w-12 bg-white/40" />
               <span className="text-[10px] font-medium tracking-[0.4em] uppercase text-white/60">
                 Elite Performance Framework
               </span>
            </div>

            <h1 className="text-[12vw] md:text-[8vw] font-medium leading-[0.95] tracking-[-0.04em] text-white mb-16">
              Precision <br />
              <span className="text-[#6366F1]">Intelligence.</span>
            </h1>

            <div className="flex flex-col md:flex-row items-start md:items-end gap-12 md:gap-24">
               <p className="text-white/40 text-lg md:text-xl font-normal leading-relaxed max-w-md tracking-tight">
                 Elevate your professional presence through advanced behavioral coaching and real-time response optimization.
               </p>

               <motion.button
                 onClick={onStart}
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 className="group flex items-center gap-6 px-10 py-6 bg-white text-black hover:bg-white/90 transition-colors rounded-none font-medium text-sm tracking-widest uppercase outline-none"
               >
                 Initiate Assessment
                 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
               </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Subtle Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-white/20 opacity-0 md:opacity-100">
         <span className="text-[10px] font-medium tracking-[0.5em] uppercase">Scroll to explore</span>
         <ChevronDown className="h-4 w-4 animate-bounce" />
      </div>
    </div>
  );
}
