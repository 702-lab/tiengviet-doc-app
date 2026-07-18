const ONSETS = [
  'ngh',
  'ch', 'gh', 'gi', 'kh', 'ng', 'nh', 'ph', 'qu', 'th', 'tr',
  'b', 'c', 'd', 'đ', 'g', 'h', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'x'
];

const ONSET_PRONUNCIATION_NORTH: { [key: string]: string } = {
  'b': 'bờ', 'c': 'cờ', 'ch': 'chờ', 'd': 'dờ', 'đ': 'đờ',
  'g': 'gờ', 'gh': 'gờ', 'gi': 'giờ', 'h': 'hờ', 'k': 'cờ',
  'kh': 'khờ', 'l': 'lờ', 'm': 'mờ', 'n': 'nờ', 'ng': 'ngờ',
  'ngh': 'ngờ', 'nh': 'nhờ', 'p': 'pờ', 'ph': 'phờ', 'q': 'quờ',
  'qu': 'quờ', 'r': 'rờ', 's': 'sờ', 't': 'tờ', 'th': 'thờ',
  'tr': 'trờ', 'v': 'vờ', 'x': 'xờ'
};

const ONSET_PRONUNCIATION_SOUTH: { [key: string]: string } = {
  'b': 'bờ', 'c': 'cờ', 'ch': 'chờ', 'd': 'dờ', 'đ': 'đờ',
  'g': 'gờ', 'gh': 'gờ', 'gi': 'dờ', 'h': 'hờ', 'k': 'cờ',  // Giọng Nam: gi -> dờ
  'kh': 'khờ', 'l': 'lờ', 'm': 'mờ', 'n': 'nờ', 'ng': 'ngờ',
  'ngh': 'ngờ', 'nh': 'nhờ', 'p': 'pờ', 'ph': 'phờ', 'q': 'quờ',
  'qu': 'quờ', 'r': 'gờ', 's': 'sờ', 't': 'tờ', 'th': 'thờ',  // Giọng Nam: r -> gờ
  'tr': 'trờ', 'v': 'dờ', 'x': 'xờ'                          // Giọng Nam: v -> dờ
};

// Giọng miền Trung: Giữ lại chuẩn phát âm âm uốn lưỡi (tr, r, s) và phân biệt rõ vờ / dờ
const ONSET_PRONUNCIATION_CENTRAL: { [key: string]: string } = {
  'b': 'bờ', 'c': 'cờ', 'ch': 'chờ', 'd': 'dờ', 'đ': 'đờ',
  'g': 'gờ', 'gh': 'gờ', 'gi': 'giờ', 'h': 'hờ', 'k': 'cờ',
  'kh': 'khờ', 'l': 'lờ', 'm': 'mờ', 'n': 'nờ', 'ng': 'ngờ',
  'ngh': 'ngờ', 'nh': 'nhờ', 'p': 'pờ', 'ph': 'phờ', 'q': 'quờ',
  'qu': 'quờ', 
  'r': 'rờ',   // Phát âm rung đầu lưỡi rõ rệt (trilled r)
  's': 'sờ',   // Phát âm uốn lưỡi rõ rệt (retroflex s)
  't': 'tờ', 'th': 'thờ',
  'tr': 'trờ', // Phát âm uốn lưỡi rõ rệt (retroflex tr)
  'v': 'vờ', 
  'x': 'xờ'
};

const TONE_MAP: { [key: string]: string } = {
  '\u0300': 'huyền',
  '\u0301': 'sắc',
  '\u0309': 'hỏi',
  '\u0303': 'ngã',
  '\u0323': 'nặng'
};

export interface ParsedSyllable {
  original: string;
  toneFreeWord: string;
  onset: string;
  onsetSpeech: string;
  rhyme: string;
  tone: string;
  toneChar: string;
}

export interface SpellingStep {
  text: string;
  speech: string;
  type: 'onset' | 'rhyme' | 'combined_no_tone' | 'tone' | 'final';
}

export interface SpellingResult {
  parsed: ParsedSyllable;
  spellingText: string;
  steps: SpellingStep[];
}

export interface Token {
  id: string;
  text: string;
  isWord: boolean;
  spellingResult?: SpellingResult;
}

/**
 * Phân tích một từ tiếng Việt thành các thành phần âm tiết theo giọng vùng miền
 */
export function parseWord(word: string, dialect: 'north' | 'south' | 'central' = 'north'): ParsedSyllable {
  const normalized = word.toLowerCase().normalize('NFD');
  
  let tone = 'ngang';
  let toneChar = '';
  const cleanChars: string[] = [];
  
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    if (TONE_MAP[char]) {
      tone = TONE_MAP[char];
      toneChar = char;
    } else {
      cleanChars.push(char);
    }
  }
  
  const toneFreeWord = cleanChars.join('').normalize('NFC');
  
  let onset = '';
  let rhyme = '';
  
  if (toneFreeWord.startsWith('gi')) {
    onset = 'gi';
    const remainder = toneFreeWord.slice(2);
    if (remainder === '') {
      rhyme = 'i';
    } else if (/^[bcdđgklmnpqrstvx]/.test(remainder)) {
      rhyme = 'i' + remainder;
    } else if (remainder.startsWith('e') || remainder.startsWith('ê')) {
      rhyme = 'i' + remainder;
    } else {
      rhyme = remainder;
    }
  } else {
    for (const o of ONSETS) {
      if (toneFreeWord.startsWith(o)) {
        onset = o;
        rhyme = toneFreeWord.slice(o.length);
        break;
      }
    }
    if (!onset) {
      rhyme = toneFreeWord;
    }
  }
  
  const finalRhyme = rhyme.normalize('NFC');
  
  let pronunciationMap = ONSET_PRONUNCIATION_NORTH;
  if (dialect === 'south') {
    pronunciationMap = ONSET_PRONUNCIATION_SOUTH;
  } else if (dialect === 'central') {
    pronunciationMap = ONSET_PRONUNCIATION_CENTRAL;
  }
  
  return {
    original: word,
    toneFreeWord,
    onset,
    onsetSpeech: pronunciationMap[onset] || '',
    rhyme: finalRhyme,
    tone,
    toneChar
  };
}

/**
 * Sinh các bước đánh vần từ một từ tiếng Việt dựa trên giọng vùng miền
 */
export function generateSpellingSteps(word: string, dialect: 'north' | 'south' | 'central' = 'north'): SpellingResult {
  const cleanWord = word.replace(/[.,!?;:"()“”]/g, '').trim();
  const parsed = parseWord(cleanWord, dialect);
  
  if (!parsed.rhyme) {
    return {
      parsed,
      spellingText: word,
      steps: [{ text: word, speech: word, type: 'final' }]
    };
  }
  
  const steps: SpellingStep[] = [];
  const textSteps: string[] = [];
  
  if (parsed.onset) {
    steps.push({ text: parsed.onset, speech: parsed.onsetSpeech, type: 'onset' });
    textSteps.push(parsed.onsetSpeech);
    
    steps.push({ text: parsed.rhyme, speech: parsed.rhyme, type: 'rhyme' });
    textSteps.push(parsed.rhyme);
    
    const combinedNoTone = (parsed.onset === 'gi' && parsed.rhyme.startsWith('i'))
      ? 'gi' + parsed.rhyme.slice(1)
      : parsed.onset + parsed.rhyme;
    const combinedNoToneNFC = combinedNoTone.normalize('NFC');
    steps.push({ text: combinedNoToneNFC, speech: combinedNoToneNFC, type: 'combined_no_tone' });
    textSteps.push(combinedNoToneNFC);
  } else {
    steps.push({ text: parsed.rhyme, speech: parsed.rhyme, type: 'rhyme' });
    textSteps.push(parsed.rhyme);
  }
  
  if (parsed.tone !== 'ngang') {
    steps.push({ text: parsed.tone, speech: parsed.tone, type: 'tone' });
    textSteps.push(parsed.tone);
    
    steps.push({ text: word, speech: cleanWord, type: 'final' });
    textSteps.push(cleanWord);
  } else {
    if (parsed.onset) {
      steps[steps.length - 1].type = 'final';
    } else {
      steps[steps.length - 1].type = 'final';
    }
  }
  
  return {
    parsed,
    spellingText: textSteps.join(' - '),
    steps
  };
}

/**
 * Tách một đoạn văn thành danh sách các Token theo giọng vùng miền
 */
export function tokenizeText(text: string, dialect: 'north' | 'south' | 'central' = 'north'): Token[] {
  if (!text) return [];
  
  const matches = text.match(/[\p{L}]+|[^\p{L}]+/gu);
  if (!matches) return [];
  
  return matches.map((match, index) => {
    const isWord = /[\p{L}]/u.test(match);
    const id = `token-${index}`;
    
    if (isWord) {
      return {
        id,
        text: match,
        isWord,
        spellingResult: generateSpellingSteps(match, dialect)
      };
    } else {
      return {
        id,
        text: match,
        isWord
      };
    }
  });
}
