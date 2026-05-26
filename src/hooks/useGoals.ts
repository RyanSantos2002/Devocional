import { useLocalStorage } from './useLocalStorage';
import { deleteGoalFromCloud } from '../services/supabase';
import type { DiscipleshipGoal } from '../types';

function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
}

export function useGoals() {
  const [goals, setGoals] = useLocalStorage<DiscipleshipGoal[]>('devocional-goals', []);

  const handleAddGoal = (title: string, description: string, targetDate: string, partnerName: string, proposedBy: 'mentor' | 'disciple') => {
    const newGoal: DiscipleshipGoal = {
      id: generateId(),
      title,
      description,
      targetDate,
      isCompleted: false,
      partnerName,
      proposedBy,
    };
    setGoals(prev => [newGoal, ...prev]);
  };

  const handleToggleGoal = (id: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, isCompleted: !g.isCompleted } : g));
  };

  const handleDeleteGoal = async (id: string) => {
    if (window.confirm('Excluir esta meta definitivamente?')) {
      setGoals(prev => prev.filter(g => g.id !== id));
      await deleteGoalFromCloud(id);
    }
  };

  return {
    goals,
    setGoals,
    handleAddGoal,
    handleToggleGoal,
    handleDeleteGoal,
  };
}
