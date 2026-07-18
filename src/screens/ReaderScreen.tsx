import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useReader } from '../context/ReaderContext';
import { KaraokeText } from '../components/KaraokeText';
import { VisualPhonics } from '../components/VisualPhonics';
import { SignLanguage } from '../components/SignLanguage';
import { ControlPanel } from '../components/ControlPanel';
import { COLORS } from '../theme/colors';

interface ReaderScreenProps {
  onNavigateToHome: () => void;
}

export const ReaderScreen: React.FC<ReaderScreenProps> = ({ onNavigateToHome }) => {
  const { stop } = useReader();

  const handleBack = () => {
    stop(); // Dừng tất cả âm thanh trước khi thoát
    onNavigateToHome();
  };

  return (
    <View style={styles.container}>
      {/* Thanh điều hướng Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>⬅️ Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Luyện Đọc Học Vần</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Khung hiển thị văn bản Karaoke */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Đoạn văn của bé:</Text>
          <View style={styles.karaokeWrapper}>
            <KaraokeText />
          </View>
        </View>

        {/* Khung phân tích cấu trúc âm tiết */}
        <VisualPhonics />

        {/* Hướng dẫn Thủ ngữ / Khẩu hình */}
        <SignLanguage />

        {/* Bảng điều khiển */}
        <ControlPanel />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: COLORS.cardBg,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F1F3F5',
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  placeholder: {
    width: 80, // Để cân bằng đối xứng header
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
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  karaokeWrapper: {
    marginBottom: 8,
  },
});
