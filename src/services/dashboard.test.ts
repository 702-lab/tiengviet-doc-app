import { describe, it, expect } from 'vitest';
import { SessionLog } from './storage';
import { calculateStats, calculateStreak } from './dashboard';

describe('Parent Dashboard Analytics Unit Tests', () => {
  it('should return default values when history logs list is empty', () => {
    const stats = calculateStats([]);
    expect(stats.totalSessions).toBe(0);
    expect(stats.averageScore).toBe(0);
    expect(stats.topMissed).toEqual([]);
  });

  it('should correctly calculate total sessions and average score', () => {
    const logs: SessionLog[] = [
      { id: '1', date: '', text: '', score: 100, missedWords: [] },
      { id: '2', date: '', text: '', score: 80, missedWords: [] },
      { id: '3', date: '', text: '', score: 60, missedWords: [] },
    ];

    const stats = calculateStats(logs);
    expect(stats.totalSessions).toBe(3);
    expect(stats.averageScore).toBe(80); // (100 + 80 + 60) / 3 = 80
  });

  it('should extract top 3 missed words sorted by frequency of occurrence', () => {
    const logs: SessionLog[] = [
      { id: '1', date: '', text: '', score: 80, missedWords: ['mèo', 'lông'] },
      { id: '2', date: '', text: '', score: 70, missedWords: ['mèo', 'lông', 'ngoan'] },
      { id: '3', date: '', text: '', score: 90, missedWords: ['mèo'] },
    ];

    const stats = calculateStats(logs);
    expect(stats.topMissed).toHaveLength(3);
    expect(stats.topMissed[0]).toBe('mèo'); // Xuất hiện 3 lần
    expect(stats.topMissed[1]).toBe('lông'); // Xuất hiện 2 lần
    expect(stats.topMissed[2]).toBe('ngoan'); // Xuất hiện 1 lần
  });

  it('should clean punctuation marks from missed words list', () => {
    const logs: SessionLog[] = [
      { id: '1', date: '', text: '', score: 50, missedWords: ['mèo,', 'ngoan!'] },
      { id: '2', date: '', text: '', score: 50, missedWords: ['mèo.', 'ngoan?'] },
    ];

    const stats = calculateStats(logs);
    expect(stats.topMissed).toContain('mèo');
    expect(stats.topMissed).toContain('ngoan');
    expect(stats.topMissed).not.toContain('mèo,');
    expect(stats.topMissed).not.toContain('ngoan!');
  });
});

describe('Daily Study Streak Check Unit Tests', () => {
  const getPastDateISO = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString();
  };

  it('should return 0 streak for empty logs', () => {
    expect(calculateStreak([])).toBe(0);
  });

  it('should return 1 for a single log created today', () => {
    const logs: SessionLog[] = [
      { id: '1', date: getPastDateISO(0), text: '', score: 90, missedWords: [] }
    ];
    expect(calculateStreak(logs)).toBe(1);
  });

  it('should return 1 for a single log created yesterday', () => {
    const logs: SessionLog[] = [
      { id: '1', date: getPastDateISO(1), text: '', score: 90, missedWords: [] }
    ];
    expect(calculateStreak(logs)).toBe(1);
  });

  it('should return 0 if the latest log is 2 or more days old', () => {
    const logs: SessionLog[] = [
      { id: '1', date: getPastDateISO(2), text: '', score: 90, missedWords: [] }
    ];
    expect(calculateStreak(logs)).toBe(0);
  });

  it('should return 2 for consecutive days (today and yesterday)', () => {
    const logs: SessionLog[] = [
      { id: '1', date: getPastDateISO(0), text: '', score: 95, missedWords: [] },
      { id: '2', date: getPastDateISO(1), text: '', score: 90, missedWords: [] }
    ];
    expect(calculateStreak(logs)).toBe(2);
  });

  it('should return 3 for consecutive days (today, yesterday, and 2 days ago)', () => {
    const logs: SessionLog[] = [
      { id: '1', date: getPastDateISO(0), text: '', score: 95, missedWords: [] },
      { id: '2', date: getPastDateISO(1), text: '', score: 90, missedWords: [] },
      { id: '3', date: getPastDateISO(2), text: '', score: 85, missedWords: [] }
    ];
    expect(calculateStreak(logs)).toBe(3);
  });

  it('should handle duplicate reads on the same day without doubling the count', () => {
    const logs: SessionLog[] = [
      { id: '1', date: getPastDateISO(0), text: '', score: 95, missedWords: [] },
      { id: '2', date: getPastDateISO(0), text: '', score: 90, missedWords: [] }, // Duplicate today
      { id: '3', date: getPastDateISO(1), text: '', score: 80, missedWords: [] }
    ];
    expect(calculateStreak(logs)).toBe(2);
  });

  it('should break the streak if there is a calendar gap', () => {
    const logs: SessionLog[] = [
      { id: '1', date: getPastDateISO(0), text: '', score: 95, missedWords: [] },
      // Yesterday was missed!
      { id: '2', date: getPastDateISO(2), text: '', score: 80, missedWords: [] }
    ];
    expect(calculateStreak(logs)).toBe(1); // Reset to 1 (only today is active)
  });
});
