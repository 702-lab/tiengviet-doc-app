import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { Token, tokenizeText, ParsedSyllable } from '../services/phonicsEngine';
import { speakAsync, stopAllSpeech } from '../services/audioManager';
import { Audio } from 'expo-av';

interface ReaderContextType {
  text: string;
  tokens: Token[];
  isPlaying: boolean;
  activeTokenId: string | null;
  activeStepIndex: number;
  speed: number;
  mode: 'spell' | 'read';
  setText: (text: string) => void;
  setSpeed: (speed: number) => void;
  setMode: (mode: 'spell' | 'read') => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  activeWordParsed: ParsedSyllable | null;
  
  // Các tính năng phục vụ Luyện phát âm & AI STT Assessment
  isRecording: boolean;
  isAssessing: boolean;
  wordAssessment: { [tokenId: string]: 'correct' | 'incorrect' } | null;
  assessmentScore: number | null;
  startRecording: () => Promise<void>;
  stopRecordingAndAssess: () => Promise<void>;
  clearAssessment: () => void;
}

const ReaderContext = createContext<ReaderContextType | undefined>(undefined);

const PUNCTUATION_DELAYS: { [key: string]: number } = {
  '.': 700,
  ',': 400,
  '!': 700,
  '?': 700,
  ';': 500,
  ':': 500,
  '\n': 900,
};

export const ReaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [text, _setText] = useState('');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTokenId, setActiveTokenId] = useState<string | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [speed, _setSpeed] = useState(0.8);
  const [mode, _setMode] = useState<'spell' | 'read'>('spell');

  // Trạng thái cho ghi âm và đánh giá phát âm
  const [isRecording, setIsRecording] = useState(false);
  const [isAssessing, setIsAssessing] = useState(false);
  const [wordAssessment, setWordAssessment] = useState<{ [tokenId: string]: 'correct' | 'incorrect' } | null>(null);
  const [assessmentScore, setAssessmentScore] = useState<number | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);

  // Refs tránh stale closure trong vòng lặp phát âm thanh
  const isPlayingRef = useRef(false);
  const tokensRef = useRef<Token[]>([]);
  const currentIndexRef = useRef(0);
  const speedRef = useRef(0.8);
  const modeRef = useRef<'spell' | 'read'>('spell');
  const loopActiveRef = useRef(false);

  useEffect(() => {
    tokensRef.current = tokens;
  }, [tokens]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const setText = (newText: string) => {
    stop();
    clearAssessment();
    _setText(newText);
    const newTokens = tokenizeText(newText);
    setTokens(newTokens);
    currentIndexRef.current = 0;
  };

  const setSpeed = (newSpeed: number) => {
    _setSpeed(newSpeed);
  };

  const setMode = (newMode: 'spell' | 'read') => {
    _setMode(newMode);
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Vòng lặp phát âm
  const runPlaybackLoop = async () => {
    if (loopActiveRef.current) return;
    loopActiveRef.current = true;

    try {
      while (isPlayingRef.current && currentIndexRef.current < tokensRef.current.length) {
        const index = currentIndexRef.current;
        const token = tokensRef.current[index];

        if (!token.isWord) {
          setActiveTokenId(token.id);
          setActiveStepIndex(-1);
          
          let pauseTime = 100;
          const trimmedText = token.text.trim();
          if (trimmedText && PUNCTUATION_DELAYS[trimmedText]) {
            pauseTime = PUNCTUATION_DELAYS[trimmedText];
          }
          
          await delay(pauseTime / speedRef.current);
          currentIndexRef.current++;
          continue;
        }

        setActiveTokenId(token.id);

        if (modeRef.current === 'read') {
          setActiveStepIndex(-1);
          await speakAsync(token.text, speedRef.current);
          if (!isPlayingRef.current) break;
          await delay(350 / speedRef.current);
        } else {
          const spellingResult = token.spellingResult;
          if (spellingResult && spellingResult.steps.length > 0) {
            const steps = spellingResult.steps;
            
            for (let stepIdx = 0; stepIdx < steps.length; stepIdx++) {
              if (!isPlayingRef.current) break;
              
              setActiveStepIndex(stepIdx);
              const step = steps[stepIdx];
              await speakAsync(step.speech, speedRef.current);
              if (!isPlayingRef.current) break;
              await delay(250 / speedRef.current);
            }
          } else {
            setActiveStepIndex(-1);
            await speakAsync(token.text, speedRef.current);
          }
          
          if (!isPlayingRef.current) break;
          await delay(450 / speedRef.current);
        }

        if (!isPlayingRef.current) break;
        currentIndexRef.current++;
      }

      if (currentIndexRef.current >= tokensRef.current.length && isPlayingRef.current) {
        setIsPlaying(false);
        isPlayingRef.current = false;
        setActiveTokenId(null);
        setActiveStepIndex(-1);
        currentIndexRef.current = 0;
      }
    } catch (e) {
      console.warn('Lỗi luồng phát nhạc:', e);
    } finally {
      loopActiveRef.current = false;
    }
  };

  const play = () => {
    if (tokens.length === 0) return;
    clearAssessment(); // Xóa kết quả đánh giá cũ khi học đọc lại
    if (currentIndexRef.current >= tokens.length) {
      currentIndexRef.current = 0;
    }
    setIsPlaying(true);
    isPlayingRef.current = true;
    runPlaybackLoop();
  };

  const pause = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    stopAllSpeech();
  };

  const stop = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    stopAllSpeech();
    setActiveTokenId(null);
    setActiveStepIndex(-1);
    currentIndexRef.current = 0;
  };

  // --- CÁC HÀM GHI ÂM VÀ ĐÁNH GIÁ PHÁT ÂM (AI STT ASSESSMENT) ---

  const startRecording = async () => {
    try {
      stop(); // Dừng đọc mẫu nếu đang phát
      clearAssessment();

      // Xin quyền ghi âm
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Lỗi', 'Ứng dụng cần quyền truy cập Micro để ghi âm giọng đọc của bé.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (err) {
      console.error('Không thể bắt đầu ghi âm:', err);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi khởi động Micro.');
    }
  };

  const stopRecordingAndAssess = async () => {
    if (!recordingRef.current) return;

    try {
      setIsRecording(false);
      setIsAssessing(true);

      const recording = recordingRef.current;
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;

      // Giả lập lựa chọn cho phụ huynh để kiểm thử hiệu quả các trường hợp
      Alert.alert(
        'AI Phân Tích Giọng Đọc',
        'Chọn chế độ giả lập đọc của bé để kiểm tra màu sắc Karaoke:',
        [
          {
            text: 'Đọc Đúng 100% 🌟',
            onPress: () => processAssessment(text)
          },
          {
            text: 'Đọc Sai Một Số Từ ⚠️',
            onPress: () => {
              // Giả lập bé đọc thiếu một vài từ ngẫu nhiên
              const words = text.split(/\s+/);
              const simulatedWords = words.filter((_, idx) => idx % 4 !== 0); // Bỏ bớt từ mỗi 4 từ
              processAssessment(simulatedWords.join(' '));
            }
          },
          {
            text: 'Đọc Sai Nhiều ❌',
            onPress: () => {
              // Giả lập bé đọc sai hoặc bỏ sót nhiều từ
              const words = text.split(/\s+/);
              const simulatedWords = words.filter((_, idx) => idx % 2 === 0); // Bỏ 50% số từ
              processAssessment(simulatedWords.join(' '));
            }
          }
        ],
        { cancelable: false }
      );

    } catch (err) {
      console.error('Không thể dừng ghi âm:', err);
      setIsAssessing(false);
    }
  };

  // Thuật toán so khớp chuỗi con chung dài nhất (Longest Common Subsequence - LCS)
  // để đánh giá chính xác từng từ bé đọc được so với văn bản gốc
  const processAssessment = (transcribedText: string) => {
    const wordTokens = tokens.filter(t => t.isWord);
    if (wordTokens.length === 0) {
      setIsAssessing(false);
      return;
    }

    // Chuẩn hóa chuỗi văn bản gốc và văn bản đọc được
    const cleanWord = (w: string) => w.toLowerCase().replace(/[.,!?;:"()“”]/g, '').trim().normalize('NFC');
    
    const targetWords = wordTokens.map(t => cleanWord(t.text));
    const spokenWords = transcribedText.split(/\s+/).map(w => cleanWord(w)).filter(Boolean);

    // Tính ma trận LCS
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

    // Truy vết ngược để lấy tập hợp chỉ số từ viết đúng trong văn bản gốc
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

    // Gán kết quả đánh giá cho từng Token
    const assessmentResult: { [tokenId: string]: 'correct' | 'incorrect' } = {};
    wordTokens.forEach((token, index) => {
      if (matchedTargetIndices.has(index)) {
        assessmentResult[token.id] = 'correct';
      } else {
        assessmentResult[token.id] = 'incorrect';
      }
    });

    // Tính điểm phần trăm chính xác
    const correctCount = matchedTargetIndices.size;
    const score = Math.round((correctCount / wordTokens.length) * 100);

    setWordAssessment(assessmentResult);
    setAssessmentScore(score);
    setIsAssessing(false);
  };

  const clearAssessment = () => {
    setWordAssessment(null);
    setAssessmentScore(null);
  };

  useEffect(() => {
    return () => {
      stopAllSpeech();
    };
  }, []);

  const activeToken = tokens.find((t) => t.id === activeTokenId);
  const activeWordParsed = activeToken?.isWord && activeToken.spellingResult
    ? activeToken.spellingResult.parsed
    : null;

  return (
    <ReaderContext.Provider
      value={{
        text,
        tokens,
        isPlaying,
        activeTokenId,
        activeStepIndex,
        speed,
        mode,
        setText,
        setSpeed,
        setMode,
        play,
        pause,
        stop,
        activeWordParsed,
        
        isRecording,
        isAssessing,
        wordAssessment,
        assessmentScore,
        startRecording,
        stopRecordingAndAssess,
        clearAssessment,
      }}
    >
      {children}
    </ReaderContext.Provider>
  );
};

export const useReader = () => {
  const context = useContext(ReaderContext);
  if (!context) {
    throw new Error('useReader must be used within a ReaderProvider');
  }
  return context;
};
