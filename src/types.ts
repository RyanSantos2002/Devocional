export interface JournalEntry {
  id: string;
  date: string;
  bookId: string;
  bookName: string;
  chapter: number;
  reflection: string;
  prayer: string;
  gratitude: string;
  verseRef?: string;
  verseText?: string;
}

export interface Meeting {
  id: string;
  date: string;
  partnerName: string;
  role: 'mentor' | 'disciple';
  notes: string;
  commitment: string;
}

export interface ReadingLog {
  date: string;
  bookId: string;
  bookName: string;
  chapter: number;
  seconds: number;
}

export interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  date: string;
  isAnswered: boolean;
  answerText?: string;
  answerDate?: string;
}

export interface DiscipleshipGoal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  isCompleted: boolean;
  partnerName: string;
  proposedBy: 'mentor' | 'disciple';
}

export interface PlanProgress {
  planId: string;
  completedDays: number[];
}

export interface SharedDevocional {
  id: string;
  user_id: string;
  user_name: string;
  verse_ref?: string;
  verse_text?: string;
  reflection: string;
  date: string;
  created_at: string;
}
