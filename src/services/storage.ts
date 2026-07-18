import AsyncStorage from '@react-native-async-storage/async-storage';

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

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  dialect: 'north',
  speed: 0.8,
};

/**
 * Saves application configurations (theme, dialect, reading speed) to AsyncStorage.
 */
export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings to storage:', error);
  }
}

/**
 * Loads application configurations. Falls back to default settings if empty.
 */
export async function loadSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Failed to load settings from storage:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Saves custom parent-typed reading passages list.
 */
export async function saveCustomPassages(passages: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(PASSAGES_KEY, JSON.stringify(passages));
  } catch (error) {
    console.error('Failed to save passages to storage:', error);
  }
}

/**
 * Loads custom parent-typed reading passages list.
 */
export async function loadCustomPassages(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(PASSAGES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load passages from storage:', error);
    return [];
  }
}

/**
 * Saves a new reading session assessment log to the history list.
 */
export async function saveSessionLog(log: Omit<SessionLog, 'id'>): Promise<SessionLog[]> {
  try {
    const logs = await loadSessionLogs();
    const newLog: SessionLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    // Unshift to place latest logs at the top
    const updatedLogs = [newLog, ...logs];
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedLogs));
    return updatedLogs;
  } catch (error) {
    console.error('Failed to save session log to storage:', error);
    return [];
  }
}

/**
 * Loads the list of historical session logs.
 */
export async function loadSessionLogs(): Promise<SessionLog[]> {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load session logs from storage:', error);
    return [];
  }
}

/**
 * Clears all historical logs.
 */
export async function clearSessionLogs(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear session logs:', error);
  }
}
