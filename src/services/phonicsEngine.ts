const ONSETS = [
  'ngh',
  'ch', 'gh', 'gi', 'kh', 'ng', 'nh', 'ph', 'qu', 'th', 'tr',
  'b', 'c', 'd', 'đ', 'g', 'h', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'x'
];

const ONSET_PRONUNCIATION: { [key: string]: string } = {
  'b': 'bờ', 'c': 'cờ', 'ch': 'chờ', 'd': 'dờ', 'đ': 'đờ',
  'g': 'gờ', 'gh': 'gờ', 'gi': 'giờ', 'h': 'hờ', 'k': 'cờ',
  'kh': 'khờ', 'l': 'lờ', 'm': 'mờ', 'n': 'nờ', 'ng': 'ngờ',
  'ngh': 'ngờ', 'nh': 'nhờ', 'p': 'pờ', 'ph': 'phờ', 'q': 'quờ',
  'qu': 'quờ', 'r': 'rờ', 's': 'sờ', 't': 'tờ', 'th': 'thờ',
  'tr': 'trờ', 'v': 'vờ', 'x': 'xờ'
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
 * Phân tích một từ tiếng Việt thành các thành phần âm tiết
 */
export function parseWord(word: string): ParsedSyllable {
  // Chuẩn hóa sang dạng NFD để tách biệt các dấu thanh
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
  
  // Tái tổ hợp từ không dấu sang NFC
  const toneFreeWord = cleanChars.join('').normalize('NFC');
  
  let onset = '';
  let rhyme = '';
  
  // Trường hợp đặc biệt của 'gi'
  if (toneFreeWord.startsWith('gi')) {
    onset = 'gi';
    const remainder = toneFreeWord.slice(2);
    if (remainder === '') {
      rhyme = 'i';
    } else if (/^[bcdđgklmnpqrstvx]/.test(remainder)) {
      // Nếu bắt đầu bằng phụ âm
      rhyme = 'i' + remainder;
    } else if (remainder.startsWith('e') || remainder.startsWith('ê')) {
      rhyme = 'i' + remainder;
    } else {
      rhyme = remainder;
    }
  } else {
    // Tìm phụ âm đầu khớp dài nhất
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
  
  return {
    original: word,
    toneFreeWord,
    onset,
    onsetSpeech: ONSET_PRONUNCIATION[onset] || '',
    rhyme: finalRhyme,
    tone,
    toneChar
  };
}

/**
 * Sinh các bước đánh vần từ một từ tiếng Việt
 */
export function generateSpellingSteps(word: string): SpellingResult {
  // Loại bỏ các ký tự đặc biệt, dấu câu để phân tích
  const cleanWord = word.replace(/[.,!?;:"()“”]/g, '').trim();
  const parsed = parseWord(cleanWord);
  
  // Nếu không có phần vần (ví dụ từ viết tắt hoặc từ không hợp lệ)
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
    // Bước 1: Phát âm âm đầu (ví dụ: "bờ")
    steps.push({ text: parsed.onset, speech: parsed.onsetSpeech, type: 'onset' });
    textSteps.push(parsed.onsetSpeech);
    
    // Bước 2: Phát âm phần vần (ví dụ: "an")
    steps.push({ text: parsed.rhyme, speech: parsed.rhyme, type: 'rhyme' });
    textSteps.push(parsed.rhyme);
    
    // Bước 3: Ghép âm đầu + vần (chưa dấu, ví dụ: "ban")
    const combinedNoTone = (parsed.onset === 'gi' && parsed.rhyme.startsWith('i'))
      ? 'gi' + parsed.rhyme.slice(1)
      : parsed.onset + parsed.rhyme;
    const combinedNoToneNFC = combinedNoTone.normalize('NFC');
    steps.push({ text: combinedNoToneNFC, speech: combinedNoToneNFC, type: 'combined_no_tone' });
    textSteps.push(combinedNoToneNFC);
  } else {
    // Không có phụ âm đầu, phát âm phần vần trực tiếp
    steps.push({ text: parsed.rhyme, speech: parsed.rhyme, type: 'rhyme' });
    textSteps.push(parsed.rhyme);
  }
  
  // Bước 4: Thêm dấu thanh nếu có
  if (parsed.tone !== 'ngang') {
    steps.push({ text: parsed.tone, speech: parsed.tone, type: 'tone' });
    textSteps.push(parsed.tone);
    
    // Bước 5: Phát âm từ hoàn chỉnh
    steps.push({ text: word, speech: cleanWord, type: 'final' });
    textSteps.push(cleanWord);
  } else {
    // Nếu là thanh ngang, từ ghép không dấu ở Bước 3 chính là từ cuối cùng
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
 * Tách một đoạn văn thành danh sách các Token (từ và ký tự ngăn cách/khoảng trắng)
 */
export function tokenizeText(text: string): Token[] {
  if (!text) return [];
  
  // Biểu thức chính quy Unicode phân tách từ (\p{L}) và các ký tự phi-chữ (\p{L} phủ định)
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
        spellingResult: generateSpellingSteps(match)
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
