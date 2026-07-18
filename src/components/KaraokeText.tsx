import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useReader } from '../context/ReaderContext';
import { COLORS } from '../theme/colors';

export const KaraokeText: React.FC = () => {
  const { tokens, activeTokenId, activeStepIndex, mode, wordAssessment } = useReader();

  // Hàm hiển thị chữ cái đang được đánh vần trực tiếp trên từ đó
  const renderWordToken = (token: any) => {
    const isActive = token.id === activeTokenId;
    const hasAssessment = wordAssessment && wordAssessment[token.id];
    
    if (!isActive) {
      if (hasAssessment) {
        const isCorrect = wordAssessment[token.id] === 'correct';
        return (
          <View 
            key={token.id} 
            style={[
              styles.assessedWordContainer, 
              isCorrect ? styles.correctWord : styles.incorrectWord
            ]}
          >
            <Text style={[
              styles.normalWord, 
              { color: isCorrect ? '#2E7D32' : '#C62828', marginHorizontal: 0, paddingVertical: 0 }
            ]}>
              {token.text}
            </Text>
          </View>
        );
      }
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
    let onsetPart = '';
    let rhymePart = originalText;

    if (onset) {
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
        onsetColor = COLORS.onset;
        onsetWeight = 'bold';
        break;
      case 'rhyme':
        rhymeColor = COLORS.rhyme;
        rhymeWeight = 'bold';
        break;
      case 'combined_no_tone':
        onsetColor = COLORS.primary;
        rhymeColor = COLORS.primary;
        onsetWeight = 'bold';
        rhymeWeight = 'bold';
        break;
      case 'tone':
        rhymeColor = COLORS.tone;
        onsetColor = COLORS.text;
        onsetWeight = 'bold';
        rhymeWeight = 'bold';
        break;
      case 'final':
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
  
  // Styles phục vụ đánh giá phát âm đúng/sai
  assessedWordContainer: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginHorizontal: 2,
    borderWidth: 1,
  },
  correctWord: {
    backgroundColor: '#E8F5E9',
    borderColor: '#A5D6A7',
  },
  incorrectWord: {
    backgroundColor: '#FFEBEE',
    borderColor: '#EF9A9A',
  },
});
