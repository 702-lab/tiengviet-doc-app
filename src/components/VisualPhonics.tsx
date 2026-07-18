import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useReader } from '../context/ReaderContext';
import { COLORS } from '../theme/colors';

export const VisualPhonics: React.FC = () => {
  const { activeWordParsed, theme } = useReader();
  const isDark = theme === 'dark';

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
        🧩 Ghép Vần Kỳ Diệu: "{original}"
      </Text>

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
});
