import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, Platform } from 'react-native';
import { ReaderProvider, useReader } from './src/context/ReaderContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { ReaderScreen } from './src/screens/ReaderScreen';
import { COLORS } from './src/theme/colors';

function MainApp() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'reader'>('home');
  const { theme } = useReader();
  const isDark = theme === 'dark';

  return (
    <SafeAreaView style={[
      styles.safeArea, 
      { backgroundColor: isDark ? COLORS.bgDark : COLORS.bg }
    ]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : (Platform.OS === 'ios' ? 'dark-content' : 'default')}
        backgroundColor={isDark ? COLORS.cardBgDark : COLORS.cardBg}
      />
      {currentScreen === 'home' ? (
        <HomeScreen onNavigateToReader={() => setCurrentScreen('reader')} />
      ) : (
        <ReaderScreen onNavigateToHome={() => setCurrentScreen('home')} />
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ReaderProvider>
      <MainApp />
    </ReaderProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
