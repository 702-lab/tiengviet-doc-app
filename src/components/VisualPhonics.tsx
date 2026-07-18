import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useReader } from '../context/ReaderContext';
import { COLORS } from '../theme/colors';

export const VisualPhonics: React.FC = () => {
  const { activeWordParsed, activeStepIndex, mode, tokens, activeTokenId } = useReader();

  // Tìm token hiện tại để lấy danh sách bước đánh vần
  const activeToken = tokens.find(t => t.id === activeTokenId);
  const steps = activeToken?.spellingResult?.steps;
  const currentStep = steps && activeStepIndex !== -1 && activeStepIndex < steps.length 
    ? steps[activeStepIndex] 
    : null;

  if (!activeWordParsed) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Chạm vào một từ bất kỳ hoặc bấm nút "Dạy đọc" để xem phân tích âm tiết tại đây
        </Text>
      </View>
    );
  }

  const { original, onset, onsetSpeech, rhyme, tone } = activeWordParsed;

  // Xác định xem hộp nào đang được highlight
  const isOnsetHighlight = mode === 'spell' && currentStep?.type === 'onset';
  const isRhymeHighlight = mode === 'spell' && currentStep?.type === 'rhyme';
  const isToneHighlight = mode === 'spell' && currentStep?.type === 'tone';
  const isCombinedHighlight = mode === 'spell' && currentStep?.type === 'combined_no_tone';
  const isFinalHighlight = mode === 'read' || currentStep?.type === 'final';

  // Chuyển đổi tên dấu thanh sang chữ hoa hiển thị cho trực quan
  const displayToneName = tone.toUpperCase();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Phân Tích Âm Tiết</Text>
      
      <View style={styles.wordTitleContainer}>
        <Text style={[
          styles.bigWord, 
          isFinalHighlight && styles.glowingWord
        ]}>
          {original}
        </Text>
        {mode === 'spell' && currentStep && (
          <Text style={styles.stepSpeechText}>
            Đang đọc: <Text style={styles.highlightText}>{currentStep.speech.toUpperCase()}</Text>
          </Text>
        )}
      </View>

      <View style={styles.boxesRow}>
        {/* Hộp Âm đầu */}
        {onset ? (
          <View style={[
            styles.partBox, 
            { borderColor: COLORS.onset },
            isOnsetHighlight && styles.activeBoxOnset,
            isCombinedHighlight && styles.combinedActiveBox
          ]}>
            <Text style={[styles.boxLabel, { color: COLORS.onset }]}>ÂM ĐẦU</Text>
            <Text style={styles.boxText}>{onset}</Text>
            <Text style={styles.boxSpeech}>({onsetSpeech})</Text>
          </View>
        ) : (
          <View style={[styles.partBox, styles.disabledBox]}>
            <Text style={styles.disabledLabel}>ÂM ĐẦU</Text>
            <Text style={styles.disabledText}>-</Text>
            <Text style={styles.disabledSub}>(Không có)</Text>
          </View>
        )}

        {/* Hộp Phần vần */}
        <View style={[
          styles.partBox, 
          { borderColor: COLORS.rhyme },
          isRhymeHighlight && styles.activeBoxRhyme,
          isCombinedHighlight && styles.combinedActiveBox
        ]}>
          <Text style={[styles.boxLabel, { color: COLORS.rhyme }]}>PHẦN VẦN</Text>
          <Text style={styles.boxText}>{rhyme}</Text>
          <Text style={styles.boxSpeech}>({rhyme})</Text>
        </View>

        {/* Hộp Thanh điệu */}
        <View style={[
          styles.partBox, 
          { borderColor: COLORS.tone },
          isToneHighlight && styles.activeBoxTone
        ]}>
          <Text style={[styles.boxLabel, { color: COLORS.tone }]}>THANH ĐIỆU</Text>
          <Text style={styles.boxText}>
            {tone === 'ngang' ? '◌' : tone === 'huyền' ? '◌̀' : tone === 'sắc' ? '◌́' : tone === 'hỏi' ? '◌̉' : tone === 'ngã' ? '◌̃' : '◌̣'}
          </Text>
          <Text style={styles.boxSpeech}>{displayToneName}</Text>
        </View>
      </View>

      {/* Hiển thị kịch bản đánh vần dưới dạng chữ */}
      {activeToken?.spellingResult?.spellingText && (
        <View style={styles.scriptContainer}>
          <Text style={styles.scriptTitle}>Công thức đánh vần:</Text>
          <Text style={styles.scriptText}>
            {activeToken.spellingResult.spellingText}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  emptyContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 30,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 24,
  },
  wordTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
    marginBottom: 15,
  },
  bigWord: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  glowingWord: {
    color: COLORS.primary,
    textShadowColor: 'rgba(255, 127, 80, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  stepSpeechText: {
    fontSize: 16,
    color: COLORS.muted,
    fontWeight: '600',
  },
  highlightText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  partBox: {
    flex: 1,
    backgroundColor: '#FCFBF7',
    borderRadius: 16,
    padding: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 1,
  },
  activeBoxOnset: {
    backgroundColor: 'rgba(230, 57, 70, 0.08)',
    borderColor: COLORS.onset,
    borderWidth: 3,
    transform: [{ scale: 1.05 }],
  },
  activeBoxRhyme: {
    backgroundColor: 'rgba(42, 157, 143, 0.08)',
    borderColor: COLORS.rhyme,
    borderWidth: 3,
    transform: [{ scale: 1.05 }],
  },
  activeBoxTone: {
    backgroundColor: 'rgba(69, 123, 157, 0.08)',
    borderColor: COLORS.tone,
    borderWidth: 3,
    transform: [{ scale: 1.05 }],
  },
  combinedActiveBox: {
    backgroundColor: 'rgba(255, 127, 80, 0.08)',
    borderColor: COLORS.primary,
    borderWidth: 3,
    transform: [{ scale: 1.03 }],
  },
  disabledBox: {
    backgroundColor: '#F1F3F5',
    borderColor: '#CED4DA',
  },
  boxLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  disabledLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ADB5BD',
    marginBottom: 8,
  },
  boxText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  disabledText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#CED4DA',
  },
  boxSpeech: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 4,
    fontWeight: '500',
  },
  disabledSub: {
    fontSize: 12,
    color: '#ADB5BD',
    marginTop: 4,
  },
  scriptContainer: {
    marginTop: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scriptTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.muted,
    marginBottom: 4,
  },
  scriptText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 1,
  },
});
