import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/hooks/useAuth';
import { supabase } from '../../../config/supabase';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Ortak Tasarım Sistemi Renkleri
const COLORS = {
  primary: '#06B6D4',
  secondary: '#00A896',
  darkText: '#1F2937',
  lightText: '#9CA3AF',
  background: '#F8FAFC',
  inputBg: '#F1F5F9',
  white: '#FFFFFF',
  shadow: '#00C4B4',
  danger: '#FF6B6B',
  success: '#6BCB77',
};

export const CreateGuestScreen = () => {
  const { session } = useAuth();
  const navigation = useNavigation();
  const userId = session?.user?.id;

  const [fullName, setFullName] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert('Hata', 'Kullanıcı oturumu bulunamadı');
      return;
    }

    if (!fullName.trim()) {
      Alert.alert('Hata', 'Lütfen misafir adını giriniz');
      return;
    }

    if (!visitDate.trim()) {
      Alert.alert('Hata', 'Lütfen ziyaret tarihini giriniz');
      return;
    }

    // Simple date validation (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(visitDate)) {
      Alert.alert('Hata', 'Tarih formatı: YYYY-MM-DD (örn: 2024-12-25)');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('guests').insert({
        user_id: userId,
        full_name: fullName.trim(),
        plate_number: plateNumber.trim() || null,
        visit_date: visitDate,
      } as any);

      if (error) throw error;

      Alert.alert('Başarılı', 'Misafir kaydı oluşturuldu!', [
        {
          text: 'Tamam',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error creating guest:', error);
      Alert.alert('Hata', 'Misafir kaydı oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Arkaplan Dekorasyonu */}
      <View style={styles.bgDecoration} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={COLORS.darkText}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Yeni Misafir</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.formCard}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons
                  name="account-plus-outline"
                  size={40}
                  color={COLORS.primary}
                />
              </View>
            </View>

            <Text style={styles.formTitle}>Misafir Bilgileri</Text>
            <Text style={styles.formSubtitle}>
              Misafiriniz için dijital geçiş belgesi oluşturun.
            </Text>

            {/* Full Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ad Soyad *</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="account-outline"
                  size={20}
                  color={COLORS.lightText}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Örn: Ahmet Yılmaz"
                  placeholderTextColor={COLORS.lightText}
                  value={fullName}
                  onChangeText={setFullName}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Plate Number Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Araç Plakası (Opsiyonel)</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="car-outline"
                  size={20}
                  color={COLORS.lightText}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Örn: 34 ABC 123"
                  placeholderTextColor={COLORS.lightText}
                  value={plateNumber}
                  onChangeText={setPlateNumber}
                  editable={!loading}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Visit Date Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ziyaret Tarihi *</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="calendar-range-outline"
                  size={20}
                  color={COLORS.lightText}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-AA-GG (Örn: 2024-12-25)"
                  placeholderTextColor={COLORS.lightText}
                  value={visitDate}
                  onChangeText={setVisitDate}
                  editable={!loading}
                />
              </View>
              <Text style={styles.hint}>Format: YYYY-AA-GG</Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButtonContainer}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[COLORS.primary, '#2DD4BF']}
                start={{x:0, y:0}} end={{x:1, y:0}}
                style={styles.submitButton}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="qrcode-plus"
                      size={24}
                      color="#FFFFFF"
                    />
                    <Text style={styles.submitText}>Geçiş Belgesi Oluştur</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  bgDecoration: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(0, 196, 180, 0.05)',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.darkText,
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: COLORS.lightText,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkText,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.darkText,
    fontWeight: '500',
  },
  hint: {
    fontSize: 12,
    color: COLORS.lightText,
    marginTop: 6,
    marginLeft: 4,
  },
  submitButtonContainer: {
    marginTop: 24,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButton: {
    flexDirection: 'row',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  submitText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
});