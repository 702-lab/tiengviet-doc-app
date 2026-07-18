import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, Platform, View, ActivityIndicator } from 'react-native';
import { ReaderProvider, useReader } from './src/context/ReaderContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { ReaderScreen } from './src/screens/ReaderScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { supabase } from './src/services/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { COLORS } from './src/theme/colors';

function MainApp() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'reader'>('home');
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const { theme } = useReader();
  const isDark = theme === 'dark';

  // Lắng nghe trạng thái đăng nhập từ Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Màn hình tải ban đầu
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? COLORS.bgDark : COLORS.bgSoft }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[
      styles.safeArea, 
      { backgroundColor: isDark ? COLORS.bgDark : COLORS.bg }
    ]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : (Platform.OS === 'ios' ? 'dark-content' : 'default')}
        backgroundColor={isDark ? COLORS.cardBgDark : COLORS.cardBg}
      />
      
      {!session ? (
        <AuthScreen />
      ) : currentScreen === 'home' ? (
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
