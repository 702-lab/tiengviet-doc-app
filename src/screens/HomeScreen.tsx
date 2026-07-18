import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { useReader } from '../context/ReaderContext';
import { loadCustomPassages, saveCustomPassages, loadSessionLogs, clearSessionLogs, SessionLog } from '../services/storage';
import { COLORS } from '../theme/colors';

const SAMPLE_STORIES = [
  { title: '🐱 Con mèo nhà em', text: 'Con mèo nhà em lông màu trắng muốt. Nó rất ngoan và thích bắt chuột.' },
  { title: '☀️ Buổi sáng quê em', text: 'Buổi sáng quê em gió mát rượi. Ông mặt trời đỏ rực nhô lên sau lũy tre làng.' },
  { title: '🐠 Chú cá vàng lấp lánh', text: 'Chú cá vàng bơi lội tung tăng trong bể nước. Vảy cá vàng óng lấp lánh như dát vàng.' }
];

interface HomeScreenProps {
  onNavigateToReader: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToReader }) => {
  const { setText, theme, toggleTheme } = useReader();
  const [inputText, setInputText] = useState('');
  const [customPassages, setCustomPassages] = useState<string[]>([]);
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Trạng thái nhấn nút 3D (Duolingo style)
  const [isPlayPressed, setIsPlayPressed] = useState(false);
  const [isThemePressed, setIsThemePressed] = useState(false);
  const [isClearPressed, setIsClearPressed] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    loadCustomPassages().then(setCustomPassages);
    loadSessionLogs().then(setSessionLogs);
  }, []);

  const handleStartPlay = (textToPlay: string) => {
    if (!textToPlay.trim()) {
      Alert.alert('Bố mẹ ơi!', 'Hãy nhập một đoạn văn hoặc chọn bài đọc mẫu phía dưới cho bé nhé!');
      return;
    }

    setText(textToPlay);
    
    // Nếu là đoạn văn tự soạn chưa có trong danh sách, lưu lại
    const isSample = SAMPLE_STORIES.some(s => s.text === textToPlay);
    const isAlreadySaved = customPassages.includes(textToPlay);
    if (!isSample && !isAlreadySaved) {
      const updated = [textToPlay, ...customPassages];
      setCustomPassages(updated);
      saveCustomPassages(updated);
    }

    onNavigateToReader();
  };

  const handleDeletePassage = (indexToDelete: number) => {
    Alert.alert(
      'Xóa bài đọc',
      'Bố mẹ có chắc chắn muốn xóa bài tự soạn này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: () => {
            const updated = customPassages.filter((_, idx) => idx !== indexToDelete);
            setCustomPassages(updated);
            saveCustomPassages(updated);
          }
        }
      ]
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Xóa lịch sử',
      'Bố mẹ có chắc chắn muốn xóa toàn bộ học bạ của bé không? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa sạch',
          style: 'destructive',
          onPress: async () => {
            await clearSessionLogs();
            setSessionLogs([]);
            Alert.alert('Thành công', 'Đã xóa toàn bộ lịch sử học tập.');
          }
        }
      ]
    );
  };

  // Tính toán số liệu học bạ của bé
  const totalSessions = sessionLogs.length;
  const averageScore = totalSessions > 0 
    ? Math.round(sessionLogs.reduce((acc, log) => acc + log.score, 0) / totalSessions)
    : 0;

  // Lấy các từ hay đọc sai nhất (top 3)
  const wordCounts: { [word: string]: number } = {};
  sessionLogs.forEach((log) => {
    log.missedWords.forEach((word) => {
      const clean = word.toLowerCase().replace(/[.,!?;:"()“”]/g, '').trim();
      if (clean) {
        wordCounts[clean] = (wordCounts[clean] || 0) + 1;
      }
    });
  });

  const topMissedWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word);

  const getScoreColor = (score: number) => {
    if (score >= 80) return COLORS.primary;
    if (score >= 60) return COLORS.secondary;
    return COLORS.error;
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: isDark ? COLORS.bgDark : COLORS.bg }]}
    >
      {/* Header Duolingo Style */}
      <View style={[styles.header, { borderBottomColor: isDark ? COLORS.borderDark : COLORS.border }]}>
        <View>
          <Text style={styles.headerSubtitle}>GIA SƯ TẬP ĐỌC</Text>
          <Text style={[styles.headerTitle, { color: isDark ? COLORS.textDark : COLORS.text }]}>
            Vui Học Tiếng Việt 🦉
          </Text>
        </View>

        <TouchableOpacity 
          activeOpacity={1}
          onPressIn={() => setIsThemePressed(true)}
          onPressOut={() => setIsThemePressed(false)}
          onPress={toggleTheme}
          style={[
            styles.themeBtn,
            {
              backgroundColor: isDark ? COLORS.bgSoftDark : '#FFFFFF',
              borderColor: isDark ? COLORS.borderDark : COLORS.border,
              borderBottomColor: isDark ? '#162228' : '#D5D5D5',
              transform: [{ translateY: isThemePressed ? 2 : 0 }],
              borderBottomWidth: isThemePressed ? 1 : 4,
            }
          ]}
        >
          <Text style={styles.themeBtnText}>{isDark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Hộp soạn bài đọc */}
        <View style={[
          styles.card,
          { 
            backgroundColor: isDark ? COLORS.bgSoftDark : '#FFFFFF',
            borderColor: isDark ? COLORS.borderDark : COLORS.border
          }
        ]}>
          <Text style={[styles.cardTitle, { color: isDark ? COLORS.textDark : COLORS.text }]}>
            ✍️ Bố mẹ soạn bài đọc mới
          </Text>
          
          <TextInput
            style={[
              styles.input,
              { 
                borderColor: isDark ? COLORS.borderDark : COLORS.border,
                backgroundColor: isDark ? COLORS.bgDark : COLORS.bgSoft,
                color: isDark ? COLORS.textDark : COLORS.text
              }
            ]}
            placeholder="Nhập câu hoặc đoạn văn tại đây để bé tập đọc..."
            placeholderTextColor={isDark ? COLORS.mutedDark : COLORS.muted}
            multiline
            numberOfLines={4}
            value={inputText}
            onChangeText={setInputText}
          />

          <TouchableOpacity
            activeOpacity={1}
            onPressIn={() => setIsPlayPressed(true)}
            onPressOut={() => setIsPlayPressed(false)}
            onPress={() => handleStartPlay(inputText)}
            style={[
              styles.startBtn,
              {
                backgroundColor: COLORS.primary,
                borderBottomColor: COLORS.primaryShadow,
                transform: [{ translateY: isPlayPressed ? 3 : 0 }],
                borderBottomWidth: isPlayPressed ? 1 : 4,
              }
            ]}
          >
            <Text style={styles.startBtnText}>BẮT ĐẦU HỌC ĐỌC 🚀</Text>
          </TouchableOpacity>
        </View>

        {/* Học bạ Duolingo (Thành tích) */}
        <View style={[
          styles.card,
          { 
            backgroundColor: isDark ? COLORS.bgSoftDark : '#FFFFFF',
            borderColor: isDark ? COLORS.borderDark : COLORS.border
          }
        ]}>
          <Text style={[styles.cardTitle, { color: isDark ? COLORS.textDark : COLORS.text }]}>
            🏆 Thành tích của bé
          </Text>
          
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: isDark ? COLORS.bgDark : '#F7F9FA' }]}>
              <Text style={styles.statVal}>{totalSessions}</Text>
              <Text style={styles.statLbl}>Bài đã đọc</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: isDark ? COLORS.bgDark : '#F7F9FA' }]}>
              <Text style={[styles.statVal, { color: COLORS.secondary }]}>{averageScore}%</Text>
              <Text style={styles.statLbl}>Đúng trung bình</Text>
            </View>
          </View>

          {topMissedWords.length > 0 && (
            <View style={[styles.remedialBox, { borderColor: isDark ? COLORS.borderDark : COLORS.border }]}>
              <Text style={[styles.remedialTitle, { color: isDark ? COLORS.textDark : COLORS.text }]}>
                ⚠️ Từ bé hay phát âm sai:
              </Text>
              <View style={styles.badgeContainer}>
                {topMissedWords.map((word, idx) => (
                  <View key={idx} style={styles.missedBadge}>
                    <Text style={styles.missedBadgeText}>{word}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {totalSessions > 0 && (
            <View style={styles.historySection}>
              <TouchableOpacity 
                style={styles.toggleHistoryBtn} 
                onPress={() => setShowHistory(!showHistory)}
              >
                <Text style={styles.toggleHistoryText}>
                  {showHistory ? '🔼 Ẩn lịch sử chi tiết' : '🔽 Xem lịch sử chi tiết'}
                </Text>
              </TouchableOpacity>

              {showHistory && (
                <View style={styles.historyList}>
                  {sessionLogs.map((log) => (
                    <View 
                      key={log.id} 
                      style={[
                        styles.historyItem,
                        { borderBottomColor: isDark ? COLORS.borderDark : '#F1F3F5' }
                      ]}
                    >
                      <View style={styles.historyHeader}>
                        <Text style={[styles.historyDate, { color: isDark ? COLORS.mutedDark : COLORS.muted }]}>
                          {new Date(log.date).toLocaleDateString('vi-VN')} {new Date(log.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        <Text style={[styles.historyScore, { color: getScoreColor(log.score) }]}>
                          {log.score}% Đúng
                        </Text>
                      </View>
                      <Text 
                        numberOfLines={1} 
                        style={[styles.historyTextPreview, { color: isDark ? COLORS.textDark : COLORS.text }]}
                      >
                        {log.text}
                      </Text>
                    </View>
                  ))}

                  <TouchableOpacity
                    activeOpacity={1}
                    onPressIn={() => setIsClearPressed(true)}
                    onPressOut={() => setIsClearPressed(false)}
                    onPress={handleClearHistory}
                    style={[
                      styles.clearHistoryBtn,
                      {
                        backgroundColor: COLORS.error,
                        borderBottomColor: COLORS.errorShadow,
                        transform: [{ translateY: isClearPressed ? 2 : 0 }],
                        borderBottomWidth: isClearPressed ? 1 : 4,
                      }
                    ]}
                  >
                    <Text style={styles.clearHistoryTextBtn}>🗑️ XÓA TOÀN BỘ LỊCH SỬ</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Bài đọc mẫu */}
        <Text style={[styles.sectionTitle, { color: isDark ? COLORS.textDark : COLORS.text }]}>
          📚 Truyện mẫu cho bé
        </Text>
        {SAMPLE_STORIES.map((story, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.9}
            style={[
              styles.storyCard,
              { 
                backgroundColor: isDark ? COLORS.bgSoftDark : '#FFFFFF',
                borderColor: isDark ? COLORS.borderDark : COLORS.border
              }
            ]}
            onPress={() => handleStartPlay(story.text)}
          >
            <Text style={[styles.storyTitle, { color: isDark ? COLORS.textDark : COLORS.text }]}>
              {story.title}
            </Text>
            <Text 
              numberOfLines={2} 
              style={[styles.storySnippet, { color: isDark ? COLORS.mutedDark : COLORS.muted }]}
            >
              {story.text}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Danh sách bài tự soạn */}
        {customPassages.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: isDark ? COLORS.textDark : COLORS.text }]}>
              📝 Bài tự soạn của ba mẹ
            </Text>
            {customPassages.map((passage, index) => (
              <View 
                key={index}
                style={[
                  styles.customPassageCard,
                  { 
                    backgroundColor: isDark ? COLORS.bgSoftDark : '#FFFFFF',
                    borderColor: isDark ? COLORS.borderDark : COLORS.border
                  }
                ]}
              >
                <TouchableOpacity 
                  style={styles.customPassageContent} 
                  onPress={() => handleStartPlay(passage)}
                >
                  <Text style={[styles.customPassageTitle, { color: isDark ? COLORS.textDark : COLORS.text }]}>
                    Bài tự soạn {customPassages.length - index}
                  </Text>
                  <Text 
                    numberOfLines={1} 
                    style={[styles.customPassageSnippet, { color: isDark ? COLORS.mutedDark : COLORS.muted }]}
                  >
                    {passage}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.deleteBtn} 
                  onPress={() => handleDeletePassage(index)}
                >
                  <Text style={styles.deleteBtnText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 2,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.muted,
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
  },
  themeBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeBtnText: {
    fontSize: 20,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 24,
    borderWidth: 2,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  input: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 14,
    height: 100,
    fontSize: 15,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  startBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  statVal: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
  },
  statLbl: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.muted,
    marginTop: 2,
  },
  remedialBox: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 12,
    marginTop: 4,
  },
  remedialTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  missedBadge: {
    backgroundColor: COLORS.incorrectBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FFA4A4',
  },
  missedBadgeText: {
    color: COLORS.error,
    fontWeight: 'bold',
    fontSize: 13,
  },
  historySection: {
    marginTop: 12,
  },
  toggleHistoryBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  toggleHistoryText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
    fontSize: 13,
  },
  historyList: {
    marginTop: 12,
  },
  historyItem: {
    borderBottomWidth: 1.5,
    paddingVertical: 10,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  historyScore: {
    fontSize: 13,
    fontWeight: '800',
  },
  historyTextPreview: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearHistoryBtn: {
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  clearHistoryTextBtn: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 12,
  },
  storyCard: {
    borderRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 5,
    padding: 16,
    marginBottom: 12,
  },
  storyTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  storySnippet: {
    fontSize: 13,
    lineHeight: 18,
  },
  customPassageCard: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 5,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  customPassageContent: {
    flex: 1,
  },
  customPassageTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  customPassageSnippet: {
    fontSize: 13,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFE3E3',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteBtnText: {
    fontSize: 16,
  },
});
