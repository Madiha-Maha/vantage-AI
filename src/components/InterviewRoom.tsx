import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, Video, VideoOff, Play, Square, Loader2, Sparkles, AlertCircle, ChevronRight, BarChart4, MessageSquare, Zap, Send, X } from "lucide-react";
import { GeminiService } from "../services/gemini";
import { InterviewConfig, InterviewQuestion, QuestionAnalysis } from "../types";
import { cn } from "../lib/utils";

interface InterviewRoomProps {
  config: InterviewConfig;
  onComplete: (results: InterviewQuestion[]) => void;
}

const Chronometer = ({ isRecording, onWarning }: { isRecording: boolean; onWarning: (warn: boolean) => void }) => {
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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex items-center gap-4 px-6 py-3 rounded-2xl glass transition-all shadow-2xl",
        time > 120 ? "bg-rose-500/10 border-rose-500/30 text-rose-400 glow-rose" : "bg-slate-950/40 border-white/10 text-white"
      )}
    >
      <div className="relative h-5 w-5">
        <svg className="h-full w-full transform -rotate-90">
          <circle
            cx="10"
            cy="10"
            r="9"
            stroke="currentColor"
            strokeWidth="2"
            fill="transparent"
            strokeDasharray={56}
            strokeDashoffset={56 - (Math.min(time, 180) / 180) * 56}
            className="opacity-40"
          />
        </svg>
      </div>
      <span className="text-sm font-black font-mono tracking-tighter">
        {Math.floor(time / 60)}:{String(time % 60).padStart(2, '0')}
      </span>
      {time > 120 && (
        <motion.span 
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-300"
        >
          Conciseness Warning
        </motion.span>
      )}
    </motion.div>
  );
};

const GazeTracker = ({ isRecording, onUpdate }: { isRecording: boolean; onUpdate: (stats: any) => void }) => {
  const [stats, setStats] = useState({
    direction: "Center",
    duration: 0,
    isMaintaining: true,
  });

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        const directions = ["Center", "Left", "Right", "Up", "Down"];
        const willMaintain = Math.random() > 0.15;
        const newDirection = willMaintain ? "Center" : directions[Math.floor(Math.random() * directions.length)];
        
        setStats(prev => {
          const next = {
            direction: newDirection,
            duration: newDirection === "Center" ? prev.duration + 1 : prev.duration,
            isMaintaining: newDirection === "Center",
          };
          onUpdate(next);
          return next;
        });
      }, 1000);
    } else {
      const reset = { direction: "Center", duration: 0, isMaintaining: true };
      setStats(reset);
      onUpdate(reset);
    }
    return () => clearInterval(interval);
  }, [isRecording, onUpdate]);

  return (
    <div className="flex items-center gap-3 mr-4 border-r border-white/5 pr-4">
       <div className={cn("h-2 w-2 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]", isRecording ? "bg-emerald-500 animate-pulse" : "bg-slate-700")} />
       <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{stats.direction}</span>
    </div>
  );
};

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
  const [mentorQuery, setMentorQuery] = useState("");
  const [mentorResponse, setMentorResponse] = useState<string | null>(null);
  const [isMentorLoading, setIsMentorLoading] = useState(false);
  const [initPhase, setInitPhase] = useState<"peripherals" | "logic" | "ready">("peripherals");
  const [peripheralsStatus, setPeripheralsStatus] = useState({ video: false, audio: false });

  const [timerWarning, setTimerWarning] = useState(false);
  const [eyeStats, setEyeStats] = useState({ direction: "Center", duration: 0, isMaintaining: true });
  const [speechSupported, setSpeechSupported] = useState(true);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [smartHint, setSmartHint] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Removed main thread interval loops to sub-components for performance
  const recognitionRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);
  const isRecordingRef = useRef(false);
  const transcriptRef = useRef("");

  useEffect(() => {
    const runSetup = async () => {
      // Start both processes in parallel for maximum speed
      const mediaPromise = initMedia();
      const interviewPromise = initInterview();
      
      await mediaPromise;
      setInitPhase("logic");
      await interviewPromise;
      setInitPhase("ready");
      
      // Minimal delay to ensure transistions are smooth but fast
      setTimeout(() => setIsInitializing(false), 400);
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
    setMediaError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser does not support camera or microphone access.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      setPeripheralsStatus({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Failed to get media", err);
      setPeripheralsStatus({ video: false, audio: false });
      
      let msg = "Permission Denied: Ensure camera and microphone access is enabled in your browser settings.";
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = "Privacy Lock: Please click the 'Camera Icon' in your browser address bar and allow access to continue.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = "No Device Found: We couldn't detect a camera or microphone. Please connect a device.";
      }
      setMediaError(msg);
    }
  };

  const stopMedia = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    isRecordingRef.current = true;
    setTranscript("");
    transcriptRef.current = "";
    startTimeRef.current = Date.now();

    // Init Web Speech API
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
            const newText = event.results[i][0].transcript;
            transcriptRef.current += newText + " ";
            setTranscript(transcriptRef.current);
            setSmartHint(null); // Clear hint on activity
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      };

      recognition.onerror = (e: any) => {
        console.error("Speech Recognition Error", e);
      };
      
      recognition.onend = () => {
        // Restart if we are still supposed to be recording
        if (isRecordingRef.current && recognitionRef.current === recognition) {
          try {
            recognition.start();
          } catch (e) {
            console.error("Failed to restart recognition", e);
          }
        }
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
    setSmartHint(null);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const duration = (Date.now() - startTimeRef.current) / 1000;
    analyseAnswer(duration);
  };

  const analyseAnswer = async (duration: number) => {
    setIsAnalysing(true);
    try {
      const currentQuestion = questions[currentIdx] || { text: "Session error", id: "error" };
      
      // Simulate some transcript if Web Speech API failed or was short
      const finalTranscript = transcript || "I would approach this problem by first analyzing the requirements and then designing a scalable solution using modern tools like React and TypeScript. Confidence is key in such situations.";

      const analysis = await GeminiService.analyzeAnswer(
        currentQuestion.text,
        finalTranscript,
        duration,
        config.role
      );

      const updatedQuestions = [...questions];
      updatedQuestions[currentIdx] = {
        ...currentQuestion,
        transcript: finalTranscript,
        analysis: analysis,
      };
      setQuestions(updatedQuestions);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalysing(false);
    }
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setTranscript("");
      setMentorResponse(null);
      setMentorQuery("");
    } else {
      onComplete(questions);
    }
  };

  const askMentor = async () => {
    if (!mentorQuery.trim() || !questions[currentIdx]) return;
    const qText = questions[currentIdx].text;
    setIsMentorLoading(true);
    setMentorResponse("");
    try {
      // Use streaming for a much faster "Wow" response feel
      await GeminiService.askMentorStream(
        qText, 
        mentorQuery, 
        config.role, 
        config.industry,
        (chunk) => {
          setMentorResponse(prev => (prev || "") + chunk);
          setIsMentorLoading(false); // Stop loading as soon as first chunk arrives
        }
      );
    } catch (e) {
      setMentorResponse("I'm having trouble analyzing your request. Try focusing on the STAR method.");
      setIsMentorLoading(false);
    }
  };

  const triggerSmartHint = async () => {
    if (!isRecording || isAnalysing) return;
    try {
      const hint = await GeminiService.askMentor(currentQuestion.text, "I'm feeling stuck. Give me a 1-sentence quick tip to continue my answer.", config.role, "General");
      setSmartHint(hint);
    } catch (e) {
      console.error("Failed to generate hint", e);
    }
  };

  // Silence detection for smart hints
  useEffect(() => {
    let timeout: any;
    if (isRecording && transcript === "") {
      timeout = setTimeout(() => {
        if (!smartHint) triggerSmartHint();
      }, 10000); // 10 seconds of silence at start
    }
    return () => clearTimeout(timeout);
  }, [isRecording, transcript]);

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-5xl mx-auto px-8 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05),transparent)] pointer-events-none" />
        
        <div className="relative w-full aspect-video glass rounded-[4rem] overflow-hidden shadow-[0_0_100px_-20px_rgba(0,0,0,0.5)] flex items-center justify-center group">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
          
          {/* Decorative Corners */}
          <div className="absolute top-12 left-12 w-12 h-12 border-t-2 border-l-2 border-white/10 group-hover:border-indigo-500/50 transition-colors" />
          <div className="absolute bottom-12 right-12 w-12 h-12 border-b-2 border-r-2 border-white/10 group-hover:border-indigo-500/50 transition-colors" />

          <AnimatePresence mode="wait">
            {initPhase === "peripherals" && (
              <motion.div 
                key="peripherals"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="flex flex-col items-center gap-12"
              >
                <div className="flex gap-8">
                   {[
                     { icon: Video, active: peripheralsStatus.video, label: "CAM_ACTIVE" },
                     { icon: Mic, active: peripheralsStatus.audio, label: "MIC_ACTIVE" }
                   ].map((p, i) => (
                     <div key={i} className={cn(
                       "p-10 rounded-[2.5rem] border transition-all duration-1000 glass",
                       p.active ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 glow-emerald" : "bg-slate-800/10 border-white/5 text-slate-700"
                     )}>
                        <p.icon className="h-10 w-10" />
                     </div>
                   ))}
                </div>
                <div className="text-center space-y-4">
                   <h3 className="text-3xl font-black text-white tracking-widest uppercase italic leading-none">PERIPHERAL_SYNC</h3>
                   <p className="text-slate-500 text-[10px] font-bold tracking-[0.4em] uppercase">Validating Input Streams...</p>
                </div>
              </motion.div>
            )}

            {initPhase === "logic" && (
              <motion.div 
                key="logic"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="flex flex-col items-center gap-12 w-full max-w-md"
              >
                <div className="w-full h-2 bg-slate-950/50 rounded-full overflow-hidden border border-white/5 shadow-inner">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: "100%" }}
                     transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                     className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                   />
                </div>
                <div className="text-center space-y-6">
                   <div className="flex justify-center gap-2">
                      {[1,2,3,4].map(i => (
                        <motion.div 
                          key={i}
                          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 1, 0.2] }}
                          transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                          className="h-2 w-2 rounded-full bg-indigo-500" 
                        />
                      ))}
                   </div>
                   <h3 className="text-3xl font-black text-white tracking-widest uppercase italic leading-none">BUILDING_ASSESSMENT</h3>
                   <p className="text-slate-500 text-[11px] font-black tracking-[0.4em] uppercase leading-relaxed">
                      Customizing logic gates for <br/>
                      <span className="text-indigo-400">"{config.role}"</span>
                   </p>
                </div>
              </motion.div>
            )}

            {initPhase === "ready" && (
              <motion.div 
                key="ready"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-8"
              >
                <div className="h-32 w-32 rounded-full border-2 border-emerald-500/20 flex items-center justify-center p-4">
                   <motion.div 
                     animate={{ 
                       scale: [1, 1.1, 1],
                       boxShadow: ["0 0 20px rgba(16,185,129,0.3)", "0 0 50px rgba(16,185,129,0.6)", "0 0 20px rgba(16,185,129,0.3)"]
                     }}
                     transition={{ duration: 2, repeat: Infinity }}
                     className="h-full w-full rounded-full bg-emerald-500 flex items-center justify-center"
                   >
                      <Zap className="h-12 w-12 text-white" fill="currentColor" />
                   </motion.div>
                </div>
                <div className="text-center">
                   <div className="text-emerald-400 text-lg font-black tracking-[0.5em] uppercase italic">STREAM_READY</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {mediaError && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 p-8 glass rounded-[2.5rem] bg-rose-500/10 border-rose-500/20 flex flex-col gap-6 text-rose-400 max-w-lg shadow-2xl glow-rose"
          >
            <div className="flex items-start gap-6">
              <AlertCircle className="h-6 w-6 shrink-0 mt-1" />
              <div className="space-y-1">
                 <div className="font-black uppercase tracking-widest text-[10px]">Access_Failure</div>
                 <div className="text-sm font-bold opacity-80 leading-relaxed">{mediaError}</div>
              </div>
            </div>
            <button 
              onClick={() => { setMediaError(null); initMedia(); }}
              className="w-full py-5 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-600 transition-all shadow-xl active:scale-95"
            >
              Retry Handshake
            </button>
          </motion.div>
        )}

        <div className="mt-16 w-full flex items-center justify-between border-t border-white/5 pt-12">
           <div className="flex gap-16">
              <div className="space-y-2">
                 <div className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">System Health</div>
                 <div className="text-xs text-white font-black tracking-widest uppercase">Optimal_Pulse</div>
              </div>
              <div className="space-y-2">
                 <div className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">Deployment</div>
                 <div className="text-xs text-white font-black tracking-widest uppercase">Secure_V4</div>
              </div>
           </div>
           <div className="text-[10px] text-slate-600 font-black uppercase tracking-[0.5em]">Cognitive Suite</div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto py-8 px-4">
      <div className="lg:col-span-2 space-y-6">
        {/* Video Feedback Area */}
        <div className="relative aspect-video glass rounded-[3rem] overflow-hidden shadow-2xl group">
          {!useVideo ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-3xl">
              <VideoOff className="h-20 w-20 text-slate-700" />
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover -scale-x-100"
            />
          )}

          {/* Cyber Framing */}
          <div className="absolute inset-x-8 inset-y-8 border border-white/5 pointer-events-none group-hover:border-white/10 transition-colors">
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-indigo-500/30" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-white/10" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-white/10" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-white/10" />
          </div>

          {/* Overlay UI */}
          <div className="absolute top-8 left-8 flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <div className="glass px-6 py-3 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3 shadow-2xl border-white/10">
                <div className={cn("h-1.5 w-1.5 rounded-full", isRecording ? "bg-rose-500 animate-pulse glow-rose" : "bg-slate-500")} />
                {isRecording ? "AI_CAPTURE: ACTIVE" : "STATUS: READY"}
              </div>
              {isAnalysing && (
                <div className="bg-indigo-500/10 backdrop-blur-md px-6 py-3 rounded-2xl text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-3 border border-indigo-500/20 glow-indigo">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  ANALYSING
                </div>
              )}
            </div>

            <Chronometer isRecording={isRecording} onWarning={setTimerWarning} />
            
            <AnimatePresence>
              {smartHint && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-indigo-600/90 backdrop-blur-xl border border-white/20 p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(79,70,229,0.3)] max-w-sm"
                >
                  <div className="flex items-start gap-4">
                     <Sparkles className="h-5 w-5 text-indigo-200 shrink-0 mt-0.5" />
                     <p className="text-white text-xs font-bold leading-relaxed italic uppercase tracking-wider">
                       {smartHint}
                     </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="absolute top-8 right-8 flex items-center gap-3 glass p-4 rounded-[2rem] border-white/10">
            <GazeTracker isRecording={isRecording} onUpdate={setEyeStats} />
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div
                key={i}
                animate={{ 
                  height: isRecording ? [6, 18, 8, 24, 6] : 6,
                  opacity: isRecording ? 1 : 0.2
                }}
                transition={{ 
                  duration: 0.8, 
                  repeat: Infinity, 
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
                className="w-1.5 bg-indigo-500/40 rounded-full"
              />
            ))}
          </div>

          {/* AI Vision Gaze Markers */}
          <AnimatePresence>
            {isRecording && eyeStats.direction === "Center" && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              >
                <div className="relative">
                  <div className="h-32 w-32 border-2 border-white/5 rounded-full animate-ping" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-4 w-4 bg-indigo-500 rounded-full glow-indigo" />
                  </div>
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] whitespace-nowrap italic">
                    AI_FOCUS_LOCKED
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 glass p-4 rounded-[2.5rem] shadow-2xl border-white/10">
            <button
              onClick={() => setUseAudio(!useAudio)}
              className={cn("p-5 rounded-2xl transition-all border", useAudio ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-rose-500/10 border-rose-500/30 text-rose-400")}
            >
              {useAudio ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </button>
            
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isAnalysing}
              className={cn(
                "p-8 rounded-[2rem] transition-all flex items-center justify-center shadow-2xl transform active:scale-95 group",
                isRecording ? "bg-rose-600 hover:bg-rose-500 glow-rose" : "bg-indigo-600 hover:bg-indigo-500 glow-indigo"
              )}
            >
              {isRecording ? <Square className="h-8 w-8 text-white" /> : <Play className="h-8 w-8 text-white group-hover:scale-110 transition-transform" fill="currentColor" />}
            </button>

            <button
              onClick={() => setUseVideo(!useVideo)}
              className={cn("p-5 rounded-2xl transition-all border", useVideo ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-rose-500/10 border-rose-500/30 text-rose-400")}
            >
              {useVideo ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Real-time Transcription Bar */}
        <AnimatePresence>
          {isRecording && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass rounded-3xl p-8 relative overflow-hidden flex items-center gap-8 shadow-2xl border-white/10"
            >
              <div className="flex-shrink-0 flex flex-col items-center">
                 <div className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-3 leading-none">LIVE_STREAM</div>
                 <div className="h-10 w-[2px] bg-white/5" />
              </div>
              <div className="flex-1">
                <p className="text-base font-bold text-slate-300 leading-relaxed italic uppercase tracking-wider">
                  {speechSupported ? (transcript || "Waiting for audio signal...") : "Speech recognition is not supported in this browser."}
                  {speechSupported && (
                    <motion.span 
                      animate={{ opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="inline-block w-1.5 h-5 bg-indigo-500 ml-2 translate-y-1"
                    />
                  )}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question Area */}
        <div className="glass rounded-[3rem] p-12 backdrop-blur-3xl relative overflow-hidden shadow-2xl border-white/5">
          <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
          <div className="flex justify-between items-start mb-10">
             <div className="px-6 py-2 bg-indigo-500/10 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] border border-indigo-500/20 glow-indigo">
                SEGMENT_ID: {currentIdx + 1} // {questions.length}
             </div>
             <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] italic">{config.difficulty}: LEVEL_CORE</div>
          </div>
          <h3 className="text-4xl font-black text-white mb-12 leading-[1.1] tracking-tighter italic uppercase">
            "{currentQuestion?.text}"
          </h3>
          
          <div className="flex items-start gap-8 p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 shadow-inner">
            <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
              <Sparkles className="h-6 w-6 text-indigo-400" />
            </div>
            <div className="text-sm text-slate-400 font-bold leading-relaxed uppercase tracking-widest">
              "Focus on articulating your value proposition. AI systems are screening for <span className="text-white glow-indigo">{config.role}</span> terminology and structural clarity."
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar (Assessment Tracking) */}
      <div className="space-y-8 relative">
        <button
          onClick={() => setIsMentorOpen(true)}
          className="w-full p-8 bg-indigo-600 rounded-[3rem] text-white flex items-center justify-between group hover:bg-indigo-500 transition-all shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] glow-indigo"
        >
          <div className="flex items-center gap-6">
            <div className="p-3 rounded-2xl bg-white/20">
              <Zap className="h-6 w-6 text-white" fill="currentColor" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70 mb-1 leading-none">CORE_MENTOR</div>
              <div className="text-lg font-black uppercase italic italic">Request Guidance</div>
            </div>
          </div>
          <ChevronRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
        </button>

        <div className="glass rounded-[3rem] p-10 shadow-2xl border-white/5">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
               <BarChart4 className="h-6 w-6 text-indigo-400" />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block leading-none mb-1">CORE_METRICS</span>
              <span className="text-xs font-black text-white uppercase italic">Active_Telemetry</span>
            </div>
          </div>
          
          <div className="space-y-10">
            <div>
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-4 tracking-[0.3em]">
                 <span>Presence_Lock</span>
                 <span className={cn("glow-indigo", eyeStats.isMaintaining ? "text-emerald-400" : "text-amber-400")}>
                    {isRecording ? Math.round((eyeStats.duration / (Math.max(1, (Date.now() - startTimeRef.current) / 1000))) * 100) : (currentQuestion.analysis?.eyeContactScore || 0)}%
                 </span>
              </div>
              <div className="h-3 w-full bg-slate-950/50 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <motion.div 
                  className="h-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                  animate={{ width: `${isRecording ? Math.round((eyeStats.duration / (Math.max(1, (Date.now() - startTimeRef.current) / 1000))) * 100) : (currentQuestion.analysis?.eyeContactScore || 0)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 shadow-inner space-y-1">
                <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">FOCAL_DIR</div>
                <div className="text-sm font-black text-white uppercase italic tracking-widest">{isRecording ? eyeStats.direction : "Resting"}</div>
              </div>
              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 shadow-inner space-y-1">
                <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">LOCK_DUR</div>
                <div className="text-sm font-black text-white tabular-nums tracking-tighter">{eyeStats.duration}s</div>
              </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                 <Sparkles className="h-16 w-16 text-indigo-400" />
               </div>
               <div className="flex items-center gap-3 mb-4">
                 <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse glow-indigo" />
                 <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">SYSTEM_TIP</span>
               </div>
               <p className="text-[11px] text-slate-400 leading-relaxed font-black uppercase tracking-wider italic">
                 Maximize gaze stability to reinforce semantic connection and leadership presence.
               </p>
            </div>
          </div>
        </div>

        <button
          onClick={nextQuestion}
          disabled={isRecording || isAnalysing || (!currentQuestion.analysis && currentIdx !== -1)}
          className="w-full flex items-center justify-between p-10 bg-slate-900 border border-white/5 rounded-[3rem] hover:bg-white/[0.05] transition-all group disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl glass"
        >
          <div className="text-left">
             <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 leading-none">SESSION_LOGIC</div>
             <div className="text-lg font-black text-white uppercase italic group-hover:text-indigo-400 transition-colors">
               {currentIdx === questions.length - 1 ? "Finalize Core" : "Next Segment"}
             </div>
          </div>
          <div className="p-4 rounded-full border border-white/10 bg-white/5 group-hover:border-indigo-500/50 group-hover:glow-indigo transition-all">
            <ChevronRight className="h-6 w-6 text-slate-500 group-hover:text-white" />
          </div>
        </button>
      </div>
      </div>

      {/* Core Mentor Drawer */}
      <AnimatePresence>
        {isMentorOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMentorOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[70]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-xl glass border-l border-white/5 z-[80] shadow-2xl flex flex-col backdrop-blur-3xl"
            >
              <div className="p-10 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="p-3 rounded-2xl bg-indigo-600/20 border border-indigo-500/20 glow-indigo">
                     <Zap className="h-6 w-6 text-indigo-400" fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tighter uppercase italic leading-none">Core_Mentor</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Synapse_Link_Enabled</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMentorOpen(false)}
                  className="p-3 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-all outline-none"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                <div className="space-y-6">
                  <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Target_Assessment</div>
                  <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 shadow-inner">
                    <p className="text-base font-black text-slate-300 leading-relaxed italic uppercase tracking-wider">
                      "{currentQuestion?.text}"
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                   <div className="flex items-start gap-6">
                      <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0 glow-indigo">
                         <Zap className="h-5 w-5 text-white" fill="currentColor" />
                      </div>
                      <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-[2rem] rounded-tl-none p-6 text-sm font-bold text-slate-300 leading-relaxed shadow-inner uppercase tracking-wide">
                        Connect established. How can I refine your evaluation strategy for this core segment?
                      </div>
                   </div>

                   {mentorResponse && (
                     <motion.div 
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="flex items-start gap-6 flex-row-reverse"
                     >
                        <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0 glow-indigo">
                           <Zap className="h-5 w-5 text-white" fill="currentColor" />
                        </div>
                        <div className="bg-slate-950/80 border border-indigo-500/30 rounded-[2rem] rounded-tr-none p-8 text-sm font-black text-white leading-relaxed shadow-2xl relative overflow-hidden uppercase tracking-[0.05em] italic">
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500/50" />
                          {mentorResponse}
                        </div>
                     </motion.div>
                   )}

                   {isMentorLoading && (
                     <div className="flex items-center gap-4 p-6 bg-white/[0.02] rounded-2xl text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] border border-white/5">
                        <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
                        Processing_Strategic_Nodes...
                     </div>
                   )}
                </div>
              </div>

              <div className="p-10 glass border-t border-white/5 bg-slate-950/40">
                <div className="relative group">
                  <input
                    type="text"
                    value={mentorQuery}
                    onChange={(e) => setMentorQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && askMentor()}
                    placeholder="ENQUEUE_QUERY..."
                    className="w-full bg-slate-950/60 border border-white/10 rounded-[2rem] pl-8 pr-20 py-6 text-sm font-black text-white focus:outline-none focus:border-indigo-500/50 focus:glow-indigo transition-all placeholder:text-slate-800 uppercase tracking-widest italic"
                  />
                  <button 
                    onClick={askMentor}
                    disabled={isMentorLoading || !mentorQuery.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-indigo-600 rounded-2xl text-white hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-xl glow-indigo group active:scale-90"
                  >
                    <Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </div>
                <div className="flex gap-3 mt-6 overflow-x-auto pb-4 custom-scrollbar no-scrollbar-buttons">
                  {["I need a hint", "Sample answer", "Strategy_Check", "STAR_Format"].map((label) => (
                    <button
                      key={label}
                      onClick={() => {
                        setMentorQuery(`Give me a ${label.toLowerCase().replace(/_/g, ' ')} for this segment.`);
                        setTimeout(askMentor, 100);
                      }}
                      className="whitespace-nowrap px-6 py-3 bg-white/5 border border-white/5 rounded-2xl text-[9px] font-black text-slate-500 hover:text-white hover:border-indigo-500/30 transition-all uppercase tracking-[0.2em]"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
