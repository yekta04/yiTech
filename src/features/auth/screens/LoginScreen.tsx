import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
  Animated,
  ScrollView,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../auth/hooks/useAuth';

const { width, height } = Dimensions.get('window');

// GÜNCELLENMİŞ TURKUAZ MAVİSİ RENK PALETİ
const COLORS = {
  primary: '#06B6D4', // Cyan-500
  primaryDark: '#0891B2', // Cyan-600
  darkText: '#1F2937',
  lightText: '#9CA3AF',
  background: '#F8FDFF', // Çok açık maviye çalan beyaz
  inputBg: '#F0F9FF', // Sky-50
  white: '#FFFFFF',
  shadow: '#06B6D4',
};

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const { signInWithEmail } = useAuth();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Eksik Bilgi', 'Lütfen tüm alanları doldurun');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signInWithEmail(email, password);
      if (error) {
        Alert.alert(
          isRegisterMode ? 'Kayıt Başarısız' : 'Giriş Başarısız',
          error.message
        );
      }
    } catch (err: any) {
      Alert.alert('Hata', `Beklenmeyen bir hata oluştu: ${err?.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Arka Plan Dekorasyonu */}
      <View style={styles.topDecorationCircle} />
      <View style={styles.topDecorationCircleSmall} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View 
            style={[
              styles.content, 
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            
            {/* Header / Logo Alanı */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                {/* LOGO DÜZELTİLDİ: 4 seviye yukarı çıkılarak root/assets klasörüne erişildi */}
                <Image
                  source={require('../../../../assets/logo.jpg')} 
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <Text style={styles.appTagline}>
                  {isRegisterMode ? 'Aramıza Katılın' : 'Site Yönetimine Hoş Geldiniz'}
                </Text>
              </View>
            </View>

            {/* Ana Form Kartı */}
            <View style={styles.mainCard}>
              <Text style={styles.cardTitle}>
                {isRegisterMode ? 'Hesap Oluştur' : 'Giriş Yap'}
              </Text>
              
              <View style={styles.form}>
                
                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>E-posta</Text>
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                      name="email-outline"
                      size={20}
                      color={COLORS.primary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="ornek@site.com"
                      placeholderTextColor="#94A3B8"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      editable={!isLoading}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Şifre</Text>
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                      name="lock-outline"
                      size={20}
                      color={COLORS.primary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="#94A3B8"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      editable={!isLoading}
                    />
                  </View>
                </View>

                {!isRegisterMode && (
                  <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>Şifremi Unuttum?</Text>
                  </TouchableOpacity>
                )}

                {/* Action Button - Turkuaz Gradient */}
                <TouchableOpacity
                  style={styles.actionButtonContainer}
                  onPress={handleAuth}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.actionButton}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.actionButtonText}>
                        {isRegisterMode ? 'Kayıt Ol' : 'Giriş Yap'}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Toggle Auth Mode */}
                <View style={styles.toggleContainer}>
                  <Text style={styles.toggleText}>
                    {isRegisterMode ? 'Zaten hesabınız var mı? ' : 'Henüz hesabınız yok mu? '}
                  </Text>
                  <TouchableOpacity onPress={() => setIsRegisterMode(!isRegisterMode)}>
                    <Text style={styles.toggleTextBold}>
                      {isRegisterMode ? 'Giriş Yapın' : 'Kayıt Olun'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Alt Özellikler */}
            <View style={styles.footerFeatures}>
              <FeatureItem icon="shield-check-outline" text="Güvenli" />
              <View style={styles.dividerDot} />
              <FeatureItem icon="lightning-bolt-outline" text="Hızlı" />
              <View style={styles.dividerDot} />
              <FeatureItem icon="cellphone-check" text="Mobil" />
            </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const FeatureItem = ({ icon, text }: { icon: any, text: string }) => (
  <View style={styles.featureItem}>
    <MaterialCommunityIcons name={icon} size={16} color={COLORS.lightText} />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topDecorationCircle: {
    position: 'absolute',
    top: -height * 0.15,
    right: -width * 0.2,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(6, 182, 212, 0.05)', // Turkuaz Opak
  },
  topDecorationCircleSmall: {
    position: 'absolute',
    top: height * 0.1,
    left: -width * 0.1,
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: 'rgba(6, 182, 212, 0.03)',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  content: {
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoImage: {
    width: 180,
    height: 180,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.darkText,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  appTagline: {
    fontSize: 15,
    color: COLORS.lightText,
    fontWeight: '500',
  },
  mainCard: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 25,
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkText,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.darkText,
    fontWeight: '500',
    height: '100%',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -10,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  actionButtonContainer: {
    marginTop: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  actionButton: {
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  toggleText: {
    color: COLORS.lightText,
    fontSize: 14,
  },
  toggleTextBold: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  footerFeatures: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    gap: 15,
    opacity: 0.7,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    color: COLORS.lightText,
    fontWeight: '600',
  },
  dividerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.lightText,
    opacity: 0.5,
  },
});