import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth';
import { useJournal } from '../hooks/useJournal';
import { useMeetings } from '../hooks/useMeetings';
import { usePrayers } from '../hooks/usePrayers';
import { useGoals } from '../hooks/useGoals';
import { useReadingPlans } from '../hooks/useReadingPlans';
import { useStreak } from '../hooks/useStreak';
import { useCloudSync } from '../hooks/useCloudSync';
import { BIBLE_BOOKS } from '../hooks/useBible';
import type {
  JournalEntry,
  Meeting,
  PrayerRequest,
  DiscipleshipGoal,
  PlanProgress,
  ReadingLog,
  SharedDevocional,
} from '../types';

const TAB_TO_PATH: Record<string, string> = {
  dashboard: '/',
  bible: '/bible',
  journal: '/journal',
  discipleship: '/discipleship',
};

const PATH_TO_TAB: Record<string, string> = {
  '/': 'dashboard',
  '/bible': 'bible',
  '/journal': 'journal',
  '/discipleship': 'discipleship',
};

interface AppContextType {
  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Auth
  session: Session | null;
  setSession: (session: Session | null) => void;
  authLoading: boolean;
  handleLogout: () => Promise<void>;

  // User Settings
  userName: string;
  setUserName: (name: string) => void;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  showSettingsModal: boolean;
  setShowSettingsModal: (show: boolean) => void;

  // Journal
  journalEntries: JournalEntry[];
  handleAddJournalEntry: (entry: Omit<JournalEntry, 'id' | 'date'> & { shareWithDiscipleship?: boolean }) => Promise<void>;
  handleDeleteJournalEntry: (id: string) => void;

  // Meetings
  discipleshipMeetings: Meeting[];
  handleAddMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  handleDeleteMeeting: (id: string) => void;

  // Prayers
  prayers: PrayerRequest[];
  handleAddPrayer: (title: string, description: string) => void;
  handleToggleAnswered: (id: string, answerText?: string) => void;
  handleDeletePrayer: (id: string) => Promise<void>;

  // Goals
  goals: DiscipleshipGoal[];
  handleAddGoal: (title: string, description: string, targetDate: string, partnerName: string, proposedBy: 'mentor' | 'disciple') => void;
  handleToggleGoal: (id: string) => void;
  handleDeleteGoal: (id: string) => Promise<void>;

  // Reading Plans
  readingProgress: PlanProgress[];
  readingLogs: ReadingLog[];
  sharedDevocionais: SharedDevocional[];
  feedLoading: boolean;
  handleJoinPlan: (planId: string) => void;
  handleCompleteDay: (planId: string, day: number) => void;
  handleReportReadingTime: (bookId: string, bookName: string, chapter: number, seconds: number) => void;
  handleRefreshFeed: () => Promise<void>;

  // Streak
  streakCount: number;

  // Bible Highlights
  bibleHighlights: string[];
  handleToggleHighlight: (highlightKey: string) => void;

  // Bible Navigation
  prefillVerseRef: string;
  prefillVerseText: string;
  handleStartDevotionalFromBible: (verseRef: string, verseText: string) => void;
  clearPrefill: () => void;
  bibleTargetPassage: { bookId: string; chapter: number; verse?: number } | null;
  handleNavigateToPassage: (refString: string) => void;
  clearTargetPassage: () => void;
  bibleSubView: 'bible' | 'plans';
  setBibleSubView: (subView: 'bible' | 'plans') => void;
  handleNavigateToPlans: () => void;

  // Data Export/Import
  exportData: () => void;
  importData: (file: File) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation - derived from URL
  const activeTab = PATH_TO_TAB[location.pathname] || 'dashboard';
  const setActiveTab = useCallback((tab: string) => {
    const path = TAB_TO_PATH[tab] || '/';
    navigate(path);
  }, [navigate]);

  // Theme
  const [theme, setTheme] = useLocalStorage<'dark' | 'light'>('devocional-theme', 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  // Auth
  const { session, setSession, authLoading, handleLogout } = useAuth();

  // User Settings
  const [userName, setUserName] = useLocalStorage<string>('devocional-user-name', '');
  const [geminiApiKey, setGeminiApiKey] = useLocalStorage<string>('devocional-gemini-key', '');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Journal
  const { journalEntries, setJournalEntries, handleAddJournalEntry, handleDeleteJournalEntry } = useJournal(userName);

  // Meetings
  const { discipleshipMeetings, setDiscipleshipMeetings, handleAddMeeting, handleDeleteMeeting } = useMeetings();

  // Prayers
  const { prayers, setPrayers, handleAddPrayer, handleToggleAnswered, handleDeletePrayer } = usePrayers();

  // Goals
  const { goals, setGoals, handleAddGoal, handleToggleGoal, handleDeleteGoal } = useGoals();

  // Reading Plans
  const {
    readingProgress, setReadingProgress, readingLogs,
    sharedDevocionais, feedLoading,
    handleJoinPlan, handleCompleteDay, handleReportReadingTime, handleRefreshFeed,
  } = useReadingPlans();

  // Streak
  const streakCount = useStreak(journalEntries);

  // Bible Highlights
  const [bibleHighlights, setBibleHighlights] = useLocalStorage<string[]>('devocional-highlights', []);

  const handleToggleHighlight = (highlightKey: string) => {
    setBibleHighlights(prev =>
      prev.includes(highlightKey)
        ? prev.filter(k => k !== highlightKey)
        : [...prev, highlightKey]
    );
  };

  // Bible Navigation
  const [prefillVerseRef, setPrefillVerseRef] = useState('');
  const [prefillVerseText, setPrefillVerseText] = useState('');
  const [bibleTargetPassage, setBibleTargetPassage] = useState<{ bookId: string; chapter: number; verse?: number } | null>(null);
  const [bibleSubView, setBibleSubView] = useState<'bible' | 'plans'>('bible');

  const handleStartDevotionalFromBible = (verseRef: string, verseText: string) => {
    setPrefillVerseRef(verseRef);
    setPrefillVerseText(verseText);
    setActiveTab('journal');
  };

  const clearPrefill = () => {
    setPrefillVerseRef('');
    setPrefillVerseText('');
  };

  const parseVerseReference = (ref: string) => {
    const match = ref.match(/(.+)\s(\d+):(\d+)/);
    if (!match) return null;
    const bookName = match[1].trim();
    const chapter = parseInt(match[2]);
    const verse = parseInt(match[3]);
    const book = BIBLE_BOOKS.find(b => b.name.toLowerCase() === bookName.toLowerCase());
    if (!book) return null;
    return { bookId: book.id, chapter, verse };
  };

  const handleNavigateToPassage = (refString: string) => {
    const parsed = parseVerseReference(refString);
    if (parsed) setBibleTargetPassage(parsed);
    setActiveTab('bible');
  };

  const clearTargetPassage = () => setBibleTargetPassage(null);

  const handleNavigateToPlans = () => {
    setBibleSubView('plans');
    setActiveTab('bible');
  };

  // Data Export
  const exportData = () => {
    const data = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      journalEntries,
      discipleshipMeetings,
      bibleHighlights,
      prayers,
      goals,
      readingProgress,
      readingLogs,
      userName,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devocional-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Data Import
  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!data.version) {
          alert('Arquivo de backup invalido.');
          return;
        }
        if (data.journalEntries) setJournalEntries(data.journalEntries);
        if (data.discipleshipMeetings) setDiscipleshipMeetings(data.discipleshipMeetings);
        if (data.bibleHighlights) setBibleHighlights(data.bibleHighlights);
        if (data.prayers) setPrayers(data.prayers);
        if (data.goals) setGoals(data.goals);
        if (data.readingProgress) setReadingProgress(data.readingProgress);
        if (data.userName) setUserName(data.userName);
        alert('Dados restaurados com sucesso!');
      } catch {
        alert('Erro ao ler o arquivo de backup. Verifique se o arquivo esta correto.');
      }
    };
    reader.readAsText(file);
  };

  // Cloud Sync
  useCloudSync({
    journalEntries, setJournalEntries,
    discipleshipMeetings, setDiscipleshipMeetings,
    bibleHighlights, setBibleHighlights,
    prayers, setPrayers,
    goals, setGoals,
    readingProgress, setReadingProgress,
  });

  const value: AppContextType = {
    activeTab, setActiveTab,
    theme, toggleTheme,
    session, setSession, authLoading, handleLogout,
    userName, setUserName, geminiApiKey, setGeminiApiKey, showSettingsModal, setShowSettingsModal,
    journalEntries, handleAddJournalEntry, handleDeleteJournalEntry,
    discipleshipMeetings, handleAddMeeting, handleDeleteMeeting,
    prayers, handleAddPrayer, handleToggleAnswered, handleDeletePrayer,
    goals, handleAddGoal, handleToggleGoal, handleDeleteGoal,
    readingProgress, readingLogs, sharedDevocionais, feedLoading,
    handleJoinPlan, handleCompleteDay, handleReportReadingTime, handleRefreshFeed,
    streakCount,
    bibleHighlights, handleToggleHighlight,
    prefillVerseRef, prefillVerseText, handleStartDevotionalFromBible, clearPrefill,
    bibleTargetPassage, handleNavigateToPassage, clearTargetPassage,
    bibleSubView, setBibleSubView, handleNavigateToPlans,
    exportData, importData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
