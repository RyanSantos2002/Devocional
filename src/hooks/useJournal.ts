import { useLocalStorage } from './useLocalStorage';
import { publishDevocionalToFeed } from '../services/supabase';
import type { JournalEntry } from '../types';

function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
}

export function useJournal(userName: string) {
  const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>('devocional-journal', []);

  const handleAddJournalEntry = async (newEntryData: Omit<JournalEntry, 'id' | 'date'> & { shareWithDiscipleship?: boolean }) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newEntry: JournalEntry = {
      ...newEntryData,
      id: generateId(),
      date: todayStr
    };
    setJournalEntries(prev => [newEntry, ...prev]);

    if (newEntryData.shareWithDiscipleship) {
      await publishDevocionalToFeed(
        newEntryData.verseRef || '',
        newEntryData.verseText || '',
        newEntryData.reflection,
        userName || 'Visitante'
      );
      alert('Devocional compartilhado com sucesso no Mural de Edificação!');
    }
  };

  const handleDeleteJournalEntry = (id: string) => {
    if (window.confirm('Tem certeza de que deseja excluir este devocional do seu diário?')) {
      setJournalEntries(prev => prev.filter(entry => entry.id !== id));
    }
  };

  return {
    journalEntries,
    setJournalEntries,
    handleAddJournalEntry,
    handleDeleteJournalEntry,
  };
}
