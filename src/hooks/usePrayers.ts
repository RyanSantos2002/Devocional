import { useLocalStorage } from './useLocalStorage';
import { deletePrayerFromCloud } from '../services/supabase';
import type { PrayerRequest } from '../types';

function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
}

export function usePrayers() {
  const [prayers, setPrayers] = useLocalStorage<PrayerRequest[]>('devocional-prayers', []);

  const handleAddPrayer = (title: string, description: string) => {
    const newPrayer: PrayerRequest = {
      id: generateId(),
      title,
      description,
      date: new Date().toISOString().split('T')[0],
      isAnswered: false,
    };
    setPrayers(prev => [newPrayer, ...prev]);
  };

  const handleToggleAnswered = (id: string, answerText?: string) => {
    setPrayers(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          isAnswered: true,
          answerText,
          answerDate: new Date().toISOString().split('T')[0],
        };
      }
      return p;
    }));
  };

  const handleDeletePrayer = async (id: string) => {
    if (window.confirm('Tem certeza de que deseja excluir este clamor?')) {
      setPrayers(prev => prev.filter(p => p.id !== id));
      await deletePrayerFromCloud(id);
    }
  };

  return {
    prayers,
    setPrayers,
    handleAddPrayer,
    handleToggleAnswered,
    handleDeletePrayer,
  };
}
