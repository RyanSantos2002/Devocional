import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { JournalEntry } from '../types';

export function useStreak(journalEntries: JournalEntry[]) {
  const [streakCount, setStreakCount] = useLocalStorage<number>('devocional-streak', 0);

  useEffect(() => {
    if (journalEntries.length === 0) {
      setStreakCount(0);
      return;
    }

    const sortedDates = [...journalEntries]
      .map(entry => entry.date)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (sortedDates.length === 0) {
      setStreakCount(0);
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const hasToday = sortedDates[0] === todayStr;
    const hasYesterday = sortedDates[0] === yesterdayStr || (sortedDates.length > 1 && sortedDates[1] === yesterdayStr);

    if (!hasToday && !hasYesterday) {
      setStreakCount(0);
      return;
    }

    let currentStreak = 1;
    let checkDate = new Date(sortedDates[0]);

    for (let i = 1; i < sortedDates.length; i++) {
      const entryDate = new Date(sortedDates[i]);
      const diffTime = Math.abs(checkDate.getTime() - entryDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
        checkDate = entryDate;
      } else if (diffDays > 1) {
        break;
      }
    }

    setStreakCount(currentStreak);
  }, [journalEntries]);

  return streakCount;
}
