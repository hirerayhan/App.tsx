import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext, useReducer } from 'react';
import { 
  UploadCloud, FileAudio, FileVideo, Settings, Activity, History, 
  Trash2, Play, Pause, X, CheckCircle, AlertCircle, Info, 
  Terminal, BarChart2, Zap, Shield, HardDrive, Cpu, 
  ChevronRight, Download, RefreshCw, Moon, Sun, Monitor,
  Music, Layers, Maximize2, MoreVertical
} from 'lucide-react';

/* =========================================================================
   ARCHITECTURE LAYER: TYPES & INTERFACES
   Extensive TypeScript definitions simulating a large-scale SaaS app
========================================================================= */

type Theme = 'dark' | 'light' | 'system';
type FileStatus = 'idle' | 'queued' | 'processing' | 'completed' | 'error';
type LogLevel = 'info' | 'warn' | 'error' | 'success';

interface AppSettings {
  theme: Theme;
  autoDownload: boolean;
  maxConcurrent: number;
  audioBitrate: '128k' | '192k' | '256k' | '320k';
  preserveMetadata: boolean;
  notificationsEnabled: boolean;
  experimentalEngine: boolean;
}

interface ConversionTask {
  id: string;
  file: File;
  originalName: string;
  size: number;
  status: FileStatus;
  progress: number;
  eta: number; // seconds
  speed: number; // bytes per second
  error?: string;
  outputUrl?: string;
  createdAt: number;
  completedAt?: number;
  logs: LogEntry[];
}

interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  taskId?: string;
}

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

/* =========================================================================
   ARCHITECTURE LAYER: UTILITIES & HELPERS
   Core standalone functions for parsing, math, formatting, and validation
========================================================================= */

const Utils = {
  generateId: () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36),
  
  formatBytes: (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024, dm = decimals < 0 ? 0 : decimals, sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  },

  formatTime: (seconds: number) => {
    if (!seconds || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  },

  validateFile: (file: File) => {
    const validTypes = ['video/mp4', 'video/x-m4v', 'video/quicktime'];
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.mp4')) {
      throw new Error(`Invalid file type: ${file.name}. Only MP4 is supported.`);
    }
    if (file.size > maxSize) {
      throw new Error(`File too large: ${file.name}. Max size is 2GB.`);
    }
    return true;
  },

  sleep: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // Simulates a complex FFmpeg WebAssembly processing pipeline
  simulateProcessingEngine: async (
    task: ConversionTask, 
    updateProgress: (id: string, progress: number, speed: number, eta: number, log: LogEntry) => void
  ) => {
    const totalChunks = 100;
    let currentChunk = 0;
    const baseSpeed = task.size / 20; // Assume 20 seconds for full file
    
    updateProgress(task.id, 0, 0, 0, { id: Utils.generateId(), level: 'info', message: `Initialized WebAssembly FFmpeg worker for ${task.originalName}`, timestamp: Date.now() });
    await Utils.sleep(800);
    
    updateProgress(task.id, 0, 0, 0, { id: Utils.generateId(), level: 'info', message: 'Analyzing media streams...', timestamp: Date.now() });
    await Utils.sleep(500);

    const hasAudio = Math.random() > 0.05; // 5% chance of fake no-audio error
    if (!hasAudio) {
      throw new Error("No audio stream found in the video file.");
    }

    updateProgress(task.id, 2, 0, 0, { id: Utils.generateId(), level: 'success', message: 'Found active AAC audio stream. Starting extraction.', timestamp: Date.now() });

    while (currentChunk < totalChunks) {
      // Simulate chunk processing
      const processingTime = Math.random() * 200 + 50; 
      await Utils.sleep(processingTime);
      currentChunk += Math.random() * 5 + 1; // Progress by 1-6%
      if (currentChunk > totalChunks) currentChunk = totalChunks;

      const progress = Math.min(Math.round(currentChunk), 100);
      const simulatedSpeed = baseSpeed * (0.8 + Math.random() * 0.4); // Add variance
      const remainingBytes = task.size * (1 - (progress / 100));
      const eta = remainingBytes / simulatedSpeed;

      const logMsg = progress === 100 
        ? 'Finalizing MP3 muxing...' 
        : `Demuxing packet ${Math.floor(progress * 1000)}/100000... frame rate stable.`;

      updateProgress(task.id, progress, simulatedSpeed, eta, {
        id: Utils.generateId(),
        level: progress === 100 ? 'success' : 'info',
        message: logMsg,
        timestamp: Date.now()
      });

      // 1% chance of random failure during processing to demonstrate error handling
      if (Math.random() < 0.005) {
        throw new Error("Segmentation fault in WebAssembly memory block 0x00FF2A");
      }
    }

    await Utils.sleep(500);
    // Return dummy URL
    return URL.createObjectURL(new Blob(["mock-audio-data"], { type: "audio/mp3" }));
  }
};

/* =========================================================================
   ARCHITECTURE LAYER: MOCK DATA GENERATORS
   For History, Analytics, and simulated user environments
========================================================================= */

const generateMockHistory = (count: number): ConversionTask[] => {
  return Array.from({ length: count }).map((_, i) => {
    const isError = Math.random() > 0.8;
    return {
      id: `mock-${i}`,
      file: new File([""], `project_export_v${i}.mp4`),
      originalName: `project_export_v${i}.mp4`,
      size: Math.floor(Math.random() * 500000000) + 10000000,
      status: isError ? 'error' : 'completed',
      progress: isError ? Math.floor(Math.random() * 80) : 100,
      eta: 0,
      speed: 0,
      error: isError ? 'Codec missing or corrupted headers' : undefined,
      createdAt: Date.now() - Math.floor(Math.random() * 10000000000),
      completedAt: Date.now() - Math.floor(Math.random() * 5000000000),
      logs: []
    };
  });
};

const MockData = {
  history: generateMockHistory(45),
  analytics: Array.from({ length: 14 }).map((_, i) => ({
    date: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    conversions: Math.floor(Math.random() * 50) + 10,
    dataProcessed: Math.floor(Math.random() * 5) + 1 // GB
  }))
};

/* =========================================================================
   ARCHITECTURE LAYER: STATE MANAGEMENT (CONTEXT & REDUCERS)
========================================================================= */

// 1. Toast Context
interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}
const ToastContext = createContext<ToastContextType>({} as ToastContextType);

const ToastProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Utils.generateId();
    setToasts(prev => [...prev, { ...toast, id }]);
    if (toast.duration !== 0) {
      setTimeout(() => removeToast(id), toast.duration || 5000);
    }
  }, []);
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);
  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// 2. Global App Context (Queue, Logs, Settings)
interface AppState {
  tasks: Record<string, ConversionTask>;
  queue: string[];
  history: ConversionTask[];
  settings: AppSettings;
  globalLogs: LogEntry[];
}

type AppAction = 
  | { type: 'ADD_TASKS'; tasks: ConversionTask[] }
  | { type: 'UPDATE_TASK'; id: string; updates: Partial<ConversionTask> }
  | { type: 'REMOVE_TASK'; id: string }
  | { type: 'ADD_LOG'; log: LogEntry }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<AppSettings> }
  | { type: 'CLEAR_HISTORY' };

const initialAppState: AppState = {
  tasks: {},
  queue: [],
  history: MockData.history,
  settings: {
    theme: 'dark',
    autoDownload: true,
    maxConcurrent: 3,
    audioBitrate: '320k',
    preserveMetadata: true,
    notificationsEnabled: true,
    experimentalEngine: false
  },
  globalLogs: [
    { id: '1', level: 'info', message: 'Engine initialized v4.2.0', timestamp: Date.now() },
    { id: '2', level: 'success', message: 'WASM modules loaded successfully', timestamp: Date.now() }
  ]
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'ADD_TASKS':
      const newTasks = { ...state.tasks };
      const newQueue = [...state.queue];
      action.tasks.forEach(t => {
        newTasks[t.id] = t;
        newQueue.push(t.id);
      });
      return { ...state, tasks: newTasks, queue: newQueue };
    case 'UPDATE_TASK':
      if (!state.tasks[action.id]) return state;
      const updatedTask = { ...state.tasks[action.id], ...action.updates };
      
      // If completed or error, move to history potentially (simplified for demo)
      let newHistory = state.history;
      if (['completed', 'error'].includes(updatedTask.status) && state.tasks[action.id].status !== updatedTask.status) {
         newHistory = [updatedTask, ...state.history];
      }

      return { 
        ...state, 
        tasks: { ...state.tasks, [action.id]: updatedTask },
        history: newHistory
      };
    case 'REMOVE_TASK':
      const { [action.id]: _, ...restTasks } = state.tasks;
      return {
        ...state,
        tasks: restTasks,
        queue: state.queue.filter(id => id !== action.id)
      };
    case 'ADD_LOG':
      return { ...state, globalLogs: [action.log, ...state.globalLogs].slice(0, 1000) };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } };
    case 'CLEAR_HISTORY':
      return { ...state, history: [] };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  processQueue: () => void;
}>({ state: initialAppState, dispatch: () => {}, processQueue: () => {} });

/* =========================================================================
   DESIGN SYSTEM: ATOMS
   Highly reusable base components
========================================================================= */

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'secondary'|'danger'|'ghost', size?: 'sm'|'md'|'lg', loading?: boolean, icon?: React.ReactNode }> = ({ 
  children, variant = 'primary', size = 'md', loading, icon, className = '', disabled, ...props 
}) => {
  const base = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950";
  const variants = {
    primary: "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/20",
    secondary: "bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/50 backdrop-blur-sm",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20",
    ghost: "hover:bg-slate-800/50 text-slate-400 hover:text-slate-200"
  };
  const sizes = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-base px-6 py-3 gap-2.5"
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={disabled || loading} {...props}>
      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
};

const Badge: React.FC<{ children: React.ReactNode, variant?: 'success'|'warning'|'error'|'info'|'neutral' }> = ({ children, variant = 'neutral' }) => {
  const variants = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    neutral: "bg-slate-800/50 text-slate-400 border-slate-700"
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm flex items-center gap-1.5 w-max ${variants[variant]}`}>
      {children}
    </span>
  );
};

const ProgressBar: React.FC<{ progress: number, status?: FileStatus, className?: string }> = ({ progress, status = 'processing', className = '' }) => {
  const colors = {
    idle: 'bg-slate-600',
    queued: 'bg-slate-500',
    processing: 'bg-indigo-500',
    completed: 'bg-emerald-500',
    error: 'bg-red-500'
  };
  
  return (
    <div className={`w-full bg-slate-900/50 rounded-full h-2.5 border border-slate-800 overflow-hidden ${className}`}>
      <div 
        className={`h-full rounded-full transition-all duration-500 ease-out ${colors[status]} ${status === 'processing' ? 'animate-pulse' : ''} relative overflow-hidden`}
        style={{ width: `${progress}%` }}
      >
        {status === 'processing' && (
          <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite] -skew-x-12" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'}}></div>
        )}
      </div>
    </div>
  );
};

const Card: React.FC<{ children: React.ReactNode, className?: string, hover?: boolean }> = ({ children, className = '', hover = false }) => (
  <div className={`bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6 shadow-xl ${hover ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-slate-700' : ''} ${className}`}>
    {children}
  </div>
);

const Switch: React.FC<{ checked: boolean, onChange: (c: boolean) => void, label?: string, desc?: string }> = ({ checked, onChange, label, desc }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      {label && <div className="text-sm font-medium text-slate-200">{label}</div>}
      {desc && <div className="text-xs text-slate-500 mt-0.5">{desc}</div>}
    </div>
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950 ${checked ? 'bg-indigo-500' : 'bg-slate-700'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

/* =========================================================================
   DESIGN SYSTEM: MOLECULES
   Complex functional components
========================================================================= */

const ToastItem: React.FC<{ toast: ToastMessage, onClose: () => void }> = ({ toast, onClose }) => {
  const icons = {
    success: <CheckCircle className="text-emerald-400" />,
    error: <AlertCircle className="text-red-400" />,
    warning: <AlertCircle className="text-amber-400" />,
    info: <Info className="text-blue-400" />
  };
  const bgClasses = {
    success: "bg-emerald-950/80 border-emerald-900/50",
    error: "bg-red-950/80 border-red-900/50",
    warning: "bg-amber-950/80 border-amber-900/50",
    info: "bg-slate-900/90 border-slate-800"
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl animate-[slideIn_0.3s_ease-out] min-w-[300px] max-w-md ${bgClasses[toast.type]}`}>
      <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1">
        <h4 className="text-sm font-medium text-slate-200">{toast.title}</h4>
        {toast.message && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{toast.message}</p>}
      </div>
      <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const FileDropzone: React.FC<{ onDropFiles: (files: File[]) => void }> = ({ onDropFiles }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useContext(ToastContext);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(Array.from(e.target.files));
  };

  const processFiles = (files: File[]) => {
    const validFiles: File[] = [];
    files.forEach(file => {
      try {
        if (Utils.validateFile(file)) validFiles.push(file);
      } catch (err: any) {
        addToast({ type: 'error', title: 'Upload Failed', message: err.message });
      }
    });
    if (validFiles.length > 0) onDropFiles(validFiles);
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative group flex flex-col items-center justify-center w-full p-12 border-2 border-dashed rounded-3xl transition-all duration-300 bg-slate-900/20 backdrop-blur-sm
        ${isDragging ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_50px_-12px_rgba(99,102,241,0.3)]' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/40'}`}
    >
      <input 
        type="file" multiple accept="video/mp4,video/x-m4v" className="hidden" 
        ref={fileInputRef} onChange={handleFileInput} 
      />
      
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-700" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full group-hover:bg-purple-500/20 transition-all duration-700" />
      </div>

      <div className={`p-5 rounded-2xl mb-6 transition-all duration-300 ${isDragging ? 'bg-indigo-500/20 scale-110' : 'bg-slate-800 shadow-xl'}`}>
        <UploadCloud className={`w-10 h-10 ${isDragging ? 'text-indigo-400' : 'text-slate-400 group-hover:text-indigo-400'} transition-colors`} />
      </div>
      <h3 className="text-xl font-bold text-slate-200 mb-2 text-center">
        Drag & Drop your MP4 files here
      </h3>
      <p className="text-sm text-slate-500 text-center max-w-sm mb-8">
        Enterprise-grade WebAssembly conversion engine. Everything runs locally in your browser. No data leaves your machine.
      </p>
      
      <Button onClick={() => fileInputRef.current?.click()} size="lg" icon={<FileVideo className="w-5 h-5" />}>
        Select Files
      </Button>

      <div className="flex gap-4 mt-8 text-xs font-medium text-slate-500">
        <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Client-side Processing</span>
        <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> High-Speed WASM</span>
        <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> Batch Support</span>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: string | number, trend?: string, icon: React.ReactNode, color: 'indigo'|'emerald'|'purple'|'blue' }> = ({ title, value, trend, icon, color }) => {
  const colors = {
    indigo: "text-indigo-400 bg-indigo-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10",
    purple: "text-purple-400 bg-purple-500/10",
    blue: "text-blue-400 bg-blue-500/10",
  };
  return (
    <Card hover className="relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[50px] opacity-20 transition-opacity duration-500 group-hover:opacity-40 rounded-full ${colors[color].split(' ')[0]}`} />
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-medium text-emerald-400 flex items-center bg-emerald-500/10 px-2 py-1 rounded-lg">
            ↑ {trend}
          </span>
        )}
      </div>
      <div className="relative z-10">
        <h4 className="text-sm font-medium text-slate-400 mb-1">{title}</h4>
        <div className="text-3xl font-bold text-slate-100">{value}</div>
      </div>
    </Card>
  );
};

const SimpleBarChart: React.FC<{ data: { label: string, value: number }[] }> = ({ data }) => {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="h-64 flex items-end gap-2 w-full pt-8 relative">
      {/* Grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-full border-b border-slate-800/50 h-0" />
        ))}
      </div>
      
      {data.map((item, i) => {
        const heightPercent = max === 0 ? 0 : (item.value / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative z-10">
            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 text-slate-200 text-xs py-1 px-2 rounded-md transition-opacity pointer-events-none whitespace-nowrap z-20">
              {item.value} files
            </div>
            <div 
              className="w-full bg-indigo-500/20 group-hover:bg-indigo-500 transition-all duration-300 rounded-t-sm border-t border-indigo-500/50 relative overflow-hidden"
              style={{ height: `${heightPercent}%`, minHeight: '4px' }}
            >
               <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
            </div>
            <div className="text-[10px] text-slate-500 mt-3 rotate-45 origin-left truncate w-full text-center group-hover:text-slate-300 transition-colors">
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AudioVisualizer: React.FC = () => {
  return (
    <div className="h-16 w-full flex items-center justify-center gap-1 py-2 px-4 bg-slate-950/50 rounded-xl border border-slate-800/50 overflow-hidden">
       {[...Array(40)].map((_, i) => (
          <div 
            key={i} 
            className="w-1.5 bg-indigo-500/80 rounded-full animate-visualizer"
            style={{ 
              height: `${Math.random() * 100}%`,
              animationDuration: `${0.5 + Math.random() * 0.5}s`,
              animationDelay: `${Math.random() * 0.5}s`
            }} 
          />
       ))}
    </div>
  );
};

/* =========================================================================
   DESIGN SYSTEM: ORGANISMS
   Major sections of the application
========================================================================= */

const ConversionItemRow: React.FC<{ task: ConversionTask, onRemove: (id: string) => void }> = ({ task, onRemove }) => {
  const { settings } = useContext(AppContext);
  const statusColors = {
    idle: 'text-slate-500', queued: 'text-slate-400', processing: 'text-indigo-400', completed: 'text-emerald-400', error: 'text-red-400'
  };

  return (
    <div className="p-4 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/20 transition-colors group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={`p-2.5 rounded-xl bg-slate-900 border border-slate-700/50 ${statusColors[task.status]}`}>
            {task.status === 'completed' ? <FileAudio className="w-5 h-5" /> : <FileVideo className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-medium text-slate-200 truncate pr-4" title={task.originalName}>
              {task.originalName}
            </h4>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span>{Utils.formatBytes(task.size)}</span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span className="uppercase tracking-wider font-semibold">{task.status}</span>
              
              {task.status === 'processing' && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-700" />
                  <span className="text-indigo-400">{Utils.formatBytes(task.speed)}/s</span>
                  <span className="w-1 h-1 rounded-full bg-slate-700" />
                  <span className="text-slate-400">ETA: {Utils.formatTime(task.eta)}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {task.status === 'completed' && task.outputUrl && (
            <a href={task.outputUrl} download={task.originalName.replace(/\.mp4$/i, '.mp3')} className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
            </a>
          )}
          <button onClick={() => onRemove(task.id)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <ProgressBar progress={task.progress} status={task.status} className="flex-1" />
        <span className="text-xs font-mono font-medium text-slate-400 w-10 text-right">
          {task.progress}%
        </span>
      </div>
      
      {task.error && (
        <div className="mt-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg flex items-start gap-2">
           <AlertCircle className="w-4 h-4 shrink-0" />
           <span className="leading-relaxed">{task.error}</span>
        </div>
      )}
    </div>
  );
};

const LogTerminal: React.FC<{ logs: LogEntry[] }> = ({ logs }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-[#0D1117] border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[400px]">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161B22] border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Terminal className="w-4 h-4" /> Engine Logs (tty1)
        </div>
        <div className="flex gap-1.5">
           <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
           <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
           <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
        </div>
      </div>
      <div ref={terminalRef} className="flex-1 overflow-y-auto p-4 font-mono text-[11px] sm:text-xs leading-relaxed custom-scrollbar">
        {logs.length === 0 ? (
          <div className="text-slate-600 italic">No logs available. Waiting for engine...</div>
        ) : (
          logs.map((log) => {
             const time = new Date(log.timestamp).toISOString().split('T')[1].replace('Z', '');
             const colors = {
               info: 'text-blue-400',
               success: 'text-emerald-400',
               warn: 'text-amber-400',
               error: 'text-red-400 font-bold'
             };
             return (
               <div key={log.id} className="mb-1 flex gap-3 hover:bg-white/5 px-1 -mx-1 rounded">
                 <span className="text-slate-600 shrink-0">[{time}]</span>
                 <span className={`shrink-0 w-16 uppercase ${colors[log.level]}`}>{log.level}</span>
                 <span className="text-slate-300 break-words">{log.message}</span>
               </div>
             );
          })
        )}
      </div>
    </div>
  );
};

/* =========================================================================
   PAGES / VIEWS
========================================================================= */

const ConverterView: React.FC = () => {
  const { state, dispatch, processQueue } = useContext(AppContext);
  const { addToast } = useContext(ToastContext);

  const handleFiles = (files: File[]) => {
    const newTasks: ConversionTask[] = files.map(f => ({
      id: Utils.generateId(),
      file: f,
      originalName: f.name,
      size: f.size,
      status: 'queued',
      progress: 0,
      eta: 0,
      speed: 0,
      createdAt: Date.now(),
      logs: []
    }));
    
    dispatch({ type: 'ADD_TASKS', tasks: newTasks });
    addToast({ type: 'info', title: 'Files Queued', message: `Added ${files.length} file(s) to the conversion queue.` });
    
    // Trigger queue processing asynchronously
    setTimeout(processQueue, 100);
  };

  const tasksList = Object.values(state.tasks).sort((a, b) => b.createdAt - a.createdAt);
  const activeCount = tasksList.filter(t => t.status === 'processing').length;
  const queuedCount = tasksList.filter(t => t.status === 'queued').length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">MP4 to MP3 Converter</h1>
        <p className="text-slate-400">Enterprise-grade client-side media extraction tool.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <FileDropzone onDropFiles={handleFiles} />
          
          {tasksList.length > 0 && (
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center justify-between p-4 bg-slate-900/80 border-b border-slate-800">
                <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" /> Active Queue
                </h3>
                <div className="flex gap-2 text-xs">
                  <Badge variant="info">{activeCount} Processing</Badge>
                  <Badge variant="neutral">{queuedCount} Queued</Badge>
                </div>
              </div>
              <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                {tasksList.map(task => (
                  <ConversionItemRow 
                    key={task.id} 
                    task={task} 
                    onRemove={(id) => dispatch({ type: 'REMOVE_TASK', id })} 
                  />
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/20">
            <h3 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4" /> System Status
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>WASM Engine Core</span>
                  <span className="text-emerald-400">Online</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-full animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Memory Usage (Simulated)</span>
                  <span>45%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[45%]" />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800/50">
                <div className="text-xs text-slate-500 flex justify-between">
                  <span>Concurrency Limit</span>
                  <span className="text-slate-300">{state.settings.maxConcurrent} Threads</span>
                </div>
                <div className="text-xs text-slate-500 flex justify-between mt-2">
                  <span>Output Quality</span>
                  <span className="text-slate-300">{state.settings.audioBitrate} CBR</span>
                </div>
              </div>
            </div>
          </Card>
          
          <LogTerminal logs={state.globalLogs} />
        </div>
      </div>
    </div>
  );
};

const HistoryView: React.FC = () => {
  const { state, dispatch } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = state.history.filter(t => 
    t.originalName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto animate-[fadeIn_0.5s_ease-out]">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Conversion History</h1>
          <p className="text-slate-400">Review past exports, errors, and metadata logs.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
           <input 
             type="text" 
             placeholder="Search files..." 
             className="bg-slate-900 border border-slate-700 text-sm rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-full sm:w-64"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
           <Button variant="danger" icon={<Trash2 className="w-4 h-4"/>} onClick={() => dispatch({ type: 'CLEAR_HISTORY' })}>
             Clear
           </Button>
        </div>
      </header>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <th className="p-4">File Name</th>
                <th className="p-4">Date</th>
                <th className="p-4">Size</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredHistory.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No history found.</td></tr>
              ) : (
                filteredHistory.map(task => (
                  <tr key={task.id} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {task.status === 'completed' ? <FileAudio className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        </div>
                        <span className="text-sm font-medium text-slate-300 truncate max-w-[200px] sm:max-w-xs block" title={task.originalName}>
                          {task.originalName}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-400">
                      {new Date(task.completedAt || task.createdAt).toLocaleDateString()} <span className="text-slate-600">{new Date(task.completedAt || task.createdAt).toLocaleTimeString()}</span>
                    </td>
                    <td className="p-4 text-sm text-slate-400 font-mono">{Utils.formatBytes(task.size)}</td>
                    <td className="p-4">
                      {task.status === 'completed' ? <Badge variant="success">Success</Badge> : <Badge variant="error">Failed</Badge>}
                    </td>
                    <td className="p-4 text-right">
                       <Button variant="ghost" size="sm" icon={<MoreVertical className="w-4 h-4" />} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const AnalyticsView: React.FC = () => {
  const { state } = useContext(AppContext);
  const totalProcessed = state.history.filter(t => t.status === 'completed').length;
  const successRate = state.history.length ? Math.round((totalProcessed / state.history.length) * 100) : 0;
  const totalData = state.history.reduce((acc, curr) => acc + curr.size, 0);

  return (
    <div className="max-w-6xl mx-auto animate-[fadeIn_0.5s_ease-out] space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Platform Analytics</h1>
        <p className="text-slate-400">Comprehensive overview of your processing metrics.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Total Conversions" value={totalProcessed} trend="12%" icon={<Layers className="w-6 h-6" />} color="indigo" />
        <StatCard title="Success Rate" value={`${successRate}%`} trend="2.1%" icon={<CheckCircle className="w-6 h-6" />} color="emerald" />
        <StatCard title="Data Processed" value={Utils.formatBytes(totalData)} icon={<HardDrive className="w-6 h-6" />} color="blue" />
        <StatCard title="Time Saved" value="~14h" trend="4h" icon={<Zap className="w-6 h-6" />} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-400" /> Conversion Volume (Last 14 Days)
          </h3>
          <SimpleBarChart data={MockData.analytics.map(d => ({ label: d.date, value: d.conversions }))} />
        </Card>
        
        <Card>
          <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
            <Music className="w-5 h-5 text-purple-400" /> Recent Output Analysis
          </h3>
          <div className="space-y-6">
             <AudioVisualizer />
             <div className="space-y-3 pt-4 border-t border-slate-800/50">
               <div className="flex justify-between text-sm">
                 <span className="text-slate-400">Average Bitrate</span>
                 <span className="text-slate-200 font-mono">256 kbps</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-slate-400">Stereo/Mono Ratio</span>
                 <span className="text-slate-200 font-mono">98% / 2%</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-slate-400">Metadata Preserved</span>
                 <span className="text-emerald-400 font-medium">Yes</span>
               </div>
             </div>
             <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
               <p className="text-xs text-purple-300 leading-relaxed">
                 <Info className="w-3.5 h-3.5 inline mr-1 mb-0.5" />
                 Your audio outputs show excellent dynamic range. Consider keeping 320kbps for master archives.
               </p>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const SettingsView: React.FC = () => {
  const { state, dispatch } = useContext(AppContext);
  const { addToast } = useContext(ToastContext);
  const s = state.settings;

  const update = (key: keyof AppSettings, value: any) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings: { [key]: value } });
    addToast({ type: 'success', title: 'Settings Updated', message: `Successfully updated ${key}.`, duration: 2000 });
  };

  return (
    <div className="max-w-4xl mx-auto animate-[fadeIn_0.5s_ease-out] pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Preferences & Settings</h1>
        <p className="text-slate-400">Configure engine parameters and application behavior.</p>
      </header>

      <div className="space-y-6">
        <Card>
          <h3 className="text-lg font-semibold text-slate-200 mb-6 border-b border-slate-800 pb-4">Extraction Engine</h3>
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3">
              <div>
                <div className="text-sm font-medium text-slate-200">Audio Bitrate Quality</div>
                <div className="text-xs text-slate-500 mt-0.5">Constant bitrate encoding for MP3 output.</div>
              </div>
              <select 
                className="mt-3 sm:mt-0 bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:w-32 p-2.5"
                value={s.audioBitrate}
                onChange={(e) => update('audioBitrate', e.target.value)}
              >
                <option value="128k">128 kbps</option>
                <option value="192k">192 kbps</option>
                <option value="256k">256 kbps</option>
                <option value="320k">320 kbps (HQ)</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3">
              <div>
                <div className="text-sm font-medium text-slate-200">Max Concurrent Threads</div>
                <div className="text-xs text-slate-500 mt-0.5">Number of files to process simultaneously. Higher uses more memory.</div>
              </div>
               <select 
                className="mt-3 sm:mt-0 bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:w-32 p-2.5"
                value={s.maxConcurrent.toString()}
                onChange={(e) => update('maxConcurrent', parseInt(e.target.value))}
              >
                <option value="1">1 (Safe)</option>
                <option value="2">2</option>
                <option value="3">3 (Recommended)</option>
                <option value="5">5 (High CPU)</option>
              </select>
            </div>
            <Switch 
              checked={s.experimentalEngine} onChange={(v) => update('experimentalEngine', v)}
              label="Enable Experimental Engine" desc="Use beta WebAssembly SIMD instructions for up to 30% faster processing. May crash on older browsers."
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-200 mb-6 border-b border-slate-800 pb-4">Application Behavior</h3>
          <div className="space-y-2">
            <Switch 
              checked={s.autoDownload} onChange={(v) => update('autoDownload', v)}
              label="Auto-Download" desc="Automatically save MP3 files to your default downloads folder when finished."
            />
             <Switch 
              checked={s.preserveMetadata} onChange={(v) => update('preserveMetadata', v)}
              label="Preserve Metadata" desc="Attempt to copy ID3 tags, album art, and creation dates from the source MP4."
            />
            <Switch 
              checked={s.notificationsEnabled} onChange={(v) => update('notificationsEnabled', v)}
              label="System Notifications" desc="Show browser level toast notifications on completion."
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

/* =========================================================================
   LAYOUT & ROUTING (Simulated)
========================================================================= */

type PageRoute = 'converter' | 'history' | 'analytics' | 'settings';

const Sidebar: React.FC<{ currentRoute: PageRoute, setRoute: (r: PageRoute) => void }> = ({ currentRoute, setRoute }) => {
  const navItems: { id: PageRoute, label: string, icon: React.ReactNode }[] = [
    { id: 'converter', label: 'Converter', icon: <RefreshCw className="w-5 h-5" /> },
    { id: 'history', label: 'History', icon: <History className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <Activity className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-[#0B0F19] border-r border-slate-800/80 hidden md:flex flex-col h-screen fixed left-0 top-0 z-40">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
           <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight">AudioExtract Pro</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map(item => {
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setRoute(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium
                ${isActive 
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'}`}
            >
              {item.icon}
              {item.label}
              {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
            </button>
          );
        })}
      </nav>

      <div className="p-4 m-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50">
         <div className="text-xs text-slate-400 mb-2">Storage Usage</div>
         <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-indigo-500 w-[68%]" />
         </div>
         <div className="text-[10px] text-slate-500 text-right">6.8 GB Local Cache</div>
      </div>
    </aside>
  );
};

const MobileNav: React.FC<{ currentRoute: PageRoute, setRoute: (r: PageRoute) => void }> = ({ currentRoute, setRoute }) => {
  const navItems: { id: PageRoute, icon: React.ReactNode }[] = [
    { id: 'converter', icon: <RefreshCw className="w-6 h-6" /> },
    { id: 'history', icon: <History className="w-6 h-6" /> },
    { id: 'analytics', icon: <Activity className="w-6 h-6" /> },
    { id: 'settings', icon: <Settings className="w-6 h-6" /> },
  ];
  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-slate-950/80 backdrop-blur-xl border-t border-slate-800 z-50 px-6 py-3 pb-safe flex justify-between items-center">
      {navItems.map(item => (
        <button 
          key={item.id} onClick={() => setRoute(item.id)}
          className={`p-3 rounded-xl transition-colors ${currentRoute === item.id ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500'}`}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
};

/* =========================================================================
   MAIN APP & ENGINE ORCHESTRATION
========================================================================= */

const MainAppContent: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<PageRoute>('converter');

  return (
    <div className="min-h-screen bg-[#060913] text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Dynamic Grid Background Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none z-0" />

      <Sidebar currentRoute={currentRoute} setRoute={setCurrentRoute} />
      
      <main className="md:pl-64 pt-6 md:pt-12 px-4 sm:px-8 pb-24 md:pb-12 relative z-10 min-h-screen">
        {currentRoute === 'converter' && <ConverterView />}
        {currentRoute === 'history' && <HistoryView />}
        {currentRoute === 'analytics' && <AnalyticsView />}
        {currentRoute === 'settings' && <SettingsView />}
      </main>

      <MobileNav currentRoute={currentRoute} setRoute={setCurrentRoute} />
    </div>
  );
};

export default function App() {
  const [state, dispatch] = useReducer(appReducer, initialAppState);
  const processingRef = useRef(false);

  // Core Engine Queue Manager Simulation
  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    
    // Simple mock to get the latest state in the closure, in a real app would use a more robust store integration
    // We rely on the context provider re-rendering, but for the async loop, we manage a local queue pointer or let the reducer handle it.
    // For this simulation, we'll recursively call a processing function that reads from a ref.
  }, []);

  // Effect to handle queue processing. In a real app with Redux/Zustand this is a saga or thunk.
  useEffect(() => {
    const activeTasksCount = Object.values(state.tasks).filter(t => t.status === 'processing').length;
    const queuedTasks = state.queue.filter(id => state.tasks[id]?.status === 'queued');

    if (activeTasksCount < state.settings.maxConcurrent && queuedTasks.length > 0) {
      // Pick next tasks to fill capacity
      const capacity = state.settings.maxConcurrent - activeTasksCount;
      const tasksToStart = queuedTasks.slice(0, capacity);

      tasksToStart.forEach(id => {
        const task = state.tasks[id];
        if(!task) return;
        
        // Start Processing
        dispatch({ type: 'UPDATE_TASK', id, updates: { status: 'processing' } });
        dispatch({ type: 'ADD_LOG', log: { id: Utils.generateId(), level: 'info', message: `Starting conversion job for ${task.originalName}`, taskId: id, timestamp: Date.now() }});

        // The Engine Execution
        Utils.simulateProcessingEngine(
          task,
          (tId, progress, speed, eta, log) => {
            dispatch({ type: 'UPDATE_TASK', id: tId, updates: { progress, speed, eta } });
            dispatch({ type: 'ADD_LOG', log });
          }
        ).then((outputUrl) => {
          dispatch({ 
            type: 'UPDATE_TASK', 
            id, 
            updates: { status: 'completed', progress: 100, outputUrl, completedAt: Date.now(), speed: 0, eta: 0 } 
          });
          dispatch({ type: 'ADD_LOG', log: { id: Utils.generateId(), level: 'success', message: `Job completed successfully: ${task.originalName}`, taskId: id, timestamp: Date.now() }});
        }).catch(err => {
          dispatch({ 
            type: 'UPDATE_TASK', 
            id, 
            updates: { status: 'error', error: err.message, speed: 0, eta: 0 } 
          });
          dispatch({ type: 'ADD_LOG', log: { id: Utils.generateId(), level: 'error', message: `Job Failed: ${err.message}`, taskId: id, timestamp: Date.now() }});
        });
      });
    }
  }, [state.queue, state.tasks, state.settings.maxConcurrent]);

  return (
    <AppContext.Provider value={{ state, dispatch, processQueue }}>
      <ToastProvider>
        <MainAppContent />
      </ToastProvider>
    </AppContext.Provider>
  );
}

/* Styles injected for custom animations 
  Since standard tailwind config isn't accessible, we inject keyframes.
*/
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shimmer {
      0% { transform: translateX(-100%) skewX(-12deg); }
      100% { transform: translateX(200%) skewX(-12deg); }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes visualizer {
      0%, 100% { height: 10%; opacity: 0.5; }
      50% { height: 100%; opacity: 1; }
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #334155;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #475569;
    }
  `;
  document.head.appendChild(style);
}
