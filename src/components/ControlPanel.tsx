import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useReader } from '../context/ReaderContext';
import { COLORS } from '../theme/colors';

export const ControlPanel: React.FC = () => {
  const { isPlaying, play, pause, stop, speed, setSpeed, mode, setMode } = useReader();

  const speedOptions = [0.5, 0.8, 1.0, 1.2];

  return (
    <View style={styles.container}>
      {/* Hàng 1: Chuyển đổi chế độ đọc */}
      <View style={styles.modeRow}>
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
          style={styles.stopButton} 
          onPress={stop}
          activeOpacity={0.7}
        >
          <Text style={styles.stopButtonText}>⏹️ Dừng lại</Text>
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

      {/* Hàng 3: Tốc độ đọc */}
      <View style={styles.speedRow}>
        <Text style={styles.speedLabel}>Tốc độ đọc:</Text>
        <View style={styles.speedOptionsContainer}>
          {speedOptions.map((opt) => {
            const isActive = speed === opt;
            let speedText = `${opt}x`;
            if (opt === 0.8) speedText = '0.8x (Bé học)';
            
            return (
              <TouchableOpacity
                key={opt}
                style={[styles.speedOptButton, isActive && styles.activeSpeedOpt]}
                onPress={() => setSpeed(opt)}
                activeOpacity={0.7}
              >
                <Text style={[styles.speedOptText, isActive && styles.activeSpeedOptText]}>
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
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginVertical: 12,
  },
  modeRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F3F5',
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
    color: COLORS.muted,
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
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
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
  speedRow: {
    alignItems: 'flex-start',
  },
  speedLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.muted,
    marginBottom: 8,
  },
  speedOptionsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 6,
  },
  speedOptButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeSpeedOpt: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.primary,
  },
  speedOptText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  activeSpeedOptText: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
});
