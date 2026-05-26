import { createClient } from '@supabase/supabase-js';

// Load Supabase environment keys
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Verify if the keys are set and are not default placeholders
const isConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('substitua-com-sua-url') && 
  !supabaseAnonKey.includes('sua-anon-key-longa-aqui');

// Initialize client gracefully (if not configured, we write a safe wrapper that returns standard promises to prevent crashes)
export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!isConfigured) {
  console.warn("⚠️ Supabase não está configurado ou está usando valores padrão de placeholder no arquivo .env. O aplicativo continuará funcionando em modo 100% local/offline.");
}

// ----------------------------------------------------
// BIBLE CHAPTER CACHE METHODS (Proxy Cache Pattern)
// ----------------------------------------------------

export async function fetchBibleChapterFromSupabase(book: string, chapter: number, version: string) {
  if (!supabase) return null;

  try {
    const id = `${version}-${book}-${chapter}`.toLowerCase();
    const { data, error } = await supabase
      .from('capitulos_biblia')
      .select('verses')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return data.verses; // Returns standard array of { number: X, text: Y }
  } catch (e) {
    console.error('Failed to fetch Bible chapter from Supabase cache:', e);
    return null;
  }
}

export async function saveBibleChapterToSupabase(book: string, chapter: number, version: string, verses: any[]) {
  if (!supabase) return;

  try {
    const id = `${version}-${book}-${chapter}`.toLowerCase();
    
    // Save/Upsert
    await supabase
      .from('capitulos_biblia')
      .upsert({
        id,
        version,
        book,
        chapter,
        verses
      }, { onConflict: 'id' });
      
    console.log(`☁️ Capítulo ${book} ${chapter} (${version.toUpperCase()}) salvo/cacheado no Supabase.`);
  } catch (e) {
    console.error('Failed to save Bible chapter to Supabase cache:', e);
  }
}

// ----------------------------------------------------
// HYBRID CLOUD SYNC METHODS (Offline-First Sync)
// ----------------------------------------------------

import type { JournalEntry, Meeting, PrayerRequest, DiscipleshipGoal, PlanProgress, SharedDevocional } from '../types';

// Sync Devotional Notes: Local -> Cloud (Upsert all new items)
export async function syncDevocionaisCloud(localEntries: JournalEntry[]): Promise<JournalEntry[]> {
  if (!supabase || localEntries.length === 0) return localEntries;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return localEntries;

    // 1. Upload local entries
    const formattedEntries = localEntries.map(entry => ({
      id: entry.id,
      date: entry.date,
      verse_ref: entry.verseRef || '',
      verse_text: entry.verseText || '',
      reflection: entry.reflection,
      prayer: entry.prayer || '',
      gratitude: entry.gratitude || '',
      user_id: user.id
    }));

    const { error: uploadError } = await supabase
      .from('diario_devocional')
      .upsert(formattedEntries, { onConflict: 'id' });

    if (uploadError) {
      console.warn("Cloud sync devocionais upload failed:", uploadError.message);
    }

    // 2. Download any entries on the cloud that we might have missed
    const { data: cloudEntries, error: downloadError } = await supabase
      .from('diario_devocional')
      .select('*')
      .order('date', { ascending: false });

    if (downloadError || !cloudEntries) {
      return localEntries;
    }

    // Map cloud schema back to local state model
    const syncedEntries: JournalEntry[] = cloudEntries.map((cloud: any) => ({
      id: cloud.id,
      date: cloud.date,
      bookId: '',
      bookName: cloud.verse_ref || 'Geral',
      chapter: 1,
      reflection: cloud.reflection,
      prayer: cloud.prayer,
      gratitude: cloud.gratitude,
      verseRef: cloud.verse_ref,
      verseText: cloud.verse_text
    }));

    return syncedEntries;
  } catch (e) {
    console.error("Cloud sync devocionais error:", e);
    return localEntries;
  }
}

// Sync Discipleship Meetings: Local -> Cloud
export async function syncMeetingsCloud(localMeetings: Meeting[]): Promise<Meeting[]> {
  if (!supabase || localMeetings.length === 0) return localMeetings;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return localMeetings;

    const formattedMeetings = localMeetings.map(m => ({
      id: m.id,
      date: m.date,
      partner_name: m.partnerName,
      role: m.role,
      notes: m.notes,
      commitment: m.commitment || '',
      user_id: user.id
    }));

    const { error: uploadError } = await supabase
      .from('encontros_discipulado')
      .upsert(formattedMeetings, { onConflict: 'id' });

    if (uploadError) {
      console.warn("Cloud sync meetings upload failed:", uploadError.message);
    }

    const { data: cloudMeetings, error: downloadError } = await supabase
      .from('encontros_discipulado')
      .select('*')
      .order('date', { ascending: false });

    if (downloadError || !cloudMeetings) {
      return localMeetings;
    }

    const syncedMeetings: Meeting[] = cloudMeetings.map((c: any) => ({
      id: c.id,
      date: c.date,
      partnerName: c.partner_name,
      role: c.role as 'mentor' | 'disciple',
      notes: c.notes,
      commitment: c.commitment
    }));

    return syncedMeetings;
  } catch (e) {
    console.error("Cloud sync meetings error:", e);
    return localMeetings;
  }
}

// Sync Bible Highlights
export async function syncHighlightsCloud(localHighlights: string[]): Promise<string[]> {
  if (!supabase) return localHighlights;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return localHighlights;

    // Sync is simple: upload all local highlights
    if (localHighlights.length > 0) {
      const formatted = localHighlights.map(key => ({
        highlight_key: key,
        user_id: user.id
      }));

      await supabase
        .from('destaques_biblia')
        .upsert(formatted, { onConflict: 'user_id,highlight_key' });
    }

    // Pull highlights
    const { data: cloudHighlights, error } = await supabase
      .from('destaques_biblia')
      .select('highlight_key');

    if (error || !cloudHighlights) {
      return localHighlights;
    }

    const merged = Array.from(new Set([
      ...localHighlights,
      ...cloudHighlights.map((c: any) => c.highlight_key)
    ]));

    return merged;
  } catch (e) {
    console.error("Cloud sync highlights error:", e);
    return localHighlights;
  }
}

// Types are now imported from ../types and re-exported for backwards compatibility
export type { PrayerRequest, DiscipleshipGoal, PlanProgress, SharedDevocional } from '../types';

// ----------------------------------------------------
// PRAYER REQUESTS SYNC METHODS
// ----------------------------------------------------

export async function syncPrayersCloud(localPrayers: PrayerRequest[]): Promise<PrayerRequest[]> {
  if (!supabase || localPrayers.length === 0) return localPrayers;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return localPrayers;

    const formatted = localPrayers.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      date: p.date,
      is_answered: p.isAnswered,
      answer_text: p.answerText || '',
      answer_date: p.answerDate || null,
      user_id: user.id
    }));

    const { error: uploadError } = await supabase
      .from('oracoes')
      .upsert(formatted, { onConflict: 'id' });

    if (uploadError) {
      console.warn("Cloud sync prayers upload failed:", uploadError.message);
    }

    const { data: cloudPrayers, error: downloadError } = await supabase
      .from('oracoes')
      .select('*')
      .order('date', { ascending: false });

    if (downloadError || !cloudPrayers) {
      return localPrayers;
    }

    const synced: PrayerRequest[] = cloudPrayers.map((c: any) => ({
      id: c.id,
      title: c.title,
      description: c.description || '',
      date: c.date,
      isAnswered: c.is_answered,
      answerText: c.answer_text || undefined,
      answerDate: c.answer_date || undefined
    }));

    return synced;
  } catch (e) {
    console.error("Cloud sync prayers error:", e);
    return localPrayers;
  }
}

export async function deletePrayerFromCloud(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('oracoes')
      .delete()
      .eq('id', id);
    return !error;
  } catch (e) {
    console.error("Failed to delete prayer from cloud:", e);
    return false;
  }
}

// ----------------------------------------------------
// DISCIPLESHIP GOALS SYNC METHODS
// ----------------------------------------------------

export async function syncGoalsCloud(localGoals: DiscipleshipGoal[]): Promise<DiscipleshipGoal[]> {
  if (!supabase || localGoals.length === 0) return localGoals;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return localGoals;

    const formatted = localGoals.map(g => ({
      id: g.id,
      title: g.title,
      description: g.description,
      target_date: g.targetDate,
      is_completed: g.isCompleted,
      partner_name: g.partnerName,
      proposed_by: g.proposedBy,
      user_id: user.id
    }));

    const { error: uploadError } = await supabase
      .from('metas_discipulado')
      .upsert(formatted, { onConflict: 'id' });

    if (uploadError) {
      console.warn("Cloud sync goals upload failed:", uploadError.message);
    }

    const { data: cloudGoals, error: downloadError } = await supabase
      .from('metas_discipulado')
      .select('*')
      .order('created_at', { ascending: false });

    if (downloadError || !cloudGoals) {
      return localGoals;
    }

    const synced: DiscipleshipGoal[] = cloudGoals.map((c: any) => ({
      id: c.id,
      title: c.title,
      description: c.description || '',
      targetDate: c.target_date,
      isCompleted: c.is_completed,
      partnerName: c.partner_name,
      proposedBy: c.proposed_by as 'mentor' | 'disciple'
    }));

    return synced;
  } catch (e) {
    console.error("Cloud sync goals error:", e);
    return localGoals;
  }
}

export async function deleteGoalFromCloud(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('metas_discipulado')
      .delete()
      .eq('id', id);
    return !error;
  } catch (e) {
    console.error("Failed to delete goal from cloud:", e);
    return false;
  }
}

// ----------------------------------------------------
// READING PLANS SYNC METHODS
// ----------------------------------------------------

export async function syncReadingProgressCloud(localProgress: PlanProgress[]): Promise<PlanProgress[]> {
  if (!supabase || localProgress.length === 0) return localProgress;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return localProgress;

    const { data: cloudProgress, error } = await supabase
      .from('progresso_leitura')
      .select('*');

    if (error || !cloudProgress) return localProgress;

    for (const lp of localProgress) {
      const cloudItem = cloudProgress.find((c: any) => c.plan_id === lp.planId);
      if (cloudItem) {
        if (JSON.stringify(cloudItem.completed_days) !== JSON.stringify(lp.completedDays)) {
          await supabase
            .from('progresso_leitura')
            .update({ completed_days: lp.completedDays, updated_at: new Date().toISOString() })
            .eq('id', cloudItem.id);
        }
      } else {
        await supabase
          .from('progresso_leitura')
          .insert({ plan_id: lp.planId, completed_days: lp.completedDays, user_id: user.id });
      }
    }

    const { data: latestCloudProgress } = await supabase
      .from('progresso_leitura')
      .select('*');

    if (!latestCloudProgress) return localProgress;

    return latestCloudProgress.map((c: any) => ({
      planId: c.plan_id,
      completedDays: c.completed_days
    }));

  } catch (e) {
    console.error("Cloud sync reading progress error:", e);
    return localProgress;
  }
}

// ----------------------------------------------------
// PUBLIC SHARED DEVOCIONAIS FEED METHODS
// ----------------------------------------------------

export async function publishDevocionalToFeed(
  verseRef: string,
  verseText: string,
  reflection: string,
  userName: string
): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('devocionais_compartilhados')
      .insert({
        verse_ref: verseRef,
        verse_text: verseText,
        reflection: reflection,
        user_name: userName || 'Visitante',
        user_id: user.id
      });

    return !error;
  } catch (e) {
    console.error("Failed to publish devotional to feed:", e);
    return false;
  }
}

export async function fetchSharedFeed(): Promise<SharedDevocional[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('devocionais_compartilhados')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error || !data) return [];
    return data;
  } catch (e) {
    console.error("Failed to fetch shared feed:", e);
    return [];
  }
}

