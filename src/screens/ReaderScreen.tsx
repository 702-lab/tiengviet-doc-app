import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useReader } from '../context/ReaderContext';
import { KaraokeText } from '../components/KaraokeText';
import { VisualPhonics } from '../components/VisualPhonics';
import { SignLanguage } from '../components/SignLanguage';
import { ControlPanel } from '../components/ControlPanel';
import { PracticePanel } from '../components/PracticePanel';
import { COLORS } from '../theme/colors';

interface ReaderScreenProps {
  onNavigateToHome: () => void;
}

export const ReaderScreen: React.FC<ReaderScreenProps> = ({ onNavigateToHome }) => {
  const { tokens, activeTokenId, theme, stop } = useReader();
  const isDark = theme === 'dark';

  const handleBack = () => {
    stop();
    onNavigateToHome();
  };

  // Tính toán % tiến trình tập đọc của bé hiện tại
  const getProgress = () => {
    if (tokens.length === 0 || !activeTokenId) return 0;
    const currentIndex = tokens.findIndex((t) => t.id === activeTokenId);
    if (currentIndex === -1) return 0;
    return (currentIndex + 1) / tokens.length;
  };

  const progress = getProgress();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? COLORS.bgDark : COLORS.bgSoft }]}>
      {/* Custom Game Header (Duolingo Style) */}
      <View style={[
        styles.header, 
        { 
          backgroundColor: isDark ? COLORS.bgDark : COLORS.bg,
          borderBottomColor: isDark ? COLORS.borderDark : COLORS.border 
        }
      ]}>
        <TouchableOpacity style={styles.closeBtn} onPress={handleBack}>
          <Text style={[styles.closeBtnText, { color: isDark ? COLORS.textDark : COLORS.text }]}>✕</Text>
        </TouchableOpacity>

        {/* Cột tiến độ học tập (Progress Bar) */}
        <View style={[styles.progressTrack, { backgroundColor: isDark ? COLORS.borderDark : '#E5E5E5' }]}>
          <View 
            style={[
              styles.progressBar, 
              { 
                width: `${Math.max(progress * 100, 5)}%`, // Đảm bảo tối thiểu 5% để nhìn thấy đầu bo tròn
                backgroundColor: COLORS.primary 
              }
            ]} 
          />
        </View>

        <Text style={styles.trophyIcon}>🏆</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Khối chữ lớn tương tác */}
        <View style={styles.karaokeWrapper}>
          <KaraokeText />
        </View>

        {/* Panel các công cụ hỗ trợ trực quan bé tự học */}
        <View style={styles.widgetsWrapper}>
          {/* Ghép vần */}
          <VisualPhonics />

          {/* Thủ ngữ & Khẩu hình */}
          <SignLanguage />

          {/* Điều khiển tập đọc */}
          <ControlPanel />

          {/* Micro tập đọc to AI */}
          <PracticePanel />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 2,
    justifyContent: 'space-between',
  },
  closeBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  progressTrack: {
    flex: 1,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 14,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 8,
    // Hiệu ứng đổ bóng sáng ở đỉnh bar giống Duolingo
    borderTopWidth: 2,
    borderTopColor: '#A6E46D',
  },
  trophyIcon: {
    fontSize: 22,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  karaokeWrapper: {
    marginBottom: 8,
  },
  widgetsWrapper: {
    width: '100%',
  },
});
