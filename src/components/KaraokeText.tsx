import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useReader } from '../context/ReaderContext';
import { COLORS } from '../theme/colors';

export const KaraokeText: React.FC = () => {
  const { tokens, activeTokenId, activeStepIndex, mode } = useReader();

  // Hàm hiển thị chữ cái đang được đánh vần trực tiếp trên từ đó
  const renderWordToken = (token: any) => {
    const isActive = token.id === activeTokenId;
    
    if (!isActive) {
      return (
        <Text key={token.id} style={styles.normalWord}>
          {token.text}
        </Text>
      );
    }

    // Nếu từ đang phát âm và ở chế độ đọc trơn (hoặc không phân tích được vần)
    const steps = token.spellingResult?.steps;
    if (mode === 'read' || !steps || activeStepIndex === -1 || activeStepIndex >= steps.length) {
      return (
        <View key={token.id} style={styles.activeWordContainer}>
          <Text style={styles.activeWordFull}>
            {token.text}
          </Text>
        </View>
      );
    }

    const currentStep = steps[activeStepIndex];
    const parsed = token.spellingResult.parsed;
    const { onset, rhyme } = parsed;
    const originalText = token.text;

    // Phân rã từ để tô màu chi tiết theo từng ký tự
    // Ví dụ: "bàn" -> "b" (âm đầu) + "àn" (phần vần chứa dấu)
    let onsetPart = '';
    let rhymePart = originalText;

    if (onset) {
      // Tìm điểm cắt âm đầu (bỏ qua viết hoa/thường)
      const onsetLen = onset.length;
      onsetPart = originalText.slice(0, onsetLen);
      rhymePart = originalText.slice(onsetLen);
    }

    let onsetColor = COLORS.text;
    let rhymeColor = COLORS.text;
    let onsetWeight: 'normal' | 'bold' = 'normal';
    let rhymeWeight: 'normal' | 'bold' = 'normal';

    switch (currentStep.type) {
      case 'onset':
        // Đang đánh vần âm đầu -> Tô màu đỏ/coral, phóng to âm đầu
        onsetColor = COLORS.onset;
        onsetWeight = 'bold';
        break;
      case 'rhyme':
        // Đang đánh vần vần -> Tô màu xanh lá, phóng to vần
        rhymeColor = COLORS.rhyme;
        rhymeWeight = 'bold';
        break;
      case 'combined_no_tone':
        // Đọc ghép âm + vần chưa dấu -> Tô cả hai bằng màu trung gian, viết đậm
        onsetColor = COLORS.primary;
        rhymeColor = COLORS.primary;
        onsetWeight = 'bold';
        rhymeWeight = 'bold';
        break;
      case 'tone':
        // Đọc thanh điệu -> Tô vần bằng màu xanh dương (nơi chứa dấu thanh)
        rhymeColor = COLORS.tone;
        onsetColor = COLORS.text;
        onsetWeight = 'bold';
        rhymeWeight = 'bold';
        break;
      case 'final':
        // Đọc nguyên từ -> Highlight toàn bộ
        onsetColor = COLORS.primary;
        rhymeColor = COLORS.primary;
        onsetWeight = 'bold';
        rhymeWeight = 'bold';
        break;
    }

    return (
      <View key={token.id} style={styles.activeWordContainer}>
        {onsetPart ? (
          <Text style={[styles.spellingLetter, { color: onsetColor, fontWeight: onsetWeight }]}>
            {onsetPart}
          </Text>
        ) : null}
        <Text style={[styles.spellingLetter, { color: rhymeColor, fontWeight: rhymeWeight }]}>
          {rhymePart}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.textWrapper}>
        {tokens.map((token) => {
          if (token.isWord) {
            return renderWordToken(token);
          } else {
            // Hiển thị khoảng trắng hoặc dấu câu bình thường
            return (
              <Text key={token.id} style={styles.punctuation}>
                {token.text}
              </Text>
            );
          }
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginVertical: 12,
  },
  textWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    lineHeight: 48,
  },
  normalWord: {
    fontSize: 28,
    color: COLORS.text,
    fontFamily: 'System',
    marginHorizontal: 2,
    paddingVertical: 4,
    borderRadius: 8,
  },
  punctuation: {
    fontSize: 28,
    color: COLORS.muted,
    fontFamily: 'System',
  },
  activeWordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.highlightBg,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginHorizontal: 2,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  activeWordFull: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.highlightText,
    fontFamily: 'System',
  },
  spellingLetter: {
    fontSize: 28,
    fontFamily: 'System',
  },
});
