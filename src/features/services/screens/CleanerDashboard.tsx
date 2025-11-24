import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Switch,
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
import * as Location from 'expo-location';

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
  warning: '#FFD93D',
  success: '#6BCB77',
};

interface ServiceLog {
  id: number;
  resident_id: string;
  type: 'garbage' | 'repair';
  status: 'pending' | 'completed';
  coordinates: { latitude: number; longitude: number } | null;
  created_at: string;
  profiles?: {
    full_name: string;
    block_no?: string;
    apartment_no?: string;
  };
}

export const CleanerDashboard = () => {
  const [onDuty, setOnDuty] = useState(false);
  const [tasks, setTasks] = useState<ServiceLog[]>([]);
  const [supportRequests, setSupportRequests] = useState<any[]>([]);
  const [locationInterval, setLocationInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchTasks();
    fetchSupportRequests();
  }, []);

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('service_logs')
      .select('*, profiles(full_name, block_no, apartment_no)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (data) setTasks(data);
  };

  const fetchSupportRequests = async () => {
    const { data } = await supabase
      .from('service_requests')
      .select('*')
      .eq('category', 'cleaning')
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

  const toggleDuty = async (value: boolean) => {
    if (value) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Konum izni verilmedi');
        return;
      }

      const interval = setInterval(async () => {
        const location = await Location.getCurrentPositionAsync({});
        const { data: user } = await supabase.auth.getUser();
        
        if (user.user) {
          await supabase.from('staff_locations').upsert({
            user_id: user.user.id,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      }, 10000);

      setLocationInterval(interval);
      setOnDuty(true);
    } else {
      if (locationInterval) {
        clearInterval(locationInterval);
        setLocationInterval(null);
      }
      setOnDuty(false);
    }
  };

  const markAsCompleted = async (taskId: number) => {
    const { data: user } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('service_logs')
      .update({ 
        status: 'completed', 
        staff_id: user.user?.id 
      })
      .eq('id', taskId);

    if (error) {
      Alert.alert('Hata', 'Görev güncellenemedi');
    } else {
      Alert.alert('Başarılı', 'Görev tamamlandı olarak işaretlendi');
      fetchTasks();
    }
  };

  const renderTask = ({ item }: { item: ServiceLog }) => (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <View style={styles.taskIconContainer}>
          <MaterialCommunityIcons
            name={item.type === 'garbage' ? 'delete-outline' : 'wrench-outline'}
            size={24}
            color={COLORS.primary}
          />
        </View>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>
            {item.type === 'garbage' ? 'Çöp Toplama' : 'Tamir / Bakım'}
          </Text>
          <Text style={styles.taskResident}>
            {item.profiles?.full_name}
          </Text>
          {item.profiles?.block_no && item.profiles?.apartment_no && (
            <View style={styles.locationRow}>
               <MaterialCommunityIcons name="home-outline" size={12} color={COLORS.lightText} />
               <Text style={styles.taskAddress}>
                 Blok {item.profiles.block_no} - Daire {item.profiles.apartment_no}
               </Text>
            </View>
          )}
        </View>
        <View style={[
          styles.statusBadge,
          item.status === 'completed' ? styles.statusCompleted : styles.statusPending
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.status === 'completed' ? COLORS.success : COLORS.warning }
          ]}>
            {item.status === 'completed' ? 'Bitti' : 'Bekliyor'}
          </Text>
        </View>
      </View>

      <View style={styles.taskFooter}>
        <View style={styles.timeContainer}>
           <MaterialCommunityIcons name="clock-outline" size={14} color={COLORS.lightText} />
           <Text style={styles.taskTime}>
             {new Date(item.created_at).toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
           </Text>
        </View>
        
        <TouchableOpacity
          style={styles.completeButtonContainer}
          onPress={() => markAsCompleted(item.id)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primary, '#2DD4BF']}
            style={styles.completeButton}
            start={{x:0, y:0}} end={{x:1, y:0}}
          >
            <Text style={styles.completeButtonText}>Tamamla</Text>
            <MaterialCommunityIcons name="check" size={16} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

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
              <Text style={styles.greeting}>İyi Çalışmalar</Text>
              <Text style={styles.headerTitle}>Temizlik Paneli</Text>
            </View>
            <View style={styles.headerIconContainer}>
              <MaterialCommunityIcons name="broom" size={28} color={COLORS.primary} />
            </View>
          </View>

          {/* Duty Status Card */}
          <View style={styles.statusCardContainer}>
            <LinearGradient
              colors={onDuty ? [COLORS.primary, '#0EA5E9'] : ['#94A3B8', '#64748B']}
              start={{x:0, y:0}} end={{x:1, y:1}}
              style={styles.statusCard}
            >
              <View style={styles.statusContent}>
                <View>
                  <Text style={styles.statusLabel}>Görev Durumu</Text>
                  <Text style={styles.statusValue}>
                    {onDuty ? 'Mesai Başladı' : 'Mesai Dışı'}
                  </Text>
                  <Text style={styles.statusSubtext}>
                    {onDuty ? 'Konum servisleri aktif' : 'Başlamak için aktifleştirin'}
                  </Text>
                </View>
                <View style={styles.switchWrapper}>
                  <Switch
                    value={onDuty}
                    onValueChange={toggleDuty}
                    trackColor={{ false: '#CBD5E1', true: 'rgba(255,255,255,0.4)' }}
                    thumbColor={COLORS.white}
                    ios_backgroundColor="#CBD5E1"
                  />
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Stats Overview */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              {/* Turkuaz/Mavi Gradient */}
              <LinearGradient
                colors={['#06B6D4', '#0891B2']} 
                style={styles.statCircle}
              >
                <Text style={styles.statNumber}>{tasks.length}</Text>
              </LinearGradient>
              <Text style={styles.statLabel}>Tüm İşler</Text>
            </View>

            <View style={styles.statItem}>
              {/* Turkuaz/Mavi Gradient */}
              <LinearGradient
                colors={['#06B6D4', '#0891B2']}
                style={styles.statCircle}
              >
                <Text style={styles.statNumber}>
                  {tasks.filter(t => t.type === 'garbage').length}
                </Text>
              </LinearGradient>
              <Text style={styles.statLabel}>Çöp</Text>
            </View>

            <View style={styles.statItem}>
              {/* Turkuaz/Mavi Gradient */}
              <LinearGradient
                colors={['#06B6D4', '#0891B2']}
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
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
                <View style={[styles.actionIconBg, { backgroundColor: '#E0F2FE' }]}>
                  <MaterialCommunityIcons name="clipboard-list-outline" size={24} color="#0EA5E9" />
                </View>
                <Text style={styles.actionTitle}>Görev Listesi</Text>
                <Text style={styles.actionSubtitle}>Tümünü Gör</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
                <View style={[styles.actionIconBg, { backgroundColor: '#F0FDF4' }]}>
                  <MaterialCommunityIcons name="history" size={24} color="#22C55E" />
                </View>
                <Text style={styles.actionTitle}>Geçmiş</Text>
                <Text style={styles.actionSubtitle}>Tamamlananlar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tasks List */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Güncel Görevler</Text>
              {tasks.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tasks.length}</Text>
                </View>
              )}
            </View>
            
            {tasks.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={48}
                  color={COLORS.lightText}
                />
                <Text style={styles.emptyTitle}>Harika!</Text>
                <Text style={styles.emptySubtitle}>
                  Şu an bekleyen görev bulunmuyor.
                </Text>
              </View>
            ) : (
              <FlatList
                data={tasks}
                renderItem={renderTask}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                contentContainerStyle={styles.taskList}
              />
            )}
          </View>

          {/* Cleaning Requests Section */}
          {supportRequests.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Temizlik Talepleri</Text>
                <View style={[styles.badge, { backgroundColor: COLORS.warning }]}>
                  <Text style={styles.badgeText}>{supportRequests.length}</Text>
                </View>
              </View>
              
              {supportRequests.map((item) => (
                <View key={item.id} style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <View style={styles.requestTitleContainer}>
                      <View style={styles.requestIconBg}>
                         <MaterialCommunityIcons name="spray-bottle" size={20} color={COLORS.warning} />
                      </View>
                      <Text style={styles.requestTitle}>Özel Talep</Text>
                    </View>
                    <Text style={styles.requestTime}>
                      {new Date(item.created_at).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})}
                    </Text>
                  </View>
                  
                  <Text style={styles.requestDescription}>{item.description}</Text>
                  
                  <View style={styles.requestActions}>
                    <TouchableOpacity
                      style={styles.actionBtnSmall}
                      onPress={() => updateRequestStatus(item.id, 'in_progress')}
                    >
                      <Text style={styles.actionBtnTextSmall}>Başla</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtnSmall, styles.actionBtnPrimary]}
                      onPress={() => updateRequestStatus(item.id, 'resolved')}
                    >
                      <Text style={[styles.actionBtnTextSmall, { color: COLORS.white }]}>Bitir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
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
  // Duty Status Card
  statusCardContainer: {
    marginBottom: 24,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  statusCard: {
    borderRadius: 24,
    padding: 20,
  },
  statusContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 22,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  switchWrapper: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 4,
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
  // Hızlı İşlemler
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
  // Görev Listesi
  taskList: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  taskIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 4,
  },
  taskResident: {
    fontSize: 14,
    color: COLORS.darkText,
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskAddress: {
    fontSize: 12,
    color: COLORS.lightText,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusCompleted: {
    backgroundColor: '#DCFCE7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBg,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskTime: {
    fontSize: 12,
    color: COLORS.lightText,
    fontWeight: '500',
  },
  completeButtonContainer: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  completeButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
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
    marginBottom: 12,
  },
  requestTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  requestIconBg: {
    width: 32,
    height: 32,
    borderRadius: 12,
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
    marginBottom: 16,
    lineHeight: 20,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
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
});