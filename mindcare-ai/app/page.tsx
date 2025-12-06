'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { 
  Brain, TrendingUp, Calendar, BarChart3, Save, Trash2, BookOpen, Sparkles, 
  Mic, Keyboard, Square, Sun, Moon, Sunrise, Heart, Target, Zap, 
  ChevronRight, Star, Award, Flame, CloudSun, Quote, RefreshCw, User, Mail, Lock, LogOut
} from 'lucide-react';

// Types
interface PeriodAnalysis {
  text: string;
  mood: string;
  score: number;
  tips: string;
  insights: string;
}

interface DailySummary {
  overallMood: string;
  avgScore: number;
  summary: string;
  recommendations: string;
}

interface JournalEntry {
  id: string;
  date: string;
  morning: PeriodAnalysis;
  afternoon: PeriodAnalysis;
  evening: PeriodAnalysis;
  dailySummary: DailySummary;
  timestamp: number;
}

interface MonthlyInsight {
  month: string;
  insights: string;
  patterns: string;
  trends: string;
  triggers: string;
  recommendations: string;
  highlights: string;
  growth: string;
  generatedAt: number;
}

interface StorageData {
  entries: JournalEntry[];
  monthlyInsights: MonthlyInsight[];
}

interface User {
  name: string;
  email: string;
  avatar: string;
}

// Extend Window interface for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onstart: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const MOODS = ['Happy', 'Sad', 'Anxious', 'Excited', 'Stressed', 'Angry', 'Content', 'Confused', 'Hopeful', 'Neutral'];

const MOTIVATIONAL_QUOTES = [
  { quote: "Every day is a new beginning. Take a deep breath and start again.", author: "Unknown" },
  { quote: "Your mental health is a priority. Your happiness is essential.", author: "Unknown" },
  { quote: "Be gentle with yourself. You're doing the best you can.", author: "Unknown" },
  { quote: "Progress, not perfection, is what we should be asking of ourselves.", author: "Julia Cameron" },
  { quote: "You are worthy of the love you keep trying to give everyone else.", author: "Unknown" },
  { quote: "Small steps every day lead to big changes over time.", author: "Unknown" },
];

// Avatar generator function
const generateAvatar = (email: string) => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}&backgroundColor=b6e3f4`;
};

// Main Wrapper Component with Authentication
export default function MindCareWrapper() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Check for a logged-in user in localStorage
    const storedUser = localStorage.getItem('mindcare_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setAuthLoading(false);
  }, []);

  const handleLogin = (loggedInUser: User) => {
    localStorage.setItem('mindcare_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('mindcare_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Brain className="w-16 h-16 text-violet-600 animate-pulse mx-auto" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-ping"></div>
          </div>
          <p className="text-gray-600 mt-4 font-medium">Loading MindCare AI...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return <MindCarePage user={user} onLogout={handleLogout} />;
}

// Authentication Screen Component
function AuthScreen({ onLogin }: { onLogin: (user: User) => void }) {
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (authView === 'signup' && !name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    
    // Dummy authentication logic
    const userName = authView === 'signup' ? name : email.split('@')[0];
    const avatarUrl = generateAvatar(email);
    
    onLogin({ name: userName, email, avatar: avatarUrl });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-4 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg border border-white/40">
            <div className="relative">
              <Brain className="w-10 h-10 text-violet-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full"></div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
              MindCare AI
            </h1>
          </div>
          <p className="text-gray-600">Your Personal Mental Wellness Companion</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/60 p-8">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-1 bg-violet-100 p-1 rounded-xl">
              <button 
                onClick={() => setAuthView('login')} 
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  authView === 'login' 
                    ? 'bg-white text-violet-600 shadow-md' 
                    : 'text-gray-500 hover:bg-white/50'
                }`}
              >
                Login
              </button>
              <button 
                onClick={() => setAuthView('signup')} 
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  authView === 'signup' 
                    ? 'bg-white text-violet-600 shadow-md' 
                    : 'text-gray-500 hover:bg-white/50'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">
            {authView === 'login' ? 'Welcome Back!' : 'Create Your Account'}
          </h2>
          <p className="text-gray-500 text-center text-sm mb-6">
            {authView === 'login' ? 'Log in to continue your journey.' : 'Start your wellness journey today.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {authView === 'signup' && (
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute top-1/2 left-4 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" 
                />
              </div>
            )}
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute top-1/2 left-4 -translate-y-1/2" />
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full pl-10 pr-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" 
              />
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute top-1/2 left-4 -translate-y-1/2" />
              <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full pl-10 pr-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" 
              />
            </div>

            {error && <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">{error}</p>}

            <button 
              type="submit" 
              className="w-full py-3 mt-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {authView === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Made with 💜 for your mental wellness journey
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App Page Component
function MindCarePage({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [morningEntry, setMorningEntry] = useState('');
  const [afternoonEntry, setAfternoonEntry] = useState('');
  const [eveningEntry, setEveningEntry] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<JournalEntry | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [monthlyInsights, setMonthlyInsights] = useState<MonthlyInsight[]>([]);
  const [view, setView] = useState<'journal' | 'history' | 'stats' | 'insights'>('journal');
  const [error, setError] = useState('');
  const [quote, setQuote] = useState(MOTIVATIONAL_QUOTES[0]);
  
  // Speech recognition states
  const [isListening, setIsListening] = useState(false);
  const [activeRecording, setActiveRecording] = useState<'morning' | 'afternoon' | 'evening' | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [interimTranscript, setInterimTranscript] = useState('');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const activeRecordingRef = useRef<'morning' | 'afternoon' | 'evening' | null>(null);

  // Random quote on mount
  useEffect(() => {
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  }, []);

  // Keep ref in sync with state
  useEffect(() => {
    activeRecordingRef.current = activeRecording;
  }, [activeRecording]);

  // Initialize speech recognition only once
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognitionAPI) {
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = '';
          let interim = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interim += transcript;
            }
          }
          
          setInterimTranscript(interim);
          
          if (finalTranscript) {
            const currentPeriod = activeRecordingRef.current;
            if (currentPeriod === 'morning') {
              setMorningEntry(prev => prev + finalTranscript);
            } else if (currentPeriod === 'afternoon') {
              setAfternoonEntry(prev => prev + finalTranscript);
            } else if (currentPeriod === 'evening') {
              setEveningEntry(prev => prev + finalTranscript);
            }
          }
        };
        
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          if (event.error === 'aborted' || event.error === 'no-speech') {
            return;
          }
          console.error('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            setError('Microphone access denied. Please allow microphone access to use voice input.');
          }
          setIsListening(false);
          setActiveRecording(null);
          setInterimTranscript('');
        };
        
        recognition.onend = () => {
          setIsListening(false);
          setInterimTranscript('');
        };
        
        recognitionRef.current = recognition;
      } else {
        setSpeechSupported(false);
        setInputMode('text');
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore errors during cleanup
        }
      }
    };
  }, []);

  const startListening = useCallback((period: 'morning' | 'afternoon' | 'evening') => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore errors
      }
    }
    
    setActiveRecording(period);
    activeRecordingRef.current = period;
    setIsListening(true);
    setInterimTranscript('');
    
    setTimeout(() => {
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setIsListening(false);
        setActiveRecording(null);
      }
    }, 100);
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore errors
      }
      setIsListening(false);
      setActiveRecording(null);
      activeRecordingRef.current = null;
      setInterimTranscript('');
    }
  }, [isListening]);

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`mindcare_data_${user.email}`);
    if (stored) {
      const data: StorageData = JSON.parse(stored);
      setEntries(data.entries || []);
      setMonthlyInsights(data.monthlyInsights || []);
    }
  }, [user.email]);

  // Save to localStorage whenever entries change
  useEffect(() => {
    if (entries.length > 0 || monthlyInsights.length > 0) {
      const data: StorageData = { entries, monthlyInsights };
      localStorage.setItem(`mindcare_data_${user.email}`, JSON.stringify(data));
    }
  }, [entries, monthlyInsights, user.email]);

  // Check if monthly insights should be generated
  useEffect(() => {
    if (entries.length >= 30) {
      const lastInsight = monthlyInsights[monthlyInsights.length - 1];
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      
      if (!lastInsight || lastInsight.generatedAt < thirtyDaysAgo) {
        generateMonthlyInsights();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries.length]);

  const generateMonthlyInsights = async () => {
    const last30Days = entries.slice(-30);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'monthly', entries: last30Days })
      });

      const data = await response.json();
      
      if (data.insights) {
        const newInsight: MonthlyInsight = {
          month: new Date().toISOString().slice(0, 7),
          ...data.insights,
          generatedAt: Date.now()
        };
        setMonthlyInsights(prev => [...prev, newInsight]);
      }
    } catch (err) {
      console.error('Failed to generate monthly insights:', err);
    }
  };

  const handleSubmit = async () => {
    if (isListening) {
      stopListening();
    }
    
    if (!morningEntry.trim() || !afternoonEntry.trim() || !eveningEntry.trim()) {
      setError('Please complete all three journal entries before submitting.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'daily',
          morning: morningEntry,
          afternoon: afternoonEntry,
          evening: eveningEntry
        })
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        morning: { text: morningEntry, ...data.morning },
        afternoon: { text: afternoonEntry, ...data.afternoon },
        evening: { text: eveningEntry, ...data.evening },
        dailySummary: data.dailySummary,
        timestamp: Date.now()
      };

      setEntries(prev => [...prev, newEntry]);
      setCurrentAnalysis(newEntry);
      setMorningEntry('');
      setAfternoonEntry('');
      setEveningEntry('');
      setView('history');
    } catch (err) {
      setError('Failed to analyze entries. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.removeItem(`mindcare_data_${user.email}`);
      setEntries([]);
      setMonthlyInsights([]);
      setCurrentAnalysis(null);
      setMorningEntry('');
      setAfternoonEntry('');
      setEveningEntry('');
    }
  };

  const refreshQuote = () => {
    const newQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    setQuote(newQuote);
  };

  // Statistics calculations
  const stats = {
    totalEntries: entries.length,
    avgScore: entries.length > 0 
      ? (entries.reduce((sum, e) => sum + e.dailySummary.avgScore, 0) / entries.length).toFixed(1)
      : '0',
    mostCommonMood: entries.length > 0
      ? Object.entries(
          entries.reduce((acc, e) => {
            acc[e.dailySummary.overallMood] = (acc[e.dailySummary.overallMood] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
      : 'N/A',
    currentStreak: calculateStreak(),
    moodDistribution: MOODS.map(mood => {
      const count = entries.filter(e => 
        e.morning.mood === mood || e.afternoon.mood === mood || e.evening.mood === mood
      ).length;
      const total = entries.length * 3;
      return { mood, percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0', count };
    }).filter(m => parseFloat(m.percentage) > 0)
  };

  function calculateStreak(): number {
    if (entries.length === 0) return 0;
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].timestamp);
      entryDate.setHours(0, 0, 0, 0);
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  // Chart data
  const trendData = entries.slice(-30).map(e => ({
    date: e.date.slice(5),
    score: Number(e.dailySummary.avgScore),
    mood: e.dailySummary.overallMood
  }));

  const barData = entries.slice(-7).map(e => ({
    date: e.date.slice(5),
    Morning: Number(e.morning.score),
    Afternoon: Number(e.afternoon.score),
    Evening: Number(e.evening.score)
  }));

  const getMoodColor = (mood: string) => {
    const colors: Record<string, string> = {
      Happy: 'from-amber-400 to-yellow-500',
      Sad: 'from-blue-400 to-blue-600',
      Anxious: 'from-purple-400 to-purple-600',
      Excited: 'from-orange-400 to-red-500',
      Stressed: 'from-red-400 to-red-600',
      Angry: 'from-red-500 to-red-700',
      Content: 'from-emerald-400 to-green-500',
      Confused: 'from-gray-400 to-gray-600',
      Hopeful: 'from-teal-400 to-cyan-500',
      Neutral: 'from-slate-400 to-gray-500'
    };
    return colors[mood] || 'from-gray-400 to-gray-500';
  };

  const getMoodEmoji = (mood: string) => {
    const emojis: Record<string, string> = {
      Happy: '😊', Sad: '😢', Anxious: '😰', Excited: '🤩', Stressed: '😫',
      Angry: '😠', Content: '😌', Confused: '😕', Hopeful: '🌟', Neutral: '😐'
    };
    return emojis[mood] || '😐';
  };

  const getEntryValue = (period: 'morning' | 'afternoon' | 'evening') => {
    if (period === 'morning') return morningEntry;
    if (period === 'afternoon') return afternoonEntry;
    return eveningEntry;
  };

  const setEntryValue = (period: 'morning' | 'afternoon' | 'evening', value: string) => {
    if (period === 'morning') setMorningEntry(value);
    else if (period === 'afternoon') setAfternoonEntry(value);
    else setEveningEntry(value);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = user.name.split(' ')[0];
    if (hour < 12) return { text: `Good Morning, ${firstName}`, icon: Sunrise, color: 'text-amber-500' };
    if (hour < 17) return { text: `Good Afternoon, ${firstName}`, icon: Sun, color: 'text-orange-500' };
    return { text: `Good Evening, ${firstName}`, icon: Moon, color: 'text-indigo-500' };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="mb-8 pt-4">
            <div className="flex items-center justify-between mb-6">
              <div className="inline-flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg border border-white/40">
                <div className="relative">
                  <Brain className="w-8 h-8 text-violet-600" />
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></div>
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full"></div>
                </div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                  MindCare AI
                </h1>
              </div>
              
              {/* User Profile & Logout */}
              <div className="relative group">
                <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border border-white/40 cursor-pointer hover:shadow-xl transition-all">
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-9 h-9 rounded-full border-2 border-violet-200" 
                  />
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                
                {/* Dropdown */}
                <div className="absolute top-full right-0 mt-2 w-56 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-3 border-b border-gray-100">
                    <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                    <p className="text-gray-500 text-xs truncate">{user.email}</p>
                  </div>
                  <button 
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
                <GreetingIcon className={`w-5 h-5 ${greeting.color}`} />
                <p className="text-lg font-medium">{greeting.text}! Ready to reflect?</p>
              </div>

              {/* Motivational Quote */}
              <div className="max-w-2xl mx-auto bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/60 shadow-sm">
                <div className="flex items-start gap-3">
                  <Quote className="w-6 h-6 text-violet-400 flex-shrink-0 mt-1" />
                  <div className="flex-1 text-left">
                    <p className="text-gray-700 italic text-sm md:text-base">&ldquo;{quote.quote}&rdquo;</p>
                    <p className="text-violet-500 text-xs mt-1 font-medium">— {quote.author}</p>
                  </div>
                  <button 
                    onClick={refreshQuote}
                    className="p-2 hover:bg-violet-100 rounded-full transition-colors"
                    title="New quote"
                  >
                    <RefreshCw className="w-4 h-4 text-violet-400" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Quick Stats Bar */}
          {entries.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/60 shadow-sm">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">{stats.currentStreak} day streak</span>
              </div>
              <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/60 shadow-sm">
                <BookOpen className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-medium text-gray-700">{stats.totalEntries} entries</span>
              </div>
              <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/60 shadow-sm">
                <Star className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-gray-700">{stats.avgScore}/10 avg mood</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex flex-wrap justify-center gap-2 mb-8">
            {[
              { id: 'journal', label: 'Journal', icon: BookOpen, desc: 'Write today' },
              { id: 'history', label: 'History', icon: Calendar, desc: 'Past entries' },
              { id: 'stats', label: 'Analytics', icon: BarChart3, desc: 'Your data' },
              { id: 'insights', label: 'Insights', icon: Sparkles, desc: 'AI analysis' }
            ].map(({ id, label, icon: Icon, desc }) => (
              <button
                key={id}
                onClick={() => setView(id as typeof view)}
                className={`group relative flex flex-col items-center gap-1 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                  view === id
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30 scale-105'
                    : 'bg-white/70 backdrop-blur-sm text-gray-600 hover:bg-white hover:shadow-md border border-white/60'
                }`}
              >
                <Icon className={`w-5 h-5 ${view === id ? 'text-white' : 'text-violet-500'}`} />
                <span className="text-sm">{label}</span>
                {view !== id && (
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {desc}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Journal View */}
          {view === 'journal' && (
            <div className="space-y-6">
              {/* Main Journal Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 overflow-hidden">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 p-6 text-white">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Heart className="w-6 h-6" />
                        Today&apos;s Reflection
                      </h2>
                      <p className="text-violet-100 text-sm mt-1">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    
                    {/* Input Mode Toggle */}
                    {speechSupported && (
                      <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm p-1 rounded-xl">
                        <button
                          onClick={() => {
                            if (isListening) stopListening();
                            setInputMode('voice');
                          }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                            inputMode === 'voice'
                              ? 'bg-white text-violet-600 shadow-md'
                              : 'text-white/80 hover:bg-white/10'
                          }`}
                        >
                          <Mic className="w-4 h-4" />
                          <span className="text-sm font-medium">Voice</span>
                        </button>
                        <button
                          onClick={() => {
                            if (isListening) stopListening();
                            setInputMode('text');
                          }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                            inputMode === 'text'
                              ? 'bg-white text-violet-600 shadow-md'
                              : 'text-white/80 hover:bg-white/10'
                          }`}
                        >
                          <Keyboard className="w-4 h-4" />
                          <span className="text-sm font-medium">Type</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 md:p-8">
                  {!speechSupported && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
                      <CloudSun className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm">
                        Speech recognition is not supported in your browser. Please use Chrome for voice input.
                      </p>
                    </div>
                  )}
                  
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3 animate-shake">
                      <Zap className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm">{error}</p>
                      <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">×</button>
                    </div>
                  )}

                  <div className="space-y-8">
                    {[
                      { 
                        period: 'morning' as const, 
                        label: 'Morning', 
                        icon: Sunrise,
                        gradient: 'from-amber-400 to-orange-500',
                        bgGradient: 'from-amber-50 to-orange-50',
                        placeholder: 'How do you feel this morning? What intentions do you have for today?',
                        prompt: 'Start your day with intention...'
                      },
                      { 
                        period: 'afternoon' as const, 
                        label: 'Afternoon', 
                        icon: Sun,
                        gradient: 'from-sky-400 to-blue-500',
                        bgGradient: 'from-sky-50 to-blue-50',
                        placeholder: 'How has your day been going? What moments stood out?',
                        prompt: 'Reflect on your progress...'
                      },
                      { 
                        period: 'evening' as const, 
                        label: 'Evening', 
                        icon: Moon,
                        gradient: 'from-violet-400 to-purple-600',
                        bgGradient: 'from-violet-50 to-purple-50',
                        placeholder: 'How do you feel as the day ends? What are you grateful for?',
                        prompt: 'Close the day with gratitude...'
                      }
                    ].map(({ period, label, icon: PeriodIcon, gradient, bgGradient, placeholder, prompt }) => (
                      <div key={period} className="relative">
                        {/* Period Header */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-xl bg-gradient-to-r ${gradient} shadow-lg`}>
                            <PeriodIcon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">{label} Reflection</h3>
                            <p className="text-xs text-gray-500">{prompt}</p>
                          </div>
                          {activeRecording === period && (
                            <span className="flex items-center gap-2 text-red-500 animate-pulse bg-red-50 px-3 py-1 rounded-full">
                              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                              <span className="text-xs font-medium">Recording...</span>
                            </span>
                          )}
                          {getEntryValue(period) && (
                            <span className="flex items-center gap-1 text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">
                              <span className="text-xs font-medium">✓ Done</span>
                            </span>
                          )}
                        </div>
                        
                        {inputMode === 'voice' && speechSupported ? (
                          <div className={`rounded-2xl bg-gradient-to-br ${bgGradient} p-4 border border-white shadow-sm`}>
                            {/* Voice Recording Button */}
                            <div className="flex items-center justify-center mb-4">
                              {activeRecording === period ? (
                                <button
                                  onClick={stopListening}
                                  className="group flex flex-col items-center gap-2 p-5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-full shadow-lg shadow-red-500/30 transition-all transform hover:scale-105 animate-pulse"
                                >
                                  <Square className="w-7 h-7" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => startListening(period)}
                                  disabled={isListening && activeRecording !== period}
                                  className={`group flex flex-col items-center gap-2 p-5 rounded-full shadow-lg transition-all transform hover:scale-105 ${
                                    isListening && activeRecording !== period
                                      ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                      : `bg-gradient-to-r ${gradient} text-white shadow-lg`
                                  }`}
                                >
                                  <Mic className="w-7 h-7" />
                                </button>
                              )}
                            </div>
                            
                            {activeRecording !== period && !getEntryValue(period) && (
                              <p className="text-center text-gray-500 text-sm mb-3">
                                Tap the microphone to start speaking
                              </p>
                            )}
                            
                            {/* Display Box for Voice Input */}
                            <div className={`min-h-[100px] p-4 bg-white/70 backdrop-blur-sm rounded-xl border-2 transition-all ${
                              activeRecording === period 
                                ? 'border-red-300 shadow-lg shadow-red-100' 
                                : getEntryValue(period)
                                  ? 'border-emerald-300'
                                  : 'border-transparent'
                            }`}>
                              {getEntryValue(period) || (activeRecording === period && interimTranscript) ? (
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                  {getEntryValue(period)}
                                  {activeRecording === period && interimTranscript && (
                                    <span className="text-gray-400 italic">{interimTranscript}</span>
                                  )}
                                </p>
                              ) : (
                                <p className="text-gray-400 italic text-center text-sm">
                                  {placeholder}
                                </p>
                              )}
                            </div>
                            
                            {/* Clear button */}
                            {getEntryValue(period) && (
                              <button
                                onClick={() => setEntryValue(period, '')}
                                className="mt-3 text-sm text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                Clear entry
                              </button>
                            )}
                          </div>
                        ) : (
                          <textarea
                            value={getEntryValue(period)}
                            onChange={(e) => setEntryValue(period, e.target.value)}
                            placeholder={placeholder}
                            rows={4}
                            className={`w-full px-4 py-3 bg-gradient-to-br ${bgGradient} border-2 border-transparent rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-700 placeholder-gray-400 resize-none transition-all hover:shadow-md focus:shadow-lg`}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={loading || isListening}
                    className={`mt-8 w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3 ${
                      loading || isListening
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Analyzing your thoughts...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save & Analyze Entry
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Voice Input Tips */}
              {inputMode === 'voice' && speechSupported && (
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/60">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="p-1.5 bg-violet-100 rounded-lg">
                      <Mic className="w-4 h-4 text-violet-600" />
                    </div>
                    Voice Input Tips
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      { icon: '🎤', tip: 'Speak clearly and at a natural pace' },
                      { icon: '🔘', tip: 'Click microphone to start/stop' },
                      { icon: '📝', tip: 'Record each section separately' },
                      { icon: '⌨️', tip: 'Switch to Type mode anytime' }
                    ].map(({ icon, tip }) => (
                      <div key={tip} className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{icon}</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History View */}
          {view === 'history' && (
            <div className="space-y-6">
              {entries.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Your Journey Begins Here</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Start your wellness journey by writing your first journal entry. Your future self will thank you!
                  </p>
                  <button 
                    onClick={() => setView('journal')}
                    className="mt-6 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                  >
                    Write First Entry
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-gray-800">Your Journal History</h2>
                    <span className="text-sm text-gray-500">{entries.length} entries</span>
                  </div>
                  
                  {entries.slice().reverse().map((entry, idx) => (
                    <div 
                      key={entry.id} 
                      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 overflow-hidden hover:shadow-xl transition-all"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      {/* Entry Header */}
                      <div className={`p-4 bg-gradient-to-r ${getMoodColor(entry.dailySummary.overallMood)} text-white`}>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getMoodEmoji(entry.dailySummary.overallMood)}</span>
                            <div>
                              <h3 className="font-semibold">
                                {new Date(entry.timestamp).toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </h3>
                              <p className="text-white/80 text-sm">
                                Feeling {entry.dailySummary.overallMood.toLowerCase()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            <Target className="w-4 h-4" />
                            <span className="font-bold">{Number(entry.dailySummary.avgScore).toFixed(1)}</span>
                            <span className="text-white/80 text-sm">/10</span>
                          </div>
                        </div>
                      </div>

                      {/* Entry Body */}
                      <div className="p-5">
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          {[
                            { period: 'Morning', data: entry.morning, icon: Sunrise, color: 'amber' },
                            { period: 'Afternoon', data: entry.afternoon, icon: Sun, color: 'sky' },
                            { period: 'Evening', data: entry.evening, icon: Moon, color: 'violet' }
                          ].map(({ period, data, icon: PIcon, color }) => (
                            <div key={period} className={`bg-${color}-50 rounded-xl p-4 border border-${color}-100`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <PIcon className={`w-4 h-4 text-${color}-500`} />
                                  <h4 className="font-medium text-gray-700 text-sm">{period}</h4>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${getMoodColor(data.mood)} text-white`}>
                                  {data.mood}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-3 mb-2">
                                {data.text}
                              </p>
                              <div className="flex items-start gap-1 text-xs text-gray-500">
                                <span>💡</span>
                                <span className="italic">{data.tips}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Daily Summary */}
                        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-violet-500" />
                            <h4 className="font-semibold text-violet-800">Daily Summary</h4>
                          </div>
                          <p className="text-sm text-gray-700 mb-3">
                            {entry.dailySummary.summary}
                          </p>
                          <div className="flex items-start gap-2 bg-white/60 rounded-lg p-3">
                            <Award className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-violet-700">
                              <strong>Recommendation:</strong> {entry.dailySummary.recommendations}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Statistics View */}
          {view === 'stats' && (
            <div className="space-y-6">
              {/* Summary Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Entries', value: stats.totalEntries, icon: BookOpen, color: 'violet', suffix: '' },
                  { label: 'Current Streak', value: stats.currentStreak, icon: Flame, color: 'orange', suffix: ' days' },
                  { label: 'Avg Mood Score', value: stats.avgScore, icon: TrendingUp, color: 'emerald', suffix: '/10' },
                  { label: 'Top Mood', value: stats.mostCommonMood, icon: Heart, color: 'pink', suffix: '' }
                ].map(({ label, value, icon: Icon, color, suffix }) => (
                  <div 
                    key={label} 
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/60 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-${color}-100 flex items-center justify-center mb-3`}>
                      <Icon className={`w-5 h-5 text-${color}-500`} />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{value}{suffix}</p>
                    <p className="text-sm text-gray-500">{label}</p>
                  </div>
                ))}
              </div>

              {/* Charts */}
              {entries.length > 0 ? (
                <>
                  {/* Mood Trend Chart */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-violet-500" />
                      Mood Trend (Last 30 Days)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={trendData}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                        <YAxis domain={[0, 10]} stroke="#9ca3af" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255,255,255,0.9)', 
                            borderRadius: '12px', 
                            border: 'none',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                          }} 
                        />
                        <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" name="Mood Score" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Daily Breakdown Chart */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-violet-500" />
                      Daily Breakdown (Last 7 Days)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                        <YAxis domain={[0, 10]} stroke="#9ca3af" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255,255,255,0.9)', 
                            borderRadius: '12px', 
                            border: 'none',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                          }} 
                        />
                        <Legend />
                        <Bar dataKey="Morning" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Afternoon" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Evening" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Mood Distribution */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-violet-500" />
                      Mood Distribution
                    </h3>
                    <div className="grid gap-3">
                      {stats.moodDistribution.map(({ mood, percentage, count }) => (
                        <div key={mood} className="group">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getMoodEmoji(mood)}</span>
                              <span className="text-sm font-medium text-gray-700">{mood}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {percentage}% ({count})
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-3 rounded-full bg-gradient-to-r ${getMoodColor(mood)} transition-all duration-500 group-hover:shadow-lg`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-12 text-center">
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Data Yet</h3>
                  <p className="text-gray-500">Start journaling to see your mood analytics!</p>
                </div>
              )}
            </div>
          )}

          {/* Insights View */}
          {view === 'insights' && (
            <div className="space-y-6">
              {monthlyInsights.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 p-12 text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-violet-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">Unlock AI Insights</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    After 30 days of journaling, our AI will analyze your patterns and provide personalized insights about your mental wellness journey.
                  </p>
                  
                  {/* Progress to Insights */}
                  <div className="max-w-xs mx-auto">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress to insights</span>
                      <span className="font-medium text-violet-600">{entries.length}/30 days</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-3 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-500"
                        style={{ width: `${Math.min((entries.length / 30) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {30 - entries.length > 0 ? `${30 - entries.length} more days to go!` : 'Generating insights...'}
                    </p>
                  </div>
                </div>
              ) : (
                monthlyInsights.slice().reverse().map((insight, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 overflow-hidden"
                  >
                    {/* Insight Header */}
                    <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 p-6 text-white">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                          <Brain className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Monthly AI Insights</h3>
                          <p className="text-violet-100 text-sm">{insight.month}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Insight Body */}
                    <div className="p-6 grid md:grid-cols-2 gap-4">
                      {[
                        { label: 'Behavior Patterns', content: insight.patterns, icon: '🔄', color: 'blue' },
                        { label: 'Mood Trends', content: insight.trends, icon: '📈', color: 'green' },
                        { label: 'Trigger Analysis', content: insight.triggers, icon: '⚡', color: 'amber' },
                        { label: 'Recommendations', content: insight.recommendations, icon: '💡', color: 'violet' },
                        { label: 'Highlights', content: insight.highlights, icon: '✨', color: 'pink' },
                        { label: 'Growth Areas', content: insight.growth, icon: '🌱', color: 'emerald' }
                      ].map(({ label, content, icon, color }) => (
                        <div key={label} className={`bg-${color}-50 rounded-xl p-4 border border-${color}-100`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{icon}</span>
                            <h4 className="font-semibold text-gray-800">{label}</h4>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Clear Data Button */}
          {entries.length > 0 && (
            <div className="mt-12 text-center">
              <button
                onClick={clearAllData}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </button>
            </div>
          )}

          {/* Footer */}
          <footer className="mt-12 text-center text-gray-400 text-sm pb-8">
            <p>Made with 💜 for your mental wellness journey</p>
          </footer>
        </div>
      </div>
    </div>
  );
}