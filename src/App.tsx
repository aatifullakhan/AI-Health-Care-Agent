import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Stethoscope, 
  Mic, 
  FileText, 
  BarChart3, 
  LogOut, 
  User,
  History,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Pause,
  Play,
  Check,
  Settings,
  Sun,
  Moon,
  Search,
  Bell,
  FileSpreadsheet,
  Trash2,
  TrendingUp,
  Activity,
  Headphones,
  Volume2,
  MicOff,
  Calendar,
  Clock,
  Plus,
  UserPlus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { GoogleGenAI, Modality } from "@google/genai";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line
} from "recharts";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock Auth
const MOCK_USER = { id: "doctor", password: "1234" };

export default function App() {
  const [user, setUser] = useState<string | null>(localStorage.getItem("doctor_id"));
  const [currentPage, setCurrentPage] = useState<"consultation" | "analytics" | "history" | "settings" | "assistant" | "book" | "schedule" | "patients" | "prescriptions">("consultation");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [isPatientMode, setIsPatientMode] = useState(false);
  const [notifications, setNotifications] = useState<{ id: number, message: string, type: "success" | "error" }[]>([]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  const addNotification = (message: string, type: "success" | "error" = "success") => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  if (isPatientMode) {
    return (
      <div className={cn("min-h-screen transition-colors duration-300", darkMode ? "bg-slate-950 text-slate-50" : "bg-[#F8FAFC] text-slate-900")}>
        <div className="max-w-4xl mx-auto p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20">
                <Stethoscope size={24} />
              </div>
              <h1 className="font-bold text-xl tracking-tight">MediScribe Patient Portal</h1>
            </div>
            <button 
              onClick={() => setIsPatientMode(false)}
              className="text-emerald-500 font-semibold hover:underline"
            >
              Doctor Login
            </button>
          </div>
          <BookAppointmentPage darkMode={darkMode} onNotify={addNotification} onBack={() => setIsPatientMode(false)} />
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage 
      onLogin={(id) => {
        localStorage.setItem("doctor_id", id);
        setUser(id);
        addNotification("Welcome back, Dr. " + id);
      }} 
      onPatientMode={() => setIsPatientMode(true)}
    />;
  }

  return (
    <div className={cn("flex h-screen transition-colors duration-300", darkMode ? "bg-slate-950 text-slate-50" : "bg-[#F8FAFC] text-slate-900")}>
      {/* Sidebar */}
      <aside className={cn("w-64 border-r flex flex-col transition-colors duration-300", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
        <div className={cn("p-6 flex items-center gap-3 border-b transition-colors duration-300", darkMode ? "border-slate-800" : "border-slate-100")}>
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20">
            <Stethoscope size={24} />
          </div>
          <h1 className="font-bold text-xl tracking-tight">MediScribe</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem 
            icon={<Mic size={20} />} 
            label="Consultation" 
            active={currentPage === "consultation"} 
            onClick={() => setCurrentPage("consultation")} 
            darkMode={darkMode}
          />
          <NavItem 
            icon={<Headphones size={20} />} 
            label="Voice Assistant" 
            active={currentPage === "assistant"} 
            onClick={() => setCurrentPage("assistant")} 
            darkMode={darkMode}
          />
          <NavItem 
            icon={<Calendar size={20} />} 
            label="Doctor Schedule" 
            active={currentPage === "schedule"} 
            onClick={() => setCurrentPage("schedule")} 
            darkMode={darkMode}
          />
          <NavItem 
            icon={<UserPlus size={20} />} 
            label="Book Appointment" 
            active={currentPage === "book"} 
            onClick={() => setCurrentPage("book")} 
            darkMode={darkMode}
          />
          <NavItem 
            icon={<User size={20} />} 
            label="Patients (EMR)" 
            active={currentPage === "patients"} 
            onClick={() => setCurrentPage("patients")} 
            darkMode={darkMode}
          />
          <NavItem 
            icon={<FileSpreadsheet size={20} />} 
            label="Prescriptions" 
            active={currentPage === "prescriptions"} 
            onClick={() => setCurrentPage("prescriptions")} 
            darkMode={darkMode}
          />
          <NavItem 
            icon={<History size={20} />} 
            label="History" 
            active={currentPage === "history"} 
            onClick={() => setCurrentPage("history")} 
            darkMode={darkMode}
          />
          <NavItem 
            icon={<BarChart3 size={20} />} 
            label="Analytics" 
            active={currentPage === "analytics"} 
            onClick={() => setCurrentPage("analytics")} 
            darkMode={darkMode}
          />
          <NavItem 
            icon={<Settings size={20} />} 
            label="Settings" 
            active={currentPage === "settings"} 
            onClick={() => setCurrentPage("settings")} 
            darkMode={darkMode}
          />
        </nav>

        <div className={cn("p-4 border-t transition-colors duration-300", darkMode ? "border-slate-800" : "border-slate-100")}>
          <button 
            onClick={() => {
              localStorage.removeItem("doctor_id");
              setUser(null);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
              darkMode ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className={cn("text-2xl font-bold transition-colors duration-300", darkMode ? "text-slate-100" : "text-slate-800")}>
              {currentPage === "consultation" && "New Consultation"}
              {currentPage === "assistant" && "Voice AI Assistant"}
              {currentPage === "schedule" && "Doctor Schedule"}
              {currentPage === "book" && "Book Appointment"}
              {currentPage === "history" && "Consultation History"}
              {currentPage === "patients" && "Patient EMR Records"}
              {currentPage === "prescriptions" && "Prescription Management"}
              {currentPage === "analytics" && "Patient Analytics"}
              {currentPage === "settings" && "System Settings"}
            </h2>
            <p className="text-slate-500">Welcome back, Dr. {user}</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={cn(
                "p-2 rounded-xl border transition-all duration-300",
                darkMode ? "bg-slate-800 border-slate-700 text-amber-400" : "bg-white border-slate-200 text-slate-600 shadow-sm"
              )}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className={cn("flex items-center gap-3 p-2 rounded-2xl border transition-all duration-300", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm")}>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", darkMode ? "bg-slate-800" : "bg-slate-100")}>
                <User size={16} className={darkMode ? "text-slate-400" : "text-slate-600"} />
              </div>
              <span className="font-medium text-sm pr-2">Dr. {user}</span>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentPage === "consultation" && <ConsultationPage darkMode={darkMode} onNotify={addNotification} />}
            {currentPage === "assistant" && <VoiceAssistantPage darkMode={darkMode} onNotify={addNotification} />}
            {currentPage === "schedule" && <DoctorSchedulePage darkMode={darkMode} onNotify={addNotification} />}
            {currentPage === "book" && <BookAppointmentPage darkMode={darkMode} onNotify={addNotification} />}
            {currentPage === "history" && <HistoryPage darkMode={darkMode} onNotify={addNotification} />}
            {currentPage === "patients" && <PatientsPage darkMode={darkMode} onNotify={addNotification} />}
            {currentPage === "prescriptions" && <PrescriptionsPage darkMode={darkMode} onNotify={addNotification} />}
            {currentPage === "analytics" && <AnalyticsPage darkMode={darkMode} />}
            {currentPage === "settings" && <SettingsPage darkMode={darkMode} setDarkMode={setDarkMode} />}
          </motion.div>
        </AnimatePresence>

        {/* Notifications */}
        <div className="fixed bottom-8 right-8 z-50 space-y-4">
          <AnimatePresence>
            {notifications.map((n) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                className={cn(
                  "px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border min-w-[300px]",
                  n.type === "success" 
                    ? (darkMode ? "bg-emerald-900/90 border-emerald-800 text-emerald-100" : "bg-white border-emerald-100 text-emerald-800")
                    : (darkMode ? "bg-red-900/90 border-red-800 text-red-100" : "bg-white border-red-100 text-red-800")
                )}
              >
                {n.type === "success" ? <CheckCircle2 className="text-emerald-500" /> : <AlertCircle className="text-red-500" />}
                <span className="font-medium">{n.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>
      <AIChatbot darkMode={darkMode} />
    </div>
  );
}

function NavItem({ icon, label, active, onClick, darkMode }: { icon: any, label: string, active: boolean, onClick: () => void, darkMode: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
        active 
          ? (darkMode ? "bg-emerald-900/30 text-emerald-400 font-semibold shadow-sm" : "bg-emerald-50 text-emerald-600 font-semibold shadow-sm")
          : (darkMode ? "text-slate-400 hover:bg-slate-800 font-medium" : "text-slate-500 hover:bg-slate-50 font-medium")
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function LoginPage({ onLogin, onPatientMode }: { onLogin: (id: string) => void, onPatientMode: () => void }) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id === MOCK_USER.id && password === MOCK_USER.password) {
      onLogin(id);
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 mb-4">
            <Stethoscope size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">MediScribe AI 2.0</h1>
          <p className="text-slate-500 dark:text-slate-400">Clinical Documentation Assistant</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Doctor ID</label>
            <input 
              type="text" 
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter your ID"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          <button 
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 transition-all active:scale-95"
          >
            Login to Dashboard
          </button>
        </form>
        <div className="mt-6 text-center text-xs text-slate-400">
          <p>Demo Credentials: doctor / 1234</p>
        </div>
      </motion.div>

      <button 
        onClick={onPatientMode}
        className="flex items-center gap-2 text-emerald-500 font-semibold hover:underline mt-6"
      >
        <UserPlus size={20} />
        Patient? Book an Appointment
      </button>
    </div>
  );
}

function ConsultationPage({ darkMode, onNotify }: { darkMode: boolean, onNotify: (m: string, t?: "success" | "error") => void }) {
  const [patientName, setPatientName] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [selectedMedicines, setSelectedMedicines] = useState<string[]>([]);
  const [dosage, setDosage] = useState("");
  const [isGeneratingPrescription, setIsGeneratingPrescription] = useState(false);
  
  // Real-time transcription states
  const [liveTranscript, setLiveTranscript] = useState("");
  const [previewData, setPreviewData] = useState<{ symptoms: string[], medicines: string[] }>({ symptoms: [], medicines: [] });
  const [isUpdatingPreview, setIsUpdatingPreview] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Standard recording for backend processing
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        setAudioChunks(chunks);
      };
      recorder.start();
      setMediaRecorder(recorder);

      // Real-time transcription setup
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const session = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
        },
        callbacks: {
          onmessage: (message: any) => {
            // Handle user input transcription (real-time feedback)
            const transcription = message.inputAudioTranscription?.text;
            if (transcription) {
              setLiveTranscript(prev => prev + " " + transcription);
            }
          },
          onerror: (err) => console.error("Live API Error:", err),
        }
      });
      sessionRef.current = session;

      // Audio processing for Live API (PCM 16kHz)
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isPaused) return;
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert to 16-bit PCM
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        session.sendRealtimeInput({
          media: { data: base64Data, mimeType: "audio/pcm;rate=16000" }
        });
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      setIsRecording(true);
      setIsPaused(false);
      setReport(null);
      setLiveTranscript("");
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const togglePause = () => {
    if (isRecording) {
      setIsPaused(!isPaused);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      // Cleanup real-time resources
      if (sessionRef.current) {
        sessionRef.current.close();
        sessionRef.current = null;
      }
      if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const finalizeTranscription = () => {
    // This allows the doctor to edit or confirm the live transcript before report generation
    // For now, we'll just keep it in state
  };

  // Debounced preview update
  useEffect(() => {
    if (!liveTranscript || !isRecording || isPaused) return;

    const timer = setTimeout(async () => {
      if (liveTranscript.length < 50) return;
      
      setIsUpdatingPreview(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Analyze this partial medical consultation transcript and extract symptoms and suggested medicines. 
          Return ONLY a JSON object with "symptoms" (array of strings) and "medicines" (array of strings).
          Transcript: ${liveTranscript.slice(-1000)}`, // Send last 1000 chars for context
          config: {
            responseMimeType: "application/json",
          }
        });
        
        const data = JSON.parse(response.text || "{}");
        if (data.symptoms || data.medicines) {
          setPreviewData({
            symptoms: Array.from(new Set([...previewData.symptoms, ...(data.symptoms || [])])),
            medicines: Array.from(new Set([...previewData.medicines, ...(data.medicines || [])]))
          });
        }
      } catch (e) {
        console.error("Preview update error:", e);
      } finally {
        setIsUpdatingPreview(false);
      }
    }, 5000); // Update every 5 seconds of silence/activity

    return () => clearTimeout(timer);
  }, [liveTranscript, isRecording, isPaused]);

  const processAudio = async () => {
    if (audioChunks.length === 0) return;

    setIsProcessing(true);
    const blob = new Blob(audioChunks, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", blob, "consultation.webm");
    formData.append("patientName", patientName);
    // Optionally send the live transcript to help the AI
    formData.append("hint_transcript", liveTranscript);

    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setReport(data);
      setSelectedMedicines(data.medicines || []);
      onNotify("Medical report generated successfully!");
    } catch (err) {
      console.error("Error processing audio:", err);
      onNotify("Failed to generate report", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPDF = () => {
    if (!report) return;
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text("Medical Consultation Report", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleString()}`, 20, 30);
    
    doc.setFontSize(16);
    doc.text("Transcription", 20, 45);
    doc.setFontSize(10);
    const splitTranscription = doc.splitTextToSize(report.transcription, 170);
    doc.text(splitTranscription, 20, 55);
    
    let y = 55 + (splitTranscription.length * 5) + 10;
    
    doc.setFontSize(16);
    doc.text("Symptoms", 20, y);
    doc.setFontSize(10);
    doc.text(report.symptoms.join(", "), 20, y + 10);
    
    y += 25;
    doc.setFontSize(16);
    doc.text("Diagnosis", 20, y);
    doc.setFontSize(10);
    doc.text(report.diagnosis, 20, y + 10);
    
    y += 25;
    doc.setFontSize(16);
    doc.text("Recommended Medicines", 20, y);
    doc.setFontSize(10);
    doc.text(report.medicines.join(", "), 20, y + 10);
    
    if (report.soap) {
      y += 25;
      doc.setFontSize(16);
      doc.text("SOAP Notes", 20, y);
      doc.setFontSize(10);
      doc.text(`Subjective: ${report.soap.subjective}`, 20, y + 10);
      doc.text(`Objective: ${report.soap.objective}`, 20, y + 20);
      doc.text(`Assessment: ${report.soap.assessment}`, 20, y + 30);
      doc.text(`Plan: ${report.soap.plan}`, 20, y + 40);
    }
    
    doc.save(`report_${report.id}.pdf`);
  };

  const generatePrescription = async () => {
    if (!report || selectedMedicines.length === 0) {
      onNotify("Please select at least one medicine", "error");
      return;
    }

    setIsGeneratingPrescription(true);
    try {
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_name: patientName || "Unknown Patient",
          symptoms: report.symptoms.join(", "),
          diagnosis: report.diagnosis,
          medicines: selectedMedicines,
          dosage: dosage,
          doctor_name: "doctor" // Mock doctor name
        })
      });

      if (res.ok) {
        const data = await res.json();
        onNotify("Prescription generated successfully!");
        
        // Download PDF
        const doc = new jsPDF();
        doc.setFillColor(16, 185, 129);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text("MEDICAL PRESCRIPTION", 105, 25, { align: "center" });
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text(`Patient Name: ${patientName || "Unknown Patient"}`, 20, 60);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 60);
        doc.text(`Doctor: Dr. doctor`, 20, 70);
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 75, 190, 75);
        doc.setFont("helvetica", "bold");
        doc.text("Symptoms:", 20, 85);
        doc.setFont("helvetica", "normal");
        doc.text(report.symptoms.join(", "), 20, 92);
        doc.setFont("helvetica", "bold");
        doc.text("Diagnosis:", 20, 105);
        doc.setFont("helvetica", "normal");
        doc.text(report.diagnosis, 20, 112);
        doc.setFont("helvetica", "bold");
        doc.text("Prescribed Medicines:", 20, 130);
        let y = 140;
        selectedMedicines.forEach((m, i) => {
          doc.text(`${i + 1}. ${m}`, 25, y);
          y += 10;
        });
        doc.setFont("helvetica", "bold");
        doc.text("Dosage Instructions:", 20, y + 10);
        doc.setFont("helvetica", "normal");
        doc.text(dosage || "As directed by physician", 20, y + 17);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("Generated by MediScribe AI Healthcare Assistant", 105, 280, { align: "center" });
        doc.save(`Prescription_${patientName}_${data.id}.pdf`);
      }
    } catch (error) {
      onNotify("Failed to generate prescription", "error");
    } finally {
      setIsGeneratingPrescription(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Recording Section */}
      <div className="space-y-6">
        <div className={cn("p-8 rounded-3xl border transition-all duration-300", darkMode ? "bg-slate-900 border-slate-800 shadow-xl shadow-black/20" : "bg-white border-slate-200 shadow-sm")}>
          <div className="mb-8">
            <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", darkMode ? "text-slate-500" : "text-slate-400")}>Patient Name</label>
            <input 
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter patient name..."
              className={cn(
                "w-full px-4 py-3 rounded-xl border outline-none transition-all",
                darkMode 
                  ? "bg-slate-800 border-slate-700 text-slate-100 focus:ring-2 focus:ring-emerald-500/50" 
                  : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
              )}
            />
          </div>

          <div className="flex flex-col items-center text-center">
            <div className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-500 relative",
              isRecording 
                ? (isPaused ? "bg-amber-500 shadow-lg shadow-amber-200 dark:shadow-amber-900/20" : "bg-red-500 animate-pulse shadow-lg shadow-red-200 dark:shadow-red-900/20") 
                : (darkMode ? "bg-emerald-900/30 text-emerald-400" : "bg-emerald-100 text-emerald-600")
            )}>
              <Mic size={40} className={isRecording ? "text-white" : ""} />
              {isPaused && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                  <Pause size={32} className="text-white" />
                </div>
              )}
            </div>
            <h3 className={cn("text-xl font-bold mb-2", darkMode ? "text-slate-100" : "text-slate-800")}>
              {isRecording ? (isPaused ? "Recording paused" : "Listening to consultation...") : "Ready to record"}
            </h3>
            <p className={cn("mb-8 max-w-xs", darkMode ? "text-slate-400" : "text-slate-500")}>
              Start recording the patient consultation. See the transcription in real-time below.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              {!isRecording ? (
                <>
                  <button 
                    onClick={startRecording}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 transition-all flex items-center gap-2"
                  >
                    <Mic size={20} />
                    Start Recording
                  </button>
                  <label className={cn(
                    "border font-bold px-8 py-3 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer",
                    darkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700" : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                  )}>
                    <Download size={20} className="rotate-180" />
                    Upload Audio
                    <input 
                      type="file" 
                      accept="audio/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setAudioUrl(URL.createObjectURL(file));
                          setAudioChunks([file]);
                          setReport(null);
                          setLiveTranscript("");
                        }
                      }}
                    />
                  </label>
                </>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={togglePause}
                    className={cn(
                      "font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg",
                      isPaused 
                        ? "bg-emerald-500 text-white shadow-emerald-200 dark:shadow-emerald-900/20" 
                        : "bg-amber-500 text-white shadow-amber-200 dark:shadow-amber-900/20"
                    )}
                  >
                    {isPaused ? <Play size={20} /> : <Pause size={20} />}
                    {isPaused ? "Resume" : "Pause"}
                  </button>
                  <button 
                    onClick={stopRecording}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-red-200 dark:shadow-red-900/20 transition-all flex items-center gap-2"
                  >
                    <Check size={20} />
                    Finalize
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Real-time Transcription Display */}
          {(isRecording || liveTranscript) && (
            <div className="mt-8 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className={cn("text-xs font-bold uppercase tracking-widest", darkMode ? "text-slate-500" : "text-slate-400")}>Live Transcription</h4>
                {isRecording && !isPaused && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Live</span>
                  </div>
                )}
              </div>
              <div className={cn(
                "border rounded-2xl p-4 min-h-[120px] max-h-[200px] overflow-y-auto transition-all",
                darkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"
              )}>
                {liveTranscript ? (
                  <p className={cn("text-sm leading-relaxed", darkMode ? "text-slate-300" : "text-slate-700")}>
                    {liveTranscript}
                    {isRecording && !isPaused && <span className="inline-block w-1.5 h-4 bg-emerald-500 ml-1 animate-pulse align-middle" />}
                  </p>
                ) : (
                  <p className="text-slate-400 text-sm italic">Waiting for speech...</p>
                )}
              </div>
            </div>
          )}

          {audioUrl && !isRecording && (
            <div className={cn("mt-8 p-6 rounded-2xl border transition-all", darkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200")}>
              <audio src={audioUrl} controls className="w-full mb-4" />
              <button 
                onClick={processAudio}
                disabled={isProcessing}
                className={cn(
                  "w-full font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50",
                  darkMode ? "bg-slate-100 hover:bg-white text-slate-900" : "bg-slate-800 hover:bg-slate-900 text-white"
                )}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <FileText size={20} />
                    Generate Medical Report
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Report Section */}
      <div className="space-y-6">
        {report ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn("p-8 rounded-3xl border transition-all duration-300 h-full", darkMode ? "bg-slate-900 border-slate-800 shadow-xl shadow-black/20" : "bg-white border-slate-200 shadow-sm")}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded-full text-sm font-bold">
                <CheckCircle2 size={16} />
                Report Generated
              </div>
              <button 
                onClick={downloadPDF}
                className={cn("transition-colors flex items-center gap-2 text-sm font-semibold", darkMode ? "text-slate-400 hover:text-emerald-400" : "text-slate-500 hover:text-emerald-600")}
              >
                <Download size={18} />
                Download PDF
              </button>
            </div>

            <div className="space-y-8">
              <section>
                <h4 className={cn("text-xs font-bold uppercase tracking-widest mb-3", darkMode ? "text-slate-500" : "text-slate-400")}>Transcription</h4>
                <p className={cn("leading-relaxed italic p-4 rounded-2xl border transition-all", darkMode ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-50 border-slate-100 text-slate-700")}>
                  "{report.transcription}"
                </p>
              </section>

              <div className="grid grid-cols-1 gap-6">
                <section>
                  <h4 className={cn("text-xs font-bold uppercase tracking-widest mb-3", darkMode ? "text-slate-500" : "text-slate-400")}>Symptoms</h4>
                  <div className="flex flex-wrap gap-2">
                    {report.symptoms.map((s: string, i: number) => (
                      <span key={i} className={cn("px-3 py-1 rounded-lg text-sm font-medium border transition-all", darkMode ? "bg-blue-900/30 text-blue-400 border-blue-800" : "bg-blue-50 text-blue-600 border-blue-100")}>
                        {s}
                      </span>
                    ))}
                  </div>
                </section>
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={cn("text-xs font-bold uppercase tracking-widest", darkMode ? "text-slate-500" : "text-slate-400")}>Medicines</h4>
                    <span className="text-[10px] font-bold text-amber-500 uppercase">Select to Prescribe</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {report.medicines.map((m: string, i: number) => (
                      <button 
                        key={i} 
                        onClick={() => {
                          if (selectedMedicines.includes(m)) {
                            setSelectedMedicines(selectedMedicines.filter(item => item !== m));
                          } else {
                            setSelectedMedicines([...selectedMedicines, m]);
                          }
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-sm font-medium border transition-all flex items-center gap-2",
                          selectedMedicines.includes(m)
                            ? "bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-200 dark:shadow-emerald-900/20"
                            : (darkMode ? "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300")
                        )}
                      >
                        {selectedMedicines.includes(m) ? <Check size={14} /> : <Plus size={14} />}
                        {m}
                      </button>
                    ))}
                    <div className="flex items-center gap-2">
                      <input 
                        type="text"
                        placeholder="Add manual..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val && !selectedMedicines.includes(val)) {
                              setSelectedMedicines([...selectedMedicines, val]);
                              (e.target as HTMLInputElement).value = "";
                            }
                          }
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-sm border outline-none w-32 transition-all",
                          darkMode ? "bg-slate-800 border-slate-700 text-slate-100 focus:border-emerald-500" : "bg-white border-slate-200 focus:border-emerald-500"
                        )}
                      />
                    </div>
                  </div>
                </section>
              </div>

              <section>
                <h4 className={cn("text-xs font-bold uppercase tracking-widest mb-3", darkMode ? "text-slate-500" : "text-slate-400")}>Dosage & Instructions</h4>
                <textarea 
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g., 1-0-1 after meals for 5 days..."
                  rows={2}
                  className={cn(
                    "w-full px-4 py-3 rounded-2xl border outline-none transition-all text-sm",
                    darkMode ? "bg-slate-800 border-slate-700 text-slate-100 focus:border-emerald-500" : "bg-slate-50 border-slate-200 focus:border-emerald-500"
                  )}
                />
              </section>

              <section>
                <h4 className={cn("text-xs font-bold uppercase tracking-widest mb-3", darkMode ? "text-slate-500" : "text-slate-400")}>Diagnosis</h4>
                <div className={cn("p-4 rounded-2xl border font-medium transition-all", darkMode ? "bg-emerald-900/30 text-emerald-400 border-emerald-800" : "bg-emerald-50 text-emerald-800 border-emerald-100")}>
                  {report.diagnosis}
                </div>
              </section>

              <div className="flex gap-4">
                <button 
                  onClick={generatePrescription}
                  disabled={isGeneratingPrescription || selectedMedicines.length === 0}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGeneratingPrescription ? <Loader2 className="animate-spin" /> : <FileSpreadsheet size={20} />}
                  Generate Smart Prescription
                </button>
              </div>

              {report.soap && (
                <section className="space-y-4">
                  <h4 className={cn("text-xs font-bold uppercase tracking-widest", darkMode ? "text-slate-500" : "text-slate-400")}>SOAP Clinical Notes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={cn("p-4 rounded-2xl border transition-all", darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-100")}>
                      <span className={cn("text-[10px] font-bold uppercase block mb-1", darkMode ? "text-slate-500" : "text-slate-400")}>Subjective</span>
                      <p className={cn("text-sm", darkMode ? "text-slate-300" : "text-slate-700")}>{report.soap.subjective}</p>
                    </div>
                    <div className={cn("p-4 rounded-2xl border transition-all", darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-100")}>
                      <span className={cn("text-[10px] font-bold uppercase block mb-1", darkMode ? "text-slate-500" : "text-slate-400")}>Objective</span>
                      <p className={cn("text-sm", darkMode ? "text-slate-300" : "text-slate-700")}>{report.soap.objective}</p>
                    </div>
                    <div className={cn("p-4 rounded-2xl border transition-all", darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-100")}>
                      <span className={cn("text-[10px] font-bold uppercase block mb-1", darkMode ? "text-slate-500" : "text-slate-400")}>Assessment</span>
                      <p className={cn("text-sm", darkMode ? "text-slate-300" : "text-slate-700")}>{report.soap.assessment}</p>
                    </div>
                    <div className={cn("p-4 rounded-2xl border transition-all", darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-100")}>
                      <span className={cn("text-[10px] font-bold uppercase block mb-1", darkMode ? "text-slate-500" : "text-slate-400")}>Plan</span>
                      <p className={cn("text-sm", darkMode ? "text-slate-300" : "text-slate-700")}>{report.soap.plan}</p>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </motion.div>
        ) : isRecording || liveTranscript ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("p-8 rounded-3xl border transition-all duration-300 h-full", darkMode ? "bg-slate-900 border-slate-800 shadow-xl shadow-black/20" : "bg-white border-slate-200 shadow-sm")}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className={cn("text-lg font-bold flex items-center gap-2", darkMode ? "text-slate-100" : "text-slate-800")}>
                <TrendingUp size={20} className="text-emerald-500" />
                Live Insights Preview
              </h3>
              {isUpdatingPreview && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Loader2 size={12} className="animate-spin" />
                  Updating...
                </div>
              )}
            </div>

            <div className="space-y-8">
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h4 className={cn("text-xs font-bold uppercase tracking-widest", darkMode ? "text-slate-500" : "text-slate-400")}>Detected Symptoms</h4>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">Dynamic</span>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[40px]">
                  {previewData.symptoms.length > 0 ? (
                    previewData.symptoms.map((s, i) => (
                      <motion.span 
                        key={i} 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={cn("px-3 py-1.5 rounded-xl text-sm font-medium border transition-all", darkMode ? "bg-blue-900/20 text-blue-400 border-blue-800/50" : "bg-blue-50 text-blue-600 border-blue-100")}
                      >
                        {s}
                      </motion.span>
                    ))
                  ) : (
                    <p className="text-slate-400 text-sm italic">Listening for symptoms...</p>
                  )}
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-3">
                  <h4 className={cn("text-xs font-bold uppercase tracking-widest", darkMode ? "text-slate-500" : "text-slate-400")}>Suggested Medicines</h4>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500">AI Suggestion</span>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[40px]">
                  {previewData.medicines.length > 0 ? (
                    previewData.medicines.map((m, i) => (
                      <motion.span 
                        key={i} 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={cn("px-3 py-1.5 rounded-xl text-sm font-medium border transition-all", darkMode ? "bg-purple-900/20 text-purple-400 border-purple-800/50" : "bg-purple-50 text-purple-600 border-purple-100")}
                      >
                        {m}
                      </motion.span>
                    ))
                  ) : (
                    <p className="text-slate-400 text-sm italic">Suggestions will appear here...</p>
                  )}
                </div>
              </section>

              <div className={cn("p-6 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center", darkMode ? "bg-slate-800/30 border-slate-700" : "bg-slate-50 border-slate-200")}>
                <Activity size={32} className={cn("mb-3 opacity-20", isRecording ? "text-emerald-500 animate-pulse" : "text-slate-400")} />
                <p className={cn("text-sm font-medium", darkMode ? "text-slate-400" : "text-slate-500")}>
                  {isRecording ? "AI is analyzing the conversation in real-time to provide immediate feedback." : "Finalize the consultation to generate the full structured report."}
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className={cn("border-2 border-dashed rounded-3xl h-full flex flex-col items-center justify-center p-12 text-center transition-all", darkMode ? "bg-slate-900/50 border-slate-800 text-slate-600" : "bg-slate-50 border-slate-200 text-slate-400")}>
            <FileText size={48} className="mb-4 opacity-20" />
            <p className="font-medium">The medical report will appear here after processing the consultation.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryPage({ darkMode, onNotify }: { darkMode: boolean, onNotify: (m: string, t?: "success" | "error") => void }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchHistory = () => {
    setLoading(true);
    fetch("/api/consultations")
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const deleteRecord = async (id: number) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      await fetch(`/api/consultations/${id}`, { method: "DELETE" });
      onNotify("Record deleted successfully");
      fetchHistory();
    } catch (err) {
      onNotify("Failed to delete record", "error");
    }
  };

  const exportToCSV = () => {
    const data = history.map(item => ({
      ID: item.id,
      Patient: item.patient_name,
      Date: new Date(item.timestamp).toLocaleString(),
      Diagnosis: item.diagnosis,
      Symptoms: item.symptoms.join(", "),
      Medicines: item.medicines.join(", "),
      Transcription: item.transcription
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Consultations");
    XLSX.writeFile(wb, "medical_records_export.xlsx");
    onNotify("Records exported to Excel successfully");
  };

  const filteredHistory = history.filter(item => 
    (item.patient_name || "Unknown").toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.symptoms.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-emerald-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className={cn("flex-1 p-4 rounded-2xl border flex items-center gap-3 transition-all duration-300", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm")}>
          <Search className={darkMode ? "text-slate-500" : "text-slate-400"} size={20} />
          <input 
            type="text"
            placeholder="Search by patient name, diagnosis, or symptom..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn("flex-1 bg-transparent outline-none text-sm", darkMode ? "text-slate-200" : "text-slate-700")}
          />
        </div>
        <button 
          onClick={exportToCSV}
          className={cn(
            "px-6 py-4 rounded-2xl border font-bold text-sm flex items-center justify-center gap-2 transition-all",
            darkMode ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
          )}
        >
          <FileSpreadsheet size={18} className="text-emerald-500" />
          Export to Excel
        </button>
      </div>

      <div className={cn("rounded-3xl border shadow-sm overflow-hidden transition-all duration-300", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
        <table className="w-full text-left">
          <thead className={cn("border-b transition-all duration-300", darkMode ? "bg-slate-800/50 border-slate-800" : "bg-slate-50 border-slate-200")}>
            <tr>
              <th className={cn("px-6 py-4 text-xs font-bold uppercase tracking-widest", darkMode ? "text-slate-500" : "text-slate-400")}>Patient</th>
              <th className={cn("px-6 py-4 text-xs font-bold uppercase tracking-widest", darkMode ? "text-slate-500" : "text-slate-400")}>Date</th>
              <th className={cn("px-6 py-4 text-xs font-bold uppercase tracking-widest", darkMode ? "text-slate-500" : "text-slate-400")}>Diagnosis</th>
              <th className={cn("px-6 py-4 text-xs font-bold uppercase tracking-widest", darkMode ? "text-slate-500" : "text-slate-400")}>Symptoms</th>
              <th className={cn("px-6 py-4 text-xs font-bold uppercase tracking-widest text-right", darkMode ? "text-slate-500" : "text-slate-400")}>Actions</th>
            </tr>
          </thead>
          <tbody className={cn("divide-y transition-all duration-300", darkMode ? "divide-slate-800" : "divide-slate-100")}>
            {filteredHistory.map((item) => (
              <React.Fragment key={item.id}>
                <tr 
                  className={cn(
                    "transition-colors cursor-pointer",
                    darkMode ? "hover:bg-slate-800/50" : "hover:bg-slate-50",
                    expandedId === item.id && (darkMode ? "bg-slate-800/50" : "bg-slate-50")
                  )}
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                >
                  <td className={cn("px-6 py-4 text-sm font-bold", darkMode ? "text-slate-200" : "text-slate-800")}>
                    {item.patient_name || "Unknown Patient"}
                  </td>
                  <td className={cn("px-6 py-4 text-sm", darkMode ? "text-slate-400" : "text-slate-600")}>
                    {new Date(item.timestamp).toLocaleDateString()}
                  </td>
                  <td className={cn("px-6 py-4 font-semibold", darkMode ? "text-slate-300" : "text-slate-800")}>{item.diagnosis}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {item.symptoms.slice(0, 3).map((s: string, i: number) => (
                        <span key={i} className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase", darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600")}>
                          {s}
                        </span>
                      ))}
                      {item.symptoms.length > 3 && <span className="text-[10px] text-slate-400">+{item.symptoms.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button className="text-emerald-500 font-bold text-xs hover:underline">
                        {expandedId === item.id ? "Hide" : "View"}
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRecord(item.id);
                        }}
                        className="text-red-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedId === item.id && (
                  <tr>
                    <td colSpan={5} className={cn("px-6 py-6 border-t transition-all duration-300", darkMode ? "bg-slate-900/50 border-slate-800" : "bg-slate-50/50 border-slate-200")}>
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                      >
                        <div className="space-y-4">
                          <section>
                            <h4 className={cn("text-[10px] font-bold uppercase tracking-widest mb-2", darkMode ? "text-slate-500" : "text-slate-400")}>Transcription</h4>
                            <p className={cn("text-sm italic p-3 rounded-xl border transition-all", darkMode ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-white border-slate-200 text-slate-600")}>
                              "{item.transcription}"
                            </p>
                          </section>
                          <section>
                            <h4 className={cn("text-[10px] font-bold uppercase tracking-widest mb-2", darkMode ? "text-slate-500" : "text-slate-400")}>Medicines</h4>
                            <div className="flex flex-wrap gap-2">
                              {item.medicines.map((m: string, i: number) => (
                                <span key={i} className={cn("px-3 py-1 rounded-lg text-xs font-medium border transition-all", darkMode ? "bg-emerald-900/30 text-emerald-400 border-emerald-800" : "bg-emerald-50 text-emerald-600 border-emerald-100")}>
                                  {m}
                                </span>
                              ))}
                            </div>
                          </section>
                        </div>
                        <div className="space-y-4">
                          <h4 className={cn("text-[10px] font-bold uppercase tracking-widest mb-2", darkMode ? "text-slate-500" : "text-slate-400")}>SOAP Notes</h4>
                          {item.soap ? (
                            <div className="grid grid-cols-2 gap-3">
                              {Object.entries(item.soap).map(([key, value]: [string, any]) => (
                                <div key={key} className={cn("p-3 rounded-xl border transition-all", darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
                                  <span className={cn("text-[9px] font-bold uppercase block mb-1", darkMode ? "text-slate-500" : "text-slate-400")}>{key}</span>
                                  <p className={cn("text-xs", darkMode ? "text-slate-300" : "text-slate-700")}>{value}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">No SOAP notes available for this record.</p>
                          )}
                        </div>
                      </motion.div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnalyticsPage({ darkMode }: { darkMode: boolean }) {
  const [data, setData] = useState<any>({ symptoms: [], trends: [] });
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchAnalytics = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    
    fetch(`/api/analytics?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, [startDate, endDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const setRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];

  return (
    <div className="space-y-8">
      {/* Date Filters */}
      <div className={cn("p-6 rounded-3xl border transition-all flex flex-col md:flex-row md:items-end gap-6", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm")}>
        <div className="flex-1 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Filter by Date</h3>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setRange(7)}
              className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all", darkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600")}
            >
              Last 7 Days
            </button>
            <button 
              onClick={() => setRange(30)}
              className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all", darkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600")}
            >
              Last 30 Days
            </button>
            <button 
              onClick={() => { setStartDate(""); setEndDate(""); }}
              className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all", darkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600")}
            >
              All Time
            </button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Start Date</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={cn("px-4 py-2 rounded-xl border outline-none transition-all text-sm", darkMode ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-200")}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">End Date</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={cn("px-4 py-2 rounded-xl border outline-none transition-all text-sm", darkMode ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-200")}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-emerald-500" /></div>
      ) : (
        <>
          {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={cn("p-6 rounded-3xl border transition-all", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm")}>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Consultations</p>
              <h4 className={cn("text-2xl font-bold", darkMode ? "text-slate-100" : "text-slate-800")}>
                {data.trends.reduce((acc: number, curr: any) => acc + curr.count, 0)}
              </h4>
            </div>
          </div>
          <p className="text-xs text-slate-500">Across all patient records</p>
        </div>
        <div className={cn("p-6 rounded-3xl border transition-all", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm")}>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Top Symptom</p>
              <h4 className={cn("text-2xl font-bold", darkMode ? "text-slate-100" : "text-slate-800")}>
                {data.symptoms[0]?.name || "N/A"}
              </h4>
            </div>
          </div>
          <p className="text-xs text-slate-500">Most frequently reported</p>
        </div>
        <div className={cn("p-6 rounded-3xl border transition-all", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm")}>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500">
              <User size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Avg. Symptoms</p>
              <h4 className={cn("text-2xl font-bold", darkMode ? "text-slate-100" : "text-slate-800")}>
                2.4
              </h4>
            </div>
          </div>
          <p className="text-xs text-slate-500">Per patient consultation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={cn("p-8 rounded-3xl border transition-all duration-300", darkMode ? "bg-slate-900 border-slate-800 shadow-xl" : "bg-white border-slate-200 shadow-sm")}>
          <h3 className={cn("text-lg font-bold mb-6", darkMode ? "text-slate-100" : "text-slate-800")}>Consultation Trends</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trends}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1E293B" : "#E2E8F0"} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    backgroundColor: darkMode ? '#0F172A' : '#FFFFFF',
                    color: darkMode ? '#F1F5F9' : '#0F172A'
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="#10B981" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cn("p-8 rounded-3xl border transition-all duration-300", darkMode ? "bg-slate-900 border-slate-800 shadow-xl" : "bg-white border-slate-200 shadow-sm")}>
          <h3 className={cn("text-lg font-bold mb-6", darkMode ? "text-slate-100" : "text-slate-800")}>Symptom Frequency</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.symptoms}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1E293B" : "#E2E8F0"} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    backgroundColor: darkMode ? '#0F172A' : '#FFFFFF',
                    color: darkMode ? '#F1F5F9' : '#0F172A'
                  }}
                />
                <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cn("p-8 rounded-3xl border transition-all duration-300", darkMode ? "bg-slate-900 border-slate-800 shadow-xl" : "bg-white border-slate-200 shadow-sm")}>
          <h3 className={cn("text-lg font-bold mb-6", darkMode ? "text-slate-100" : "text-slate-800")}>Symptom Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.symptoms}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.symptoms.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    backgroundColor: darkMode ? '#0F172A' : '#FFFFFF',
                    color: darkMode ? '#F1F5F9' : '#0F172A'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cn("p-8 rounded-3xl border transition-all duration-300", darkMode ? "bg-slate-900 border-slate-800 shadow-xl" : "bg-white border-slate-200 shadow-sm")}>
          <h3 className={cn("text-lg font-bold mb-6", darkMode ? "text-slate-100" : "text-slate-800")}>Diagnosis Probability</h3>
          <div className="space-y-4">
            {data.symptoms.slice(0, 5).map((s: any, i: number) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span className={darkMode ? "text-slate-400" : "text-slate-500"}>{s.name}</span>
                  <span className="text-emerald-500">{Math.round((s.value / data.trends.reduce((acc: number, curr: any) => acc + curr.count, 0)) * 100)}%</span>
                </div>
                <div className={cn("h-2 rounded-full overflow-hidden", darkMode ? "bg-slate-800" : "bg-slate-100")}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.value / data.trends.reduce((acc: number, curr: any) => acc + curr.count, 0)) * 100}%` }}
                    className="h-full bg-emerald-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )}
</div>
);
}

function SettingsPage({ darkMode, setDarkMode }: { darkMode: boolean, setDarkMode: (d: boolean) => void }) {
  return (
    <div className="max-w-4xl space-y-8">
      <div className={cn("p-8 rounded-3xl border transition-all duration-300", darkMode ? "bg-slate-900 border-slate-800 shadow-xl" : "bg-white border-slate-200 shadow-sm")}>
        <h3 className={cn("text-lg font-bold mb-6", darkMode ? "text-slate-100" : "text-slate-800")}>Appearance</h3>
        <p className="text-sm text-slate-500 mb-6">Customize how MediScribe looks on your device.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => setDarkMode(false)}
            className={cn(
              "flex flex-col items-center gap-4 p-6 rounded-2xl border transition-all text-left",
              !darkMode 
                ? "bg-emerald-50 border-emerald-200 ring-2 ring-emerald-500/20" 
                : "bg-slate-800/50 border-slate-700 hover:bg-slate-800"
            )}
          >
            <div className={cn(
              "w-full aspect-video rounded-lg border flex items-center justify-center bg-white mb-2",
              !darkMode ? "border-emerald-200 shadow-sm" : "border-slate-700"
            )}>
              <Sun className="text-amber-500" size={32} />
            </div>
            <div className="w-full flex items-center justify-between">
              <span className={cn("font-bold", darkMode ? "text-slate-300" : "text-slate-900")}>Light Mode</span>
              {!darkMode && <CheckCircle2 className="text-emerald-500" size={20} />}
            </div>
          </button>

          <button 
            onClick={() => setDarkMode(true)}
            className={cn(
              "flex flex-col items-center gap-4 p-6 rounded-2xl border transition-all text-left",
              darkMode 
                ? "bg-emerald-900/20 border-emerald-800 ring-2 ring-emerald-500/20" 
                : "bg-slate-50 border-slate-200 hover:bg-slate-100"
            )}
          >
            <div className={cn(
              "w-full aspect-video rounded-lg border flex items-center justify-center bg-slate-900 mb-2",
              darkMode ? "border-emerald-800 shadow-sm" : "border-slate-200"
            )}>
              <Moon className="text-indigo-400" size={32} />
            </div>
            <div className="w-full flex items-center justify-between">
              <span className={cn("font-bold", darkMode ? "text-slate-100" : "text-slate-700")}>Dark Mode</span>
              {darkMode && <CheckCircle2 className="text-emerald-500" size={20} />}
            </div>
          </button>
        </div>
      </div>

      <div className={cn("p-8 rounded-3xl border transition-all duration-300", darkMode ? "bg-slate-900 border-slate-800 shadow-xl" : "bg-white border-slate-200 shadow-sm")}>
        <h3 className={cn("text-lg font-bold mb-6", darkMode ? "text-slate-100" : "text-slate-800")}>Report Customization</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className={cn("text-sm font-medium", darkMode ? "text-slate-300" : "text-slate-600")}>Include SOAP Notes in PDF</p>
            <input type="checkbox" defaultChecked className="w-5 h-5 accent-emerald-500" />
          </div>
          <div className="flex items-center justify-between">
            <p className={cn("text-sm font-medium", darkMode ? "text-slate-300" : "text-slate-600")}>Include Transcription in PDF</p>
            <input type="checkbox" defaultChecked className="w-5 h-5 accent-emerald-500" />
          </div>
          <div className="flex items-center justify-between">
            <p className={cn("text-sm font-medium", darkMode ? "text-slate-300" : "text-slate-600")}>Auto-save consultations</p>
            <input type="checkbox" defaultChecked className="w-5 h-5 accent-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

function VoiceAssistantPage({ darkMode, onNotify }: { darkMode: boolean, onNotify: (m: string, t?: "success" | "error") => void }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueue = useRef<Int16Array[]>([]);
  const isPlaying = useRef(false);
  const nextStartTime = useRef(0);

  const connectAssistant = async () => {
    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      
      const session = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are a helpful and professional healthcare assistant. You can assist doctors with medical queries, patient information, or help patients understand their symptoms and general health advice. Always maintain a professional, empathetic, and clinical tone. If asked for specific medical advice that requires a doctor's intervention, advise the user to consult their physician.",
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            onNotify("Voice Assistant Connected");
            startMic();
          },
          onmessage: async (message: any) => {
            // Handle Audio Output
            if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
              const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
              const binaryString = atob(base64Audio);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const pcmData = new Int16Array(bytes.buffer);
              audioQueue.current.push(pcmData);
              if (!isPlaying.current) {
                playNextChunk();
              }
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
              audioQueue.current = [];
              isPlaying.current = false;
            }

            const userTranscription = message.inputAudioTranscription?.text;
            if (userTranscription) {
              setTranscript(prev => [...prev, { role: 'user', text: userTranscription }]);
            }

            const modelTranscription = message.outputAudioTranscription?.text;
            if (modelTranscription) {
              setTranscript(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'model') {
                  return [...prev.slice(0, -1), { role: 'model', text: last.text + modelTranscription }];
                }
                return [...prev, { role: 'model', text: modelTranscription }];
              });
            }
          },
          onclose: () => {
            setIsConnected(false);
            onNotify("Voice Assistant Disconnected", "error");
            stopMic();
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setIsConnecting(false);
            onNotify("Connection Error", "error");
          }
        }
      });
      sessionRef.current = session;
    } catch (err) {
      console.error("Failed to connect:", err);
      setIsConnecting(false);
    }
  };

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        sessionRef.current?.sendRealtimeInput({
          media: { data: base64Data, mimeType: "audio/pcm;rate=16000" }
        });
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
    } catch (err) {
      console.error("Mic error:", err);
    }
  };

  const stopMic = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const playNextChunk = () => {
    if (audioQueue.current.length === 0 || !audioContextRef.current) {
      isPlaying.current = false;
      return;
    }

    isPlaying.current = true;
    const pcmData = audioQueue.current.shift()!;
    const audioBuffer = audioContextRef.current.createBuffer(1, pcmData.length, 24000); // Live API output is 24kHz
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < pcmData.length; i++) {
      channelData[i] = pcmData[i] / 0x7FFF;
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    
    const startTime = Math.max(audioContextRef.current.currentTime, nextStartTime.current);
    source.start(startTime);
    nextStartTime.current = startTime + audioBuffer.duration;
    
    source.onended = () => {
      playNextChunk();
    };
  };

  const disconnectAssistant = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    stopMic();
    setIsConnected(false);
  };

  useEffect(() => {
    return () => {
      disconnectAssistant();
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className={cn("p-12 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden", darkMode ? "bg-slate-900 border-slate-800 shadow-2xl" : "bg-white border-slate-200 shadow-xl shadow-slate-200/50")}>
        {/* Background Glow */}
        <div className={cn("absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] opacity-20 transition-colors", isConnected ? "bg-emerald-500" : "bg-blue-500")} />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className={cn(
            "w-32 h-32 rounded-full flex items-center justify-center mb-8 transition-all duration-700 relative",
            isConnected 
              ? "bg-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.4)]" 
              : (darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-400")
          )}>
            {isConnected ? (
              <div className="flex items-center gap-1">
                <motion.div animate={{ height: [10, 30, 10] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1.5 bg-white rounded-full" />
                <motion.div animate={{ height: [20, 45, 20] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }} className="w-1.5 bg-white rounded-full" />
                <motion.div animate={{ height: [15, 35, 15] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }} className="w-1.5 bg-white rounded-full" />
                <motion.div animate={{ height: [25, 50, 25] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.3 }} className="w-1.5 bg-white rounded-full" />
                <motion.div animate={{ height: [10, 30, 10] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.4 }} className="w-1.5 bg-white rounded-full" />
              </div>
            ) : (
              <Headphones size={48} />
            )}
            
            {isConnecting && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 size={64} className="text-emerald-500 animate-spin opacity-50" />
              </div>
            )}
          </div>

          <h3 className={cn("text-3xl font-bold mb-4 tracking-tight", darkMode ? "text-slate-100" : "text-slate-800")}>
            {isConnected ? "Assistant is Listening..." : "Healthcare Voice Assistant"}
          </h3>
          <p className={cn("text-lg mb-10 max-w-md leading-relaxed", darkMode ? "text-slate-400" : "text-slate-500")}>
            {isConnected 
              ? "You can talk naturally. Ask about symptoms, medical procedures, or general health advice." 
              : "Experience real-time, low-latency voice interaction for clinical support and patient guidance."}
          </p>

          <div className="flex gap-4">
            {!isConnected ? (
              <button 
                onClick={connectAssistant}
                disabled={isConnecting}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-10 py-4 rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {isConnecting ? <Loader2 className="animate-spin" /> : <Volume2 size={24} />}
                {isConnecting ? "Connecting..." : "Start Conversation"}
              </button>
            ) : (
              <button 
                onClick={disconnectAssistant}
                className="bg-red-500 hover:bg-red-600 text-white font-bold px-10 py-4 rounded-2xl shadow-lg shadow-red-200 dark:shadow-red-900/20 transition-all flex items-center gap-3 active:scale-95"
              >
                <MicOff size={24} />
                End Session
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Transcript */}
      <div className="space-y-4">
        <h4 className={cn("text-xs font-bold uppercase tracking-widest px-2", darkMode ? "text-slate-500" : "text-slate-400")}>Live Conversation Log</h4>
        <div className={cn("p-6 rounded-3xl border min-h-[300px] max-h-[500px] overflow-y-auto space-y-6 transition-all", darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm")}>
          {transcript.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20">
              <Activity size={48} className="mb-4" />
              <p className="font-medium">No conversation history yet.</p>
            </div>
          ) : (
            transcript.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex flex-col max-w-[80%]",
                  msg.role === 'user' ? "ml-auto items-end" : "items-start"
                )}
              >
                <span className={cn("text-[10px] font-bold uppercase mb-1 px-2", darkMode ? "text-slate-500" : "text-slate-400")}>
                  {msg.role === 'user' ? "You" : "MediScribe AI"}
                </span>
                <div className={cn(
                  "px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                  msg.role === 'user' 
                    ? (darkMode ? "bg-emerald-900/40 text-emerald-100 border border-emerald-800/50" : "bg-emerald-500 text-white")
                    : (darkMode ? "bg-slate-800 text-slate-200 border border-slate-700" : "bg-slate-100 text-slate-800")
                )}>
                  {msg.text}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function BookAppointmentPage({ darkMode, onNotify, onBack }: { darkMode: boolean, onNotify: (m: string, t?: "success" | "error") => void, onBack?: () => void }) {
  const [formData, setFormData] = useState({
    patient_name: "",
    age: "",
    phone: "",
    symptoms: "",
    appointment_date: "",
    appointment_time: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        onNotify(data.message);
        setFormData({
          patient_name: "",
          age: "",
          phone: "",
          symptoms: "",
          appointment_date: "",
          appointment_time: ""
        });
        if (onBack) onBack();
      } else {
        onNotify(data.message || data.error, "error");
      }
    } catch (err) {
      onNotify("Failed to book appointment", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className={cn("p-8 rounded-3xl border transition-all duration-300", darkMode ? "bg-slate-900 border-slate-800 shadow-xl" : "bg-white border-slate-200 shadow-sm")}>
        <h3 className={cn("text-2xl font-bold mb-6", darkMode ? "text-slate-100" : "text-slate-800")}>Book an Appointment</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Patient Name</label>
              <input 
                required
                type="text" 
                value={formData.patient_name}
                onChange={(e) => setFormData({...formData, patient_name: e.target.value})}
                className={cn("w-full px-4 py-3 rounded-xl border outline-none transition-all", darkMode ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-200")}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Age</label>
              <input 
                required
                type="number" 
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                className={cn("w-full px-4 py-3 rounded-xl border outline-none transition-all", darkMode ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-200")}
                placeholder="25"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Phone Number</label>
            <input 
              required
              type="tel" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className={cn("w-full px-4 py-3 rounded-xl border outline-none transition-all", darkMode ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-200")}
              placeholder="+1 234 567 890"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Symptoms / Reason for visit</label>
            <textarea 
              required
              value={formData.symptoms}
              onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
              className={cn("w-full px-4 py-3 rounded-xl border outline-none transition-all min-h-[100px]", darkMode ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-200")}
              placeholder="Describe your symptoms..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Preferred Date</label>
              <input 
                required
                type="date" 
                value={formData.appointment_date}
                onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
                className={cn("w-full px-4 py-3 rounded-xl border outline-none transition-all", darkMode ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-200")}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Preferred Time</label>
              <input 
                required
                type="time" 
                value={formData.appointment_time}
                onChange={(e) => setFormData({...formData, appointment_time: e.target.value})}
                className={cn("w-full px-4 py-3 rounded-xl border outline-none transition-all", darkMode ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-200")}
              />
            </div>
          </div>
          <button 
            disabled={isSubmitting}
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? "Booking..." : "Confirm Appointment"}
          </button>
        </form>
      </div>
    </div>
  );
}

function DoctorSchedulePage({ darkMode, onNotify }: { darkMode: boolean, onNotify: (m: string, t?: "success" | "error") => void }) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      onNotify("Failed to fetch appointments", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        onNotify(`Appointment marked as ${status}`);
        fetchAppointments();
      }
    } catch (err) {
      onNotify("Failed to update status", "error");
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments.filter(a => a.appointment_date === today && a.status === 'Scheduled');
  const upcomingAppointments = appointments.filter(a => a.appointment_date > today && a.status === 'Scheduled');
  const completedAppointments = appointments.filter(a => a.status !== 'Scheduled');

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={cn("p-6 rounded-3xl border transition-all", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm")}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Calendar size={20} />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Today</span>
          </div>
          <h4 className="text-2xl font-bold">{todaysAppointments.length}</h4>
          <p className="text-xs text-slate-500">Scheduled for today</p>
        </div>
        <div className={cn("p-6 rounded-3xl border transition-all", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm")}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Clock size={20} />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Upcoming</span>
          </div>
          <h4 className="text-2xl font-bold">{upcomingAppointments.length}</h4>
          <p className="text-xs text-slate-500">Future appointments</p>
        </div>
        <div className={cn("p-6 rounded-3xl border transition-all", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm")}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <Check size={20} />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest text-slate-500">History</span>
          </div>
          <h4 className="text-2xl font-bold">{completedAppointments.length}</h4>
          <p className="text-xs text-slate-500">Completed/Cancelled</p>
        </div>
      </div>

      <div className={cn("p-8 rounded-3xl border transition-all", darkMode ? "bg-slate-900 border-slate-800 shadow-xl" : "bg-white border-slate-200 shadow-sm")}>
        <h3 className="text-xl font-bold mb-6">Appointment Management</h3>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-emerald-500" size={32} />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12 opacity-50">
            <Calendar size={48} className="mx-auto mb-4" />
            <p>No appointments found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={cn("border-b", darkMode ? "border-slate-800" : "border-slate-100")}>
                  <th className="pb-4 font-bold text-sm uppercase tracking-widest text-slate-500">Patient</th>
                  <th className="pb-4 font-bold text-sm uppercase tracking-widest text-slate-500">Date/Time</th>
                  <th className="pb-4 font-bold text-sm uppercase tracking-widest text-slate-500">Symptoms</th>
                  <th className="pb-4 font-bold text-sm uppercase tracking-widest text-slate-500">Status</th>
                  <th className="pb-4 font-bold text-sm uppercase tracking-widest text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {appointments.map((a) => (
                  <tr key={a.appointment_id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4">
                      <div className="font-bold">{a.patient_name}</div>
                      <div className="text-xs text-slate-500">{a.age} yrs • {a.phone}</div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={14} className="text-emerald-500" />
                        {a.appointment_date}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock size={14} />
                        {a.appointment_time}
                      </div>
                    </td>
                    <td className="py-4 max-w-xs">
                      <p className="text-sm truncate">{a.symptoms}</p>
                    </td>
                    <td className="py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        a.status === 'Scheduled' ? "bg-blue-500/10 text-blue-500" :
                        a.status === 'Completed' ? "bg-emerald-500/10 text-emerald-500" :
                        "bg-red-500/10 text-red-500"
                      )}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      {a.status === 'Scheduled' && (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => updateStatus(a.appointment_id, 'Completed')}
                            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
                            title="Mark as Completed"
                          >
                            <Check size={16} />
                          </button>
                          <button 
                            onClick={() => updateStatus(a.appointment_id, 'Cancelled')}
                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
                            title="Cancel Appointment"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function PatientsPage({ darkMode, onNotify }: { darkMode: boolean, onNotify: (m: string, t?: "success" | "error") => void }) {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "", age: "", gender: "Male", blood_group: "O+", phone: "", email: "", address: "", medical_history: ""
  });

  const fetchPatients = () => {
    setLoading(true);
    fetch("/api/patients")
      .then(res => res.json())
      .then(data => {
        setPatients(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPatient)
      });
      if (res.ok) {
        onNotify("Patient record created successfully!");
        setShowAdd(false);
        setNewPatient({ name: "", age: "", gender: "Male", blood_group: "O+", phone: "", email: "", address: "", medical_history: "" });
        fetchPatients();
      }
    } catch (error) {
      onNotify("Failed to create patient record", "error");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className={cn("text-lg font-bold", darkMode ? "text-slate-100" : "text-slate-800")}>Electronic Medical Records</h3>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 hover:bg-emerald-600 transition-all"
        >
          <Plus size={20} />
          Add New Patient
        </button>
      </div>

      {showAdd && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("p-8 rounded-3xl border transition-all", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm")}
        >
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Full Name</label>
              <input 
                required
                value={newPatient.name}
                onChange={e => setNewPatient({...newPatient, name: e.target.value})}
                className={cn("w-full px-4 py-3 rounded-xl border outline-none transition-all", darkMode ? "bg-slate-800 border-slate-700 text-slate-100 focus:border-emerald-500" : "bg-slate-50 border-slate-200 focus:border-emerald-500")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Age</label>
                <input 
                  type="number" required
                  value={newPatient.age}
                  onChange={e => setNewPatient({...newPatient, age: e.target.value})}
                  className={cn("w-full px-4 py-3 rounded-xl border outline-none transition-all", darkMode ? "bg-slate-800 border-slate-700 text-slate-100 focus:border-emerald-500" : "bg-slate-50 border-slate-200 focus:border-emerald-500")}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Gender</label>
                <select 
                  value={newPatient.gender}
                  onChange={e => setNewPatient({...newPatient, gender: e.target.value})}
                  className={cn("w-full px-4 py-3 rounded-xl border outline-none transition-all", darkMode ? "bg-slate-800 border-slate-700 text-slate-100 focus:border-emerald-500" : "bg-slate-50 border-slate-200 focus:border-emerald-500")}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Phone Number</label>
              <input 
                required
                value={newPatient.phone}
                onChange={e => setNewPatient({...newPatient, phone: e.target.value})}
                className={cn("w-full px-4 py-3 rounded-xl border outline-none transition-all", darkMode ? "bg-slate-800 border-slate-700 text-slate-100 focus:border-emerald-500" : "bg-slate-50 border-slate-200 focus:border-emerald-500")}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Blood Group</label>
              <select 
                value={newPatient.blood_group}
                onChange={e => setNewPatient({...newPatient, blood_group: e.target.value})}
                className={cn("w-full px-4 py-3 rounded-xl border outline-none transition-all", darkMode ? "bg-slate-800 border-slate-700 text-slate-100 focus:border-emerald-500" : "bg-slate-50 border-slate-200 focus:border-emerald-500")}
              >
                <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Medical History</label>
              <textarea 
                rows={3}
                value={newPatient.medical_history}
                onChange={e => setNewPatient({...newPatient, medical_history: e.target.value})}
                placeholder="Allergies, chronic conditions, past surgeries..."
                className={cn("w-full px-4 py-3 rounded-xl border outline-none transition-all", darkMode ? "bg-slate-800 border-slate-700 text-slate-100 focus:border-emerald-500" : "bg-slate-50 border-slate-200 focus:border-emerald-500")}
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-4">
              <button 
                type="button"
                onClick={() => setShowAdd(false)}
                className={cn("px-6 py-3 rounded-2xl font-bold transition-all", darkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all"
              >
                Save Patient
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className={cn("rounded-3xl border overflow-hidden transition-all", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm")}>
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>
        ) : patients.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <User size={32} />
            </div>
            <p className="text-slate-500">No patient records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={cn("border-b transition-colors", darkMode ? "border-slate-800 bg-slate-800/50" : "border-slate-100 bg-slate-50")}>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Patient</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Age/Gender</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Blood Group</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Contact</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {patients.map((p) => (
                  <tr key={p.id} className={cn("transition-colors", darkMode ? "hover:bg-slate-800/50" : "hover:bg-slate-50")}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                          {p.name.charAt(0)}
                        </div>
                        <span className="font-bold">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{p.age} / {p.gender}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold">{p.blood_group}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{p.phone}</td>
                    <td className="px-6 py-4">
                      <button className="text-emerald-500 text-sm font-bold hover:underline">View History</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function PrescriptionsPage({ darkMode, onNotify }: { darkMode: boolean, onNotify: (m: string, t?: "success" | "error") => void }) {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/prescriptions")
      .then(res => res.json())
      .then(data => {
        setPrescriptions(data);
        setLoading(false);
      });
  }, []);

  const downloadPDF = (p: any) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("MEDICAL PRESCRIPTION", 105, 25, { align: "center" });
    
    // Content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Patient Name: ${p.patient_name}`, 20, 60);
    doc.text(`Date: ${new Date(p.date).toLocaleDateString()}`, 150, 60);
    doc.text(`Doctor: Dr. ${p.doctor_name}`, 20, 70);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 75, 190, 75);
    
    doc.setFont("helvetica", "bold");
    doc.text("Symptoms:", 20, 85);
    doc.setFont("helvetica", "normal");
    doc.text(p.symptoms, 20, 92);
    
    doc.setFont("helvetica", "bold");
    doc.text("Diagnosis:", 20, 105);
    doc.setFont("helvetica", "normal");
    doc.text(p.diagnosis, 20, 112);
    
    doc.setFont("helvetica", "bold");
    doc.text("Prescribed Medicines:", 20, 130);
    
    let y = 140;
    p.medicines.forEach((m: string, i: number) => {
      doc.text(`${i + 1}. ${m}`, 25, y);
      y += 10;
    });
    
    doc.setFont("helvetica", "bold");
    doc.text("Dosage Instructions:", 20, y + 10);
    doc.setFont("helvetica", "normal");
    doc.text(p.dosage || "As directed by physician", 20, y + 17);
    
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Generated by MediScribe AI Healthcare Assistant", 105, 280, { align: "center" });
    
    doc.save(`Prescription_${p.patient_name}_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className={cn("text-lg font-bold", darkMode ? "text-slate-100" : "text-slate-800")}>Prescription History</h3>
      </div>

      <div className={cn("rounded-3xl border overflow-hidden transition-all", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm")}>
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>
        ) : prescriptions.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <FileSpreadsheet size={32} />
            </div>
            <p className="text-slate-500">No prescriptions generated yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={cn("border-b transition-colors", darkMode ? "border-slate-800 bg-slate-800/50" : "border-slate-100 bg-slate-50")}>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Patient</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Diagnosis</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Medicines</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Date</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {prescriptions.map((p) => (
                  <tr key={p.id} className={cn("transition-colors", darkMode ? "hover:bg-slate-800/50" : "hover:bg-slate-50")}>
                    <td className="px-6 py-4 font-bold">{p.patient_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{p.diagnosis}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {p.medicines.map((m: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
                            {m}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(p.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => downloadPDF(p)}
                        className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
                      >
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function AIChatbot({ darkMode }: { darkMode: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "model", text: string }[]>([
    { role: "model", text: "Hello! I am your AI Medical Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }]
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "model", text: data.text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "model", text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 left-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn("w-80 h-[450px] mb-4 rounded-3xl border flex flex-col overflow-hidden shadow-2xl", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}
          >
            <div className="p-4 bg-emerald-500 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Stethoscope size={20} />
                <span className="font-bold">Medical AI</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-lg">
                <Pause size={16} />
              </button>
            </div>
            
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[80%] p-3 rounded-2xl text-sm", m.role === "user" ? "bg-emerald-500 text-white rounded-tr-none" : darkMode ? "bg-slate-800 text-slate-100 rounded-tl-none" : "bg-slate-100 text-slate-800 rounded-tl-none")}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className={cn("p-3 rounded-2xl bg-slate-100 dark:bg-slate-800")}>
                    <Loader2 size={16} className="animate-spin text-emerald-500" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t dark:border-slate-800 flex gap-2">
              <input 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder="Ask anything..."
                className={cn("flex-1 bg-transparent outline-none text-sm", darkMode ? "text-slate-100" : "text-slate-800")}
              />
              <button onClick={handleSend} className="text-emerald-500 hover:scale-110 transition-transform">
                <Play size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 hover:scale-110 transition-all"
      >
        <Volume2 size={24} />
      </button>
    </div>
  );
}
