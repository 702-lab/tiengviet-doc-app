import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useReader } from '../context/ReaderContext';
import { COLORS } from '../theme/colors';

export const PracticePanel: React.FC = () => {
  const { 
    isRecording, 
    isAssessing, 
    wordAssessment, 
    assessmentScore, 
    startRecording, 
    stopRecordingAndAssess, 
    clearAssessment,
    theme
  } = useReader();
  const isDark = theme === 'dark';

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
  resetBtn: {
    borderWidth: 1.5,
  },
  resetBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});
