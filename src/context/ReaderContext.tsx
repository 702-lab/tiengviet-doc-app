import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Token, tokenizeText, ParsedSyllable } from '../services/phonicsEngine';
import { speakAsync, stopAllSpeech } from '../services/audioManager';

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
  const [speed, _setSpeed] = useState(0.8); // Mặc định chậm một chút cho bé (0.8x)
  const [mode, _setMode] = useState<'spell' | 'read'>('spell');

  // Refs để lưu trữ trạng thái chạy ngầm tránh lỗi closure trong hàm async
  const isPlayingRef = useRef(false);
  const tokensRef = useRef<Token[]>([]);
  const currentIndexRef = useRef(0);
  const speedRef = useRef(0.8);
  const modeRef = useRef<'spell' | 'read'>('spell');
  const loopActiveRef = useRef(false);

  // Cập nhật các ref khi state thay đổi
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

  // Hàm chạy vòng lặp phát âm thanh tuần tự
  const runPlaybackLoop = async () => {
    if (loopActiveRef.current) return;
    loopActiveRef.current = true;

    try {
      while (isPlayingRef.current && currentIndexRef.current < tokensRef.current.length) {
        const index = currentIndexRef.current;
        const token = tokensRef.current[index];

        if (!token.isWord) {
          // Token là khoảng trắng hoặc dấu câu
          setActiveTokenId(token.id);
          setActiveStepIndex(-1);
          
          // Xác định thời gian dừng nghỉ theo loại dấu câu
          let pauseTime = 100; // Mặc định cho dấu cách
          const trimmedText = token.text.trim();
          if (trimmedText && PUNCTUATION_DELAYS[trimmedText]) {
            pauseTime = PUNCTUATION_DELAYS[trimmedText];
          }
          
          // Chia cho tốc độ đọc
          await delay(pauseTime / speedRef.current);
          currentIndexRef.current++;
          continue;
        }

        // Token là từ cần đọc
        setActiveTokenId(token.id);

        if (modeRef.current === 'read') {
          // CHẾ ĐỘ ĐỌC TRƠN
          setActiveStepIndex(-1);
          await speakAsync(token.text, speedRef.current);
          
          if (!isPlayingRef.current) break;
          // Nghỉ giữa các từ
          await delay(350 / speedRef.current);
        } else {
          // CHẾ ĐỘ ĐÁNH VẦN
          const spellingResult = token.spellingResult;
          if (spellingResult && spellingResult.steps.length > 0) {
            const steps = spellingResult.steps;
            
            for (let stepIdx = 0; stepIdx < steps.length; stepIdx++) {
              if (!isPlayingRef.current) break;
              
              setActiveStepIndex(stepIdx);
              const step = steps[stepIdx];
              
              // Đọc âm của bước hiện tại
              await speakAsync(step.speech, speedRef.current);
              
              if (!isPlayingRef.current) break;
              // Nghỉ giữa các bước đánh vần
              await delay(250 / speedRef.current);
            }
          } else {
            // Trường hợp dự phòng nếu không phân tích được vần
            setActiveStepIndex(-1);
            await speakAsync(token.text, speedRef.current);
          }
          
          if (!isPlayingRef.current) break;
          // Nghỉ lâu hơn một chút sau khi đánh vần xong một từ để bé hấp thụ
          await delay(450 / speedRef.current);
        }

        if (!isPlayingRef.current) break;
        currentIndexRef.current++;
      }

      // Kiểm tra xem đã kết thúc toàn bộ văn bản chưa
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
    
    // Nếu đã hoàn thành trước đó thì chạy lại từ đầu
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

  // Hủy âm thanh khi unmount component
  useEffect(() => {
    return () => {
      stopAllSpeech();
    };
  }, []);

  // Lấy phân tích âm tiết của từ đang hoạt động để phục vụ UI VisualPhonics
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
