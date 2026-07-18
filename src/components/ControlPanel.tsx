import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useReader } from '../context/ReaderContext';
import { COLORS } from '../theme/colors';

export const ControlPanel: React.FC = () => {
  const { isPlaying, play, pause, stop, speed, setSpeed, mode, setMode, theme, dialect, setDialect } = useReader();
  const isDark = theme === 'dark';

  const speedOptions = [0.5, 0.8, 1.0, 1.2];

  // Trạng thái nhấn nút 3D (Duolingo Style)
  const [pressedBtn, setPressedBtn] = useState<'play' | 'stop' | null>(null);

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: isDark ? COLORS.cardBgDark : COLORS.cardBg,
        borderColor: isDark ? COLORS.borderDark : COLORS.border,
        borderBottomColor: isDark ? '#162228' : '#D5D5D5',
      }
    ]}>
      {/* Hàng 1: Chuyển đổi chế độ đọc */}
      <View style={[styles.modeRow, { backgroundColor: isDark ? '#16161a' : '#F1F3F5' }]}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'spell' && styles.activeModeButton]}
          onPress={() => setMode('spell')}
          activeOpacity={0.8}
        >
          <Text style={[styles.modeText, mode === 'spell' && styles.activeModeText]}>
            📖 Đánh Vần
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'read' && styles.activeModeButton]}
          onPress={() => setMode('read')}
          activeOpacity={0.8}
        >
          <Text style={[styles.modeText, mode === 'read' && styles.activeModeText]}>
            🗣️ Đọc Trơn (Từ)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Hàng 2: Điều khiển phát & dừng (3D Buttons) */}
      <View style={styles.playbackRow}>
        <TouchableOpacity 
          activeOpacity={1}
          onPressIn={() => setPressedBtn('stop')}
          onPressOut={() => setPressedBtn(null)}
          onPress={stop}
          style={[
            styles.stopButton,
            {
              backgroundColor: isDark ? COLORS.bgSoftDark : '#FFFFFF',
              borderColor: isDark ? COLORS.borderDark : COLORS.border,
              borderBottomColor: isDark ? '#162228' : '#D5D5D5',
              transform: [{ translateY: pressedBtn === 'stop' ? 2 : 0 }],
              borderBottomWidth: pressedBtn === 'stop' ? 1 : 4,
            }
          ]}
        >
          <Text style={[styles.stopButtonText, { color: isDark ? COLORS.textDark : COLORS.text }]}>
            ⏹️ Dừng
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={1}
          onPressIn={() => setPressedBtn('play')}
          onPressOut={() => setPressedBtn(null)}
          onPress={isPlaying ? pause : play}
          style={[
            styles.playButton,
            {
              backgroundColor: isPlaying ? COLORS.primary : COLORS.secondary,
              borderBottomColor: isPlaying ? COLORS.primaryShadow : COLORS.secondaryShadow,
              transform: [{ translateY: pressedBtn === 'play' ? 3 : 0 }],
              borderBottomWidth: pressedBtn === 'play' ? 1 : 4,
            }
          ]}
        >
          <Text style={styles.playButtonText}>
            {isPlaying ? '⏸️ Tạm Dừng' : '▶️ Bắt Đầu Đọc'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Hàng 3: Chọn giọng đọc vùng miền */}
      <View style={styles.optionRow}>
        <Text style={[styles.optionLabel, { color: isDark ? '#A0AEC0' : COLORS.muted }]}>
          Giọng đọc & Phương ngữ:
        </Text>
        <View style={styles.optionsContainer}>
          {(['north', 'central', 'south'] as const).map((d) => {
            const isActive = dialect === d;
            const label = d === 'north' ? 'miền Bắc' : d === 'central' ? 'miền Trung' : 'miền Nam';
            return (
              <TouchableOpacity
                key={d}
                activeOpacity={0.8}
                style={[
                  styles.optButton, 
                  isActive && styles.activeOpt,
                  {
                    backgroundColor: isDark ? COLORS.bgSoftDark : '#FFFFFF',
                    borderColor: isActive ? COLORS.primary : (isDark ? COLORS.borderDark : COLORS.border),
                  }
                ]}
                onPress={() => setDialect(d)}
              >
                <Text style={[
                  styles.optText, 
                  isActive && styles.activeOptText,
                  { color: isActive ? COLORS.primary : (isDark ? COLORS.textDark : COLORS.text) }
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Hàng 4: Tốc độ đọc */}
      <View style={[styles.optionRow, { marginTop: 14 }]}>
        <Text style={[styles.optionLabel, { color: isDark ? '#A0AEC0' : COLORS.muted }]}>
          Tốc độ đọc:
        </Text>
        <View style={styles.optionsContainer}>
          {speedOptions.map((opt) => {
            const isActive = speed === opt;
            const label = opt === 0.8 ? '0.8x (Bé)' : `${opt}x`;
            return (
              <TouchableOpacity
                key={opt}
                activeOpacity={0.8}
                style={[
                  styles.optButton, 
                  isActive && styles.activeOpt,
                  {
                    backgroundColor: isDark ? COLORS.bgSoftDark : '#FFFFFF',
                    borderColor: isActive ? COLORS.primary : (isDark ? COLORS.borderDark : COLORS.border),
                  }
                ]}
                onPress={() => setSpeed(opt)}
              >
                <Text style={[
                  styles.optText, 
                  isActive && styles.activeOptText,
                  { color: isActive ? COLORS.primary : (isDark ? COLORS.textDark : COLORS.text) }
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
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
  modeRow: {
    flexDirection: 'row',
    borderRadius: 18,
    padding: 4,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeModeButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  modeText: {
    fontSize: 14,
    fontWeight: '800',
  },
  activeModeText: {
    color: COLORS.primary,
  },
  playbackRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  stopButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
  playButton: {
    flex: 2,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  optionRow: {
    alignItems: 'flex-start',
    width: '100%',
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
  },
  optionsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 6,
  },
  optButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeOpt: {
    backgroundColor: '#EFFFDF',
    borderColor: COLORS.primary,
  },
  optText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  activeOptText: {
    fontWeight: '900',
  },
});
