import { useEffect, useRef } from 'react';
import {
  syncDevocionaisCloud,
  syncMeetingsCloud,
  syncHighlightsCloud,
  syncPrayersCloud,
  syncGoalsCloud,
  syncReadingProgressCloud,
} from '../services/supabase';
import type { JournalEntry, Meeting, PrayerRequest, DiscipleshipGoal, PlanProgress } from '../types';

interface SyncableState {
  journalEntries: JournalEntry[];
  setJournalEntries: (value: JournalEntry[] | ((val: JournalEntry[]) => JournalEntry[])) => void;
  discipleshipMeetings: Meeting[];
  setDiscipleshipMeetings: (value: Meeting[] | ((val: Meeting[]) => Meeting[])) => void;
  bibleHighlights: string[];
  setBibleHighlights: (value: string[] | ((val: string[]) => string[])) => void;
  prayers: PrayerRequest[];
  setPrayers: (value: PrayerRequest[] | ((val: PrayerRequest[]) => PrayerRequest[])) => void;
  goals: DiscipleshipGoal[];
  setGoals: (value: DiscipleshipGoal[] | ((val: DiscipleshipGoal[]) => DiscipleshipGoal[])) => void;
  readingProgress: PlanProgress[];
  setReadingProgress: (value: PlanProgress[] | ((val: PlanProgress[]) => PlanProgress[])) => void;
}

export function useCloudSync(state: SyncableState) {
  const {
    journalEntries, setJournalEntries,
    discipleshipMeetings, setDiscipleshipMeetings,
    bibleHighlights, setBibleHighlights,
    prayers, setPrayers,
    goals, setGoals,
    readingProgress, setReadingProgress,
  } = state;

  // Track previous values to detect changes (isDirty pattern)
  const prevRef = useRef<string>('');

  useEffect(() => {
    let active = true;

    const currentHash = JSON.stringify({
      j: journalEntries.length,
      m: discipleshipMeetings.length,
      h: bibleHighlights.length,
      p: prayers.length,
      g: goals.length,
      r: readingProgress.length,
    });

    const isDirty = currentHash !== prevRef.current;

    async function performSync() {
      try {
        if (journalEntries.length > 0) {
          const synced = await syncDevocionaisCloud(journalEntries);
          if (active && JSON.stringify(synced) !== JSON.stringify(journalEntries)) {
            setJournalEntries(synced);
          }
        }

        if (discipleshipMeetings.length > 0) {
          const synced = await syncMeetingsCloud(discipleshipMeetings);
          if (active && JSON.stringify(synced) !== JSON.stringify(discipleshipMeetings)) {
            setDiscipleshipMeetings(synced);
          }
        }

        const syncedHighlights = await syncHighlightsCloud(bibleHighlights);
        if (active && JSON.stringify(syncedHighlights) !== JSON.stringify(bibleHighlights)) {
          setBibleHighlights(syncedHighlights);
        }

        if (prayers.length > 0) {
          const synced = await syncPrayersCloud(prayers);
          if (active && JSON.stringify(synced) !== JSON.stringify(prayers)) {
            setPrayers(synced);
          }
        }

        if (goals.length > 0) {
          const synced = await syncGoalsCloud(goals);
          if (active && JSON.stringify(synced) !== JSON.stringify(goals)) {
            setGoals(synced);
          }
        }

        if (readingProgress.length > 0) {
          const synced = await syncReadingProgressCloud(readingProgress);
          if (active && JSON.stringify(synced) !== JSON.stringify(readingProgress)) {
            setReadingProgress(synced);
          }
        }

        // Update hash after successful sync
        prevRef.current = currentHash;
      } catch (err) {
        console.warn("Cloud synchronization failed:", err);
      }
    }

    // Only sync when data actually changed or on initial load
    if (isDirty || prevRef.current === '') {
      performSync();
    }

    window.addEventListener('online', performSync);
    const interval = setInterval(performSync, 30000);

    return () => {
      active = false;
      window.removeEventListener('online', performSync);
      clearInterval(interval);
    };
  }, [journalEntries, discipleshipMeetings, bibleHighlights, prayers, goals, readingProgress]);
}
