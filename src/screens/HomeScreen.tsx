import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useReader } from '../context/ReaderContext';
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
  const { setText } = useReader();
  const [inputVal, setInputVal] = useState('');

  const handleStartReading = (customText?: string) => {
    const textToRead = customText || inputVal;
    if (!textToRead.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập hoặc chọn một đoạn văn trước khi bắt đầu!');
      return;
    }
    setText(textToRead);
    onNavigateToReader();
  };

  // Tính năng giả lập quét OCR máy ảnh
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

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Tiêu đề ứng dụng */}
        <View style={styles.header}>
          <Text style={styles.logo}>📚</Text>
          <Text style={styles.appName}>Gia Sư Tập Đọc</Text>
          <Text style={styles.subTitle}>Dạy bé lớp 1 đánh vần & đọc chữ trơn chuẩn sư phạm</Text>
        </View>

        {/* Khung nhập văn bản */}
        <View style={styles.inputCard}>
          <Text style={styles.cardLabel}>Nhập bài tập đọc của bé:</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={5}
            placeholder="Phụ huynh hãy dán hoặc tự gõ đoạn văn cô giáo giao về nhà vào đây để dạy bé đọc..."
            value={inputVal}
            onChangeText={setInputVal}
            textAlignVertical="top"
            placeholderTextColor={COLORS.muted}
          />
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.ocrBtn}
              onPress={handleOcrMock}
              activeOpacity={0.7}
            >
              <Text style={styles.ocrBtnText}>📸 Quét SGK (OCR)</Text>
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

        {/* Đoạn văn mẫu gợi ý */}
        <View style={styles.samplesSection}>
          <Text style={styles.sectionTitle}>Chọn nhanh bài mẫu:</Text>
          {SAMPLE_TEXTS.map((sample, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.sampleItem}
              onPress={() => handleStartReading(sample.text)}
              activeOpacity={0.7}
            >
              <Text style={styles.sampleTitle}>{sample.title}</Text>
              <Text style={styles.sampleSnippet} numberOfLines={1}>
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
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 54,
    marginBottom: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  subTitle: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  inputCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
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
    color: COLORS.text,
    marginBottom: 10,
  },
  textArea: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 120,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  ocrBtn: {
    flex: 1,
    backgroundColor: '#F1F3F5',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CED4DA',
  },
  ocrBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
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
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  sampleItem: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
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
    color: COLORS.text,
    marginBottom: 4,
  },
  sampleSnippet: {
    fontSize: 13,
    color: COLORS.muted,
  },
});
