import { motion } from "motion/react";
import { ScanEye, Hexagon } from "lucide-react";
import { cn } from "../lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  onClick?: () => void;
}

export function Logo({ className, size = "md", showText = true, onClick }: LogoProps) {
  const sizes = {
    sm: { container: "h-8 w-8", icon: "h-4 w-4", text: "text-sm", gap: "gap-2" },
    md: { container: "h-10 w-10", icon: "h-5 w-5", text: "text-xl", gap: "gap-3" },
    lg: { container: "h-14 w-14", icon: "h-7 w-7", text: "text-3xl", gap: "gap-4" },
  };

  const currentSize = sizes[size];

  return (
    <div 
      onClick={onClick}
      className={cn("flex items-center", currentSize.gap, className, onClick && "cursor-pointer")}
    >
      <div className={cn(
        "relative flex items-center justify-center rounded-2xl bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.3)] overflow-hidden group",
        currentSize.container
      )}>
        {/* Animated Background Layers */}
        <motion.div 
          animate={{ 
            rotate: [0, 360],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-20"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white via-transparent to-white" />
        </motion.div>

        {/* Outer Hexagon frame */}
        <Hexagon className={cn("text-indigo-200/40 absolute", currentSize.icon)} strokeWidth={1} />
        
        {/* Core ScanEye Icon */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <ScanEye className={cn("text-white relative z-10", currentSize.icon)} />
        </motion.div>

        {/* Scan lines / Pulse flare */}
        <motion.div 
          animate={{ y: [-20, 20] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent h-4 w-full"
        />
      </div>

      {showText && (
        <span className={cn("font-bold tracking-tight text-white", currentSize.text)}>
          Vantage
          <span className="text-indigo-400">.</span>
        </span>
      )}
    </div>
  );
}
