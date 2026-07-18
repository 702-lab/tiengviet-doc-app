import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useReader } from '../context/ReaderContext';
import { KaraokeText } from '../components/KaraokeText';
import { VisualPhonics } from '../components/VisualPhonics';
import { SignLanguage } from '../components/SignLanguage';
import { ControlPanel } from '../components/ControlPanel';
import { PracticePanel } from '../components/PracticePanel';
import { COLORS } from '../theme/colors';

// Bật LayoutAnimation cho Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ReaderScreenProps {
  onNavigateToHome: () => void;
}

export const ReaderScreen: React.FC<ReaderScreenProps> = ({ onNavigateToHome }) => {
  const { tokens, activeTokenId, theme, stop } = useReader();
  const [activeTab, setActiveTab] = useState<'practice' | 'phonics' | 'visual'>('practice');
  const isDark = theme === 'dark';

  const handleBack = () => {
    stop();
    onNavigateToHome();
  };

  // Kích hoạt LayoutAnimation mượt mà mỗi khi từ đang phát âm thay đổi
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [activeTokenId]);

  // Kích hoạt LayoutAnimation khi người dùng đổi tab
  const handleTabChange = (tab: 'practice' | 'phonics' | 'visual') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(tab);
  };

  // Tính toán tiến độ
  const getProgress = () => {
    if (tokens.length === 0 || !activeTokenId) return 0;
    const currentIndex = tokens.findIndex((t) => t.id === activeTokenId);
    if (currentIndex === -1) return 0;
    return (currentIndex + 1) / tokens.length;
  };

  const progress = getProgress();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? COLORS.bgDark : COLORS.bgSoft }]}>
      {/* 1. Custom Game Header (Duolingo Style) */}
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

        {/* Thanh tiến trình */}
        <View style={[styles.progressTrack, { backgroundColor: isDark ? COLORS.borderDark : '#E5E5E5' }]}>
          <View 
            style={[
              styles.progressBar, 
              { 
                width: `${Math.max(progress * 100, 5)}%`,
                backgroundColor: COLORS.primary 
              }
            ]} 
          />
        </View>

        <Text style={styles.trophyIcon}>🏆</Text>
      </View>

      {/* 2. Top Pinned Area (Không cuộn, cố định phần chữ lớn) */}
      <View style={[
        styles.pinnedTextCard, 
        { 
          backgroundColor: isDark ? COLORS.bgDark : COLORS.bgSoft,
          borderBottomColor: isDark ? COLORS.borderDark : COLORS.border
        }
      ]}>
        <KaraokeText />
      </View>

      {/* 3. Tab Bar điều hướng các công cụ */}
      <View style={[
        styles.tabBar,
        { 
          backgroundColor: isDark ? COLORS.bgSoftDark : '#FFFFFF',
          borderBottomColor: isDark ? COLORS.borderDark : COLORS.border
        }
      ]}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'practice' && styles.activeTabItem]}
          onPress={() => handleTabChange('practice')}
        >
          <Text style={[styles.tabLabel, activeTab === 'practice' && styles.activeTabLabel]}>
            🎙️ Luyện đọc
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'phonics' && styles.activeTabItem]}
          onPress={() => handleTabChange('phonics')}
        >
          <Text style={[styles.tabLabel, activeTab === 'phonics' && styles.activeTabLabel]}>
            🧩 Ghép vần
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'visual' && styles.activeTabItem]}
          onPress={() => handleTabChange('visual')}
        >
          <Text style={[styles.tabLabel, activeTab === 'visual' && styles.activeTabLabel]}>
            👋 Khẩu hình
          </Text>
        </TouchableOpacity>
      </View>

      {/* 4. Bottom Scroll Content Area (Chứa các widget con tương ứng tab) */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'practice' && (
          <View style={[
            styles.practiceCardWrapper,
            {
              backgroundColor: isDark ? COLORS.cardBgDark : COLORS.cardBg,
              borderColor: isDark ? COLORS.borderDark : COLORS.border,
              borderBottomColor: isDark ? '#162228' : '#D5D5D5',
            }
          ]}>
            <ControlPanel />
            <View style={[styles.divider, { backgroundColor: isDark ? COLORS.borderDark : COLORS.border }]} />
            <PracticePanel />
          </View>
        )}

        {activeTab === 'phonics' && <VisualPhonics />}

        {activeTab === 'visual' && <SignLanguage />}
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
    borderTopWidth: 2,
    borderTopColor: '#A6E46D',
  },
  trophyIcon: {
    fontSize: 22,
  },
  
  // Phần chữ lớn Karaoke được ghim cố định ở đỉnh màn hình
  pinnedTextCard: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
  },
  
  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    height: 50,
    borderBottomWidth: 2,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomColor: COLORS.primary,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.muted,
  },
  activeTabLabel: {
    color: COLORS.primary,
    fontWeight: '900',
  },
  
  // Cuộn phần công cụ bổ trợ
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  
  // Wrapper của tab Luyện Đọc
  practiceCardWrapper: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 2,
    borderBottomWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  divider: {
    height: 2,
    marginVertical: 12,
    width: '100%',
  },
});
