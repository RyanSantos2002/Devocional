import { useLocalStorage } from './useLocalStorage';
import type { Meeting } from '../types';

function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
}

export function useMeetings() {
  const [discipleshipMeetings, setDiscipleshipMeetings] = useLocalStorage<Meeting[]>('devocional-meetings', []);

  const handleAddMeeting = (newMeetingData: Omit<Meeting, 'id'>) => {
    const newMeeting: Meeting = {
      ...newMeetingData,
      id: generateId(),
    };
    setDiscipleshipMeetings(prev => [newMeeting, ...prev]);
  };

  const handleDeleteMeeting = (id: string) => {
    if (window.confirm('Excluir este registro de encontro de discipulado?')) {
      setDiscipleshipMeetings(prev => prev.filter(m => m.id !== id));
    }
  };

  return {
    discipleshipMeetings,
    setDiscipleshipMeetings,
    handleAddMeeting,
    handleDeleteMeeting,
  };
}
