import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  checkAvailability,
  createReservation,
  fetchMyReservations,
} from '../services/bookingService';

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
  disabled: '#E2E8F0',
};

const FACILITIES = [
  { name: 'Tennis Court', icon: 'tennis' },
  { name: 'Sauna', icon: 'hot-tub' },
  { name: 'BBQ Area', icon: 'grill' },
  { name: 'Meeting Room', icon: 'account-group' },
  { name: 'Swimming Pool', icon: 'pool' },
  { name: 'Gym', icon: 'dumbbell' },
];

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00',
];

interface Reservation {
  id: number;
  facility_name: string;
  date: string;
  time_slot: string;
  created_at: string;
}

export const BookingScreen = () => {
  const [selectedFacility, setSelectedFacility] = useState(FACILITIES[0].name);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const { session } = useAuth();
  const userId = session?.user?.id;

  useEffect(() => {
    if (userId) {
      loadMyReservations();
    }
  }, [userId]);

  const loadMyReservations = async () => {
    if (!userId) return;
    const { data, error } = await fetchMyReservations(userId);
    if (!error && data) {
      setMyReservations(data);
    }
  };

  const handleBooking = async () => {
    if (!userId) {
      Alert.alert('Hata', 'Kullanıcı oturumu bulunamadı');
      return;
    }

    if (!selectedDate || !selectedTimeSlot) {
      Alert.alert('Eksik Bilgi', 'Lütfen tarih ve saat seçiniz');
      return;
    }

    setLoading(true);

    try {
      const isAvailable = await checkAvailability(
        selectedFacility,
        selectedDate,
        selectedTimeSlot
      );

      if (!isAvailable) {
        Alert.alert('Müsait Değil', 'Bu zaman dilimi zaten dolu');
        setLoading(false);
        return;
      }

      const { error } = await createReservation(
        selectedFacility,
        selectedDate,
        selectedTimeSlot,
        userId
      );

      if (error) {
        Alert.alert('Hata', 'Rezervasyon oluşturulamadı');
      } else {
        Alert.alert('Başarılı', 'Rezervasyonunuz oluşturuldu!');
        setSelectedTimeSlot('');
        loadMyReservations();
      }
    } catch (err) {
      Alert.alert('Hata', 'Beklenmeyen bir hata oluştu');
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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Sosyal Tesisler</Text>
            <Text style={styles.headerTitle}>Rezervasyon</Text>
          </View>
          <View style={styles.headerIconContainer}>
            <MaterialCommunityIcons name="calendar-clock" size={28} color={COLORS.primary} />
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Facility Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tesis Seçimi</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.facilitiesContainer}
            >
              {FACILITIES.map((facility) => {
                const isSelected = selectedFacility === facility.name;
                return (
                  <TouchableOpacity
                    key={facility.name}
                    onPress={() => setSelectedFacility(facility.name)}
                    activeOpacity={0.8}
                  >
                    {isSelected ? (
                      <LinearGradient
                        colors={[COLORS.primary, '#4FD1C5']}
                        style={[styles.facilityCard, styles.facilityCardSelected]}
                      >
                         <View style={styles.facilityIconCircleWhite}>
                          <MaterialCommunityIcons
                            name={facility.icon as any}
                            size={24}
                            color={COLORS.primary}
                          />
                        </View>
                        <Text style={styles.facilityTextSelected}>{facility.name}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={styles.facilityCard}>
                         <View style={styles.facilityIconCircle}>
                          <MaterialCommunityIcons
                            name={facility.icon as any}
                            size={24}
                            color={COLORS.lightText}
                          />
                        </View>
                        <Text style={styles.facilityText}>{facility.name}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Date Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tarih Seçimi</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="calendar-range" size={22} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY-AA-GG (Örn: 2024-12-25)"
                placeholderTextColor={COLORS.lightText}
                value={selectedDate}
                onChangeText={setSelectedDate}
              />
            </View>
          </View>

          {/* Time Slots */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saat Seçimi</Text>
            <View style={styles.timeGrid}>
              {TIME_SLOTS.map((slot) => {
                const isSelected = selectedTimeSlot === slot;
                const isBooked = bookedSlots.includes(slot);
                return (
                  <TouchableOpacity
                    key={slot}
                    style={[
                      styles.timePill,
                      isSelected && styles.timePillSelected,
                      isBooked && styles.timePillBooked,
                    ]}
                    onPress={() => !isBooked && setSelectedTimeSlot(slot)}
                    disabled={isBooked}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.timePillText,
                        isSelected && styles.timePillTextSelected,
                        isBooked && styles.timePillTextBooked,
                      ]}
                    >
                      {slot}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Book Button */}
          <TouchableOpacity
            style={[styles.bookButtonContainer, loading && styles.bookButtonDisabled]}
            onPress={handleBooking}
            disabled={loading}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[COLORS.primary, '#2DD4BF']}
              style={styles.bookButton}
              start={{x:0, y:0}} end={{x:1, y:0}}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.bookButtonText}>Rezervasyonu Tamamla</Text>
                  <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* My Reservations */}
          <View style={styles.section}>
            <View style={styles.reservationsHeader}>
              <Text style={styles.sectionTitle}>Rezervasyonlarım</Text>
              {myReservations.length > 0 && (
                 <View style={styles.countBadge}>
                    <Text style={styles.countText}>{myReservations.length}</Text>
                 </View>
              )}
            </View>
            
            {myReservations.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                   <MaterialCommunityIcons name="calendar-blank-outline" size={32} color={COLORS.lightText} />
                </View>
                <Text style={styles.emptyText}>Henüz rezervasyonunuz yok</Text>
                <Text style={styles.emptySubtext}>
                  Tesislerimizden faydalanmak için yukarıdan seçim yapabilirsiniz.
                </Text>
              </View>
            ) : (
              myReservations.map((reservation) => (
                <View key={reservation.id} style={styles.reservationCard}>
                  <View style={styles.reservationIconContainer}>
                    <MaterialCommunityIcons
                      name="calendar-check"
                      size={24}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={styles.reservationContent}>
                    <Text style={styles.reservationFacility}>
                      {reservation.facility_name}
                    </Text>
                    <View style={styles.reservationDetails}>
                      <View style={styles.reservationDetail}>
                        <MaterialCommunityIcons name="calendar-today" size={14} color={COLORS.lightText} />
                        <Text style={styles.reservationDetailText}>{reservation.date}</Text>
                      </View>
                      <View style={styles.reservationDetail}>
                        <MaterialCommunityIcons name="clock-time-four-outline" size={14} color={COLORS.lightText} />
                        <Text style={styles.reservationDetailText}>{reservation.time_slot}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Onaylı</Text>
                  </View>
                </View>
              ))
            )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 10,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.lightText,
    fontWeight: '600',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.darkText,
    letterSpacing: 0.5,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 16,
  },
  // Tesis Seçimi
  facilitiesContainer: {
    paddingRight: 24, // Sağda boşluk bırakmak için
    gap: 12,
  },
  facilityCard: {
    width: 110,
    height: 130,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    padding: 10,
  },
  facilityCardSelected: {
    // Gradient background, stil inline olarak veriliyor
  },
  facilityIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  facilityIconCircleWhite: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  facilityText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkText,
    textAlign: 'center',
  },
  facilityTextSelected: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  // Tarih Input
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
  dateInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.darkText,
    height: '100%',
  },
  // Saat Seçimi
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timePill: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.inputBg,
    minWidth: '22%', // 4 kolon sığması için
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePillSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timePillBooked: {
    backgroundColor: COLORS.disabled,
    borderColor: COLORS.disabled,
    opacity: 0.5,
  },
  timePillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  timePillTextSelected: {
    color: COLORS.white,
  },
  timePillTextBooked: {
    color: COLORS.lightText,
  },
  // Rezervasyon Butonu
  bookButtonContainer: {
    marginHorizontal: 24,
    marginBottom: 30,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  bookButton: {
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  bookButtonDisabled: {
    opacity: 0.7,
  },
  bookButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  // Rezervasyon Listesi
  reservationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  countBadge: {
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.inputBg,
    borderStyle: 'dashed',
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.darkText,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.lightText,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 18,
  },
  reservationCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  reservationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  reservationContent: {
    flex: 1,
  },
  reservationFacility: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 6,
  },
  reservationDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  reservationDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reservationDetailText: {
    fontSize: 12,
    color: COLORS.lightText,
    fontWeight: '500',
  },
  statusBadge: {
    backgroundColor: '#ECFDF5', // Çok açık yeşil
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '700',
  },
});