import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useReader } from '../context/ReaderContext';
import { Audio } from 'expo-av';
import { COLORS } from '../theme/colors';

export const VisualPhonics: React.FC = () => {
  const { activeWordParsed, theme } = useReader();
  const isDark = theme === 'dark';

  // State cho mini-game ghép chữ
  const [letters, setLetters] = useState<string[]>([]);
  const [scrambled, setScrambled] = useState<{ id: string; char: string; used: boolean }[]>([]);
  const [assembled, setAssembled] = useState<{ id: string; char: string }[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [pressedChoiceId, setPressedChoiceId] = useState<string | null>(null);
  const [pressedReset, setPressedReset] = useState(false);

  // Khởi tạo/xáo trộn chữ khi bé chọn từ khác
  useEffect(() => {
    if (!activeWordParsed) return;
    
    const wordClean = activeWordParsed.original.toLowerCase().replace(/[.,!?;:"()“”]/g, '').trim();
    const charArray = wordClean.split('');
    setLetters(charArray);
    
    // Tạo danh sách chữ cái kèm ID ngẫu nhiên để tránh trùng lặp keys
    const items = charArray.map((char, index) => ({
      id: `${char}-${index}-${Math.random()}`,
      char,
      used: false
    }));

    // Xáo trộn chữ cái
    const scrambledItems = [...items].sort(() => Math.random() - 0.5);
    setScrambled(scrambledItems);
    setAssembled([]);
    setIsSuccess(false);
    setIsError(false);
  }, [activeWordParsed]);

  if (!activeWordParsed) {
    return (
      <View style={[
        styles.container,
        {
          backgroundColor: isDark ? COLORS.cardBgDark : COLORS.cardBg,
          borderColor: isDark ? COLORS.borderDark : COLORS.border,
          borderBottomColor: isDark ? '#162228' : '#D5D5D5',
        }
      ]}>
        <Text style={[styles.title, { color: isDark ? COLORS.textDark : COLORS.text }]}>
          🧩 Ghép Vần Kỳ Diệu
        </Text>
        <Text style={[styles.placeholder, { color: isDark ? COLORS.mutedDark : COLORS.muted }]}>
          Hãy bấm phát âm hoặc chọn một từ phía trên để xem các mảnh ghép vần của từ đó nhé! 🦉
        </Text>
      </View>
    );
  }

  const { original, onset, rhyme, tone, toneChar } = activeWordParsed;

  const handleTapChoice = async (item: { id: string; char: string }) => {
    if (isSuccess || isError) return;

    // Đánh dấu đã chọn
    setScrambled(prev => prev.map(x => x.id === item.id ? { ...x, used: true } : x));
    
    const nextAssembled = [...assembled, item];
    setAssembled(nextAssembled);

    // Kiểm tra khi ghép đủ ký tự
    if (nextAssembled.length === letters.length) {
      const assembledWord = nextAssembled.map(x => x.char).join('');
      const targetWord = letters.join('');

      if (assembledWord === targetWord) {
        setIsSuccess(true);
        // Phát tiếng chuông chiến thắng vui tai
        try {
          const { sound } = await Audio.Sound.createAsync(
            { uri: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav' }
          );
          await sound.playAsync();
        } catch {}
      } else {
        setIsError(true);
        // Reset sau 1.2s nếu sai để bé xếp lại
        setTimeout(() => {
          setScrambled(prev => prev.map(x => ({ ...x, used: false })));
          setAssembled([]);
          setIsError(false);
        }, 1200);
      }
    }
  };

  const handleResetGame = () => {
    setScrambled(prev => prev.map(x => ({ ...x, used: false })));
    setAssembled([]);
    setIsSuccess(false);
    setIsError(false);
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
      {/* 1. Tiêu đề ghép vần */}
      <Text style={[styles.title, { color: isDark ? COLORS.textDark : COLORS.text }]}>
        🧩 Ghép Vần Kỳ Diệu: "{original}"
      </Text>

      {/* 2. Các ô vần tĩnh */}
      <View style={styles.tilesRow}>
        {/* Âm Đầu (Onset) */}
        <View style={[
          styles.tileWrapper, 
          { borderColor: isDark ? COLORS.borderDark : COLORS.border }
        ]}>
          <View style={[styles.tileHeader, { backgroundColor: '#FFD9D9' }]}>
            <Text style={[styles.tileHeaderLabel, { color: '#E12A2A' }]}>Âm đầu</Text>
          </View>
          <View style={[styles.tileContent, { backgroundColor: isDark ? COLORS.bgDark : '#FFF5F5' }]}>
            <Text style={[styles.tileText, { color: '#E12A2A' }]}>
              {onset ? onset : '∅'}
            </Text>
          </View>
        </View>

        {/* Vần (Rhyme) */}
        <View style={[
          styles.tileWrapper, 
          { borderColor: isDark ? COLORS.borderDark : COLORS.border }
        ]}>
          <View style={[styles.tileHeader, { backgroundColor: '#D7FFB7' }]}>
            <Text style={[styles.tileHeaderLabel, { color: '#46A302' }]}>Vần</Text>
          </View>
          <View style={[styles.tileContent, { backgroundColor: isDark ? COLORS.bgDark : '#F5FFF0' }]}>
            <Text style={[styles.tileText, { color: '#46A302' }]}>
              {rhyme}
            </Text>
          </View>
        </View>

        {/* Thanh điệu (Tone) */}
        <View style={[
          styles.tileWrapper, 
          { borderColor: isDark ? COLORS.borderDark : COLORS.border }
        ]}>
          <View style={[styles.tileHeader, { backgroundColor: '#D1F2FF' }]}>
            <Text style={[styles.tileHeaderLabel, { color: '#1899D6' }]}>Dấu thanh</Text>
          </View>
          <View style={[styles.tileContent, { backgroundColor: isDark ? COLORS.bgDark : '#F0F9FF' }]}>
            <Text style={[styles.tileText, { color: '#1899D6' }]}>
              {tone !== 'ngang' ? `${toneChar}\n(${tone})` : 'ngang'}
            </Text>
          </View>
        </View>
      </View>

      {/* Phân tách ngăn cách */}
      <View style={[styles.divider, { backgroundColor: isDark ? COLORS.borderDark : '#E5E5E5' }]} />

      {/* 3. Thử thách xếp chữ tương tác */}
      <View style={styles.gameContainer}>
        <Text style={[styles.gameSubtitle, { color: COLORS.secondary }]}>
          🎯 BÉ HÃY GHÉP CÁC CHỮ CÁI:
        </Text>

        {/* Khung lắp ghép chữ (Workspace) */}
        <View style={[
          styles.workspaceRow,
          isSuccess && styles.successBorder,
          isError && styles.errorBorder
        ]}>
          {assembled.length === 0 && !isSuccess && (
            <Text style={[styles.gamePlaceholder, { color: isDark ? COLORS.mutedDark : COLORS.muted }]}>
              Chạm chữ cái phía dưới để ghép...
            </Text>
          )}
          {assembled.map((item, idx) => (
            <View key={`assembled-${idx}`} style={styles.assembledTile}>
              <Text style={styles.assembledTileText}>{item.char}</Text>
            </View>
          ))}
          {isSuccess && (
            <Text style={styles.winEmoji}>🌟 HOÀN THÀNH! 🦉🎉</Text>
          )}
        </View>

        {/* Các chữ cái để bé chọn (Choices Row) */}
        <View style={styles.choicesRow}>
          {scrambled.map((item) => (
            <TouchableOpacity
              key={item.id}
              disabled={item.used || isSuccess || isError}
              activeOpacity={1}
              onPressIn={() => setPressedChoiceId(item.id)}
              onPressOut={() => setPressedChoiceId(null)}
              onPress={() => handleTapChoice(item)}
              style={[
                styles.choiceTile,
                {
                  backgroundColor: item.used ? (isDark ? '#1C2E24' : '#F0F0F0') : '#FFFFFF',
                  borderColor: item.used ? 'transparent' : COLORS.primary,
                  borderBottomColor: item.used ? 'transparent' : COLORS.primaryShadow,
                  transform: [{ translateY: pressedChoiceId === item.id ? 2 : 0 }],
                  borderBottomWidth: item.used ? 0 : (pressedChoiceId === item.id ? 1 : 4),
                  opacity: item.used ? 0.3 : 1
                }
              ]}
            >
              <Text style={[
                styles.choiceTileText,
                { color: item.used ? '#CCCCCC' : COLORS.primary }
              ]}>
                {item.char}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Nút reset */}
        {assembled.length > 0 && !isSuccess && (
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={() => setPressedReset(true)}
            onPressOut={() => setPressedReset(false)}
            onPress={handleResetGame}
            style={[
              styles.resetBtn,
              {
                backgroundColor: isDark ? COLORS.bgSoftDark : '#FFFFFF',
                borderColor: isDark ? COLORS.borderDark : COLORS.border,
                borderBottomColor: isDark ? '#162228' : '#D5D5D5',
                transform: [{ translateY: pressedReset ? 2 : 0 }],
                borderBottomWidth: pressedReset ? 1 : 4,
              }
            ]}
          >
            <Text style={[styles.resetBtnText, { color: isDark ? COLORS.textDark : COLORS.text }]}>
              🔄 LÀM LẠI
            </Text>
          </TouchableOpacity>
        )}
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
  title: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  placeholder: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingVertical: 10,
    fontStyle: 'italic',
  },
  tilesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tileWrapper: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  tileHeader: {
    paddingVertical: 4,
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#E5E5E5',
  },
  tileHeaderLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  tileContent: {
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tileText: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  divider: {
    height: 2,
    marginVertical: 16,
    width: '100%',
  },

  // Game Styles
  gameContainer: {
    width: '100%',
    alignItems: 'center',
  },
  gameSubtitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  workspaceRow: {
    flexDirection: 'row',
    width: '100%',
    minHeight: 64,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  gamePlaceholder: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  successBorder: {
    borderColor: '#58CC02',
    borderStyle: 'solid',
    backgroundColor: '#EFFFDF',
  },
  errorBorder: {
    borderColor: '#FF4B4B',
    borderStyle: 'solid',
    backgroundColor: '#FFE3E3',
  },
  assembledTile: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  assembledTileText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  winEmoji: {
    fontSize: 16,
    fontWeight: '900',
    color: '#3A8501',
  },
  choicesRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
    width: '100%',
  },
  choiceTile: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceTileText: {
    fontSize: 20,
    fontWeight: '900',
  },
  resetBtn: {
    borderRadius: 14,
    borderWidth: 2,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
