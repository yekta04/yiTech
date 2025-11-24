import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/hooks/useAuth';

const { width } = Dimensions.get('window');

// Ortak Tasarım Sistemi Renkleri
const COLORS = {
  primary: '#06B6D4', // İstenilen Turkuaz Mavisi Kodu
  secondary: '#00A896',
  darkText: '#1F2937',
  lightText: '#9CA3AF',
  background: '#F8FAFC',
  inputBg: '#F1F5F9',
  white: '#FFFFFF',
  shadow: '#06B6D4',
  danger: '#FF6B6B',
  success: '#6BCB77',
  warning: '#F59E0B',
  purple: '#8B5CF6',
  pink: '#EC4899',
  blue: '#3B82F6',
};

export const DashboardScreen = () => {
  const { session, signOut } = useAuth();
  const navigation = useNavigation();

  const getUserName = () => {
    if (!session?.user?.email) return 'Kullanıcı';
    const emailName = session.user.email.split('@')[0];
    return emailName.charAt(0).toUpperCase() + emailName.slice(1);
  };

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const handleNavigation = (screenName: string) => {
    try {
      navigation.navigate(screenName as never);
    } catch (error) {
      Alert.alert('Hata', `${screenName} ekranına gidilemedi.`);
      console.error('Navigation error:', error);
    }
  };

  // Tüm ikonlar artık COLORS.primary (#06B6D4) rengini kullanıyor
  const quickActions = [
    {
      id: 'announcements',
      title: 'Duyurular',
      icon: 'bullhorn',
      color: COLORS.primary,
      screen: 'Announcements',
    },
    {
      id: 'support',
      title: 'Destek',
      icon: 'face-agent',
      color: COLORS.primary,
      screen: 'Support',
    },
    {
      id: 'finance',
      title: 'Mali Durum',
      icon: 'cash-multiple',
      color: COLORS.primary,
      screen: 'Finance',
    },
    {
      id: 'guests',
      title: 'Misafirler',
      icon: 'account-multiple',
      color: COLORS.primary,
      screen: 'GuestList',
    },
    {
      id: 'marketplace',
      title: 'Pazar Yeri',
      icon: 'store',
      color: COLORS.primary,
      screen: 'Marketplace',
    },
    {
      id: 'events',
      title: 'Etkinlikler',
      icon: 'calendar-star',
      color: COLORS.primary,
      screen: 'Events',
    },
  ];

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
              <Text style={styles.greeting}>Hoş Geldin,</Text>
              <Text style={styles.userName}>{getUserName()}</Text>
            </View>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="logout" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Status Card */}
          <TouchableOpacity style={styles.statusCardContainer} activeOpacity={0.9}>
            <LinearGradient
              colors={[COLORS.primary, '#0EA5E9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statusCard}
            >
              <View style={styles.statusContent}>
                <View>
                  <View style={styles.statusLabelContainer}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusLabel}>Site Durumu</Text>
                  </View>
                  <Text style={styles.statusValue}>Güvenli</Text>
                  <Text style={styles.statusSubtext}>
                    Tüm sistemler aktif ve çalışıyor
                  </Text>
                </View>
                <View style={styles.statusIconCircle}>
                  <MaterialCommunityIcons
                    name="shield-check"
                    size={32}
                    color={COLORS.primary}
                  />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Quick Actions Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.actionButton}
                  onPress={() => handleNavigation(action.screen)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.actionIconContainer,
                      { backgroundColor: action.color + '15' }, // %15 Opaklık
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={action.icon as any}
                      size={28}
                      color={action.color}
                    />
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Navigation Tabs - "Diğer Özellikler" kutucukları güncellendi */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Diğer Özellikler</Text>
            <View style={styles.tabsGrid}>
              <TouchableOpacity
                style={styles.tabButton}
                onPress={() => handleNavigation('Map')}
                activeOpacity={0.7}
              >
                <View style={[styles.tabIconBg, { backgroundColor: COLORS.primary + '15' }]}>
                   <MaterialCommunityIcons
                    name="map-marker-radius"
                    size={24}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.tabText}>Harita</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tabButton}
                onPress={() => handleNavigation('Parking')}
                activeOpacity={0.7}
              >
                <View style={[styles.tabIconBg, { backgroundColor: COLORS.primary + '15' }]}>
                  <MaterialCommunityIcons name="car" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.tabText}>Otopark</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tabButton}
                onPress={() => handleNavigation('Booking')}
                activeOpacity={0.7}
              >
                <View style={[styles.tabIconBg, { backgroundColor: COLORS.primary + '15' }]}>
                  <MaterialCommunityIcons
                    name="calendar-clock"
                    size={24}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.tabText}>Rezervasyon</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: 'rgba(6, 182, 212, 0.05)', // #06B6D4 bazlı opaklık
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
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
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.darkText,
    letterSpacing: 0.5,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  // Status Card
  statusCardContainer: {
    marginBottom: 30,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  statusCard: {
    borderRadius: 24,
    padding: 24,
  },
  statusContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  statusLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statusValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statusSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  statusIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 16,
  },
  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    width: (width - 48 - 24) / 3, // 3 kolon, padding ve gap hesabı
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 4,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.darkText,
    textAlign: 'center',
  },
  // Tabs
  tabsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  tabButton: {
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
  tabIconBg: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkText,
    textAlign: 'center',
  },
});