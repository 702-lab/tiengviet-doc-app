import { vi, describe, it, expect, beforeEach } from 'vitest';
import { 
  saveSettings, 
  loadSettings, 
  saveCustomPassages, 
  loadCustomPassages, 
  saveSessionLog, 
  loadSessionLogs,
  clearSessionLogs,
  AppSettings,
  SessionLog
} from './storage';

let mockStorage: { [key: string]: string } = {};

vi.mock('@react-native-async-storage/async-storage', () => {
  return {
    default: {
      setItem: vi.fn(async (key: string, value: string) => {
        mockStorage[key] = value;
      }),
      getItem: vi.fn(async (key: string) => {
        return mockStorage[key] || null;
      }),
      removeItem: vi.fn(async (key: string) => {
        delete mockStorage[key];
      }),
      clear: vi.fn(async () => {
        mockStorage = {};
      }),
    },
  };
});

describe('Storage Service Unit Tests', () => {
  beforeEach(() => {
    mockStorage = {};
    vi.clearAllMocks();
  });

  it('should successfully save and load application settings', async () => {
    const customSettings: AppSettings = {
      theme: 'dark',
      dialect: 'south',
      speed: 1.0,
    };

    await saveSettings(customSettings);
    const loaded = await loadSettings();

    expect(loaded).toEqual(customSettings);
  });

  it('should return default settings if none are saved', async () => {
    const loaded = await loadSettings();
    expect(loaded).toEqual({
      theme: 'light',
      dialect: 'north',
      speed: 0.8,
    });
  });

  it('should save and load custom passages', async () => {
    const passages = ['Con mèo trèo cây cau', 'Bé đi học ngoan'];

    await saveCustomPassages(passages);
    const loaded = await loadCustomPassages();

    expect(loaded).toEqual(passages);
    expect(loaded).toHaveLength(2);
  });

  it('should return an empty array if no passages exist', async () => {
    const loaded = await loadCustomPassages();
    expect(loaded).toEqual([]);
  });

  it('should append and list historical session logs', async () => {
    const log1 = {
      date: new Date().toISOString(),
      text: 'bé học đọc',
      score: 100,
      missedWords: [],
    };

    const log2 = {
      date: new Date().toISOString(),
      text: 'bé học vần',
      score: 80,
      missedWords: ['vần'],
    };

    // Save first log
    const listAfterFirst = await saveSessionLog(log1);
    expect(listAfterFirst).toHaveLength(1);
    expect(listAfterFirst[0].text).toBe('bé học đọc');
    expect(listAfterFirst[0].id).toBeDefined();

    // Save second log
    const listAfterSecond = await saveSessionLog(log2);
    expect(listAfterSecond).toHaveLength(2);
    // Newest should be at index 0 (unshifted)
    expect(listAfterSecond[0].text).toBe('bé học vần');
    expect(listAfterSecond[1].text).toBe('bé học đọc');

    // Fetch list independently
    const fetched = await loadSessionLogs();
    expect(fetched).toHaveLength(2);
    expect(fetched[0].text).toBe('bé học vần');
  });

  it('should clear historical session logs', async () => {
    const log = {
      date: new Date().toISOString(),
      text: 'test',
      score: 100,
      missedWords: [],
    };

    await saveSessionLog(log);
    const fetchedBefore = await loadSessionLogs();
    expect(fetchedBefore).toHaveLength(1);

    await clearSessionLogs();
    const fetchedAfter = await loadSessionLogs();
    expect(fetchedAfter).toEqual([]);
  });
});
