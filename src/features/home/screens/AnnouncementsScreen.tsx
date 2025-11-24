import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../config/supabase';

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
  dangerDark: '#DC2626',
  warning: '#FFD93D',
};

interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
  priority: 'low' | 'high';
  created_at: string;
}

export const AnnouncementsScreen = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setAnnouncements(data);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
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
            <Text style={styles.greeting}>Site Bilgilendirme</Text>
            <Text style={styles.headerTitle}>Duyurular</Text>
          </View>
          <View style={styles.headerIconContainer}>
            <MaterialCommunityIcons name="bullhorn-outline" size={28} color={COLORS.primary} />
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {announcements.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <MaterialCommunityIcons
                  name="information-variant"
                  size={48}
                  color={COLORS.lightText}
                />
              </View>
              <Text style={styles.emptyText}>Henüz duyuru yok</Text>
              <Text style={styles.emptySubtext}>
                Yönetim tarafından yapılan duyurular burada listelenecektir.
              </Text>
            </View>
          ) : (
            announcements.map((announcement) => (
              <View
                key={announcement.id}
                style={[
                  styles.announcementCard,
                  announcement.priority === 'high' && styles.highPriorityCard,
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.headerLeft}>
                    {announcement.priority === 'high' ? (
                      <LinearGradient
                        colors={[COLORS.danger, COLORS.dangerDark]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.priorityBadge}
                      >
                        <MaterialCommunityIcons name="alert-circle" size={14} color="#FFFFFF" />
                        <Text style={styles.priorityText}>ÖNEMLİ</Text>
                      </LinearGradient>
                    ) : (
                      <View style={styles.normalBadge}>
                        <MaterialCommunityIcons name="information" size={14} color={COLORS.primary} />
                        <Text style={styles.normalPriorityText}>Genel</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.dateContainer}>
                    <MaterialCommunityIcons name="calendar-month-outline" size={14} color={COLORS.lightText} />
                    <Text style={styles.dateText}>
                      {formatDate(announcement.date)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.announcementTitle}>
                  {announcement.title}
                </Text>
                
                <Text style={styles.announcementContent}>
                  {announcement.content}
                </Text>

                {/* Dekoratif Alt Çizgi - Sadece yüksek önceliklilerde kırmızı, diğerlerinde turkuaz */}
                <View style={[
                  styles.bottomLine, 
                  { backgroundColor: announcement.priority === 'high' ? COLORS.danger : COLORS.inputBg }
                ]} />
              </View>
            ))
          )}
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    marginTop: 20,
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
  announcementCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  highPriorityCard: {
    borderColor: 'rgba(255, 107, 107, 0.2)',
    backgroundColor: '#FFFBFB', // Çok hafif kırmızımsı beyaz
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  normalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  normalPriorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.lightText,
    fontWeight: '500',
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 8,
    lineHeight: 24,
  },
  announcementContent: {
    fontSize: 14,
    color: '#4B5563', // Biraz daha koyu gri okunabilirlik için
    lineHeight: 22,
    marginBottom: 12,
  },
  bottomLine: {
    height: 4,
    width: 40,
    borderRadius: 2,
    marginTop: 4,
  },
});