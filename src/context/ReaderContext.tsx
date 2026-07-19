import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { Token, tokenizeText, ParsedSyllable } from '../services/phonicsEngine';
import { speakAsync, stopAllSpeech } from '../services/audioManager';
import { loadSettings, saveSettings, saveSessionLog, checkAndUnlockAchievements } from '../services/storage';
import { playPhonicAssetAsync } from '../services/phonicsAssetPlayer';
import { supabase } from '../services/supabaseClient';
import { Achievement, ACHIEVEMENTS } from '../theme/achievements';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

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
  
  // Luyện phát âm & AI STT Assessment
  isRecording: boolean;
  isAssessing: boolean;
  wordAssessment: { [tokenId: string]: 'correct' | 'incorrect' } | null;
  assessmentScore: number | null;
  recordedAudioUri: string | null;
  startRecording: () => Promise<void>;
  stopRecordingAndAssess: () => Promise<void>;
  playRecordedAudio: () => Promise<void>;
  clearAssessment: () => void;

  // Giao diện sáng/tối
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Giọng đọc vùng miền (Northern/Southern/Central Dialect)
  dialect: 'north' | 'south' | 'central';
  setDialect: (dialect: 'north' | 'south' | 'central') => void;

  // Thành tựu / Huy chương
  unlockedBadge: Achievement | null;
  clearUnlockedBadge: () => void;

  // Đánh giá từ đơn lẻ trực tiếp
  assessWordDirectly: (tokenId: string, state: 'correct' | 'incorrect') => void;
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

  // Ghi âm và đánh giá
  const [isRecording, setIsRecording] = useState(false);
  const [isAssessing, setIsAssessing] = useState(false);
  const [wordAssessment, setWordAssessment] = useState<{ [tokenId: string]: 'correct' | 'incorrect' } | null>(null);
  const [assessmentScore, setAssessmentScore] = useState<number | null>(null);
  const [recordedAudioUri, setRecordedAudioUri] = useState<string | null>(null);

  // Theme sáng/tối
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Trạng thái huy chương vừa mở khóa
  const [unlockedBadge, setUnlockedBadge] = useState<Achievement | null>(null);
  const clearUnlockedBadge = () => setUnlockedBadge(null);

  // Giọng đọc miền Bắc/Nam/Trung
  const [dialect, _setDialect] = useState<'north' | 'south' | 'central'>('north');
  const [availableVoices, setAvailableVoices] = useState<Speech.Voice[]>([]);

  const recordingRef = useRef<Audio.Recording | null>(null);

  // Refs tránh stale closure trong hàm phát nhạc
  const isPlayingRef = useRef(false);
  const tokensRef = useRef<Token[]>([]);
  const currentIndexRef = useRef(0);
  const speedRef = useRef(0.8);
  const modeRef = useRef<'spell' | 'read'>('spell');
  const dialectRef = useRef<'north' | 'south' | 'central'>('north');
  const loopActiveRef = useRef(false);
  
  // Tránh vòng lặp vô hạn khi lưu thiết lập lúc khởi động
  const initialLoadDone = useRef(false);

  // Khởi chạy: Nạp cài đặt đã lưu
  useEffect(() => {
    loadSettings().then((settings) => {
      setTheme(settings.theme);
      _setDialect(settings.dialect);
      _setSpeed(settings.speed);
      initialLoadDone.current = true;
    }).catch((err) => {
      console.warn('Lỗi nạp cài đặt:', err);
      initialLoadDone.current = true;
    });

    Speech.getAvailableVoicesAsync().then((voices) => {
      setAvailableVoices(voices.filter((v) => v.language.startsWith('vi')));
    }).catch((err) => {
      console.warn('Không lấy được danh sách giọng nói:', err);
    });
  }, []);

  // Lắng nghe sự kiện đăng nhập / đăng xuất để tải lại cấu hình tương ứng
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        try {
          const settings = await loadSettings();
          setTheme(settings.theme);
          _setDialect(settings.dialect);
          _setSpeed(settings.speed);
        } catch {}
      } else if (event === 'SIGNED_OUT') {
        setTheme('light');
        _setDialect('north');
        _setSpeed(0.8);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Tự động lưu thiết lập khi có thay đổi
  useEffect(() => {
    if (initialLoadDone.current) {
      saveSettings({ theme, dialect, speed }).catch(err => {
        console.warn('Không thể lưu cài đặt:', err);
      });
    }
  }, [theme, dialect, speed]);

  useEffect(() => {
    tokensRef.current = tokens;
  }, [tokens]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    dialectRef.current = dialect;
    if (text) {
      const newTokens = tokenizeText(text, dialect);
      setTokens(newTokens);
    }
  }, [dialect]);

  const setText = (newText: string) => {
    stop();
    clearAssessment();
    _setText(newText);
    const newTokens = tokenizeText(newText, dialect);
    setTokens(newTokens);
    currentIndexRef.current = 0;
  };

  const setSpeed = (newSpeed: number) => {
    _setSpeed(newSpeed);
  };

  const setMode = (newMode: 'spell' | 'read') => {
    _setMode(newMode);
  };

  const setDialect = (newDialect: 'north' | 'south' | 'central') => {
    _setDialect(newDialect);
  };

  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Hàm chọn Voice ID tương thích với dialect của hệ thống
  const getVoiceForDialect = (currentDialect: 'north' | 'south' | 'central') => {
    if (currentDialect === 'south') {
      const south = availableVoices.find(v => 
        v.name.toLowerCase().includes('south') || 
        v.name.toLowerCase().includes('hcm') ||
        v.name.toLowerCase().includes('loc')
      );
      return south?.identifier;
    } else if (currentDialect === 'central') {
      const central = availableVoices.find(v => 
        v.name.toLowerCase().includes('central') ||
        v.name.toLowerCase().includes('hue') ||
        v.name.toLowerCase().includes('danang')
      );
      if (central) return central.identifier;
      return undefined;
    } else {
      const north = availableVoices.find(v => 
        v.name.toLowerCase().includes('north') || 
        v.name.toLowerCase().includes('hn') ||
        v.name.toLowerCase().includes('chinh')
      );
      return north?.identifier;
    }
  };

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
        const voiceId = getVoiceForDialect(dialectRef.current);

        if (modeRef.current === 'read') {
          setActiveStepIndex(-1);
          // Thử phát bằng file âm thanh chất lượng cao (Solution A) trước
          const playedAsset = await playPhonicAssetAsync(token.text, 'final', dialectRef.current);
          
          // Fallback về giọng đọc hệ thống nếu file chưa được đồng bộ hoặc offline
          if (!playedAsset) {
            await speakAsync(token.text, speedRef.current, voiceId);
          }
          
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
              
              // Thử phát bằng file âm thanh chất lượng cao (Solution A) trước
              const playedAsset = await playPhonicAssetAsync(step.text, step.type, dialectRef.current);
              
              // Fallback về giọng đọc hệ thống nếu file chưa được đồng bộ hoặc offline
              if (!playedAsset) {
                await speakAsync(step.speech, speedRef.current, voiceId);
              }
              
              if (!isPlayingRef.current) break;
              await delay(250 / speedRef.current);
            }
          } else {
            setActiveStepIndex(-1);
            const playedAsset = await playPhonicAssetAsync(token.text, 'final', dialectRef.current);
            if (!playedAsset) {
              await speakAsync(token.text, speedRef.current, voiceId);
            }
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
    clearAssessment();
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

  const startRecording = async () => {
    try {
      stop();
      clearAssessment();

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
      setRecordedAudioUri(uri);
      recordingRef.current = null;

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
              const words = text.split(/\s+/);
              const simulatedWords = words.filter((_, idx) => idx % 4 !== 0);
              processAssessment(simulatedWords.join(' '));
            }
          },
          {
            text: 'Đọc Sai Nhiều ❌',
            onPress: () => {
              const words = text.split(/\s+/);
              const simulatedWords = words.filter((_, idx) => idx % 2 === 0);
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

  const playRecordedAudio = async () => {
    if (!recordedAudioUri) return;
    try {
      stop();
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordedAudioUri },
        { shouldPlay: true }
      );

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          newSound.unloadAsync();
        }
      });
    } catch (err) {
      console.warn('Lỗi phát âm thanh đã ghi âm:', err);
      Alert.alert('Thông báo', 'Không thể phát lại giọng đọc. Vui lòng ghi âm thử lại!');
    }
  };

  const processAssessment = (transcribedText: string) => {
    const wordTokens = tokens.filter(t => t.isWord);
    if (wordTokens.length === 0) {
      setIsAssessing(false);
      return;
    }

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

    const correctCount = matchedTargetIndices.size;
    const score = Math.round((correctCount / wordTokens.length) * 100);

    setWordAssessment(assessmentResult);
    setAssessmentScore(score);
    setIsAssessing(false);

    // BÁO CÁO: Lưu kết quả luyện đọc của bé vào lịch sử
    const missedWords = wordTokens
      .filter(token => assessmentResult[token.id] === 'incorrect')
      .map(token => token.text);

    saveSessionLog({
      date: new Date().toISOString(),
      text,
      score,
      missedWords,
    }).then(async (updatedLogs) => {
      // Tự động kiểm tra và mở khóa huy chương mới
      const newlyUnlockedIds = await checkAndUnlockAchievements(updatedLogs);
      if (newlyUnlockedIds.length > 0) {
        const firstUnlockedBadgeId = newlyUnlockedIds[0];
        const badge = ACHIEVEMENTS.find(a => a.id === firstUnlockedBadgeId);
        if (badge) {
          setUnlockedBadge(badge);
        }
      }
    }).catch((err) => {
      console.warn('Lỗi ghi lại lịch sử bài học:', err);
    });
  };

  const clearAssessment = () => {
    setWordAssessment(null);
    setAssessmentScore(null);
    setRecordedAudioUri(null);
  };

  const assessWordDirectly = (tokenId: string, state: 'correct' | 'incorrect') => {
    setWordAssessment(prev => ({
      ...(prev || {}),
      [tokenId]: state,
    }));
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
        recordedAudioUri,
        startRecording,
        stopRecordingAndAssess,
        playRecordedAudio,
        clearAssessment,

        theme,
        toggleTheme,

        dialect,
        setDialect,

        unlockedBadge,
        clearUnlockedBadge,
        
        assessWordDirectly,
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
