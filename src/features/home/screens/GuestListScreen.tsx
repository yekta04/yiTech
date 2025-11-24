import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Modal,
  Share,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
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
  warning: '#F59E0B',
  info: '#3B82F6',
};

interface Guest {
  id: number;
  full_name: string;
  plate_number: string | null;
  visit_date: string;
  status: 'expected' | 'arrived' | 'departed';
  qr_token: string;
  created_at: string;
}

export const GuestListScreen = () => {
  const { session } = useAuth();
  const navigation = useNavigation();
  const userId = session?.user?.id;

  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    if (userId) {
      loadGuests();
    }
  }, [userId]);

  // Ekrana her dönüldüğünde misafirleri yenile
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (userId) {
        loadGuests();
      }
    });

    return unsubscribe;
  }, [navigation, userId]);

  const loadGuests = async () => {
    if (!userId) return;

    try {
      // Güvenlik tüm misafirleri görebilir, diğerleri sadece kendininkileri
      const { data: userProfile } = await (supabase
        .from('profiles') as any)
        .select('role')
        .eq('id', userId)
        .single();

      let query = supabase
        .from('guests')
        .select('*')
        .order('visit_date', { ascending: true });

      // Eğer güvenlik değilse, sadece kendi misafirlerini göster
      if (userProfile?.role !== 'security' && userProfile?.role !== 'admin') {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      if (data) setGuests(data);
    } catch (error) {
      console.error('Error loading guests:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('tr-TR', { month: 'short' }).toUpperCase(),
      full: date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    };
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'expected':
        return { label: 'Bekleniyor', color: COLORS.warning, bg: '#FEF3C7' };
      case 'arrived':
        return { label: 'Giriş Yaptı', color: COLORS.success, bg: '#DCFCE7' };
      case 'departed':
        return { label: 'Ayrıldı', color: COLORS.lightText, bg: '#F3F4F6' };
      default:
        return { label: status, color: COLORS.lightText, bg: '#F3F4F6' };
    }
  };

  const handleGuestPress = (guest: Guest) => {
    setSelectedGuest(guest);
    setShowQrModal(true);
  };

  const handleShare = async () => {
    if (!selectedGuest) return;

    try {
      await Share.share({
        message: `Misafir Geçiş Belgesi\n\nİsim: ${selectedGuest.full_name}\nTarih: ${formatDate(selectedGuest.visit_date).full}\nKod: ${selectedGuest.qr_token}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Arkaplan Dekorasyonu */}
      <View style={styles.bgDecoration} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Ziyaretçi Yönetimi</Text>
            <Text style={styles.headerTitle}>Misafirlerim</Text>
          </View>
          <TouchableOpacity
            onPress={async () => {
              const { supabase } = await import('../../../config/supabase');
              await supabase.auth.signOut();
            }}
            style={styles.headerIconContainer}
          >
            <MaterialCommunityIcons name="logout" size={24} color={COLORS.danger} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* New Guest Button */}
          <TouchableOpacity
            style={styles.newGuestButtonContainer}
            onPress={() => navigation.navigate('CreateGuest' as never)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[COLORS.primary, '#2DD4BF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.newGuestButton}
            >
              <View style={styles.newGuestIconCircle}>
                <MaterialCommunityIcons
                  name="account-plus"
                  size={24}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.newGuestText}>Yeni Misafir Oluştur</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Guest List */}
          <Text style={styles.sectionTitle}>Misafir Listesi</Text>
          
          {guests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <MaterialCommunityIcons
                  name="account-group-outline"
                  size={48}
                  color={COLORS.lightText}
                />
              </View>
              <Text style={styles.emptyText}>Henüz misafir kaydı yok</Text>
              <Text style={styles.emptySubtext}>
                Yukarıdaki butonu kullanarak yeni bir misafir davet edebilirsiniz.
              </Text>
            </View>
          ) : (
            guests.map((guest) => {
              const dateInfo = formatDate(guest.visit_date);
              const statusConfig = getStatusConfig(guest.status);

              return (
                <TouchableOpacity
                  key={guest.id}
                  style={styles.guestCard}
                  onPress={() => handleGuestPress(guest)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardLeft}>
                    <LinearGradient
                      colors={[COLORS.primary, '#4FD1C5']}
                      style={styles.dateBox}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.dateDay}>{dateInfo.day}</Text>
                      <Text style={styles.dateMonth}>{dateInfo.month}</Text>
                    </LinearGradient>
                  </View>

                  <View style={styles.cardMiddle}>
                    <Text style={styles.guestName}>{guest.full_name}</Text>
                    <View style={styles.plateRow}>
                      {guest.plate_number ? (
                        <View style={styles.plateContainer}>
                          <MaterialCommunityIcons
                            name="car"
                            size={14}
                            color={COLORS.lightText}
                          />
                          <Text style={styles.plateText}>{guest.plate_number}</Text>
                        </View>
                      ) : (
                        <Text style={styles.noPlateText}>Araçsız</Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.cardRight}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: statusConfig.bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: statusConfig.color },
                        ]}
                      >
                        {statusConfig.label}
                      </Text>
                    </View>
                    <MaterialCommunityIcons
                      name="qrcode-scan"
                      size={24}
                      color={COLORS.lightText}
                      style={styles.qrIcon}
                    />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>

      {/* QR Modal */}
      <Modal
        visible={showQrModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQrModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={[COLORS.white, '#F0FDFA']}
              style={styles.passCard}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.passTitle}>Geçiş Belgesi</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowQrModal(false)}
                >
                  <MaterialCommunityIcons name="close" size={24} color={COLORS.darkText} />
                </TouchableOpacity>
              </View>

              {selectedGuest && (
                <>
                  <View style={styles.qrWrapper}>
                    <View style={styles.qrBorder}>
                      <QRCode
                        value={selectedGuest.qr_token}
                        size={180}
                        color={COLORS.darkText}
                        backgroundColor="transparent"
                      />
                    </View>
                    <Text style={styles.qrCodeText}>{selectedGuest.qr_token}</Text>
                  </View>

                  <View style={styles.guestDetails}>
                    <Text style={styles.guestNameLarge}>
                      {selectedGuest.full_name}
                    </Text>
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="calendar" size={16} color={COLORS.primary} />
                      <Text style={styles.visitDate}>
                        {formatDate(selectedGuest.visit_date).full}
                      </Text>
                    </View>
                    {selectedGuest.plate_number && (
                      <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="car" size={16} color={COLORS.primary} />
                        <Text style={styles.visitDate}>
                          {selectedGuest.plate_number}
                        </Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.shareButton}
                    onPress={handleShare}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[COLORS.primary, '#2DD4BF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.shareButtonGradient}
                    >
                      <MaterialCommunityIcons
                        name="share-variant"
                        size={20}
                        color={COLORS.white}
                      />
                      <Text style={styles.shareButtonText}>Paylaş</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}
            </LinearGradient>
          </View>
        </View>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  // New Guest Button
  newGuestButtonContainer: {
    marginBottom: 30,
    borderRadius: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  newGuestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
  },
  newGuestIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  newGuestText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 16,
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.inputBg,
    borderStyle: 'dashed',
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.lightText,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  // Guest Card
  guestCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  cardLeft: {
    marginRight: 16,
  },
  dateBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateDay: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
  },
  cardMiddle: {
    flex: 1,
    justifyContent: 'center',
  },
  guestName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 6,
  },
  plateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  plateText: {
    fontSize: 12,
    color: COLORS.darkText,
    fontWeight: '600',
  },
  noPlateText: {
    fontSize: 12,
    color: COLORS.lightText,
    fontStyle: 'italic',
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 60,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  qrIcon: {
    marginTop: 'auto',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  passCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    padding: 4,
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
  },
  passTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  qrWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrBorder: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.inputBg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 12,
  },
  qrCodeText: {
    fontSize: 14,
    color: COLORS.lightText,
    fontFamily: 'monospace',
    letterSpacing: 2,
    fontWeight: '600',
  },
  guestDetails: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  guestNameLarge: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.darkText,
    marginBottom: 12,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  visitDate: {
    fontSize: 15,
    color: COLORS.darkText,
    fontWeight: '500',
  },
  shareButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  shareButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});