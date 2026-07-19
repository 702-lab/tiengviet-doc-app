import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Modal, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { useReader } from '../context/ReaderContext';
import { speakAsync } from '../services/audioManager';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { COLORS } from '../theme/colors';

// Định nghĩa màu âm vị học cho ký tự
const PHONIC_COLORS = {
  onset: '#FF4B4B',  // Đỏ (Onset)
  rhyme: '#58CC02',  // Xanh lá (Rhyme)
  tone: '#1CB0F6',   // Xanh dương (Tone)
};

export const KaraokeText: React.FC = () => {
  const { 
    tokens, 
    activeTokenId, 
    activeStepIndex, 
    mode, 
    wordAssessment, 
    theme, 
    dialect, 
    speed, 
    assessWordDirectly 
  } = useReader();

  const isDark = theme === 'dark';

  // Trạng thái modal luyện phát âm từ đơn lẻ
  const [selectedToken, setSelectedToken] = useState<any | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [isAssessingSingle, setIsAssessingSingle] = useState(false);

  // Trạng thái nhấn nút 3D (Duolingo style)
  const [pressedBtn, setPressedBtn] = useState<'speak' | 'mic' | 'stop' | 'play' | 'correct' | 'incorrect' | 'close' | null>(null);
  const [pressedTokenId, setPressedTokenId] = useState<string | null>(null);

  const [availableVoices, setAvailableVoices] = useState<Speech.Voice[]>([]);

  React.useEffect(() => {
    Speech.getAvailableVoicesAsync().then((voices) => {
      setAvailableVoices(voices.filter((v) => v.language.startsWith('vi')));
    }).catch(() => {});
  }, []);

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
      return central?.identifier;
    } else {
      const north = availableVoices.find(v => 
        v.name.toLowerCase().includes('north') || 
        v.name.toLowerCase().includes('hn') ||
        v.name.toLowerCase().includes('hn') ||
        v.name.toLowerCase().includes('chinh')
      );
      return north?.identifier;
    }
  };

  const startSingleRecording = async () => {
    try {
      setHasRecorded(false);
      setRecordedUri(null);
      
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Quyền truy cập', 'Vui lòng cấp quyền Micro để luyện đọc từ này.');
        return;
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
    } catch (err) {
      console.warn('Lỗi ghi âm từ đơn:', err);
    }
  };

  const stopSingleRecordingAndAssess = async () => {
    if (!recording) return;
    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedUri(uri);
      setHasRecorded(true);
      setRecording(null);
      
      // Mở bảng đánh giá giả lập phát âm từ
      setIsAssessingSingle(true);
    } catch (err) {
      console.warn('Lỗi dừng ghi âm từ đơn:', err);
      setIsRecording(false);
    }
  };

  const playSingleRecordedAudio = async () => {
    if (!recordedUri) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: recordedUri },
        { shouldPlay: true }
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (err) {
      console.warn('Lỗi phát lại ghi âm từ đơn:', err);
    }
  };

  const speakSelectedWord = async () => {
    if (!selectedToken) return;
    const cleanWord = selectedToken.text.replace(/[.,!?;:"()“”]/g, '').trim();
    const voiceId = getVoiceForDialect(dialect);
    await speakAsync(cleanWord, speed, voiceId);
  };

  const handleSingleAssess = async (isCorrect: boolean) => {
    if (!selectedToken) return;
    assessWordDirectly(selectedToken.id, isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav' }
        );
        await sound.playAsync();
      } catch {}
    }
    
    closeModal();
  };

  const closeModal = () => {
    setSelectedToken(null);
    setIsRecording(false);
    setHasRecorded(false);
    setRecordedUri(null);
    setIsAssessingSingle(false);
  };

  // Hàm hiển thị chữ cái đang được đánh vần hoặc đọc dưới dạng các thẻ từ 3D Duolingo
  const renderWordToken = (token: any) => {
    const isActive = token.id === activeTokenId;
    const hasAssessment = wordAssessment && wordAssessment[token.id];
    const isPressed = token.id === pressedTokenId;

    let childComponent;

    // TRƯỜNG HỢP 1: Từ bình thường không được kích hoạt phát âm
    if (!isActive) {
      if (hasAssessment) {
        const isCorrect = wordAssessment[token.id] === 'correct';
        childComponent = (
          <View style={[
            styles.assessedWordContainer, 
            isCorrect ? styles.correctWord : styles.incorrectWord,
            { 
              borderColor: isCorrect ? '#A6E46D' : '#FFA2A2',
              borderBottomColor: isCorrect ? '#58CC02' : '#FF4B4B',
              transform: [{ translateY: isPressed ? 2 : 0 }],
              borderBottomWidth: isPressed ? 1 : 4,
            }
          ]}>
            <Text style={[
              styles.wordText, 
              { color: isCorrect ? '#3A8501' : '#C82D2D' }
            ]}>
              {token.text}
            </Text>
          </View>
        );
      } else {
        childComponent = (
          <View style={[
            styles.inactiveWordContainer,
            {
              backgroundColor: isDark ? COLORS.bgSoftDark : '#FFFFFF',
              borderColor: isDark ? COLORS.borderDark : COLORS.border,
              borderBottomColor: isDark ? '#162228' : '#E5E5E5',
              transform: [{ translateY: isPressed ? 2 : 0 }],
              borderBottomWidth: isPressed ? 1 : 4,
            }
          ]}>
            <Text style={[styles.wordText, { color: isDark ? COLORS.textDark : COLORS.text }]}>
              {token.text}
            </Text>
          </View>
        );
      }
    } else {
      // TRƯỜNG HỢP 2: Từ đang được phát âm (Active Word)
      const steps = token.spellingResult?.steps;
      
      // Nếu ở chế độ đọc trơn hoặc không có bước đánh vần
      if (mode === 'read' || !steps || activeStepIndex === -1 || activeStepIndex >= steps.length) {
        childComponent = (
          <View style={[
            styles.activeWordContainer,
            {
              backgroundColor: '#EFFFDF',
              borderColor: COLORS.primary,
              borderBottomColor: COLORS.primaryShadow,
              transform: [{ translateY: isPressed ? 2 : 0 }],
              borderBottomWidth: isPressed ? 1 : 4,
            }
          ]}>
            <Text style={[styles.wordText, styles.activeWordText, { color: '#3A8501' }]}>
              {token.text}
            </Text>
          </View>
        );
      } else {
        const currentStep = steps[activeStepIndex];
        const parsed = token.spellingResult.parsed;
        const { onset, rhyme } = parsed;
        const originalText = token.text;

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

        childComponent = (
          <View style={[
            styles.activeWordContainer,
            {
              backgroundColor: '#EFFFDF',
              borderColor: COLORS.primary,
              borderBottomColor: COLORS.primaryShadow,
              transform: [{ translateY: isPressed ? 2 : 0 }],
              borderBottomWidth: isPressed ? 1 : 4,
            }
          ]}>
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
      }
    }

    return (
      <TouchableOpacity
        key={token.id}
        activeOpacity={1}
        onPressIn={() => setPressedTokenId(token.id)}
        onPressOut={() => setPressedTokenId(null)}
        onPress={() => setSelectedToken(token)}
      >
        {childComponent}
      </TouchableOpacity>
    );
  };

  // Lấy gợi ý phát âm phân tách âm đầu/vần nếu có
  const onsetHint = selectedToken?.spellingResult?.parsed?.onset;
  const rhymeHint = selectedToken?.spellingResult?.parsed?.rhyme;
  const toneHint = selectedToken?.spellingResult?.parsed?.tone;

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

      {/* Modal Luyện Tập Từ Đơn Lẻ (Mic-trigger Popover) */}
      <Modal
        visible={!!selectedToken}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalCard,
            { 
              backgroundColor: isDark ? COLORS.cardBgDark : '#FFFFFF',
              borderColor: isDark ? COLORS.borderDark : COLORS.border,
            }
          ]}>
            <Text style={[styles.modalLabel, { color: COLORS.primary }]}>🎯 LUYỆN ĐỌC TỪ ĐƠN</Text>
            <Text style={[styles.largeWord, { color: isDark ? COLORS.textDark : COLORS.text }]}>
              {selectedToken?.text}
            </Text>

            {/* Gợi ý Phonics */}
            {(onsetHint || rhymeHint) && (
              <View style={styles.phonicsHintRow}>
                {onsetHint && (
                  <Text style={[styles.phonicsHintItem, { color: PHONIC_COLORS.onset, backgroundColor: isDark ? '#2D1B1B' : '#FFE3E3' }]}>
                    Âm đầu: {onsetHint}
                  </Text>
                )}
                {rhymeHint && (
                  <Text style={[styles.phonicsHintItem, { color: PHONIC_COLORS.rhyme, backgroundColor: isDark ? '#1B2D1B' : '#E8FBE8' }]}>
                    Vần: {rhymeHint}
                  </Text>
                )}
              </View>
            )}

            {/* Nút hành động */}
            <View style={styles.modalActionsRow}>
              {/* Nghe mẫu */}
              <TouchableOpacity
                activeOpacity={1}
                onPressIn={() => setPressedBtn('speak')}
                onPressOut={() => setPressedBtn(null)}
                onPress={speakSelectedWord}
                style={[
                  styles.circleBtn,
                  {
                    backgroundColor: '#1CB0F6',
                    borderBottomColor: '#1899D6',
                    transform: [{ translateY: pressedBtn === 'speak' ? 2 : 0 }],
                    borderBottomWidth: pressedBtn === 'speak' ? 1 : 4,
                  }
                ]}
              >
                <Text style={styles.circleBtnText}>🔊</Text>
              </TouchableOpacity>

              {/* Ghi âm */}
              <TouchableOpacity
                activeOpacity={1}
                onPressIn={() => setPressedBtn(isRecording ? 'stop' : 'mic')}
                onPressOut={() => setPressedBtn(null)}
                onPress={isRecording ? stopSingleRecordingAndAssess : startSingleRecording}
                style={[
                  styles.circleBtn,
                  {
                    backgroundColor: isRecording ? COLORS.error : COLORS.primary,
                    borderBottomColor: isRecording ? COLORS.errorShadow : COLORS.primaryShadow,
                    transform: [{ translateY: (pressedBtn === 'mic' || pressedBtn === 'stop') ? 2 : 0 }],
                    borderBottomWidth: (pressedBtn === 'mic' || pressedBtn === 'stop') ? 1 : 4,
                  }
                ]}
              >
                <Text style={styles.circleBtnText}>{isRecording ? '⏹️' : '🎙️'}</Text>
              </TouchableOpacity>

              {/* Nghe lại giọng bé */}
              <TouchableOpacity
                activeOpacity={1}
                onPressIn={() => setPressedBtn('play')}
                onPressOut={() => setPressedBtn(null)}
                onPress={playSingleRecordedAudio}
                disabled={!hasRecorded}
                style={[
                  styles.circleBtn,
                  {
                    backgroundColor: hasRecorded ? COLORS.secondary : '#E5E5E5',
                    borderBottomColor: hasRecorded ? COLORS.secondaryShadow : '#D5D5D5',
                    transform: [{ translateY: pressedBtn === 'play' ? 2 : 0 }],
                    borderBottomWidth: pressedBtn === 'play' ? 1 : 4,
                    opacity: hasRecorded ? 1 : 0.5,
                  }
                ]}
              >
                <Text style={styles.circleBtnText}>🎧</Text>
              </TouchableOpacity>
            </View>

            {/* Trạng thái ghi âm */}
            {isRecording && (
              <Text style={[styles.statusText, { color: COLORS.error }]}>
                🎙️ Đang ghi âm... Con đọc đi nhé!
              </Text>
            )}

            {/* Hộp chấm điểm giả lập cho bố mẹ */}
            {isAssessingSingle && (
              <View style={styles.assessPromptBox}>
                <Text style={[styles.assessPromptTitle, { color: isDark ? COLORS.textDark : COLORS.text }]}>
                  Bố mẹ kiểm tra giọng đọc của bé:
                </Text>
                <View style={styles.assessBtnRow}>
                  <TouchableOpacity
                    activeOpacity={1}
                    onPressIn={() => setPressedBtn('correct')}
                    onPressOut={() => setPressedBtn(null)}
                    onPress={() => handleSingleAssess(true)}
                    style={[
                      styles.assessBtn,
                      {
                        backgroundColor: COLORS.primary,
                        borderBottomColor: COLORS.primaryShadow,
                        transform: [{ translateY: pressedBtn === 'correct' ? 2 : 0 }],
                        borderBottomWidth: pressedBtn === 'correct' ? 1 : 4,
                      }
                    ]}
                  >
                    <Text style={styles.assessBtnText}>ĐỌC ĐÚNG 🌟</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={1}
                    onPressIn={() => setPressedBtn('incorrect')}
                    onPressOut={() => setPressedBtn(null)}
                    onPress={() => handleSingleAssess(false)}
                    style={[
                      styles.assessBtn,
                      {
                        backgroundColor: COLORS.error,
                        borderBottomColor: COLORS.errorShadow,
                        transform: [{ translateY: pressedBtn === 'incorrect' ? 2 : 0 }],
                        borderBottomWidth: pressedBtn === 'incorrect' ? 1 : 4,
                      }
                    ]}
                  >
                    <Text style={styles.assessBtnText}>CHƯA ĐÚNG ⚠️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TouchableOpacity
              activeOpacity={1}
              onPressIn={() => setPressedBtn('close')}
              onPressOut={() => setPressedBtn(null)}
              onPress={closeModal}
              style={[
                styles.closeModalBtn,
                {
                  backgroundColor: isDark ? COLORS.bgSoftDark : '#FFFFFF',
                  borderColor: isDark ? COLORS.borderDark : COLORS.border,
                  borderBottomColor: isDark ? '#162228' : '#D5D5D5',
                  transform: [{ translateY: pressedBtn === 'close' ? 2 : 0 }],
                  borderBottomWidth: pressedBtn === 'close' ? 1 : 4,
                }
              ]}
            >
              <Text style={[styles.closeModalBtnText, { color: isDark ? COLORS.textDark : COLORS.text }]}>
                ĐÓNG
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    borderRadius: 28,
    borderWidth: 2,
    borderBottomWidth: 5,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  largeWord: {
    fontSize: 48,
    fontWeight: '900',
    marginBottom: 16,
    textAlign: 'center',
  },
  phonicsHintRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  phonicsHintItem: {
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  circleBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBtnText: {
    fontSize: 24,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 16,
  },
  assessPromptBox: {
    width: '100%',
    borderWidth: 1.5,
    borderRadius: 20,
    borderColor: '#E5E5E5',
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  assessPromptTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 12,
  },
  assessBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  assessBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assessBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  closeModalBtn: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  closeModalBtnText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
