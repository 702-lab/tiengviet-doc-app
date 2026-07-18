import { vi, describe, it, expect, beforeEach } from 'vitest';
import { 
  saveSettings, 
  loadSettings, 
  saveCustomPassages, 
  loadCustomPassages, 
  saveSessionLog, 
  loadSessionLogs,
  clearSessionLogs,
  getUnlockedAchievements,
  clearUnlockedAchievements,
  checkAndUnlockAchievements,
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

  describe('Gamified Achievements Milestone Logic', () => {
    it('should unlock Chăm Chỉ badge when logs reach 5 sessions', async () => {
      const logs: SessionLog[] = Array.from({ length: 5 }, (_, i) => ({
        id: `log-${i}`,
        date: new Date().toISOString(),
        text: `story-${i}`,
        score: 70,
        missedWords: [],
      }));

      const newlyUnlocked = await checkAndUnlockAchievements(logs);
      expect(newlyUnlocked).toContain('badge_cham_chi');
      expect(newlyUnlocked).not.toContain('badge_phat_am_chuan');

      const allUnlocked = await getUnlockedAchievements();
      expect(allUnlocked).toEqual(['badge_cham_chi']);
    });

    it('should unlock Phát Âm Chuẩn badge when perfect logs count is 3', async () => {
      const logs: SessionLog[] = [
        { id: '1', date: new Date().toISOString(), text: 't1', score: 100, missedWords: [] },
        { id: '2', date: new Date().toISOString(), text: 't2', score: 100, missedWords: [] },
        { id: '3', date: new Date().toISOString(), text: 't3', score: 100, missedWords: [] },
      ];

      const newlyUnlocked = await checkAndUnlockAchievements(logs);
      expect(newlyUnlocked).toContain('badge_phat_am_chuan');

      const allUnlocked = await getUnlockedAchievements();
      expect(allUnlocked).toEqual(['badge_phat_am_chuan']);
    });

    it('should unlock Vua Đánh Vần badge when all 3 sample stories are read with score >= 80', async () => {
      const logs: SessionLog[] = [
        {
          id: '1',
          date: new Date().toISOString(),
          text: 'Con mèo nhà em lông màu trắng muốt. Nó rất ngoan và thích bắt chuột.',
          score: 80,
          missedWords: [],
        },
        {
          id: '2',
          date: new Date().toISOString(),
          text: 'Buổi sáng quê em gió mát rượi. Ông mặt trời đỏ rực nhô lên sau lũy tre làng.',
          score: 90,
          missedWords: [],
        },
        {
          id: '3',
          date: new Date().toISOString(),
          text: 'Chú cá vàng bơi lội tung tăng trong bể nước. Vảy cá vàng óng lấp lánh như dát vàng.',
          score: 85,
          missedWords: [],
        },
      ];

      const newlyUnlocked = await checkAndUnlockAchievements(logs);
      expect(newlyUnlocked).toContain('badge_vua_danh_van');
    });

    it('should not unlock achievements that are already unlocked', async () => {
      // Setup already unlocked Chăm Chỉ badge
      await checkAndUnlockAchievements(Array.from({ length: 5 }, (_, i) => ({
        id: `log-${i}`,
        date: new Date().toISOString(),
        text: `story-${i}`,
        score: 70,
        missedWords: [],
      })));

      // Call checkAndUnlockAchievements again with same logs
      const logsAgain = Array.from({ length: 5 }, (_, i) => ({
        id: `log-${i}`,
        date: new Date().toISOString(),
        text: `story-${i}`,
        score: 70,
        missedWords: [],
      }));

      const newlyUnlocked = await checkAndUnlockAchievements(logsAgain);
      expect(newlyUnlocked).toEqual([]); // No new badges unlocked
    });
  });
});
