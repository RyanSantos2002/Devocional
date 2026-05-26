import { useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { fetchSharedFeed } from '../services/supabase';
import type { PlanProgress, ReadingLog, SharedDevocional } from '../types';

export function useReadingPlans() {
  const [readingProgress, setReadingProgress] = useLocalStorage<PlanProgress[]>('devocional-reading-progress', []);
  const [readingLogs, setReadingLogs] = useLocalStorage<ReadingLog[]>('devocional-reading-logs', []);
  const [sharedDevocionais, setSharedDevocionais] = useState<SharedDevocional[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);

  const handleJoinPlan = (planId: string) => {
    if (readingProgress.some(p => p.planId === planId)) return;
    const newProg: PlanProgress = { planId, completedDays: [] };
    setReadingProgress(prev => [...prev, newProg]);
    alert('Você iniciou um novo plano de leitura bíblica! Acompanhe-o no Leitor.');
  };

  const handleCompleteDay = (planId: string, day: number) => {
    setReadingProgress(prev => prev.map(p => {
      if (p.planId === planId) {
        const days = p.completedDays.includes(day)
          ? p.completedDays.filter(d => d !== day)
          : [...p.completedDays, day];
        return { ...p, completedDays: days };
      }
      return p;
    }));
  };

  const handleReportReadingTime = (bookId: string, bookName: string, chapter: number, seconds: number) => {
    const todayStr = new Date().toISOString().split('T')[0];

    setReadingLogs(prev => {
      const logs = [...prev];
      const existingIndex = logs.findIndex(log =>
        log.date === todayStr &&
        log.bookId === bookId &&
        log.chapter === chapter
      );

      if (existingIndex >= 0) {
        logs[existingIndex].seconds += seconds;
      } else {
        logs.push({ date: todayStr, bookId, bookName, chapter, seconds });
      }

      return logs;
    });
  };

  const handleRefreshFeed = async () => {
    setFeedLoading(true);
    const posts = await fetchSharedFeed();
    setSharedDevocionais(posts);
    setFeedLoading(false);
  };

  return {
    readingProgress,
    setReadingProgress,
    readingLogs,
    sharedDevocionais,
    feedLoading,
    handleJoinPlan,
    handleCompleteDay,
    handleReportReadingTime,
    handleRefreshFeed,
  };
}
