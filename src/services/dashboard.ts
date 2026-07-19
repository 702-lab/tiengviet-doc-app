import { SessionLog } from './storage';

/**
 * Calculates parent dashboard statistics (total sessions, average score, top missed words).
 */
export function calculateStats(sessionLogs: SessionLog[]) {
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

/**
 * Calculates the consecutive daily study streak from session logs.
 */
export function calculateStreak(logs: SessionLog[]): number {
  if (logs.length === 0) return 0;
  
  // 1. Lấy danh sách các ngày duy nhất (toDateString)
  const uniqueDateStrings = Array.from(new Set(
    logs.map(log => new Date(log.date).toDateString())
  ));
  
  const dates = uniqueDateStrings.map(d => new Date(d));
  
  // Sắp xếp ngày từ mới nhất đến cũ nhất
  dates.sort((a, b) => b.getTime() - a.getTime());
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const latestDate = new Date(dates[0]);
  latestDate.setHours(0, 0, 0, 0);
  
  // Nếu ngày đọc gần nhất không phải hôm nay và cũng không phải hôm qua thì chuỗi streak đã tắt (bằng 0)
  if (latestDate.getTime() !== today.getTime() && latestDate.getTime() !== yesterday.getTime()) {
    return 0;
  }
  
  let streak = 1;
  for (let i = 0; i < dates.length - 1; i++) {
    const current = new Date(dates[i]);
    current.setHours(0, 0, 0, 0);
    
    const next = new Date(dates[i + 1]);
    next.setHours(0, 0, 0, 0);
    
    // Tính khoảng cách ngày
    const diffTime = Math.abs(current.getTime() - next.getTime());
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
    } else if (diffDays > 1) {
      break; // Chuỗi bị đứt quãng
    }
  }
  
  return streak;
}
