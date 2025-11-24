import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { supabase } from '../../../config/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

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
  danger: '#FF6B6B',
  warning: '#FFD93D',
  success: '#6BCB77',
};

interface StaffLocation {
  user_id: string;
  latitude: number;
  longitude: number;
  updated_at: string;
}

export const ResidentServiceScreen = () => {
  const [staffLocations, setStaffLocations] = useState<StaffLocation[]>([]);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    getUserLocation();
    fetchStaffLocations();
    subscribeToStaffLocations();
  }, []);

  const getUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
  };

  const fetchStaffLocations = async () => {
    const { data } = await supabase
      .from('staff_locations')
      .select('*')
      .gte('updated_at', new Date(Date.now() - 5 * 60 * 1000).toISOString());

    if (data) setStaffLocations(data);
  };

  const subscribeToStaffLocations = () => {
    const channel = supabase
      .channel('staff_locations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'staff_locations' },
        () => fetchStaffLocations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const requestGarbageCollection = async () => {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      Alert.alert('Hata', 'Kullanıcı bilgisi alınamadı');
      return;
    }

    const { error } = await supabase.from('service_logs').insert({
      resident_id: user.user.id,
      type: 'garbage',
      status: 'pending',
      coordinates: userLocation,
    });

    if (error) {
      Alert.alert('Hata', 'İstek gönderilemedi');
    } else {
      Alert.alert(
        'Başarılı',
        'Çöp toplama isteğiniz alındı. Temizlik görevlisi en kısa sürede gelecektir.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Arkaplan Dekorasyonu */}
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
              <Text style={styles.greeting}>Hizmetler</Text>
              <Text style={styles.headerTitle}>Temizlik Servisi</Text>
            </View>
            <View style={styles.headerIconContainer}>
              <MaterialCommunityIcons name="room-service-outline" size={28} color={COLORS.primary} />
            </View>
          </View>

          {/* Service Request Card */}
          <TouchableOpacity 
            style={styles.serviceCardContainer} 
            activeOpacity={0.9} 
            onPress={requestGarbageCollection}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              start={{x:0, y:0}} end={{x:1, y:1}}
              style={styles.serviceGradient}
            >
              <View style={styles.serviceContent}>
                <View style={styles.serviceTextContainer}>
                  <View style={styles.serviceLabelContainer}>
                    <MaterialCommunityIcons name="delete-restore" size={16} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.serviceLabel}>Hızlı İstek</Text>
                  </View>
                  <Text style={styles.serviceValue}>Çöp Toplama</Text>
                  <Text style={styles.serviceSubtext}>
                    Kapı önündeki çöpü aldır
                  </Text>
                </View>
                <View style={styles.serviceIconCircle}>
                  <MaterialCommunityIcons
                    name="delete-outline"
                    size={32}
                    color={COLORS.primary}
                  />
                </View>
              </View>
              <View style={styles.tapHint}>
                <Text style={styles.tapHintText}>Çağırmak için dokun</Text>
                <MaterialCommunityIcons name="chevron-right" size={16} color="rgba(255,255,255,0.8)" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
                <View style={[styles.actionIconBg, { backgroundColor: '#E0F2FE' }]}>
                  <MaterialCommunityIcons name="history" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.actionTitle}>Geçmiş</Text>
                <Text style={styles.actionSubtitle}>Taleplerim</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
                <View style={[styles.actionIconBg, { backgroundColor: '#E0F2FE' }]}>
                  <MaterialCommunityIcons name="clock-outline" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.actionTitle}>Bekleyen</Text>
                <Text style={styles.actionSubtitle}>İşlemler</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Map Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Canlı Görevli Takibi</Text>
              {staffLocations.length > 0 && (
                <View style={[styles.badge, { backgroundColor: COLORS.success }]}>
                  <Text style={styles.badgeText}>{staffLocations.length} Aktif</Text>
                </View>
              )}
            </View>

            <View style={styles.mapContainer}>
              {userLocation ? (
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  customMapStyle={lightMapStyle}
                >
                  <Marker
                    coordinate={userLocation}
                    title="Konumunuz"
                  >
                    <View style={styles.userMarker}>
                      <MaterialCommunityIcons
                        name="home"
                        size={20}
                        color={COLORS.white}
                      />
                    </View>
                  </Marker>
                  {staffLocations.map((staff) => (
                    <Marker
                      key={staff.user_id}
                      coordinate={{
                        latitude: staff.latitude,
                        longitude: staff.longitude,
                      }}
                      title="Temizlik Görevlisi"
                    >
                      <View style={styles.staffMarker}>
                        <MaterialCommunityIcons
                          name="broom"
                          size={16}
                          color={COLORS.white}
                        />
                      </View>
                    </Marker>
                  ))}
                </MapView>
              ) : (
                <View style={styles.mapPlaceholder}>
                  <MaterialCommunityIcons
                    name="map-marker-off"
                    size={48}
                    color={COLORS.lightText}
                  />
                  <Text style={styles.emptyTitle}>Konum Bekleniyor</Text>
                  <Text style={styles.emptySubtitle}>
                    Haritayı görüntülemek için konum izni verin.
                  </Text>
                </View>
              )}
            </View>

            {staffLocations.length === 0 && (
              <View style={styles.infoCard}>
                <MaterialCommunityIcons name="information-outline" size={24} color={COLORS.lightText} />
                <Text style={styles.infoText}>
                  Şu anda aktif temizlik görevlisi görünmüyor.
                </Text>
              </View>
            )}
          </View>

          {/* Stats Overview - HEPSİ AYNI RENK */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.statCircle}
              >
                <Text style={styles.statNumber}>{staffLocations.length}</Text>
              </LinearGradient>
              <Text style={styles.statLabel}>Görevli</Text>
            </View>

            <View style={styles.statItem}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.statCircle}
              >
                <Text style={styles.statNumber}>5</Text>
              </LinearGradient>
              <Text style={styles.statLabel}>Bu Hafta</Text>
            </View>

            <View style={styles.statItem}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.statCircle}
              >
                <Text style={styles.statNumber}>0</Text>
              </LinearGradient>
              <Text style={styles.statLabel}>Bekleyen</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const lightMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#bdbdbd" }]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{ "color": "#eeeeee" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#e5e5e5" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#ffffff" }]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#dadada" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [{ "color": "#e5e5e5" }]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [{ "color": "#eeeeee" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#c9c9c9" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  }
];

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
  // Service Request Card
  serviceCardContainer: {
    marginBottom: 24,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  serviceGradient: {
    borderRadius: 24,
    padding: 20,
  },
  serviceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceTextContainer: {
    flex: 1,
  },
  serviceLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  serviceLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  serviceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  serviceSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  serviceIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  tapHintText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  // Hızlı İşlemler
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  // Map Section
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  mapContainer: {
    height: 220,
    backgroundColor: COLORS.inputBg,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkText,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.lightText,
    marginTop: 4,
    textAlign: 'center',
  },
  userMarker: {
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  staffMarker: {
    backgroundColor: COLORS.success,
    padding: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.lightText,
    lineHeight: 18,
  },
  // İstatistikler
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
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
});