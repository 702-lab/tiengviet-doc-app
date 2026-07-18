import { describe, it, expect } from 'vitest';
import { SessionLog } from './storage';

// Logic dùng để tính toán số liệu học bạ của bé (giống như trong HomeScreen)
function calculateStats(sessionLogs: SessionLog[]) {
  const totalSessions = sessionLogs.length;
  
  const averageScore = totalSessions > 0 
    ? Math.round(sessionLogs.reduce((acc, log) => acc + log.score, 0) / totalSessions)
    : 0;

  const wordCounts: { [word: string]: number } = {};
  sessionLogs.forEach((log) => {
    log.missedWords.forEach((word) => {
      const clean = word.toLowerCase().replace(/[.,!?;:"()“”]/g, '').trim();
      if (clean) {
        wordCounts[clean] = (wordCounts[clean] || 0) + 1;
      }
    });
  });

  const topMissed = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word);

  return { totalSessions, averageScore, topMissed };
}

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
