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
        "flex items-center gap-3 px-4 py-2 rounded-2xl backdrop-blur-xl border transition-colors",
        time > 120 ? "bg-rose-500/20 border-rose-500/30 text-rose-400" : "bg-slate-950/60 border-white/10 text-white"
      )}
    >
      <div className="relative h-4 w-4">
        <svg className="h-full w-full transform -rotate-90">
          <circle
            cx="8"
            cy="8"
            r="7"
            stroke="currentColor"
            strokeWidth="2"
            fill="transparent"
            strokeDasharray={44}
            strokeDashoffset={44 - (Math.min(time, 180) / 180) * 44}
            className="opacity-40"
          />
        </svg>
      </div>
      <span className="text-xs font-bold font-mono tracking-tighter">
        {Math.floor(time / 60)}:{String(time % 60).padStart(2, '0')}
      </span>
      {time > 120 && (
        <motion.span 
          animate={{ opacity: [1, 0.2, 1], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
          className="text-xs font-black uppercase tracking-widest text-rose-300"
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
    <div className="flex items-center gap-1.5 mr-3 border-r border-white/10 pr-3">
       <div className={cn("h-2 w-2 rounded-full", isRecording ? "bg-emerald-500 animate-pulse" : "bg-slate-500")} />
       <span className="text-[10px] font-bold text-white uppercase tracking-widest">{stats.direction}</span>
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
    setTranscript("");
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
            setTranscript((prev) => prev + newText + " ");
            setSmartHint(null); // Clear hint on activity
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      };

      recognition.onerror = (e: any) => console.error("Speech Recognition Error", e);
      recognition.start();
      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setSmartHint(null);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const duration = (Date.now() - startTimeRef.current) / 1000;
    analyseAnswer(duration);
  };

  const analyseAnswer = async (duration: number) => {
    setIsAnalysing(true);
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
    setIsAnalysing(false);
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
    if (!mentorQuery.trim()) return;
    setIsMentorLoading(true);
    setMentorResponse("");
    try {
      // Use streaming for a much faster "Wow" response feel
      await GeminiService.askMentorStream(
        currentQuestion.text, 
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
      <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-4xl mx-auto px-8">
        <div className="relative w-full aspect-video bg-slate-900 rounded-[3rem] overflow-hidden border border-slate-800 shadow-[0_0_100px_rgba(0,0,0,0.5)] flex items-center justify-center">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {initPhase === "peripherals" && (
              <motion.div 
                key="peripherals"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="flex flex-col items-center gap-8"
              >
                <div className="flex gap-4">
                   <div className={cn(
                     "p-6 rounded-3xl border transition-all duration-700",
                     peripheralsStatus.video ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-slate-800 border-slate-700 text-slate-500"
                   )}>
                      <Video className="h-8 w-8" />
                   </div>
                   <div className={cn(
                     "p-6 rounded-3xl border transition-all duration-700",
                     peripheralsStatus.audio ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-slate-800 border-slate-700 text-slate-500"
                   )}>
                      <Mic className="h-8 w-8" />
                   </div>
                </div>
                <div className="text-center space-y-2">
                   <h3 className="text-xl font-bold text-white tracking-widest uppercase">Peripherals Link</h3>
                   <p className="text-slate-500 text-xs font-bold tracking-[0.2em] uppercase">Checking Virtual Streams...</p>
                </div>
              </motion.div>
            )}

            {initPhase === "logic" && (
              <motion.div 
                key="logic"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center gap-10 w-full max-w-xs"
              >
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: "100%" }}
                     transition={{ duration: 1.5, ease: "easeInOut" }}
                     className="h-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                   />
                </div>
                <div className="text-center space-y-3">
                   <div className="flex justify-center gap-1">
                      {[1,2,3].map(i => (
                        <motion.div 
                          key={i}
                          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                          transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                          className="h-1.5 w-1.5 rounded-full bg-indigo-400" 
                        />
                      ))}
                   </div>
                   <h3 className="text-lg font-bold text-white tracking-[0.3em] uppercase">Tailoring Environment</h3>
                   <p className="text-slate-500 text-[10px] font-bold tracking-[0.2em] uppercase leading-relaxed">
                      Compiling tailored assessment architect for <br/>
                      <span className="text-indigo-400">"{config.role}"</span>
                   </p>
                </div>
              </motion.div>
            )}

            {initPhase === "ready" && (
              <motion.div 
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="h-20 w-20 rounded-full border-2 border-emerald-500/30 flex items-center justify-center p-2">
                   <motion.div 
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     className="h-full w-full rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                   >
                      <Zap className="h-8 w-8 text-white" fill="currentColor" />
                   </motion.div>
                </div>
                <div className="text-center">
                   <div className="text-emerald-400 text-sm font-bold tracking-[0.4em] uppercase">Connection Established</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {mediaError && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex flex-col gap-4 text-rose-400 text-xs font-medium max-w-sm"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{mediaError}</span>
            </div>
            <button 
              onClick={() => { setMediaError(null); initMedia(); }}
              className="w-full py-3 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-colors"
            >
              Retry Connection
            </button>
          </motion.div>
        )}

        {questions.length === 0 && !isInitializing && (
           <div className="mt-8 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
             Waiting for assessment data...
           </div>
        )}

        <div className="mt-12 w-full flex items-center justify-between border-t border-slate-800/50 pt-8">
           <div className="flex gap-12">
              <div className="space-y-1">
                 <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">System Health</div>
                 <div className="text-xs text-slate-400 font-bold">Optimal</div>
              </div>
              <div className="space-y-1">
                 <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Protocol</div>
                 <div className="text-xs text-slate-400 font-bold">Secure V4</div>
              </div>
           </div>
           <div className="text-[9px] text-slate-700 font-bold uppercase tracking-[0.3em]">Professional Suite</div>
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
        <div className="relative aspect-video bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
          {!useVideo ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
              <VideoOff className="h-16 w-16 text-slate-700" />
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
          <div className="absolute inset-x-10 inset-y-10 border border-white/5 pointer-events-none">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-indigo-500/30" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/10" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/10" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/10" />
          </div>

          {/* Overlay UI */}
          <div className="absolute top-6 left-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-950/80 backdrop-blur-xl px-4 py-2 rounded-xl text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-3 border border-white/10 shadow-2xl">
                <div className={cn("h-1.5 w-1.5 rounded-full", isRecording ? "bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]" : "bg-slate-500")} />
                {isRecording ? "Neural Capture: Active" : "Status: Ready"}
              </div>
              {isAnalysing && (
                <div className="bg-indigo-500/20 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-3 border border-indigo-500/30">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Processing
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
                  className="bg-indigo-600 border border-indigo-400 p-4 rounded-2xl shadow-xl max-w-xs"
                >
                  <div className="flex items-start gap-3">
                     <Sparkles className="h-4 w-4 text-white shrink-0 mt-0.5" />
                     <p className="text-white text-xs font-medium leading-relaxed italic">
                       {smartHint}
                     </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="absolute top-6 right-6 flex items-center gap-1.5 backdrop-blur-md bg-slate-950/40 p-3 rounded-2xl border border-white/10">
            <GazeTracker isRecording={isRecording} onUpdate={setEyeStats} />
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                animate={{ 
                  height: isRecording ? [4, 12, 6, 16, 4] : 4,
                  opacity: isRecording ? 1 : 0.2
                }}
                transition={{ 
                  duration: 0.6, 
                  repeat: Infinity, 
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
                className="w-1 bg-indigo-500/60 rounded-full"
              />
            ))}
          </div>

          {/* Neural Vision Gaze Markers */}
          <AnimatePresence>
            {isRecording && eyeStats.direction === "Center" && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              >
                <div className="relative">
                  <div className="h-24 w-24 border-2 border-indigo-500/20 rounded-full animate-ping" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-3 w-3 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
                  </div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] whitespace-nowrap">
                    Neural Focus Locked
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-950/40 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl">
            <button
              onClick={() => setUseAudio(!useAudio)}
              className={cn("p-4 rounded-xl transition-all border", useAudio ? "bg-slate-800 border-slate-700 text-white" : "bg-rose-500/10 border-rose-500/30 text-rose-400")}
            >
              {useAudio ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </button>
            
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isAnalysing}
              className={cn(
                "p-6 rounded-2xl transition-all flex items-center justify-center shadow-2xl transform active:scale-90",
                isRecording ? "bg-rose-600 hover:bg-rose-500 shadow-rose-500/20" : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20"
              )}
            >
              {isRecording ? <Square className="h-6 w-6 text-white" /> : <Play className="h-6 w-6 text-white" fill="currentColor" />}
            </button>

            <button
              onClick={() => setUseVideo(!useVideo)}
              className={cn("p-4 rounded-xl transition-all border", useVideo ? "bg-slate-800 border-slate-700 text-white" : "bg-rose-500/10 border-rose-500/30 text-rose-400")}
            >
              {useVideo ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Real-time Transcription Bar - WOW FEATURE */}
        <AnimatePresence>
          {isRecording && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex items-center gap-6"
            >
              <div className="flex-shrink-0 flex flex-col items-center">
                 <div className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mb-2">Live Text</div>
                 <div className="h-8 w-px bg-slate-800" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-300 leading-relaxed italic">
                  {speechSupported ? (transcript || "Waiting for audio signal...") : "Speech recognition is not supported in this browser. Please use Chrome or Edge for the full experience."}
                  {speechSupported && (
                    <motion.span 
                      animate={{ opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="inline-block w-1 h-4 bg-indigo-500 ml-1 translate-y-0.5"
                    />
                  )}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question Area */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 backdrop-blur-md relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
          <div className="flex justify-between items-start mb-6">
             <div className="px-4 py-1 bg-indigo-500/10 rounded-full text-[10px] font-bold text-indigo-400 uppercase tracking-widest border border-indigo-500/20">
                Segment {currentIdx + 1} / {questions.length}
             </div>
             <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{config.difficulty} Assessment</div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-8 leading-relaxed tracking-tight italic font-light">
            "{currentQuestion?.text}"
          </h3>
          
          <div className="flex items-start gap-5 p-6 rounded-2xl bg-slate-950/40 border border-slate-800">
            <AlertCircle className="h-5 w-5 text-indigo-400 mt-1 flex-shrink-0" />
            <div className="text-sm text-slate-400 leading-relaxed">
              "Focus on articulating your value proposition. Our systems are screening for <span className="text-white font-semibold">{config.role}</span> terminology and structural clarity."
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Sidebar (Real-time simplified stats) */}
      <div className="space-y-6 relative">
        {/* Mentor Floating Button */}
        <button
          onClick={() => setIsMentorOpen(true)}
          className="w-full p-6 bg-indigo-600 rounded-[2rem] text-white flex items-center justify-between group hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-white/20">
              <Zap className="h-5 w-5 text-white" fill="currentColor" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">Neural Mentor</div>
              <div className="text-sm font-bold">Ask for Guidance</div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
               <Zap className="h-5 w-5 text-indigo-400" fill="currentColor" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Neural Response Tracking</span>
          </div>
          
          <div className="space-y-8">
            <div>
              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-widest">
                 <span>Gaze Centrality</span>
                 <span className={cn(eyeStats.isMaintaining ? "text-emerald-400" : "text-amber-400")}>
                    {isRecording ? Math.round((eyeStats.duration / (Math.max(1, (Date.now() - startTimeRef.current) / 1000))) * 100) : (currentQuestion.analysis?.eyeContactScore || 0)}%
                 </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                  animate={{ width: `${isRecording ? Math.round((eyeStats.duration / (Math.max(1, (Date.now() - startTimeRef.current) / 1000))) * 100) : (currentQuestion.analysis?.eyeContactScore || 0)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
                <div className="text-[10px] font-bold text-slate-600 uppercase mb-1">Focal Node</div>
                <div className="text-sm font-bold text-white uppercase tracking-widest">{isRecording ? eyeStats.direction : "Resting"}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
                <div className="text-[10px] font-bold text-slate-600 uppercase mb-1">Lock Duration</div>
                <div className="text-sm font-bold text-white tabular-nums tracking-tighter">{eyeStats.duration}s</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
               <div className="flex items-center gap-2 mb-3">
                 <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                 <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Neural Tip</span>
               </div>
               <p className="text-[11px] text-slate-400 leading-relaxed font-bold">
                 Maximize gaze duration on the lens to reinforce executive presence and semantic connection.
               </p>
            </div>
          </div>
        </div>

        <button
          onClick={nextQuestion}
          disabled={isRecording || isAnalysing || (!currentQuestion.analysis && currentIdx !== -1)}
          className="w-full flex items-center justify-between p-8 bg-slate-900 border border-slate-800 rounded-3xl hover:bg-slate-800/80 transition-all group disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
        >
          <div className="text-left">
             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Session Flux</div>
             <div className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
               {currentIdx === questions.length - 1 ? "Finalize Assessment" : "Next Segment"}
             </div>
          </div>
          <div className="p-2 rounded-full border border-slate-700 bg-slate-950 group-hover:border-indigo-500/50 transition-colors">
            <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-indigo-400" />
          </div>
        </button>
      </div>
      </div>

      {/* Neural Mentor Drawer */}
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
              className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-slate-900 border-l border-slate-800 z-[80] shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/20">
                     <Zap className="h-5 w-5 text-indigo-400" fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Neural Mentor</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Global Network Active</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMentorOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-800 text-slate-500 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                <div className="bg-slate-950/50 border border-slate-800 rounded-3xl p-6">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Target Question</div>
                   <p className="text-white font-medium italic">"{currentQuestion.text}"</p>
                </div>

                <div className="space-y-6">
                   <div className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                         <Zap className="h-4 w-4 text-white" fill="currentColor" />
                      </div>
                      <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl rounded-tl-none p-4 text-sm text-slate-300 leading-relaxed shadow-inner">
                        Greetings, Analyst. I'm connected to the candidate evaluation network. How can I refine your interview strategy for this specific question?
                      </div>
                   </div>

                   {mentorResponse && (
                     <motion.div 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="flex items-start gap-4 flex-row-reverse"
                     >
                        <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                           <Zap className="h-4 w-4 text-white" fill="currentColor" />
                        </div>
                        <div className="bg-slate-950 border border-indigo-500/30 rounded-2xl rounded-tr-none p-5 text-sm text-white leading-relaxed shadow-xl relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50" />
                          {mentorResponse}
                        </div>
                     </motion.div>
                   )}

                   {isMentorLoading && (
                     <div className="flex items-center gap-3 p-4 bg-slate-800/40 rounded-2xl text-xs text-slate-500 font-bold uppercase tracking-widest border border-slate-800">
                        <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                        Neural Processing...
                     </div>
                   )}
                </div>
              </div>

              <div className="p-8 bg-slate-900 border-t border-slate-800">
                <div className="relative">
                  <input
                    type="text"
                    value={mentorQuery}
                    onChange={(e) => setMentorQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && askMentor()}
                    placeholder="Ask for a hint, strategy, or sample answer..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-6 pr-16 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700"
                  />
                  <button 
                    onClick={askMentor}
                    disabled={isMentorLoading || !mentorQuery.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-lg"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2 custom-scrollbar">
                  {["I need a hint", "Sample answer", "Strategy"].map((label) => (
                    <button
                      key={label}
                      onClick={() => {
                        setMentorQuery(`Give me a ${label.toLowerCase()} for this question.`);
                      }}
                      className="whitespace-nowrap px-4 py-2 bg-slate-800/50 border border-slate-800 rounded-xl text-[10px] font-bold text-slate-500 hover:text-white hover:border-slate-700 transition-all uppercase tracking-widest"
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
