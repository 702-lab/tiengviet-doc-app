import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useReader } from '../context/ReaderContext';
import { COLORS } from '../theme/colors';

export const ControlPanel: React.FC = () => {
  const { isPlaying, play, pause, stop, speed, setSpeed, mode, setMode, theme, dialect, setDialect } = useReader();
  const isDark = theme === 'dark';

  const speedOptions = [0.5, 0.8, 1.0, 1.2];

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: isDark ? COLORS.cardBgDark : COLORS.cardBg,
        borderColor: isDark ? '#2D3748' : COLORS.border
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
            🗣️ Đọc Trơn (Đọc từ)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Hàng 2: Điều khiển phát & dừng */}
      <View style={styles.playbackRow}>
        <TouchableOpacity 
          style={[
            styles.stopButton,
            {
              backgroundColor: isDark ? '#2D3748' : '#F8F9FA',
              borderColor: isDark ? '#4A5568' : COLORS.border
            }
          ]} 
          onPress={stop}
          activeOpacity={0.7}
        >
          <Text style={[styles.stopButtonText, { color: isDark ? COLORS.textDark : COLORS.text }]}>⏹️ Dừng lại</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playButton, isPlaying ? styles.pauseActive : styles.playActive]}
          onPress={isPlaying ? pause : play}
          activeOpacity={0.8}
        >
          <Text style={styles.playButtonText}>
            {isPlaying ? '⏸️ Tạm Dừng' : '▶️ Bắt Đầu Đọc'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Hàng 3: Chọn giọng đọc vùng miền */}
      <View style={styles.optionRow}>
        <Text style={[styles.optionLabel, { color: isDark ? '#A0AEC0' : COLORS.muted }]}>Giọng đọc & Phương ngữ:</Text>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optButton, 
              dialect === 'north' && styles.activeOpt,
              {
                backgroundColor: isDark ? '#2D3748' : '#F8F9FA',
                borderColor: isDark ? '#4A5568' : COLORS.border
              }
            ]}
            onPress={() => setDialect('north')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.optText, 
              dialect === 'north' && styles.activeOptText,
              { color: isDark ? COLORS.textDark : COLORS.text }
            ]}>
               miền Bắc
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.optButton, 
              dialect === 'central' && styles.activeOpt,
              {
                backgroundColor: isDark ? '#2D3748' : '#F8F9FA',
                borderColor: isDark ? '#4A5568' : COLORS.border
              }
            ]}
            onPress={() => setDialect('central')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.optText, 
              dialect === 'central' && styles.activeOptText,
              { color: isDark ? COLORS.textDark : COLORS.text }
            ]}>
               miền Trung
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optButton, 
              dialect === 'south' && styles.activeOpt,
              {
                backgroundColor: isDark ? '#2D3748' : '#F8F9FA',
                borderColor: isDark ? '#4A5568' : COLORS.border
              }
            ]}
            onPress={() => setDialect('south')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.optText, 
              dialect === 'south' && styles.activeOptText,
              { color: isDark ? COLORS.textDark : COLORS.text }
            ]}>
               miền Nam
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hàng 4: Tốc độ đọc */}
      <View style={[styles.optionRow, { marginTop: 16 }]}>
        <Text style={[styles.optionLabel, { color: isDark ? '#A0AEC0' : COLORS.muted }]}>Tốc độ đọc:</Text>
        <View style={styles.optionsContainer}>
          {speedOptions.map((opt) => {
            const isActive = speed === opt;
            let speedText = `${opt}x`;
            if (opt === 0.8) speedText = '0.8x (Bé học)';
            
            return (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.optButton, 
                  isActive && styles.activeOpt,
                  {
                    backgroundColor: isDark ? '#2D3748' : '#F8F9FA',
                    borderColor: isDark ? '#4A5568' : COLORS.border
                  }
                ]}
                onPress={() => setSpeed(opt)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.optText, 
                  isActive && styles.activeOptText,
                  { color: isDark ? COLORS.textDark : COLORS.text }
                ]}>
                  {speedText}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginVertical: 12,
  },
  modeRow: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeModeButton: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  modeText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  activeModeText: {
    color: '#FFFFFF',
  },
  playbackRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  stopButton: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  playButton: {
    flex: 2,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  playActive: {
    backgroundColor: COLORS.secondary,
  },
  pauseActive: {
    backgroundColor: COLORS.primary,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  optionRow: {
    alignItems: 'flex-start',
    width: '100%',
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 6,
  },
  optButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeOpt: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.primary,
  },
  optText: {
    fontSize: 11,
    fontWeight: '600',
  },
  activeOptText: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
});
