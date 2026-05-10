import { motion } from "motion/react";
import { Rocket, Sparkles, Target, Zap } from "lucide-react";
import { Logo } from "./Logo";

export function Hero({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative isolate overflow-hidden bg-slate-950">
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Logo size="lg" className="mb-10" />
            <div className="mt-8">
              <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-semibold leading-6 text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                Revolutionizing Interview Prep
              </span>
            </div>
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Master Your Next Interview with <span className="text-indigo-400 underline underline-offset-8">Vantage Professional.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-400">
              Vantage analyzes your speech, body language, and content in real-time. Get professional feedback and boost your confidence before the big day.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <button
                onClick={onStart}
                className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all transform hover:scale-105 active:scale-95"
              >
                Start Practice Now
              </button>
              <a href="#features" className="text-sm font-semibold leading-6 text-white hover:text-indigo-400 transition-colors">
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </motion.div>
        </div>

        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="rounded-2xl bg-slate-900 border border-slate-800 p-2 shadow-2xl"
            >
              <div className="rounded-xl bg-slate-950 overflow-hidden border border-slate-800/50 aspect-video w-[600px] flex flex-col">
                <div className="h-8 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500/50" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/50" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
                </div>
                <div className="flex-1 p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                      <Sparkles className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Performance Analysis in Progress</div>
                      <div className="text-xs text-slate-500">Processing audio & video cues...</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "75%" }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                        <div className="text-[10px] uppercase text-slate-500 font-bold mb-1 tracking-widest">Confidence</div>
                        <div className="text-lg font-bold text-white">88%</div>
                      </div>
                      <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                        <div className="text-[10px] uppercase text-slate-500 font-bold mb-1 tracking-widest">Speed</div>
                        <div className="text-lg font-bold text-white">142<span className="text-[10px] font-normal ml-1">wpm</span></div>
                      </div>
                      <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                        <div className="text-[10px] uppercase text-slate-500 font-bold mb-1 tracking-widest">Score</div>
                        <div className="text-lg font-bold text-indigo-400">A+</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
