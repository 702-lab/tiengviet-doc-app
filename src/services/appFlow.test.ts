import { describe, it, expect } from 'vitest';
import { tokenizeText, generateSpellingSteps } from './phonicsEngine';

describe('Integration Test: Phonics Engine & Dialect Synchronization', () => {
  it('should dynamically update spelling steps when switching between Northern and Southern dialects', () => {
    const text = 'vẽ cá';

    // 1. Kiểm tra với giọng miền Bắc (Northern)
    const tokensNorth = tokenizeText(text, 'north');
    const wordVeNorth = tokensNorth.find(t => t.text === 'vẽ');
    
    expect(wordVeNorth).toBeDefined();
    // Bắc: "vờ" - "e" - "ve" - "ngã" - "vẽ"
    expect(wordVeNorth?.spellingResult?.spellingText).toBe('vờ - e - ve - ngã - vẽ');
    expect(wordVeNorth?.spellingResult?.steps[0].speech).toBe('vờ');

    // 2. Kiểm tra với giọng miền Nam (Southern)
    const tokensSouth = tokenizeText(text, 'south');
    const wordVeSouth = tokensSouth.find(t => t.text === 'vẽ');

    expect(wordVeSouth).toBeDefined();
    // Nam: Phát âm âm đầu v thành "dờ", rồi vần "e", kết hợp thành chữ viết "ve" -> "dờ - e - ve - ngã - vẽ"
    expect(wordVeSouth?.spellingResult?.spellingText).toBe('dờ - e - ve - ngã - vẽ');
    expect(wordVeSouth?.spellingResult?.steps[0].speech).toBe('dờ');
  });

  it('should handle local Southern dialect spelling variations for "r" and "gi"', () => {
    // Rổ rá -> Giọng Nam đọc phụ âm r thành gờ, sau đó đánh vần kết hợp chữ viết "rô"
    const s1 = generateSpellingSteps('rổ', 'south');
    expect(s1.spellingText).toBe('gờ - ô - rô - hỏi - rổ');

    // Gió -> Giọng Nam đọc gi thành dờ, sau đó đánh vần kết hợp chữ viết "gio"
    const s2 = generateSpellingSteps('gió', 'south');
    expect(s2.spellingText).toBe('dờ - o - gio - sắc - gió');
  });
});

describe('E2E Simulation: End-to-End User Reading and Assessment Flow', () => {
  const processAssessmentMock = (tokens: any[], text: string, transcribedText: string) => {
    const wordTokens = tokens.filter(t => t.isWord);
    const cleanWord = (w: string) => w.toLowerCase().replace(/[.,!?;:"()“”]/g, '').trim().normalize('NFC');
    
    const targetWords = wordTokens.map(t => cleanWord(t.text));
    const spokenWords = transcribedText.split(/\s+/).map(w => cleanWord(w)).filter(Boolean);

    const m = targetWords.length;
    const n = spokenWords.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (targetWords[i - 1] === spokenWords[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    const matchedTargetIndices = new Set<number>();
    let i = m, j = n;
    while (i > 0 && j > 0) {
      if (targetWords[i - 1] === spokenWords[j - 1]) {
        matchedTargetIndices.add(i - 1);
        i--;
        j--;
      } else if (dp[i - 1][j] >= dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }

    const assessmentResult: { [tokenId: string]: 'correct' | 'incorrect' } = {};
    wordTokens.forEach((token, index) => {
      if (matchedTargetIndices.has(index)) {
        assessmentResult[token.id] = 'correct';
      } else {
        assessmentResult[token.id] = 'incorrect';
      }
    });

    const score = Math.round((matchedTargetIndices.size / wordTokens.length) * 100);
    return { assessmentResult, score };
  };

  it('should simulate a complete journey: load text -> spell word -> record voice -> show green/red colors', () => {
    const parentText = 'bé vẽ cá';
    const tokens = tokenizeText(parentText, 'north');

    expect(tokens.filter(t => t.isWord)).toHaveLength(3);
    
    const wordBe = tokens[0];
    expect(wordBe.spellingResult?.steps).toHaveLength(5); // bờ - e - be - sắc - bé
    expect(wordBe.spellingResult?.steps[0].speech).toBe('bờ');
    expect(wordBe.spellingResult?.steps[1].speech).toBe('e');

    const simulatedAudioPerfect = 'bé vẽ cá';
    const resultPerfect = processAssessmentMock(tokens, parentText, simulatedAudioPerfect);
    
    expect(resultPerfect.score).toBe(100);
    expect(resultPerfect.assessmentResult[tokens[0].id]).toBe('correct');
    expect(resultPerfect.assessmentResult[tokens[2].id]).toBe('correct');
    expect(resultPerfect.assessmentResult[tokens[4].id]).toBe('correct');

    const simulatedAudioIncomplete = 'bé vẽ';
    const resultIncomplete = processAssessmentMock(tokens, parentText, simulatedAudioIncomplete);
    
    expect(resultIncomplete.score).toBe(67);
    expect(resultIncomplete.assessmentResult[tokens[0].id]).toBe('correct');
    expect(resultIncomplete.assessmentResult[tokens[2].id]).toBe('correct');
    expect(resultIncomplete.assessmentResult[tokens[4].id]).toBe('incorrect');
  });
});
