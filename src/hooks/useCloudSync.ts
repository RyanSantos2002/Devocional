import { useEffect, useRef, useCallback } from 'react';
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
  // Store state in refs so the sync function always reads the latest values
  // without causing useEffect re-runs
  const stateRef = useRef(state);
  stateRef.current = state;

  const performSync = useCallback(async () => {
    const s = stateRef.current;
    try {
      if (s.journalEntries.length > 0) {
        const synced = await syncDevocionaisCloud(s.journalEntries);
        if (JSON.stringify(synced) !== JSON.stringify(s.journalEntries)) {
          s.setJournalEntries(synced);
        }
      }

      if (s.discipleshipMeetings.length > 0) {
        const synced = await syncMeetingsCloud(s.discipleshipMeetings);
        if (JSON.stringify(synced) !== JSON.stringify(s.discipleshipMeetings)) {
          s.setDiscipleshipMeetings(synced);
        }
      }

      const syncedHighlights = await syncHighlightsCloud(s.bibleHighlights);
      if (JSON.stringify(syncedHighlights) !== JSON.stringify(s.bibleHighlights)) {
        s.setBibleHighlights(syncedHighlights);
      }

      if (s.prayers.length > 0) {
        const synced = await syncPrayersCloud(s.prayers);
        if (JSON.stringify(synced) !== JSON.stringify(s.prayers)) {
          s.setPrayers(synced);
        }
      }

      if (s.goals.length > 0) {
        const synced = await syncGoalsCloud(s.goals);
        if (JSON.stringify(synced) !== JSON.stringify(s.goals)) {
          s.setGoals(synced);
        }
      }

      if (s.readingProgress.length > 0) {
        const synced = await syncReadingProgressCloud(s.readingProgress);
        if (JSON.stringify(synced) !== JSON.stringify(s.readingProgress)) {
          s.setReadingProgress(synced);
        }
      }
    } catch (err) {
      console.warn("Cloud synchronization failed:", err);
    }
  }, []);

  // Single stable effect - interval and online listener never re-create
  useEffect(() => {
    performSync();

    window.addEventListener('online', performSync);
    const interval = setInterval(performSync, 30000);

    return () => {
      window.removeEventListener('online', performSync);
      clearInterval(interval);
    };
  }, [performSync]);
}
