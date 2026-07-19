import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';

export interface AppSettings {
  theme: 'light' | 'dark';
  dialect: 'north' | 'south' | 'central';
  speed: number;
}

export interface SessionLog {
  id: string;
  date: string;
  text: string;
  score: number;
  missedWords: string[];
}

const SETTINGS_KEY = 'tiengviet_doc_settings';
const PASSAGES_KEY = 'tiengviet_doc_passages';
const HISTORY_KEY = 'tiengviet_doc_history';
const ACHIEVEMENTS_KEY = 'tiengviet_doc_achievements';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  dialect: 'north',
  speed: 0.8,
};

/**
 * Saves application configurations (theme, dialect, reading speed) to AsyncStorage and Supabase if authenticated.
 */
export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase
        .from('settings')
        .upsert({
          user_id: session.user.id,
          theme: settings.theme,
          dialect: settings.dialect,
          speed: settings.speed,
        });
    }
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

/**
 * Loads application configurations. Falls back to remote database, then local AsyncStorage, then default settings.
 */
export async function loadSettings(): Promise<AppSettings> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data, error } = await supabase
        .from('settings')
        .select('theme, dialect, speed')
        .eq('user_id', session.user.id)
        .single();
      
      if (data && !error) {
        const settings: AppSettings = {
          theme: data.theme as 'light' | 'dark',
          dialect: data.dialect as 'north' | 'south' | 'central',
          speed: Number(data.speed),
        };
        // Cache locally
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        return settings;
      }
    }
    
    const localData = await AsyncStorage.getItem(SETTINGS_KEY);
    return localData ? JSON.parse(localData) : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Saves custom parent-typed reading passages list to AsyncStorage and Supabase if authenticated.
 */
export async function saveCustomPassages(passages: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(PASSAGES_KEY, JSON.stringify(passages));
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // Clear remote passages and re-insert to sync list exactly
      await supabase
        .from('custom_passages')
        .delete()
        .eq('user_id', session.user.id);
        
      if (passages.length > 0) {
        const insertData = passages.map(text => ({
          user_id: session.user.id,
          text,
        }));
        await supabase
          .from('custom_passages')
          .insert(insertData);
      }
    }
  } catch (error) {
    console.error('Failed to save passages:', error);
  }
}

/**
 * Loads custom parent-typed reading passages list. Syncs from Supabase if authenticated.
 */
export async function loadCustomPassages(): Promise<string[]> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data, error } = await supabase
        .from('custom_passages')
        .select('text')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
        
      if (data && !error) {
        const list = data.map((row: any) => row.text);
        // Cache locally
        await AsyncStorage.setItem(PASSAGES_KEY, JSON.stringify(list));
        return list;
      }
    }
    
    const localData = await AsyncStorage.getItem(PASSAGES_KEY);
    return localData ? JSON.parse(localData) : [];
  } catch (error) {
    console.error('Failed to load passages:', error);
    return [];
  }
}

/**
 * Saves a new reading session assessment log to the history list. Syncs to Supabase if authenticated.
 */
export async function saveSessionLog(log: Omit<SessionLog, 'id'>): Promise<SessionLog[]> {
  try {
    const logs = await loadSessionLogs();
    const newLog: SessionLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data, error } = await supabase
        .from('session_logs')
        .insert({
          user_id: session.user.id,
          date: newLog.date,
          text: newLog.text,
          score: newLog.score,
          missed_words: newLog.missedWords,
        })
        .select()
        .single();
        
      if (data && !error) {
        newLog.id = data.id; // Map to remote UUID
      }
    }
    
    // Unshift to place latest logs at the top
    const updatedLogs = [newLog, ...logs];
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedLogs));
    return updatedLogs;
  } catch (error) {
    console.error('Failed to save session log:', error);
    return [];
  }
}

/**
 * Loads the list of historical session logs. Syncs from Supabase if authenticated.
 */
export async function loadSessionLogs(): Promise<SessionLog[]> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data, error } = await supabase
        .from('session_logs')
        .select('id, date, text, score, missed_words')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false });
        
      if (data && !error) {
        const list: SessionLog[] = data.map((row: any) => ({
          id: row.id,
          date: row.date,
          text: row.text,
          score: row.score,
          missedWords: row.missed_words || [],
        }));
        // Cache locally
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(list));
        return list;
      }
    }
    
    const localData = await AsyncStorage.getItem(HISTORY_KEY);
    return localData ? JSON.parse(localData) : [];
  } catch (error) {
    console.error('Failed to load session logs:', error);
    return [];
  }
}

/**
 * Clears all historical logs from AsyncStorage and Supabase if authenticated.
 */
export async function clearSessionLogs(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase
        .from('session_logs')
        .delete()
        .eq('user_id', session.user.id);
    }
  } catch (error) {
    console.error('Failed to clear session logs:', error);
  }
}

const SAMPLE_STORY_TEXTS = [
  'Con mèo nhà em lông màu trắng muốt. Nó rất ngoan và thích bắt chuột.',
  'Buổi sáng quê em gió mát rượi. Ông mặt trời đỏ rực nhô lên sau lũy tre làng.',
  'Chú cá vàng bơi lội tung tăng trong bể nước. Vảy cá vàng óng lấp lánh như dát vàng.'
];

/**
 * Gets the list of currently unlocked achievement IDs. Syncs from Supabase if authenticated.
 */
export async function getUnlockedAchievements(): Promise<string[]> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data, error } = await supabase
        .from('unlocked_achievements')
        .select('badge_id')
        .eq('user_id', session.user.id);
        
      if (data && !error) {
        const list = data.map((row: any) => row.badge_id);
        // Cache locally
        await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(list));
        return list;
      }
    }
    
    const localData = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
    return localData ? JSON.parse(localData) : [];
  } catch (error) {
    console.error('Failed to load achievements:', error);
    return [];
  }
}

/**
 * Saves the list of unlocked achievement IDs to AsyncStorage and Supabase if authenticated.
 */
export async function saveUnlockedAchievements(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(ids));
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // Clear remote achievements first to prevent duplicate keys
      await supabase
        .from('unlocked_achievements')
        .delete()
        .eq('user_id', session.user.id);
        
      if (ids.length > 0) {
        const insertData = ids.map(badge_id => ({
          user_id: session.user.id,
          badge_id,
        }));
        await supabase
          .from('unlocked_achievements')
          .insert(insertData);
      }
    }
  } catch (error) {
    console.error('Failed to save achievements:', error);
  }
}

/**
 * Clears all unlocked achievements from AsyncStorage and Supabase if authenticated.
 */
export async function clearUnlockedAchievements(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ACHIEVEMENTS_KEY);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase
        .from('unlocked_achievements')
        .delete()
        .eq('user_id', session.user.id);
    }
  } catch (error) {
    console.error('Failed to clear achievements:', error);
  }
}

/**
 * Analyzes session logs to see if new achievements are unlocked.
 * Returns the list of newly unlocked achievement IDs.
 */
export async function checkAndUnlockAchievements(logs: SessionLog[]): Promise<string[]> {
  const alreadyUnlocked = await getUnlockedAchievements();
  const newUnlocked: string[] = [];

  // 1. Chăm Chỉ: Hoàn thành 5 lượt tập đọc bài
  if (logs.length >= 5 && !alreadyUnlocked.includes('badge_cham_chi')) {
    newUnlocked.push('badge_cham_chi');
  }

  // 2. Phát Âm Chuẩn: Đạt điểm chính xác 100% trong 3 bài đọc
  const perfectCount = logs.filter(log => log.score === 100).length;
  if (perfectCount >= 3 && !alreadyUnlocked.includes('badge_phat_am_chuan')) {
    newUnlocked.push('badge_phat_am_chuan');
  }

  // 3. Vua Đánh Vần: Đọc đúng cả 3 bài mẫu của ứng dụng (score >= 80)
  const readSamples = SAMPLE_STORY_TEXTS.filter(sampleText => {
    return logs.some(log => log.text.trim() === sampleText.trim() && log.score >= 80);
  });
  if (readSamples.length >= 3 && !alreadyUnlocked.includes('badge_vua_danh_van')) {
    newUnlocked.push('badge_vua_danh_van');
  }

  if (newUnlocked.length > 0) {
    const updatedList = [...alreadyUnlocked, ...newUnlocked];
    await saveUnlockedAchievements(updatedList);
  }

  return newUnlocked;
}
