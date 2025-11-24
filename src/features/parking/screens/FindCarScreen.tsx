import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  fetchSpots,
  getCachedSpots,
  occupySpot,
  releaseSpot,
  subscribeToParkingUpdates,
} from '../services/parkingService';

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
  occupied: '#E2E8F0',
  occupiedText: '#94A3B8',
};

interface ParkingSpot {
  id: number;
  location_code: string;
  is_occupied: boolean;
  occupied_by: string | null;
}

export const ParkingMapScreen = () => {
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();
  const userId = session?.user?.id;

  const loadSpots = async () => {
    const cachedData = await getCachedSpots();
    if (cachedData && cachedData.length > 0) {
      setSpots(cachedData);
      setLoading(false);
    }

    const { data, error } = await fetchSpots();
    if (error) {
      if (!cachedData) {
        Alert.alert('Hata', 'Park verileri yüklenemedi');
      }
    } else if (data) {
      setSpots(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSpots();

    const unsubscribe = subscribeToParkingUpdates((updatedSpot) => {
      setSpots((prev) =>
        prev.map((spot) => (spot.id === updatedSpot.id ? updatedSpot : spot))
      );
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSpotPress = async (spot: ParkingSpot) => {
    if (!userId) return;

    if (spot.is_occupied && spot.occupied_by !== userId) {
      Alert.alert('Dolu', 'Bu park yeri başkası tarafından kullanılıyor');
      return;
    }

    if (spot.occupied_by === userId) {
      Alert.alert('Çıkış Yap', 'Park yerinden ayrılmak istiyor musunuz?', [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Ayrıl',
          onPress: async () => {
            const { error } = await releaseSpot(spot.id);
            if (error) {
              Alert.alert('Hata', 'Çıkış işlemi başarısız');
            }
          },
        },
      ]);
      return;
    }

    Alert.alert('Park Et', `${spot.location_code} numaralı yere park etmek istiyor musunuz?`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Park Et',
        onPress: async () => {
          const { error } = await occupySpot(spot.id, userId);
          if (error) {
            Alert.alert('Hata', 'Park işlemi başarısız');
          }
        },
      },
    ]);
  };

  const renderSpot = ({ item }: { item: ParkingSpot }) => {
    const isMyCar = item.occupied_by === userId;
    const isOccupied = item.is_occupied;

    // Kendi aracım ise Gradient Buton döndür
    if (isMyCar) {
      return (
        <TouchableOpacity
          style={[styles.parkingSlot, styles.myCarSlot]}
          onPress={() => handleSpotPress(item)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primary, '#4FD1C5']}
            style={styles.gradientSlot}
          >
            <View style={styles.iconCircleWhite}>
              <MaterialCommunityIcons name="car" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.slotLabelWhite}>{item.location_code}</Text>
            <View style={styles.statusBadgeWhite}>
              <Text style={styles.statusTextPrimary}>Sizin Aracınız</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    // Başkası park etmişse
    if (isOccupied) {
      return (
        <TouchableOpacity
          style={[styles.parkingSlot, styles.occupiedSlot]}
          onPress={() => handleSpotPress(item)}
          activeOpacity={0.9}
        >
          <MaterialCommunityIcons name="car-off" size={32} color={COLORS.occupiedText} />
          <Text style={styles.slotLabelOccupied}>{item.location_code}</Text>
          <Text style={styles.statusTextOccupied}>Dolu</Text>
        </TouchableOpacity>
      );
    }

    // Boş ise
    return (
      <TouchableOpacity
        style={[styles.parkingSlot, styles.availableSlot]}
        onPress={() => handleSpotPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.iconCircleAvailable}>
          <MaterialCommunityIcons name="parking" size={24} color={COLORS.primary} />
        </View>
        <Text style={styles.slotLabelAvailable}>{item.location_code}</Text>
        <Text style={styles.statusTextAvailable}>Müsait</Text>
      </TouchableOpacity>
    );
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
      
      {/* Arkaplan Dekoru */}
      <View style={styles.bgDecoration} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Otopark</Text>
            <Text style={styles.pageTitle}>Araç Durumu</Text>
          </View>
          <View style={styles.headerIconContainer}>
            <MaterialCommunityIcons name="car-multiple" size={28} color={COLORS.primary} />
          </View>
        </View>

        {/* İstatistikler */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <LinearGradient
              colors={[COLORS.primary, '#4FD1C5']}
              style={styles.statCircle}
            >
              <Text style={styles.statNumber}>
                {spots.filter(spot => !spot.is_occupied).length}
              </Text>
            </LinearGradient>
            <Text style={styles.statLabel}>Boş</Text>
          </View>
          
          <View style={styles.statItem}>
            <LinearGradient
              colors={[COLORS.occupiedText, '#CBD5E1']}
              style={styles.statCircle}
            >
              <Text style={styles.statNumber}>
                {spots.filter(spot => spot.is_occupied).length}
              </Text>
            </LinearGradient>
            <Text style={styles.statLabel}>Dolu</Text>
          </View>
          
          <View style={styles.statItem}>
            <LinearGradient
              colors={[COLORS.secondary, '#86EFAC']}
              style={styles.statCircle}
            >
              <Text style={styles.statNumber}>
                {spots.filter(spot => spot.occupied_by === userId).length}
              </Text>
            </LinearGradient>
            <Text style={styles.statLabel}>Sizin</Text>
          </View>
        </View>

        {/* Grid Listesi */}
        <FlatList
          data={spots}
          renderItem={renderSpot}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2} // Daha ferah olması için 3 yerine 2 kolon
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.columnWrapper}
        />

        {/* Alt Bilgi Barı */}
        <View style={styles.legendBar}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
            <Text style={styles.legendText}>Boş</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.occupiedText }]} />
            <Text style={styles.legendText}>Dolu</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.secondary }]} />
            <Text style={styles.legendText}>Aracınız</Text>
          </View>
        </View>

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
  pageTitle: {
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
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.lightText,
  },
  // Grid Yapısı
  grid: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  parkingSlot: {
    width: (width - 48 - 16) / 2, // Ekran genişliğine göre hesaplama (padding ve gap çıkarıldı)
    aspectRatio: 1.1, // Biraz daha yatay dikdörtgen
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Slot Tipleri
  availableSlot: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'transparent', // Gölge yeterli
  },
  occupiedSlot: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  myCarSlot: {
    backgroundColor: 'transparent', // Gradient alacak
    padding: 0, // Gradient tüm alanı kaplasın
    overflow: 'hidden',
  },
  gradientSlot: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Slot İçerikleri
  iconCircleAvailable: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircleWhite: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  slotLabelAvailable: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 4,
  },
  slotLabelOccupied: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.occupiedText,
    marginTop: 8,
    marginBottom: 4,
  },
  slotLabelWhite: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  statusTextAvailable: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  statusTextOccupied: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.occupiedText,
  },
  statusBadgeWhite: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusTextPrimary: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Legend Bar
  legendBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkText,
  },
});