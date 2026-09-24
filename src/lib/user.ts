import { supabase } from './db';

export interface UserPreferences {
  user_id: string;
  topics: string[];
  regions: string[];
  watchlist: string[];
  last_visit: string;
  last_refresh: string;
}

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }
  return data as UserPreferences;
}

export async function updateUserVisit(userId: string) {
  const now = new Date().toISOString();
  
  // Try to update, if fails, might need to insert (upsert)
  await supabase
    .from('user_preferences')
    .upsert({ 
      user_id: userId, 
      last_visit: now 
    }, { onConflict: 'user_id' });
}

export async function getEventsSinceLastVisit(userId: string) {
  const prefs = await getUserPreferences(userId);
  if (!prefs || !prefs.last_visit) return 0;

  const { count } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .gt('first_seen', prefs.last_visit);

  return count || 0;
}
