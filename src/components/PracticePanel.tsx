import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useReader } from '../context/ReaderContext';
import { Celebration } from './Celebration';
import { Audio } from 'expo-av';
import { COLORS } from '../theme/colors';

export const PracticePanel: React.FC = () => {
  const { 
    isRecording, 
    isAssessing, 
    wordAssessment, 
    assessmentScore, 
    recordedAudioUri,
    startRecording, 
    stopRecordingAndAssess, 
    playRecordedAudio,
    clearAssessment,
    theme
  } = useReader();
  
  const [showCelebration, setShowCelebration] = useState(false);
  const [pressedBtn, setPressedBtn] = useState<'rec' | 'stop' | 'playVoice' | 'retry' | null>(null);

  const isDark = theme === 'dark';

  // Kích hoạt hiệu ứng chúc mừng khi bé đạt điểm cao (>= 80%)
  useEffect(() => {
    if (assessmentScore !== null && assessmentScore >= 80) {
      setShowCelebration(true);
      playVictorySound();
      
      const timer = setTimeout(() => setShowCelebration(false), 4000);
      return () => clearTimeout(timer);
    } else {
      setShowCelebration(false);
    }
  }, [assessmentScore]);

  const playVictorySound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav' }
      );
      await sound.playAsync();
    } catch {
      // Bỏ qua lỗi âm thanh nếu thiết bị offline
    }
  };

  const getStars = (score: number) => {
    if (score === 100) return '⭐⭐⭐⭐⭐';
    if (score >= 80) return '⭐⭐⭐⭐';
    if (score >= 60) return '⭐⭐⭐';
    return '⭐⭐';
  };

  const getMessage = (score: number) => {
    if (score === 100) return 'Xuất sắc quá! Con đọc chuẩn 100% rồi! 🎉';
    if (score >= 80) return 'Giỏi lắm! Con đọc rất tốt, chỉ sai một chút thôi! 🌟';
    if (score >= 60) return 'Khá tốt! Con hãy cố gắng đọc to rõ ràng hơn nhé! 👍';
    return 'Con cố lên! Hãy bấm đọc lại để luyện tập thêm nhé! ❤️';
  };

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: isDark ? COLORS.cardBgDark : COLORS.cardBg,
        borderColor: isDark ? COLORS.borderDark : COLORS.border,
        borderBottomColor: isDark ? '#162228' : '#D5D5D5',
      }
    ]}>
      {/* Hiệu ứng pháo hoa & sao rơi trên màn hình */}
      {showCelebration && <Celebration />}

      <Text style={[styles.title, { color: isDark ? COLORS.textDark : COLORS.text }]}>
        🎙️ Thử Thách Đọc To
      </Text>

      {/* TH 1: Đang trong quá trình ghi âm */}
      {isRecording && (
        <View style={styles.stateContainer}>
          <View style={styles.pulseContainer}>
            <View style={styles.pulseRing} />
            <Text style={styles.micIcon}>🎙️</Text>
          </View>
          <Text style={[styles.stateText, { color: isDark ? COLORS.textDark : COLORS.text }]}>
            Bé hãy nhìn vào chữ phía trên và đọc to lên nhé...
          </Text>
          
          <TouchableOpacity 
            activeOpacity={1}
            onPressIn={() => setPressedBtn('stop')}
            onPressOut={() => setPressedBtn(null)}
            onPress={stopRecordingAndAssess}
            style={[
              styles.actionBtn,
              {
                backgroundColor: COLORS.error,
                borderBottomColor: COLORS.errorShadow,
                transform: [{ translateY: pressedBtn === 'stop' ? 2 : 0 }],
                borderBottomWidth: pressedBtn === 'stop' ? 1 : 4,
              }
            ]}
          >
            <Text style={styles.btnText}>⏹️ HOÀN THÀNH ĐỌC</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* TH 2: Đang phân tích AI */}
      {isAssessing && (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
          <Text style={[styles.stateText, { color: isDark ? COLORS.textDark : COLORS.text }]}>
            Đang chấm điểm giọng đọc của bé...
          </Text>
        </View>
      )}

      {/* TH 3: Đã có kết quả đánh giá */}
      {wordAssessment !== null && assessmentScore !== null && (
        <View style={styles.resultContainer}>
          <View style={[
            styles.scoreCard, 
            { 
              backgroundColor: assessmentScore >= 80 ? COLORS.correctBg : COLORS.incorrectBg,
              borderColor: assessmentScore >= 80 ? '#A6E46D' : '#FFA2A2'
            }
          ]}>
            <Text style={styles.starsText}>{getStars(assessmentScore)}</Text>
            <Text style={[styles.scoreText, { color: COLORS.text }]}>
              Độ chính xác: {assessmentScore}%
            </Text>
            <Text style={[styles.messageText, { color: assessmentScore >= 80 ? '#3A8501' : '#C82D2D' }]}>
              {getMessage(assessmentScore)}
            </Text>
          </View>
          
          <View style={styles.resultActions}>
            {recordedAudioUri && (
              <TouchableOpacity 
                activeOpacity={1}
                onPressIn={() => setPressedBtn('playVoice')}
                onPressOut={() => setPressedBtn(null)}
                onPress={playRecordedAudio}
                style={[
                  styles.actionBtn,
                  styles.playVoiceBtn,
                  {
                    backgroundColor: COLORS.secondary,
                    borderBottomColor: COLORS.secondaryShadow,
                    transform: [{ translateY: pressedBtn === 'playVoice' ? 2 : 0 }],
                    borderBottomWidth: pressedBtn === 'playVoice' ? 1 : 4,
                  }
                ]}
              >
                <Text style={styles.btnText}>🔊 NGHE LẠI</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              activeOpacity={1}
              onPressIn={() => setPressedBtn('retry')}
              onPressOut={() => setPressedBtn(null)}
              onPress={clearAssessment}
              style={[
                styles.actionBtn, 
                styles.resetBtn,
                {
                  backgroundColor: isDark ? COLORS.bgSoftDark : '#FFFFFF',
                  borderColor: isDark ? COLORS.borderDark : COLORS.border,
                  borderBottomColor: isDark ? '#162228' : '#D5D5D5',
                  transform: [{ translateY: pressedBtn === 'retry' ? 2 : 0 }],
                  borderBottomWidth: pressedBtn === 'retry' ? 1 : 4,
                }
              ]}
            >
              <Text style={[styles.resetBtnText, { color: isDark ? COLORS.textDark : COLORS.text }]}>
                🔄 THỬ LẠI
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* TH 4: Trạng thái chờ bắt đầu luyện đọc */}
      {!isRecording && !isAssessing && wordAssessment === null && (
        <View style={styles.idleContainer}>
          <Text style={[styles.infoText, { color: isDark ? '#A0AEC0' : COLORS.muted }]}>
            Nhấn chiếc nút cam dưới đây để lắng nghe giọng đọc của bé, hệ thống sẽ tự động tô màu xanh/đỏ cho các từ bé đọc đúng/sai nhé! 🦉
          </Text>
          
          <TouchableOpacity 
            activeOpacity={1}
            onPressIn={() => setPressedBtn('rec')}
            onPressOut={() => setPressedBtn(null)}
            onPress={startRecording}
            style={[
              styles.actionBtn,
              {
                backgroundColor: COLORS.accent,
                borderBottomColor: COLORS.accentShadow,
                transform: [{ translateY: pressedBtn === 'rec' ? 3 : 0 }],
                borderBottomWidth: pressedBtn === 'rec' ? 1 : 4,
              }
            ]}
          >
            <Text style={styles.btnText}>🎙️ BẮT ĐẦU ĐỌC TO</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 2,
    borderBottomWidth: 5,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
    position: 'relative',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  stateContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  pulseContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFE3E3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  pulseRing: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: COLORS.error,
    opacity: 0.4,
  },
  micIcon: {
    fontSize: 28,
  },
  stateText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 18,
    fontWeight: '700',
    paddingHorizontal: 12,
  },
  loader: {
    marginBottom: 12,
  },
  actionBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playVoiceBtn: {
    flex: 1.2,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  idleContainer: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
    paddingHorizontal: 12,
  },
  resultContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    width: '100%',
  },
  scoreCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 2,
    padding: 16,
    alignItems: 'center',
    marginBottom: 18,
  },
  starsText: {
    fontSize: 26,
    marginBottom: 6,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 6,
  },
  messageText: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  resultActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  resetBtn: {
    borderWidth: 2,
    flex: 1,
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
