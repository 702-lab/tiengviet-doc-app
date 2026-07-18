import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, Platform } from 'react-native';
import { ReaderProvider } from './src/context/ReaderContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { ReaderScreen } from './src/screens/ReaderScreen';
import { COLORS } from './src/theme/colors';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'reader'>('home');

  return (
    <ReaderProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar 
          barStyle={Platform.OS === 'ios' ? 'dark-content' : 'default'}
          backgroundColor={COLORS.cardBg}
        />
        {currentScreen === 'home' ? (
          <HomeScreen onNavigateToReader={() => setCurrentScreen('reader')} />
        ) : (
          <ReaderScreen onNavigateToHome={() => setCurrentScreen('home')} />
        ) }
      </SafeAreaView>
    </ReaderProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
