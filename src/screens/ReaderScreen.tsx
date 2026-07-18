import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useReader } from '../context/ReaderContext';
import { KaraokeText } from '../components/KaraokeText';
import { VisualPhonics } from '../components/VisualPhonics';
import { SignLanguage } from '../components/SignLanguage';
import { PracticePanel } from '../components/PracticePanel';
import { ControlPanel } from '../components/ControlPanel';
import { COLORS } from '../theme/colors';

interface ReaderScreenProps {
  onNavigateToHome: () => void;
}

export const ReaderScreen: React.FC<ReaderScreenProps> = ({ onNavigateToHome }) => {
  const { stop, theme, toggleTheme } = useReader();
  const isDark = theme === 'dark';

  const handleBack = () => {
    stop(); // Dừng tất cả âm thanh trước khi thoát
    onNavigateToHome();
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? COLORS.darkBackground : COLORS.background }]}>
      {/* Thanh điều hướng Header */}
      <View style={[
        styles.header, 
        { 
          backgroundColor: isDark ? COLORS.cardBgDark : COLORS.cardBg,
          borderBottomColor: isDark ? '#2D3748' : COLORS.border
        }
      ]}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: isDark ? '#2D3748' : '#F1F3F5' }]} 
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Text style={[styles.backButtonText, { color: isDark ? COLORS.textDark : COLORS.text }]}>⬅️ Quay lại</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? COLORS.textDark : COLORS.text }]}>Luyện Đọc</Text>
        
        {/* Nút toggle theme ở góc trên phải */}
        <TouchableOpacity 
          style={[styles.themeButton, { backgroundColor: isDark ? '#2D3748' : '#F1F3F5' }]} 
          onPress={toggleTheme}
          activeOpacity={0.7}
        >
          <Text style={styles.themeButtonText}>{isDark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Khung hiển thị văn bản Karaoke */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#A0AEC0' : COLORS.muted }]}>Đoạn văn của bé:</Text>
          <View style={styles.karaokeWrapper}>
            <KaraokeText />
          </View>
        </View>

        {/* Khung phân tích cấu trúc âm tiết */}
        <VisualPhonics />

        {/* Hướng dẫn Thủ ngữ / Khẩu hình */}
        <SignLanguage />

        {/* Luyện tập phát âm AI */}
        <PracticePanel />

        {/* Bảng điều khiển */}
        <ControlPanel />
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1.5,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  themeButton: {
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  themeButtonText: {
    fontSize: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  karaokeWrapper: {
    marginBottom: 8,
  },
});
