import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useReader } from '../context/ReaderContext';
import { loadCustomPassages, saveCustomPassages, loadSessionLogs, clearSessionLogs, SessionLog } from '../services/storage';
import { COLORS } from '../theme/colors';

const SAMPLE_TEXTS = [
  {
    title: '🐱 Con mèo nhà em',
    text: 'Nhà em có một con mèo rất ngoan. Bộ lông của nó mềm mại và mượt mà. Đôi mắt nó tròn xoe, lấp lánh như hai hòn bi ve trong đêm tối.'
  },
  {
    title: '🏫 Trường học lớp 1',
    text: 'Trường học của bé có hàng cây xanh mát. Thầy cô giáo yêu thương và chăm sóc bé mỗi ngày. Bé thích nhất giờ học đọc cùng bạn bè.'
  },
  {
    title: '👵 Kể về Bà',
    text: 'Bà ngoại của em rất hiền từ. Mái tóc bà đã bạc trắng. Mỗi tối, bà thường kể những câu chuyện cổ tích hay cho em nghe trước khi ngủ.'
  }
];

interface HomeScreenProps {
  onNavigateToReader: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToReader }) => {
  const { setText, theme, toggleTheme } = useReader();
  const [inputVal, setInputVal] = useState('');
  const [customPassages, setCustomPassages] = useState<string[]>([]);
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const isDark = theme === 'dark';

  // Nạp bài tập đọc tự soạn và lịch sử học tập
  useEffect(() => {
    const initData = async () => {
      try {
        const passages = await loadCustomPassages();
        setCustomPassages(passages);
        
        const logs = await loadSessionLogs();
        setSessionLogs(logs);
      } catch (err) {
        console.warn('Lỗi nạp dữ liệu offline:', err);
      }
    };
    initData();
  }, []);

  const handleStartReading = async (customText?: string) => {
    const textToRead = customText || inputVal;
    if (!textToRead.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập hoặc chọn một đoạn văn trước khi bắt đầu!');
      return;
    }

    if (!customText && !SAMPLE_TEXTS.some(s => s.text === textToRead)) {
      if (!customPassages.includes(textToRead)) {
        const updated = [textToRead, ...customPassages];
        setCustomPassages(updated);
        await saveCustomPassages(updated);
      }
    }

    setText(textToRead);
    onNavigateToReader();
  };

  const handleDeletePassage = (indexToDelete: number) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa bài tập đọc tự soạn này không?',
      [
        { text: 'Hủy bỏ', style: 'cancel' },
        {
          text: 'Xóa bài',
          style: 'destructive',
          onPress: async () => {
            const updated = customPassages.filter((_, idx) => idx !== indexToDelete);
            setCustomPassages(updated);
            await saveCustomPassages(updated);
          }
        }
      ]
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa toàn bộ lịch sử học tập của bé không?',
      [
        { text: 'Hủy bỏ', style: 'cancel' },
        {
          text: 'Xóa lịch sử',
          style: 'destructive',
          onPress: async () => {
            await clearSessionLogs();
            setSessionLogs([]);
            Alert.alert('Thành công', 'Đã xóa sạch lịch sử học tập.');
          }
        }
      ]
    );
  };

  // Tính toán các số liệu học bạ của bé
  const totalSessions = sessionLogs.length;
  const averageScore = totalSessions > 0 
    ? Math.round(sessionLogs.reduce((acc, log) => acc + log.score, 0) / totalSessions)
    : 0;

  // Lấy ra danh sách các từ bé hay đọc sai nhất (Top 3)
  const getTopMissedWords = () => {
    const wordCounts: { [word: string]: number } = {};
    sessionLogs.forEach((log) => {
      log.missedWords.forEach((word) => {
        const clean = word.toLowerCase().replace(/[.,!?;:"()“”]/g, '').trim();
        if (clean) {
          wordCounts[clean] = (wordCounts[clean] || 0) + 1;
        }
      });
    });

    return Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word);
  };

  const topMissed = getTopMissedWords();

  const handleOcrMock = () => {
    Alert.alert(
      'Tính năng Premium AI',
      'Bạn có muốn chụp ảnh và nhận diện chữ tự động từ sách giáo khoa lớp 1 của bé không?',
      [
        { text: 'Hủy bỏ', style: 'cancel' },
        { 
          text: 'Quét mẫu sách', 
          onPress: () => {
            const ocrMockText = 'Cô giáo em hiền hậu và vui tính. Giọng cô đọc bài ấm áp vô cùng. Cả lớp im lặng lắng nghe cô giảng bài.';
            setInputVal(ocrMockText);
            Alert.alert('Thành công', 'Đã nhận diện chữ thành công từ ảnh chụp trang sách!');
          } 
        }
      ]
    );
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '';
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: isDark ? COLORS.darkBackground : COLORS.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Nút bật/tắt theme nổi trên góc */}
        <View style={styles.themeToggleContainer}>
          <TouchableOpacity 
            style={[styles.themeBtn, { backgroundColor: isDark ? '#2D3748' : '#E2E8F0' }]} 
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Text style={[styles.themeBtnText, { color: isDark ? COLORS.textDark : COLORS.text }]}>
              {isDark ? '☀️ Sáng' : '🌙 Tối'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tiêu đề ứng dụng */}
        <View style={styles.header}>
          <Text style={styles.logo}>📚</Text>
          <Text style={[styles.appName, { color: isDark ? COLORS.textDark : COLORS.text }]}>Gia Sư Tập Đọc</Text>
          <Text style={[styles.subTitle, { color: isDark ? '#A0AEC0' : COLORS.muted }]}>
            Dạy bé lớp 1 đánh vần & đọc chữ trơn chuẩn sư phạm
          </Text>
        </View>

        {/* 📊 Bảng Báo Cáo Học Tập (Parent Dashboard) */}
        <View style={[
          styles.dashboardCard,
          {
            backgroundColor: isDark ? COLORS.cardBgDark : COLORS.cardBg,
            borderColor: isDark ? '#2D3748' : COLORS.border
          }
        ]}>
          <Text style={[styles.dashboardTitle, { color: isDark ? COLORS.textDark : COLORS.text }]}>📊 Học Bạ Của Bé</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalSessions}</Text>
              <Text style={[styles.statLabel, { color: isDark ? '#A0AEC0' : COLORS.muted }]}>Lượt học</Text>
            </View>
            <View style={[styles.statBox, styles.statBorder, { borderColor: isDark ? '#2D3748' : '#E9ECEF' }]}>
              <Text style={[
                styles.statNumber, 
                { color: averageScore >= 80 ? '#2E7D32' : averageScore >= 50 ? '#EF6C00' : '#C62828' }
              ]}>
                {averageScore}%
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? '#A0AEC0' : COLORS.muted }]}>Đọc đúng</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { fontSize: topMissed.length > 0 ? 14 : 20 }]}>
                {topMissed.length > 0 ? topMissed.join(', ') : '-'}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? '#A0AEC0' : COLORS.muted }]}>Cần luyện thêm</Text>
            </View>
          </View>

          {totalSessions > 0 && (
            <View style={styles.historyContainer}>
              <TouchableOpacity
                style={styles.historyToggleBtn}
                onPress={() => setShowHistory(!showHistory)}
                activeOpacity={0.7}
              >
                <Text style={styles.historyToggleText}>
                  {showHistory ? '🔼 Ẩn lịch sử chi tiết' : '🔽 Xem lịch sử chi tiết'}
                </Text>
              </TouchableOpacity>

              {showHistory && (
                <View style={styles.historyList}>
                  {sessionLogs.map((log) => {
                    const isPerfect = log.score === 100;
                    const isOk = log.score >= 70;
                    return (
                      <View 
                        key={log.id} 
                        style={[
                          styles.historyItem, 
                          { borderBottomColor: isDark ? '#2D3748' : '#F1F3F5' }
                        ]}
                      >
                        <View style={styles.historyHeader}>
                          <Text style={[styles.historyDate, { color: isDark ? '#718096' : COLORS.muted }]}>
                            {formatDate(log.date)}
                          </Text>
                          <View style={[
                            styles.scoreBadge,
                            { backgroundColor: isPerfect ? '#E2F0D9' : isOk ? '#FFF2CC' : '#FCE4D6' }
                          ]}>
                            <Text style={[
                              styles.scoreBadgeText,
                              { color: isPerfect ? '#385723' : isOk ? '#D5A600' : '#C65911' }
                            ]}>
                              {log.score}%
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.historyText, { color: isDark ? COLORS.textDark : COLORS.text }]} numberOfLines={1}>
                          {log.text}
                        </Text>
                        {log.missedWords.length > 0 && (
                          <Text style={styles.historyMissedText} numberOfLines={1}>
                            Sai: {log.missedWords.join(', ')}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                  
                  <TouchableOpacity
                    style={styles.clearHistoryBtn}
                    onPress={handleClearHistory}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.clearHistoryText}>🗑️ Xóa toàn bộ lịch sử</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Khung nhập văn bản */}
        <View style={[
          styles.inputCard, 
          { 
            backgroundColor: isDark ? COLORS.cardBgDark : COLORS.cardBg,
            borderColor: isDark ? '#2D3748' : COLORS.border
          }
        ]}>
          <Text style={[styles.cardLabel, { color: isDark ? COLORS.textDark : COLORS.text }]}>Nhập bài tập đọc của bé:</Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: isDark ? '#16161a' : '#F8F9FA',
                borderColor: isDark ? '#2D3748' : COLORS.border,
                color: isDark ? COLORS.textDark : COLORS.text,
              }
            ]}
            multiline
            numberOfLines={5}
            placeholder="Phụ huynh hãy dán hoặc tự gõ đoạn văn cô giáo giao về nhà vào đây để dạy bé đọc..."
            value={inputVal}
            onChangeText={setInputVal}
            textAlignVertical="top"
            placeholderTextColor={isDark ? '#718096' : COLORS.muted}
          />
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[
                styles.ocrBtn,
                {
                  backgroundColor: isDark ? '#2D3748' : '#F1F3F5',
                  borderColor: isDark ? '#4A5568' : '#CED4DA',
                }
              ]}
              onPress={handleOcrMock}
              activeOpacity={0.7}
            >
              <Text style={[styles.ocrBtnText, { color: isDark ? COLORS.textDark : COLORS.text }]}>📸 Quét SGK (OCR)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.startBtn}
              onPress={() => handleStartReading()}
              activeOpacity={0.8}
            >
              <Text style={styles.startBtnText}>Bắt đầu học đọc 🚀</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Danh sách bài tập đọc tự soạn */}
        {customPassages.length > 0 && (
          <View style={styles.samplesSection}>
            <Text style={[styles.sectionTitle, { color: isDark ? COLORS.textDark : COLORS.text }]}>Bài tự soạn của ba mẹ:</Text>
            {customPassages.map((passage, idx) => (
              <View 
                key={idx}
                style={[
                  styles.passageContainer,
                  {
                    backgroundColor: isDark ? COLORS.cardBgDark : COLORS.cardBg,
                    borderColor: isDark ? '#2D3748' : COLORS.border
                  }
                ]}
              >
                <TouchableOpacity
                  style={styles.passageTextBtn}
                  onPress={() => handleStartReading(passage)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.passageTitle, { color: isDark ? COLORS.textDark : COLORS.text }]}>
                    📝 Bài tự soạn {customPassages.length - idx}
                  </Text>
                  <Text style={[styles.sampleSnippet, { color: isDark ? '#A0AEC0' : COLORS.muted }]} numberOfLines={1}>
                    {passage}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeletePassage(idx)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.deleteBtnText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Đoạn văn mẫu gợi ý */}
        <View style={styles.samplesSection}>
          <Text style={[styles.sectionTitle, { color: isDark ? COLORS.textDark : COLORS.text }]}>Chọn nhanh bài mẫu:</Text>
          {SAMPLE_TEXTS.map((sample, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.sampleItem,
                {
                  backgroundColor: isDark ? COLORS.cardBgDark : COLORS.cardBg,
                  borderColor: isDark ? '#2D3748' : COLORS.border
                }
              ]}
              onPress={() => handleStartReading(sample.text)}
              activeOpacity={0.7}
            >
              <Text style={[styles.sampleTitle, { color: isDark ? COLORS.textDark : COLORS.text }]}>{sample.title}</Text>
              <Text style={[styles.sampleSnippet, { color: isDark ? '#A0AEC0' : COLORS.muted }]} numberOfLines={1}>
                {sample.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    paddingBottom: 40,
  },
  themeToggleContainer: {
    alignItems: 'flex-end',
    width: '100%',
    marginBottom: 8,
  },
  themeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  themeBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    fontSize: 54,
    marginBottom: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  subTitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  inputCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 24,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textArea: {
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 120,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  ocrBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  ocrBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  startBtn: {
    flex: 1.5,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  startBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  samplesSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sampleItem: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  sampleTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sampleSnippet: {
    fontSize: 13,
  },
  passageContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 10,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  passageTextBtn: {
    flex: 1,
    padding: 16,
  },
  passageTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  deleteBtn: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.05)',
  },
  deleteBtnText: {
    fontSize: 18,
  },
  
  // Dashboard Card Specific Styling
  dashboardCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 24,
  },
  dashboardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  historyContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 12,
  },
  historyToggleBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  historyToggleText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  historyList: {
    marginTop: 10,
    maxHeight: 250,
  },
  historyItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 11,
    fontWeight: '600',
  },
  scoreBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  scoreBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  historyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  historyMissedText: {
    fontSize: 11,
    color: '#C62828',
    marginTop: 2,
    fontStyle: 'italic',
  },
  clearHistoryBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  clearHistoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#C62828',
  },
});
