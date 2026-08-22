import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Alert 
} from 'react-native';
import { supabase } from '../services/supabaseClient';
import { useReader } from '../context/ReaderContext';
import { COLORS } from '../theme/colors';

interface AuthScreenProps {
  onGuestMode?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onGuestMode }) => {
  const { theme } = useReader();
  const isDark = theme === 'dark';

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [pressedBtn, setPressedBtn] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Lỗi nhập liệu', 'Vui lòng điền đầy đủ Email và Mật khẩu!');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Mật khẩu quá ngắn', 'Mật khẩu phải chứa ít nhất 6 ký tự!');
      return;
    }

    if (isSignUp && !displayName.trim()) {
      Alert.alert('Lỗi nhập liệu', 'Vui lòng điền Tên hiển thị (ví dụ: Tên bé hoặc Bố mẹ)!');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Đăng ký tài khoản
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              display_name: displayName.trim(),
            },
          },
        });

        if (error) {
          Alert.alert('Lỗi đăng ký', error.message);
        } else {
          Alert.alert(
            'Đăng ký thành công',
            'Tài khoản đã được tạo! Bạn có thể đăng nhập ngay.'
          );
          setIsSignUp(false);
        }
      } else {
        // Đăng nhập tài khoản
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) {
          Alert.alert('Lỗi đăng nhập', error.message);
        }
      }
    } catch (err) {
      Alert.alert('Lỗi kết nối', 'Không thể kết nối đến máy chủ. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: isDark ? COLORS.bgDark : COLORS.bgSoft }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Logo Cú & Tiêu đề */}
        <View style={styles.header}>
          <Text style={styles.logo}>🦉</Text>
          <Text style={[styles.title, { color: isDark ? COLORS.textDark : COLORS.text }]}>
            Gia Sư Tập Đọc
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? COLORS.mutedDark : COLORS.muted }]}>
            {isSignUp ? 'Tạo tài khoản để đồng bộ học bạ của bé' : 'Đăng nhập để tiếp tục hành trình tập đọc'}
          </Text>
        </View>

        {/* Biểu mẫu điền thông tin */}
        <View style={[
          styles.card,
          { 
            backgroundColor: isDark ? COLORS.cardBgDark : '#FFFFFF',
            borderColor: isDark ? COLORS.borderDark : COLORS.border,
            borderBottomColor: isDark ? '#162228' : '#D5D5D5',
          }
        ]}>
          {isSignUp && (
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: isDark ? '#A0AEC0' : COLORS.muted }]}>
                Tên hiển thị (Tên bé hoặc Ba mẹ)
              </Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Nhập tên..."
                placeholderTextColor={isDark ? '#4A5568' : '#A0AEC0'}
                style={[
                  styles.input,
                  { 
                    color: isDark ? COLORS.textDark : COLORS.text,
                    borderColor: isDark ? COLORS.borderDark : COLORS.border,
                    backgroundColor: isDark ? COLORS.bgDark : '#FFFFFF',
                  }
                ]}
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: isDark ? '#A0AEC0' : COLORS.muted }]}>
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="example@mail.com"
              placeholderTextColor={isDark ? '#4A5568' : '#A0AEC0'}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[
                styles.input,
                { 
                  color: isDark ? COLORS.textDark : COLORS.text,
                  borderColor: isDark ? COLORS.borderDark : COLORS.border,
                  backgroundColor: isDark ? COLORS.bgDark : '#FFFFFF',
                }
              ]}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: isDark ? '#A0AEC0' : COLORS.muted }]}>
              Mật khẩu
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Tối thiểu 6 ký tự"
              placeholderTextColor={isDark ? '#4A5568' : '#A0AEC0'}
              secureTextEntry
              autoCapitalize="none"
              style={[
                styles.input,
                { 
                  color: isDark ? COLORS.textDark : COLORS.text,
                  borderColor: isDark ? COLORS.borderDark : COLORS.border,
                  backgroundColor: isDark ? COLORS.bgDark : '#FFFFFF',
                }
              ]}
            />
          </View>

          {/* Nút hành động chính (3D style) */}
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={() => setPressedBtn(true)}
            onPressOut={() => setPressedBtn(false)}
            onPress={handleAuth}
            disabled={loading}
            style={[
              styles.authBtn,
              {
                backgroundColor: isSignUp ? COLORS.secondary : COLORS.primary,
                borderBottomColor: isSignUp ? COLORS.secondaryShadow : COLORS.primaryShadow,
                transform: [{ translateY: pressedBtn ? 2 : 0 }],
                borderBottomWidth: pressedBtn ? 1 : 4,
                opacity: loading ? 0.7 : 1,
              }
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.authBtnText}>
                {isSignUp ? 'ĐĂNG KÝ NGAY' : 'ĐĂNG NHẬP'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Nút chuyển đổi Đăng nhập / Đăng ký */}
        <TouchableOpacity 
          style={styles.toggleBtn} 
          onPress={() => {
            setIsSignUp(!isSignUp);
            setEmail('');
            setPassword('');
            setDisplayName('');
          }}
        >
          <Text style={[styles.toggleBtnText, { color: COLORS.secondary }]}>
            {isSignUp ? 'Ba mẹ đã có tài khoản? Đăng nhập tại đây' : 'Bé chưa có tài khoản? Đăng ký tại đây'}
          </Text>
        </TouchableOpacity>

        {/* Nút Dùng thử ngay không cần tài khoản */}
        {onGuestMode && (
          <TouchableOpacity
            style={styles.guestBtn}
            onPress={onGuestMode}
            // @ts-ignore
            onClick={onGuestMode}
          >
            <Text style={[styles.guestBtnText, { color: isDark ? COLORS.mutedDark : COLORS.muted }]}>
              🚀 Bỏ qua & Trải nghiệm ngay (Chế độ Khách)
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 72,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  card: {
    borderRadius: 24,
    borderWidth: 2,
    borderBottomWidth: 5,
    padding: 20,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  authBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  authBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  toggleBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  guestBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 6,
  },
  guestBtnText: {
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
