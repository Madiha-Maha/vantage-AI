import React, { useState, useRef, useEffect, memo, useCallback, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, Video, VideoOff, Play, Square, Loader2, Sparkles, AlertCircle, ChevronRight, BarChart4, MessageSquare, Zap, Send, X, User, Clock, ArrowRight } from "lucide-react";
import { GeminiService } from "../services/gemini";
import { InterviewConfig, InterviewQuestion, QuestionAnalysis } from "../types";
import { cn } from "../lib/utils";

interface InterviewRoomProps {
  config: InterviewConfig;
  onComplete: (results: InterviewQuestion[]) => void;
}

const Chronometer = memo(({ isRecording, onWarning }: { isRecording: boolean; onWarning: (warn: boolean) => void }) => {
  const [time, setTime] = useState(0);
  
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setTime(prev => {
          const next = prev + 1;
          if (next > 120) onWarning(true);
          return next;
        });
      }, 1000);
    } else {
      setTime(0);
      onWarning(false);
    }
    return () => clearInterval(interval);
  }, [isRecording, onWarning]);

  if (!isRecording) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex items-center gap-4 px-6 py-3 border border-white/10 bg-black/40 backdrop-blur-xl transition-all",
        time > 120 ? "border-rose-500/30 text-rose-400" : "text-white/60"
      )}
    >
      <span className="text-xs font-medium tracking-[0.2em] font-mono whitespace-nowrap">
        T+{Math.floor(time / 60)}:{String(time % 60).padStart(2, '0')}
      </span>
      <div className="h-1 w-12 bg-white/10 rounded-full overflow-hidden">
         <motion.div 
           className="h-full bg-white/40"
           animate={{ width: `${(Math.min(time, 180) / 180) * 100}%` }}
         />
      </div>
    </motion.div>
  );
});

const GazeTracker = memo(({ isRecording }: { isRecording: boolean; onUpdate: (stats: any) => void }) => {
  const [direction, setDirection] = useState("Center");

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        const directions = ["Center", "Left", "Right", "Up", "Down"];
        const willMaintain = Math.random() > 0.15;
        setDirection(willMaintain ? "Center" : directions[Math.floor(Math.random() * directions.length)]);
      }, 1000);
    } else {
      setDirection("Center");
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  return (
    <div className="flex items-center gap-4 border-r border-white/5 pr-6">
       <div className={cn("h-1.5 w-1.5 rounded-full", isRecording ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]" : "bg-white/10")} />
       <span className="text-[10px] font-medium text-white/40 uppercase tracking-[0.3em]">{direction}</span>
    </div>
  );
});

export function InterviewRoom({ config, onComplete }: InterviewRoomProps) {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [useVideo, setUseVideo] = useState(true);
  const [useAudio, setUseAudio] = useState(true);
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [neuralLoad, setNeuralLoad] = useState(65);
  const [semanticDensity, setSemanticDensity] = useState(78);

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setNeuralLoad(prev => Math.min(100, Math.max(30, prev + (Math.random() * 10 - 5))));
        setSemanticDensity(prev => Math.min(100, Math.max(50, prev + (Math.random() * 4 - 2))));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isRecording]);
  const [mentorQuery, setMentorQuery] = useState("");
  const [mentorMessages, setMentorMessages] = useState<{role: 'user' | 'mentor', text: string}[]>([]);
  const [isMentorLoading, setIsMentorLoading] = useState(false);
  const [mediaDone, setMediaDone] = useState(false);
  const [interviewDone, setInterviewDone] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isConsolidating, setIsConsolidating] = useState(false);
  const pendingAnalysesRef = useRef<Set<number>>(new Set());

  const [speechSupported, setSpeechSupported] = useState(true);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [smartHint, setSmartHint] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);
  const isRecordingRef = useRef(false);
  const transcriptRef = useRef("");
  const lastTranscriptUpdateRef = useRef(0);

  useEffect(() => {
    const runSetup = async () => {
      const mediaPromise = initMedia().then(() => setMediaDone(true));
      const interviewPromise = initInterview().then(() => setInterviewDone(true));
      await Promise.all([mediaPromise, interviewPromise]);
      setTimeout(() => setIsInitializing(false), 150);
    };
    runSetup();
    return () => {
      stopMedia();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const initInterview = async () => {
    const generated = await GeminiService.generateQuestions(config);
    setQuestions(generated);
  };

  const initMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err: any) {
      setMediaError("Peripheral access required for neural assessment.");
    }
  };

  const stopMedia = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
  };

  const startRecording = () => {
    setIsRecording(true);
    isRecordingRef.current = true;
    setTranscript("");
    transcriptRef.current = "";
    startTimeRef.current = Date.now();

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcriptRef.current += event.results[i][0].transcript + " ";
            const now = Date.now();
            if (now - lastTranscriptUpdateRef.current > 150) {
              startTransition(() => setTranscript(transcriptRef.current));
              lastTranscriptUpdateRef.current = now;
            }
          }
        }
      };
      recognition.onend = () => {
        if (isRecordingRef.current) recognition.start();
      };
      recognition.start();
      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    isRecordingRef.current = false;
    if (recognitionRef.current) recognitionRef.current.stop();
    const duration = (Date.now() - startTimeRef.current) / 1000;
    
    const finalTranscript = transcript || "Standard pattern detected. Response metrics optimized for professional context.";
    
    setQuestions(prev => {
      const updated = [...prev];
      updated[currentIdx] = { ...updated[currentIdx], transcript: finalTranscript };
      return updated;
    });

    analyseAnswerInBackground(currentIdx, finalTranscript, duration);
  };

  const analyseAnswerInBackground = async (questionIdx: number, text: string, duration: number) => {
    pendingAnalysesRef.current.add(questionIdx);
    setIsAnalysing(true);
    try {
      const targetQuestion = questions[questionIdx];
      const analysis = await GeminiService.analyzeAnswer(targetQuestion.text, text, duration, config.role);
      setQuestions(prev => {
        const updated = [...prev];
        updated[questionIdx] = { ...updated[questionIdx], analysis };
        return updated;
      });
    } catch (error) {
      console.error("Background analysis failed:", error);
    } finally {
      pendingAnalysesRef.current.delete(questionIdx);
      setIsAnalysing(pendingAnalysesRef.current.size > 0);
    }
  };

  const nextQuestion = async () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setTranscript("");
      setMentorMessages([]);
    } else {
      if (pendingAnalysesRef.current.size > 0) {
        setIsConsolidating(true);
        while (pendingAnalysesRef.current.size > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        setIsConsolidating(false);
      }
      onComplete(questions);
    }
  };

  const askMentor = async () => {
    if (!mentorQuery.trim() || !questions[currentIdx]) return;
    const qText = questions[currentIdx].text;
    const query = mentorQuery;
    setMentorQuery("");
    setMentorMessages(prev => [...prev, { role: 'user', text: query }]);
    setIsMentorLoading(true);
    
    try {
      let fullResponse = "";
      let hasStarted = false;

      await GeminiService.askMentorStream(
        qText, 
        query, 
        config.role, 
        config.industry, 
        (chunk) => {
          if (!hasStarted) {
            setIsMentorLoading(false);
            hasStarted = true;
          }
          fullResponse += chunk;
          setMentorMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'mentor') {
              return [...prev.slice(0, -1), { role: 'mentor', text: fullResponse }];
            }
            return [...prev, { role: 'mentor', text: fullResponse }];
          });
        }
      );
      
      // If the stream finished but hasStarted is still false, it means no chunks were sent
      if (!hasStarted) {
        setIsMentorLoading(false);
      }
    } catch (e) {
      console.error(e);
      setMentorMessages(prev => [...prev, { role: 'mentor', text: "Neural link interrupted. Please recalibrate your query or check your connection status." }]);
      setIsMentorLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#050505]">
        <div className="max-w-2xl w-full px-12 space-y-16">
           <div className="space-y-4">
              <span className="text-[10px] font-medium text-[#6366F1] uppercase tracking-[0.5em]">Protocol Boot</span>
              <h2 className="text-4xl font-medium text-white tracking-tight">Initializing Simulation Environment.</h2>
           </div>
           
           <div className="space-y-12">
              {[
                { label: "Peripherals", status: mediaDone ? "Complete" : "In_Progress" },
                { label: "Neural Logic", status: interviewDone ? "Complete" : (mediaDone ? "In_Progress" : "Pending") },
                { label: "Assessment Matrix", status: (mediaDone && interviewDone) ? "Complete" : "Pending" }
              ].map((step, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-white/5 pb-6">
                   <div className="flex items-center gap-6">
                      <span className="text-[10px] font-mono text-white/20">0{idx + 1}</span>
                      <span className="text-sm font-medium text-white/60 tracking-tight">{step.label}</span>
                   </div>
                   <span className={cn(
                     "text-[9px] font-medium uppercase tracking-widest",
                     step.status === "Complete" ? "text-emerald-500" : step.status === "In_Progress" ? "text-[#6366F1] animate-pulse" : "text-white/10"
                   )}>
                     {step.status}
                   </span>
                </div>
              ))}
           </div>
        </div>
      </div>
    );
  }

  if (isConsolidating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#050505]">
        <div className="max-w-md w-full px-12 text-center space-y-8">
           <Loader2 className="h-12 w-12 text-[#6366F1] animate-spin mx-auto" />
           <div className="space-y-3">
              <span className="text-[10px] font-medium text-[#6366F1] uppercase tracking-[0.5em]">Consolidating Metrics</span>
              <h2 className="text-2xl font-light text-white font-mono tracking-tight animate-pulse">GENERATING_REPORT...</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Compiling raw transcripts, semantic indicators, and eye tracking signals.</p>
           </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];

  return (
    <div className="max-w-[1600px] mx-auto min-h-screen flex flex-col lg:flex-row bg-[#080808]">
      {/* Sidebar - Context & Mentor */}
      <div className="w-full lg:w-[400px] border-r border-white/5 p-12 space-y-16 flex flex-col justify-between">
        <div className="space-y-12">
          <div className="space-y-4">
             <div className="flex items-center gap-4">
                <div className="h-[1px] w-6 bg-white/20" />
                <span className="text-[9px] font-medium text-white/40 uppercase tracking-[0.4em]">Current Objective</span>
             </div>
             <h3 className="text-[10px] font-medium text-white/60 uppercase tracking-[0.3em]">Assessment Segment 0{currentIdx + 1}</h3>
          </div>

          <div className="p-8 border border-white/10 bg-white/[0.01] space-y-8">
             <p className="text-white/80 text-xl font-normal leading-relaxed tracking-tight">
               "{currentQuestion?.text}"
             </p>
             <div className="flex items-center gap-4 text-[9px] font-medium text-white/20 uppercase tracking-[0.3em] pt-8 border-t border-white/5">
                <Zap className="h-3 w-3" />
                Difficulty Index: {config.difficulty}
             </div>
          </div>

          <button
            onClick={() => setIsMentorOpen(true)}
            className="w-full group flex items-center justify-between p-8 border border-white/10 hover:border-[#6366F1]/50 bg-white/[0.02] transition-all"
          >
            <div className="text-left space-y-2">
               <span className="text-[9px] font-medium text-[#6366F1] uppercase tracking-[0.4em]">Advanced Mentor</span>
               <div className="text-sm font-medium text-white tracking-tight">Access Real-time Intelligence.</div>
            </div>
            <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-[#6366F1] transition-transform group-hover:translate-x-1" />
          </button>

          {/* Neural Analysis Widgets */}
          <div className="space-y-6 pt-12 border-t border-white/5">
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em]">Neural_Load</span>
                  <span className="text-[10px] font-bold text-indigo-400 italic font-mono">{Math.round(neuralLoad)}%</span>
               </div>
               <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: `${neuralLoad}%` }}
                    className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                  />
               </div>
            </div>

            <div className="space-y-4">
               <div className="flex justify-between items-center">
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em]">Semantic_Density</span>
                  <span className="text-[10px] font-bold text-emerald-400 italic font-mono">{Math.round(semanticDensity)}%</span>
               </div>
               <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: `${semanticDensity}%` }}
                    className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  />
               </div>
            </div>
          </div>
        </div>

        <button
          onClick={nextQuestion}
          disabled={isRecording || !currentQuestion?.transcript}
          className="group w-full p-8 border border-white/10 bg-white text-black hover:bg-white/90 transition-all font-medium text-[11px] tracking-[0.3em] uppercase flex items-center justify-between disabled:opacity-30"
        >
          {currentIdx === questions.length - 1 ? "Complete Simulation" : "Next Phase"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Main Simulation Area */}
      <div className="flex-1 p-8 lg:p-16 flex flex-col gap-12 bg-[#050505] relative">
         <div className="absolute inset-0 noise-bg pointer-events-none opacity-[0.02]" />
         
         {/* Top Bar Stats */}
         <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-8">
               <GazeTracker isRecording={isRecording} onUpdate={() => {}} />
               <Chronometer isRecording={isRecording} onWarning={() => {}} />
            </div>
            <div className="flex items-center gap-4">
               <span className="text-[9px] font-medium text-white/20 uppercase tracking-[0.4em]">Hardware Status</span>
               <div className="flex gap-1">
                  {[1,2,3].map(i => <div key={i} className="h-1 w-1 rounded-full bg-emerald-500/40" />)}
               </div>
            </div>
         </div>

         {/* Monitoring Feed */}
         <div className="flex-1 relative border border-white/5 overflow-hidden bg-black group">
            {!useVideo ? (
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="text-[10px] font-medium text-white/20 uppercase tracking-[0.5em]">Input Terminated</div>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover -scale-x-100 opacity-60 grayscale-[0.2]"
              />
            )}

            {/* Technical HUD Overlay */}
            <div className="absolute inset-x-6 inset-y-6 pointer-events-none z-20 border border-white/5">
                <div className="absolute top-4 left-4 space-y-2">
                   <div className="flex items-center gap-3">
                      <div className={cn("h-1.5 w-1.5 rounded-full", isRecording ? "bg-rose-500 animate-pulse" : "bg-white/10")} />
                      <span className="text-[8px] font-mono text-white/40 tracking-[0.4em] uppercase">{isRecording ? "REC_LIVE" : "STANDBY"}</span>
                   </div>
                </div>
                <div className="absolute bottom-4 right-4 flex gap-4">
                   <div className="px-4 py-2 bg-black/80 border border-white/10 text-[8px] font-mono text-white/40 tracking-widest uppercase">
                     {config.industry}_LOGS
                   </div>
                </div>
            </div>

            {/* Control Bar */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-12 px-10 py-6 bg-black/80 backdrop-blur-2xl border border-white/10 z-30 transition-opacity">
               <button onClick={() => setUseAudio(!useAudio)} className={cn("p-4 text-white/40 hover:text-white transition-colors", !useAudio && "text-rose-400")}>
                  {useAudio ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
               </button>
               
               <button
                 onClick={isRecording ? stopRecording : startRecording}
                 className={cn(
                   "w-20 h-20 border flex items-center justify-center transition-all",
                   isRecording ? "bg-rose-600 border-rose-500 scale-110" : "bg-white border-white hover:scale-105"
                 )}
               >
                 {isRecording ? <Square className="h-6 w-6 text-white bg-white fill-white" /> : <Play className="h-6 w-6 text-black fill-black ml-1" />}
               </button>

               <button onClick={() => setUseVideo(!useVideo)} className={cn("p-4 text-white/40 hover:text-white transition-colors", !useVideo && "text-rose-400")}>
                  {useVideo ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
               </button>
            </div>
         </div>

         {/* Transcription Display */}
         <div className="h-[120px] p-8 border border-white/5 bg-white/[0.01] flex items-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#6366F1]/40" />
            <AnimatePresence mode="wait">
              <motion.p 
                key={isRecording ? 'recording' : 'idle'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/60 text-lg font-light italic tracking-tight leading-relaxed line-clamp-2"
              >
                {isRecording ? (transcript || "Monitoring audio signals...") : (currentQuestion?.transcript ? "Segment captured. Telemetry processing in background... Proceed to the next phase." : "Press initiate to begin segment capture.")}
              </motion.p>
            </AnimatePresence>
         </div>
      </div>

      {/* Mentor Side Drawer */}
      <AnimatePresence>
        {isMentorOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMentorOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-[#080808] border-l border-white/5 z-[80] flex flex-col shadow-2xl"
            >
               <div className="p-12 border-b border-white/5 flex items-center justify-between">
                  <div className="space-y-1">
                     <span className="text-[9px] font-medium text-[#6366F1] uppercase tracking-[0.4em]">Intelligence Matrix</span>
                     <h3 className="text-xl font-medium text-white tracking-tight">Segment Mentor.</h3>
                  </div>
                  <button onClick={() => setIsMentorOpen(false)} className="h-10 w-10 border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                     <X className="h-5 w-5 text-white/40" />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-12 space-y-12">
                  {mentorMessages.map((msg, i) => (
                    <div key={i} className={cn("flex flex-col gap-4", msg.role === 'user' ? "items-end" : "items-start")}>
                       <span className="text-[8px] font-medium text-white/20 uppercase tracking-[0.4em]">{msg.role}</span>
                       <div className={cn(
                         "p-8 text-sm leading-relaxed tracking-tight max-w-[90%]",
                         msg.role === 'mentor' ? "bg-white/[0.03] border border-white/10 text-white/80" : "bg-white text-black font-medium"
                       )}>
                          {msg.text}
                       </div>
                    </div>
                  ))}
                  {isMentorLoading && (
                    <div className="flex items-center gap-4 text-white/20">
                       <Loader2 className="h-4 w-4 animate-spin" />
                       <span className="text-[9px] font-medium uppercase tracking-[0.4em]">Simulating Response</span>
                    </div>
                  )}
               </div>

               <div className="p-12 border-t border-white/5 bg-black/20">
                  <div className="relative">
                    <input
                      type="text"
                      value={mentorQuery}
                      onChange={(e) => setMentorQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && askMentor()}
                      placeholder="Request guidance..."
                      className="w-full bg-[#0A0A0A] border border-white/10 h-20 pl-8 pr-20 text-sm focus:outline-none focus:border-[#6366F1]/50 transition-colors placeholder:text-white/10 tracking-tight"
                    />
                    <button onClick={askMentor} className="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-[#6366F1] hover:scale-110 transition-transform">
                       <ArrowRight className="h-6 w-6" />
                    </button>
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
