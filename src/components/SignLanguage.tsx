import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useReader } from '../context/ReaderContext';
import { MouthSvg } from './MouthSvg';
import { HandSignSvg } from './HandSignSvg';
import { COLORS } from '../theme/colors';

export const SignLanguage: React.FC = () => {
  const { activeWordParsed, activeStepIndex, theme } = useReader();
  const isDark = theme === 'dark';

  const getActiveMouthShape = (): 'default' | 'wide-open' | 'semi-open' | 'flat-smile' | 'rounded' | 'closed' => {
    if (!activeWordParsed) return 'default';
    
    // Nếu đang đánh vần đến bước cụ thể
    if (activeStepIndex !== -1 && activeWordParsed.original) {
      const token = activeWordParsed.original.toLowerCase();
      // Lấy ký tự/âm tiết tại bước hiện tại
      // Vd: 'oang' -> hình dáng tương ứng
      if (token.includes('o') || token.includes('u')) return 'rounded';
      if (token.includes('a') || token.includes('ă') || token.includes('â')) return 'wide-open';
      if (token.includes('e') || token.includes('ê') || token.includes('i') || token.includes('y')) return 'flat-smile';
    }
    
    // Mặc định dựa trên âm tiết đầy đủ
    const rhyme = activeWordParsed.rhyme.toLowerCase();
    if (rhyme.includes('o') || rhyme.includes('u') || rhyme.includes('ô') || rhyme.includes('ơ') || rhyme.includes('uô')) {
      return 'rounded';
    }
    if (rhyme.includes('a') || rhyme.includes('ă') || rhyme.includes('â') || rhyme.includes('am') || rhyme.includes('an')) {
      return 'wide-open';
    }
    if (rhyme.includes('i') || rhyme.includes('y') || rhyme.includes('e') || rhyme.includes('ê') || rhyme.includes('iê')) {
      return 'flat-smile';
    }
    
    return 'default';
  };

  const getActiveHandSign = (): 'fist' | 'flat' | 'c-shape' | 'point' | 'pinky' | 'circle' | 'v-sign' | 'default' => {
    if (!activeWordParsed) return 'default';
    
    // Lấy chữ cái bắt đầu hoặc âm đầu để hiển thị thủ ngữ
    const firstLetter = activeWordParsed.original.charAt(0).toLowerCase();
    
    const signMap: { [letter: string]: 'fist' | 'flat' | 'c-shape' | 'point' | 'pinky' | 'circle' | 'v-sign' | 'default' } = {
      'a': 'fist', 'ă': 'fist', 'â': 'fist',
      'b': 'flat',
      'c': 'c-shape', 'ch': 'c-shape',
      'd': 'point', 'đ': 'point',
      'i': 'pinky', 'y': 'pinky',
      'o': 'circle', 'ô': 'circle', 'ơ': 'circle',
      'v': 'v-sign',
    };

    return signMap[firstLetter] || 'default';
  };

  const mouthType = getActiveMouthShape();
  const handType = getActiveHandSign();

  const getMouthLabel = (type: string) => {
    switch (type) {
      case 'rounded': return 'Chu môi tròn';
      case 'wide-open': return 'Mở rộng cằm';
      case 'flat-smile': return 'Cười dẹt môi';
      case 'closed': return 'Khép miệng';
      default: return 'Khẩu hình tự nhiên';
    }
  };

  const getHandLabel = (type: string) => {
    switch (type) {
      case 'fist': return 'Nắm đấm (Chữ A)';
      case 'flat': return 'Bàn tay dựng (Chữ B)';
      case 'c-shape': return 'Chữ C cong';
      case 'point': return 'Ngón trỏ dựng (Chữ D)';
      case 'pinky': return 'Ngón út dựng (Chữ I)';
      case 'circle': return 'Vòng tròn chữ O';
      case 'v-sign': return 'Ngón tay V (Chữ V)';
      default: return 'Thủ ngữ tương ứng';
    }
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
      <Text style={[styles.title, { color: isDark ? COLORS.textDark : COLORS.text }]}>
        👋 Khẩu Hình & Thủ Ngữ
      </Text>

      <View style={styles.contentRow}>
        {/* Khẩu hình miệng */}
        <View style={[styles.panelCard, { backgroundColor: isDark ? COLORS.bgDark : '#F7F9FA', borderColor: isDark ? COLORS.borderDark : COLORS.border }]}>
          <Text style={[styles.cardHeader, { color: isDark ? COLORS.textDark : COLORS.text }]}>
            👄 Khẩu hình miệng
          </Text>
          <View style={styles.svgContainer}>
            <MouthSvg type={mouthType} isDark={isDark} />
          </View>
          <Text style={[styles.cardFooter, { color: isDark ? COLORS.mutedDark : COLORS.muted }]}>
            {getMouthLabel(mouthType)}
          </Text>
        </View>

        {/* Thủ ngữ */}
        <View style={[styles.panelCard, { backgroundColor: isDark ? COLORS.bgDark : '#F7F9FA', borderColor: isDark ? COLORS.borderDark : COLORS.border }]}>
          <Text style={[styles.cardHeader, { color: isDark ? COLORS.textDark : COLORS.text }]}>
            🖐️ Thủ ngữ VSL
          </Text>
          <View style={styles.svgContainer}>
            <HandSignSvg type={handType} isDark={isDark} />
          </View>
          <Text style={[styles.cardFooter, { color: isDark ? COLORS.mutedDark : COLORS.muted }]}>
            {getHandLabel(handType)}
          </Text>
        </View>
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
  contentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  panelCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 2,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  svgContainer: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
  },
  cardFooter: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
});
