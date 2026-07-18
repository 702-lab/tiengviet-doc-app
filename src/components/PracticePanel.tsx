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
        borderColor: isDark ? '#2D3748' : COLORS.border
      }
    ]}>
      {/* Hiệu ứng pháo hoa & sao rơi trên màn hình */}
      {showCelebration && <Celebration />}

      <Text style={[styles.title, { color: isDark ? COLORS.textDark : COLORS.text }]}>🎙️ Luyện Phát Âm (AI STT)</Text>

      {/* TH 1: Đang trong quá trình ghi âm */}
      {isRecording && (
        <View style={styles.stateContainer}>
          <View style={styles.pulseIndicator} />
          <Text style={[styles.stateText, { color: isDark ? COLORS.textDark : COLORS.text }]}>
            Bé hãy nhìn vào chữ phía trên và đọc to lên nhé...
          </Text>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.stopRecBtn]} 
            onPress={stopRecordingAndAssess}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>⏹️ Hoàn thành đọc</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* TH 2: Đang phân tích AI */}
      {isAssessing && (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
          <Text style={[styles.stateText, { color: isDark ? COLORS.textDark : COLORS.text }]}>
            Trí tuệ nhân tạo đang phân tích giọng đọc...
          </Text>
        </View>
      )}

      {/* TH 3: Đã có kết quả đánh giá */}
      {wordAssessment !== null && assessmentScore !== null && (
        <View style={styles.resultContainer}>
          <Text style={styles.starsText}>{getStars(assessmentScore)}</Text>
          <Text style={[styles.scoreText, { color: isDark ? COLORS.textDark : COLORS.text }]}>
            Điểm chính xác: {assessmentScore}%
          </Text>
          <Text style={styles.messageText}>{getMessage(assessmentScore)}</Text>
          
          <View style={styles.resultActions}>
            {recordedAudioUri && (
              <TouchableOpacity 
                style={[
                  styles.actionBtn, 
                  styles.playVoiceBtn,
                ]} 
                onPress={playRecordedAudio}
                activeOpacity={0.8}
              >
                <Text style={styles.btnText}>🔊 Nghe lại giọng đọc</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[
                styles.actionBtn, 
                styles.resetBtn,
                {
                  backgroundColor: isDark ? '#2D3748' : '#F1F3F5',
                  borderColor: isDark ? '#4A5568' : COLORS.border
                }
              ]} 
              onPress={clearAssessment}
              activeOpacity={0.8}
            >
              <Text style={[styles.resetBtnText, { color: isDark ? COLORS.textDark : COLORS.text }]}>🔄 Luyện đọc lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* TH 4: Trạng thái chờ bắt đầu luyện đọc */}
      {!isRecording && !isAssessing && wordAssessment === null && (
        <View style={styles.idleContainer}>
          <Text style={[styles.infoText, { color: isDark ? '#718096' : COLORS.muted }]}>
            Bé hãy tự đọc đoạn văn trên. Hệ thống sẽ lắng nghe và tô màu xanh/đỏ cho các từ bé đọc đúng/sai!
          </Text>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.startRecBtn]} 
            onPress={startRecording}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>🎙️ Bắt đầu ghi âm tự đọc</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginVertical: 12,
    position: 'relative', // Quan trọng để định vị hoạt ảnh sao bay
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  stateContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  pulseIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    marginBottom: 8,
    opacity: 0.8,
  },
  stateText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  loader: {
    marginBottom: 12,
  },
  actionBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  startRecBtn: {
    backgroundColor: COLORS.primary,
  },
  stopRecBtn: {
    backgroundColor: COLORS.error,
  },
  playVoiceBtn: {
    backgroundColor: COLORS.secondary,
    flex: 1.2,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  idleContainer: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  resultContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  starsText: {
    fontSize: 28,
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  messageText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  resetBtn: {
    borderWidth: 1.5,
    flex: 1,
  },
  resetBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});
