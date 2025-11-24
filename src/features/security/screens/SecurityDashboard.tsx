import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { supabase } from '../../../config/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// TURKUAZ MAVİSİ RENK PALETİ
const COLORS = {
  primary: '#06B6D4',
  primaryDark: '#0891B2',
  darkText: '#1F2937',
  lightText: '#9CA3AF',
  background: '#F8FDFF',
  inputBg: '#F0F9FF',
  white: '#FFFFFF',
  shadow: '#06B6D4',
  danger: '#EF4444',
  warning: '#FFD93D', // İsteğe bağlı, uyarılar için
};

interface Guest {
  id: number;
  full_name: string;
  plate_number: string | null;
  visit_date: string;
  status: 'expected' | 'arrived' | 'departed';
  qr_token: string;
}

export const SecurityDashboard = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [supportRequests, setSupportRequests] = useState<any[]>([]);
  const [manualCode, setManualCode] = useState('');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    fetchTodayGuests();
    fetchSupportRequests();
  }, []);

  const fetchTodayGuests = async () => {
    const { data } = await supabase
      .from('guests')
      .select('*')
      .in('status', ['expected', 'arrived'])
      .order('visit_date', { ascending: true });

    if (data) setGuests(data);
  };

  const fetchSupportRequests = async () => {
    const { data } = await supabase
      .from('service_requests')
      .select('*')
      .eq('category', 'security')
      .in('status', ['pending', 'in_progress'])
      .order('created_at', { ascending: false });

    if (data) setSupportRequests(data);
  };

  const updateRequestStatus = async (id: number, status: string) => {
    const { error } = await supabase
      .from('service_requests')
      .update({ status })
      .eq('id', id);

    if (!error) {
      fetchSupportRequests();
      Alert.alert('Başarılı', 'Talep durumu güncellendi');
    }
  };

  const handleQRScan = async (data: string) => {
    setScannerVisible(false);
    await processGuestCode(data);
  };

  const handleManualEntry = async () => {
    if (!manualCode.trim()) {
      Alert.alert('Hata', 'Lütfen bir kod girin');
      return;
    }
    await processGuestCode(manualCode.trim());
    setManualCode('');
  };

  const processGuestCode = async (code: string) => {
    const { data: guest, error: fetchError } = await supabase
      .from('guests')
      .select('*')
      .eq('qr_token', code)
      .single();

    if (fetchError || !guest) {
      Alert.alert('❌ ERİŞİM REDDEDİLDİ', 'Bu kod geçersiz veya misafir listesinde bulunamadı.');
      return;
    }

    if (guest.status === 'arrived') {
      Alert.alert('⚠️ UYARI', `Bu misafir zaten giriş yaptı.\n\nMisafir: ${guest.full_name}`);
      return;
    }

    const { error } = await supabase
      .from('guests')
      .update({ status: 'arrived' })
      .eq('id', guest.id);

    if (!error) {
      Alert.alert('✅ GİRİŞ ONAYLANDI', `Misafir: ${guest.full_name}\nTarih: ${guest.visit_date}${guest.plate_number ? `\nPlaka: ${guest.plate_number}` : ''}`);
      fetchTodayGuests();
    } else {
      Alert.alert('❌ HATA', 'Giriş kaydedilemedi. Lütfen tekrar deneyin.');
    }
  };

  const openScanner = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('İzin Gerekli', 'Kamera izni verilmedi');
        return;
      }
    }
    setScannerVisible(true);
  };

  const renderGuest = ({ item }: { item: Guest }) => (
    <View style={styles.guestCard}>
      <View style={styles.guestHeader}>
        <View style={styles.guestIconContainer}>
           <MaterialCommunityIcons name="account" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.guestInfo}>
          <Text style={styles.guestName}>{item.full_name}</Text>
          <View style={styles.guestMeta}>
             <MaterialCommunityIcons name="calendar-clock" size={14} color={COLORS.lightText} />
             <Text style={styles.guestDate}>
               {new Date(item.visit_date).toLocaleDateString('tr-TR')}
             </Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'arrived' ? '#F0FDFA' : '#F0F9FF' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.status === 'arrived' ? COLORS.primary : COLORS.primaryDark }
          ]}>
            {item.status === 'arrived' ? 'Giriş Yaptı' : 'Bekleniyor'}
          </Text>
        </View>
      </View>
      
      <View style={styles.guestFooter}>
        {item.plate_number ? (
          <View style={styles.plateContainer}>
            <MaterialCommunityIcons name="car" size={16} color={COLORS.darkText} />
            <Text style={styles.guestPlate}>{item.plate_number}</Text>
          </View>
        ) : (
          <View style={styles.plateContainer}>
             <Text style={styles.guestPlatePlaceholder}>Araçsız</Text>
          </View>
        )}
        
        <View style={styles.qrContainer}>
          <MaterialCommunityIcons name="qrcode" size={14} color={COLORS.lightText} />
          <Text style={styles.qrText}>{item.qr_token}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Arkaplan Dekoru */}
      <View style={styles.bgDecoration} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Güvenlik Paneli</Text>
              <Text style={styles.headerTitle}>Giriş Kontrol</Text>
            </View>
            <View style={styles.headerIconContainer}>
              <MaterialCommunityIcons name="shield-check-outline" size={28} color={COLORS.primary} />
            </View>
          </View>

          {/* Stats Overview - TEK RENK */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.statCircle}
              >
                <Text style={styles.statNumber}>{guests.length}</Text>
              </LinearGradient>
              <Text style={styles.statLabel}>Toplam</Text>
            </View>

            <View style={styles.statItem}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.statCircle}
              >
                <Text style={styles.statNumber}>
                  {guests.filter(g => g.status === 'arrived').length}
                </Text>
              </LinearGradient>
              <Text style={styles.statLabel}>İçeride</Text>
            </View>

            <View style={styles.statItem}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.statCircle}
              >
                <Text style={styles.statNumber}>{supportRequests.length}</Text>
              </LinearGradient>
              <Text style={styles.statLabel}>Talepler</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
            <View style={styles.quickActionsGrid}>
              {/* QR Scanner Button */}
              <TouchableOpacity
                style={styles.actionCard}
                onPress={openScanner}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#E0F2FE', '#F0F9FF']}
                  style={styles.actionIconBg}
                >
                  <MaterialCommunityIcons name="qrcode-scan" size={32} color={COLORS.primary} />
                </LinearGradient>
                <Text style={styles.actionTitle}>QR Tara</Text>
                <Text style={styles.actionSubtitle}>Hızlı Giriş</Text>
              </TouchableOpacity>

              {/* Manual Entry Input Area */}
              <View style={[styles.actionCard, { flex: 1.5 }]}>
                 <Text style={styles.manualEntryLabel}>Manuel Kod</Text>
                 <View style={styles.manualEntryRow}>
                    <TextInput
                      style={styles.manualInput}
                      value={manualCode}
                      onChangeText={setManualCode}
                      placeholder="Kodu girin"
                      placeholderTextColor={COLORS.lightText}
                      autoCapitalize="characters"
                    />
                    <TouchableOpacity 
                      style={styles.manualButton}
                      onPress={handleManualEntry}
                    >
                       <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.white} />
                    </TouchableOpacity>
                 </View>
              </View>
            </View>
          </View>

          {/* Active Guests List */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Beklenen / Gelenler</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{guests.length}</Text>
              </View>
            </View>
            
            {guests.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="account-clock-outline"
                  size={48}
                  color={COLORS.lightText}
                />
                <Text style={styles.emptyTitle}>Liste Boş</Text>
                <Text style={styles.emptySubtitle}>
                  Şu an beklenen veya giriş yapmış misafir yok.
                </Text>
              </View>
            ) : (
              <FlatList
                data={guests}
                renderItem={renderGuest}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                contentContainerStyle={styles.guestList}
              />
            )}
          </View>

          {/* Security Requests Section */}
          {supportRequests.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Güvenlik Talepleri</Text>
                <View style={[styles.badge, { backgroundColor: COLORS.warning }]}>
                  <Text style={styles.badgeText}>{supportRequests.length}</Text>
                </View>
              </View>
              
              {supportRequests.map((item) => (
                <View key={item.id} style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <View style={styles.requestTitleContainer}>
                      <View style={styles.requestIconBg}>
                         <MaterialCommunityIcons name="shield-alert-outline" size={20} color={COLORS.warning} />
                      </View>
                      <Text style={styles.requestTitle}>Güvenlik Bildirimi</Text>
                    </View>
                    <Text style={styles.requestTime}>
                      {new Date(item.created_at).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                    </Text>
                  </View>
                  
                  <Text style={styles.requestDescription}>{item.description}</Text>
                  
                  <View style={styles.requestActions}>
                    <TouchableOpacity
                      style={styles.actionBtnSmall}
                      onPress={() => updateRequestStatus(item.id, 'in_progress')}
                    >
                      <Text style={styles.actionBtnTextSmall}>İşleme Al</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtnSmall, styles.actionBtnPrimary]}
                      onPress={() => updateRequestStatus(item.id, 'resolved')}
                    >
                      <Text style={[styles.actionBtnTextSmall, { color: COLORS.white }]}>Çözüldü</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* QR Scanner Modal */}
      <Modal
        visible={scannerVisible}
        animationType="slide"
        onRequestClose={() => setScannerVisible(false)}
      >
        <View style={styles.scannerContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={({ data }) => handleQRScan(data)}
          >
            <LinearGradient
              colors={['rgba(6, 182, 212, 0.9)', 'rgba(8, 145, 178, 0.8)']}
              style={styles.scannerHeader}
            >
              <View style={styles.scannerHeaderContent}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setScannerVisible(false)}
                >
                  <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.scannerTitle}>QR Kod Tarayıcı</Text>
                <View style={{ width: 40 }} />
              </View>
            </LinearGradient>
            
            <View style={styles.scannerFrameContainer}>
              <View style={styles.scannerFrame}>
                <View style={styles.cornerTopLeft} />
                <View style={styles.cornerTopRight} />
                <View style={styles.cornerBottomLeft} />
                <View style={styles.cornerBottomRight} />
              </View>
              <Text style={styles.scannerText}>QR kodunu çerçeve içine hizalayın</Text>
            </View>
          </CameraView>
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
    backgroundColor: 'rgba(6, 182, 212, 0.05)',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
  // İstatistikler
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.lightText,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  badge: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  // Hızlı İşlemler
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: COLORS.lightText,
  },
  manualEntryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.lightText,
    marginBottom: 8,
    alignSelf: 'flex-start',
    marginLeft: 4,
  },
  manualEntryRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
  },
  manualInput: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: COLORS.darkText,
  },
  manualButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Misafir Listesi
  guestList: {
    gap: 12,
  },
  guestCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  guestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  guestIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  guestInfo: {
    flex: 1,
  },
  guestName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 2,
  },
  guestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  guestDate: {
    fontSize: 12,
    color: COLORS.lightText,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  guestFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBg,
  },
  plateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  guestPlate: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  guestPlatePlaceholder: {
    fontSize: 12,
    color: COLORS.lightText,
    fontStyle: 'italic',
  },
  qrContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  qrText: {
    fontSize: 11,
    color: COLORS.lightText,
    fontFamily: 'monospace',
  },
  // Talepler
  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBg,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requestIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  requestTime: {
    fontSize: 12,
    color: COLORS.lightText,
  },
  requestDescription: {
    fontSize: 13,
    color: COLORS.lightText,
    marginBottom: 12,
    lineHeight: 20,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtnSmall: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  actionBtnPrimary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  actionBtnTextSmall: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.inputBg,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  emptySubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.lightText,
    textAlign: 'center',
  },
  // Scanner Modal
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  scannerHeader: {
    paddingTop: 50,
    paddingBottom: 20,
  },
  scannerHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  scannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 260,
    height: 260,
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: COLORS.primary,
    borderTopLeftRadius: 20,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: COLORS.primary,
    borderTopRightRadius: 20,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: COLORS.primary,
    borderBottomLeftRadius: 20,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: COLORS.primary,
    borderBottomRightRadius: 20,
  },
  scannerText: {
    marginTop: 40,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
});