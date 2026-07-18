import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useReader } from '../context/ReaderContext';
import { COLORS } from '../theme/colors';

// Định nghĩa màu âm vị học cho ký tự
const PHONIC_COLORS = {
  onset: '#FF4B4B',  // Đỏ (Onset)
  rhyme: '#58CC02',  // Xanh lá (Rhyme)
  tone: '#1CB0F6',   // Xanh dương (Tone)
};

export const KaraokeText: React.FC = () => {
  const { tokens, activeTokenId, activeStepIndex, mode, wordAssessment, theme } = useReader();
  const isDark = theme === 'dark';

  // Hàm hiển thị chữ cái đang được đánh vần hoặc đọc dưới dạng các thẻ từ 3D Duolingo
  const renderWordToken = (token: any) => {
    const isActive = token.id === activeTokenId;
    const hasAssessment = wordAssessment && wordAssessment[token.id];
    
    // TRƯỜNG HỢP 1: Từ bình thường không được kích hoạt phát âm
    if (!isActive) {
      if (hasAssessment) {
        const isCorrect = wordAssessment[token.id] === 'correct';
        return (
          <View 
            key={token.id} 
            style={[
              styles.assessedWordContainer, 
              isCorrect ? styles.correctWord : styles.incorrectWord,
              { 
                borderColor: isCorrect ? '#A6E46D' : '#FFA2A2',
                borderBottomColor: isCorrect ? '#58CC02' : '#FF4B4B'
              }
            ]}
          >
            <Text style={[
              styles.wordText, 
              { color: isCorrect ? '#3A8501' : '#C82D2D' }
            ]}>
              {token.text}
            </Text>
          </View>
        );
      }
      
      return (
        <View 
          key={token.id}
          style={[
            styles.inactiveWordContainer,
            {
              backgroundColor: isDark ? COLORS.bgSoftDark : '#FFFFFF',
              borderColor: isDark ? COLORS.borderDark : COLORS.border,
              borderBottomColor: isDark ? '#162228' : '#E5E5E5',
            }
          ]}
        >
          <Text style={[styles.wordText, { color: isDark ? COLORS.textDark : COLORS.text }]}>
            {token.text}
          </Text>
        </View>
      );
    }

    // TRƯỜNG HỢP 2: Từ đang được phát âm (Active Word)
    const steps = token.spellingResult?.steps;
    
    // Nếu ở chế độ đọc trơn hoặc không có bước đánh vần
    if (mode === 'read' || !steps || activeStepIndex === -1 || activeStepIndex >= steps.length) {
      return (
        <View 
          key={token.id} 
          style={[
            styles.activeWordContainer,
            {
              backgroundColor: '#EFFFDF',
              borderColor: COLORS.primary,
              borderBottomColor: COLORS.primaryShadow,
            }
          ]}
        >
          <Text style={[styles.wordText, styles.activeWordText, { color: '#3A8501' }]}>
            {token.text}
          </Text>
        </View>
      );
    }

    const currentStep = steps[activeStepIndex];
    const parsed = token.spellingResult.parsed;
    const { onset, rhyme } = parsed;
    const originalText = token.text;

    // Phân rã từ thành Âm đầu và Vần để tô màu trực quan khi đánh vần
    let onsetPart = '';
    let rhymePart = originalText;

    if (onset) {
      const onsetLen = onset.length;
      onsetPart = originalText.slice(0, onsetLen);
      rhymePart = originalText.slice(onsetLen);
    }

    let onsetColor = isDark ? COLORS.textDark : COLORS.text;
    let rhymeColor = isDark ? COLORS.textDark : COLORS.text;
    let onsetWeight: 'normal' | 'bold' = 'normal';
    let rhymeWeight: 'normal' | 'bold' = 'normal';

    switch (currentStep.type) {
      case 'onset':
        onsetColor = PHONIC_COLORS.onset;
        onsetWeight = 'bold';
        break;
      case 'rhyme':
        rhymeColor = PHONIC_COLORS.rhyme;
        rhymeWeight = 'bold';
        break;
      case 'combined_no_tone':
        onsetColor = COLORS.primary;
        rhymeColor = COLORS.primary;
        onsetWeight = 'bold';
        rhymeWeight = 'bold';
        break;
      case 'tone':
        rhymeColor = PHONIC_COLORS.tone;
        onsetColor = isDark ? COLORS.textDark : COLORS.text;
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
      <View 
        key={token.id} 
        style={[
          styles.activeWordContainer,
          {
            backgroundColor: '#EFFFDF',
            borderColor: COLORS.primary,
            borderBottomColor: COLORS.primaryShadow,
          }
        ]}
      >
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
    <View style={[
      styles.container, 
      { 
        backgroundColor: isDark ? COLORS.cardBgDark : COLORS.cardBg,
        borderColor: isDark ? COLORS.borderDark : COLORS.border,
        borderBottomColor: isDark ? '#162228' : '#D5D5D5',
      }
    ]}>
      <View style={styles.textWrapper}>
        {tokens.map((token) => {
          if (token.isWord) {
            return renderWordToken(token);
          } else {
            // Hiển thị các dấu câu, ký tự đặc biệt
            const isNewline = token.text === '\n';
            if (isNewline) {
              return <View key={token.id} style={styles.newline} />;
            }
            return (
              <Text 
                key={token.id} 
                style={[
                  styles.punctuation, 
                  { color: isDark ? COLORS.mutedDark : COLORS.muted }
                ]}
              >
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
  },
  textWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  newline: {
    width: '100%',
    height: 10,
  },
  wordText: {
    fontSize: 24,
    fontWeight: '800',
  },
  spellingLetter: {
    fontSize: 24,
  },
  punctuation: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 2,
  },
  
  // Hộp thẻ từ ở các trạng thái khác nhau
  inactiveWordContainer: {
    borderRadius: 14,
    borderWidth: 2,
    borderBottomWidth: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeWordContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 2,
    borderBottomWidth: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  activeWordText: {
    fontWeight: '900',
  },
  
  // Thẻ từ sau khi được bé đọc và chấm điểm
  assessedWordContainer: {
    borderRadius: 14,
    borderWidth: 2,
    borderBottomWidth: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  correctWord: {
    backgroundColor: COLORS.correctBg,
  },
  incorrectWord: {
    backgroundColor: COLORS.incorrectBg,
  },
});
