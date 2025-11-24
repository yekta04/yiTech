import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { supabase } from '../../../config/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
  danger: '#EF4444', // Silme butonları için gerekebilir
};

interface Profile {
  id: string;
  full_name: string;
  role: 'resident' | 'admin' | 'cleaner' | 'security';
  phone?: string;
  block_no?: string;
  apartment_no?: string;
}

interface Stats {
  totalUsers: number;
  totalIssues: number;
  totalGuests: number;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalIssues: 0,
    totalGuests: 0,
  });
  const [users, setUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [supportRequests, setSupportRequests] = useState<any[]>([]);
  const [editForm, setEditForm] = useState({
    phone: '',
    block_no: '',
    apartment_no: '',
  });

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = users.filter((user) =>
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const fetchStats = async () => {
    const [usersRes, issuesRes, guestsRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase
        .from('service_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase
        .from('guests')
        .select('id', { count: 'exact', head: true })
        .eq('visit_date', new Date().toISOString().split('T')[0]),
    ]);

    setStats({
      totalUsers: usersRes.count || 0,
      totalIssues: issuesRes.count || 0,
      totalGuests: guestsRes.count || 0,
    });
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name');

    if (data) {
      setUsers(data);
      setFilteredUsers(data);
    }
  };

  const fetchSupportRequests = async () => {
    const { data } = await supabase
      .from('service_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setSupportRequests(data);
  };

  const handleSupportPress = () => {
    fetchSupportRequests();
    setSupportModalVisible(true);
  };

  const updateRequestStatus = async (id: number, status: string) => {
    const { error } = await supabase
      .from('service_requests')
      .update({ status })
      .eq('id', id);

    if (!error) {
      fetchSupportRequests();
      fetchStats();
      Alert.alert('Başarılı', 'Talep durumu güncellendi');
    }
  };

  const openEditModal = (user: Profile) => {
    setSelectedUser(user);
    setEditForm({
      phone: user.phone || '',
      block_no: user.block_no || '',
      apartment_no: user.apartment_no || '',
    });
    setModalVisible(true);
  };

  const saveUser = async () => {
    if (!selectedUser) return;

    const { error } = await supabase
      .from('profiles')
      .update(editForm)
      .eq('id', selectedUser.id);

    if (error) {
      Alert.alert('Hata', 'Kullanıcı güncellenemedi');
    } else {
      Alert.alert('Başarılı', 'Kullanıcı bilgileri güncellendi');
      setModalVisible(false);
      fetchUsers();
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return 'shield-crown-outline';
      case 'cleaner': return 'broom';
      case 'security': return 'shield-check-outline';
      default: return 'account-circle-outline';
    }
  };

  const renderUser = ({ item }: { item: Profile }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => openEditModal(item)}
      activeOpacity={0.7}
    >
      <View style={styles.userHeader}>
        <View style={[styles.userIcon, { backgroundColor: COLORS.inputBg }]}>
          <MaterialCommunityIcons
            name={getRoleIcon(item.role)}
            size={24}
            color={COLORS.primary}
          />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.full_name}</Text>
          <Text style={[styles.userRole, { color: COLORS.primaryDark }]}>
            {item.role === 'admin' ? 'Yönetici' : 
             item.role === 'cleaner' ? 'Personel' : 
             item.role === 'security' ? 'Güvenlik' : 'Site Sakini'}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.lightText} />
      </View>
      
      {(item.block_no || item.apartment_no || item.phone) && (
        <View style={styles.userDetails}>
          {item.block_no && item.apartment_no && (
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="home-outline" size={14} color={COLORS.lightText} />
              <Text style={styles.detailText}>
                Blok {item.block_no} - No {item.apartment_no}
              </Text>
            </View>
          )}
          {item.phone && (
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="phone-outline" size={14} color={COLORS.lightText} />
              <Text style={styles.detailText}>{item.phone}</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
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
              <Text style={styles.greeting}>Yönetim Paneli</Text>
              <Text style={styles.headerTitle}>Site Genel Bakış</Text>
            </View>
            <View style={styles.headerIconContainer}>
              <MaterialCommunityIcons name="view-dashboard-outline" size={28} color={COLORS.primary} />
            </View>
          </View>

          {/* İstatistikler - HEPSİ AYNI RENK */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.statsScroll}
            contentContainerStyle={styles.statsContainer}
          >
            <View style={styles.statItem}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.statCircle}
              >
                <Text style={styles.statNumber}>{stats.totalUsers}</Text>
                <MaterialCommunityIcons name="account-group" size={20} color="white" style={{opacity:0.8}} />
              </LinearGradient>
              <Text style={styles.statLabel}>Toplam Sakin</Text>
            </View>

            <View style={styles.statItem}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.statCircle}
              >
                <Text style={styles.statNumber}>{stats.totalIssues}</Text>
                <MaterialCommunityIcons name="alert-circle" size={20} color="white" style={{opacity:0.8}} />
              </LinearGradient>
              <Text style={styles.statLabel}>Aktif Sorun</Text>
            </View>

            <View style={styles.statItem}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.statCircle}
              >
                <Text style={styles.statNumber}>{stats.totalGuests}</Text>
                <MaterialCommunityIcons name="walk" size={20} color="white" style={{opacity:0.8}} />
              </LinearGradient>
              <Text style={styles.statLabel}>Ziyaretçi</Text>
            </View>
          </ScrollView>

          {/* Hızlı İşlemler */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity 
                style={styles.actionCard} 
                onPress={handleSupportPress}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#E0F2FE' }]}>
                  <MaterialCommunityIcons name="face-agent" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.actionTitle}>Destek Talepleri</Text>
                <Text style={styles.actionSubtitle}>{stats.totalIssues} Bekleyen</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
                <View style={[styles.actionIcon, { backgroundColor: '#E0F2FE' }]}>
                  <MaterialCommunityIcons name="finance" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.actionTitle}>Mali Durum</Text>
                <Text style={styles.actionSubtitle}>Raporları İncele</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Kullanıcı Arama */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Kullanıcılar</Text>
            <View style={styles.searchContainer}>
              <MaterialCommunityIcons name="magnify" size={22} color={COLORS.primary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="İsim ile ara..."
                placeholderTextColor={COLORS.lightText}
              />
            </View>
          </View>

          {/* Kullanıcı Listesi */}
          {filteredUsers.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-search-outline" size={50} color={COLORS.lightText} />
              <Text style={styles.emptyText}>Kullanıcı bulunamadı</Text>
            </View>
          ) : (
            <FlatList
              data={filteredUsers}
              renderItem={renderUser}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.userList}
            />
          )}
        </ScrollView>
      </SafeAreaView>

      {/* --- MODALLAR --- */}

      {/* Destek Talepleri Modalı */}
      <Modal
        visible={supportModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setSupportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Destek Talepleri</Text>
              <TouchableOpacity onPress={() => setSupportModalVisible(false)} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={22} color={COLORS.darkText} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={supportRequests}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <View style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                    <View style={[styles.statusDot, { 
                      backgroundColor: item.status === 'pending' ? COLORS.warning : 
                                     item.status === 'in_progress' ? COLORS.primary : COLORS.success 
                    }]} />
                  </View>
                  
                  <Text style={styles.requestDesc}>{item.description}</Text>
                  <Text style={styles.requestDate}>
                    {new Date(item.created_at).toLocaleDateString('tr-TR')}
                  </Text>

                  {item.status !== 'resolved' && (
                    <View style={styles.requestActions}>
                      <TouchableOpacity
                        style={styles.actionBtnSmall}
                        onPress={() => updateRequestStatus(item.id, 'in_progress')}
                      >
                        <Text style={styles.actionBtnTextSmall}>İşleme Al</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtnSmall, { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}
                        onPress={() => updateRequestStatus(item.id, 'resolved')}
                      >
                        <Text style={[styles.actionBtnTextSmall, { color: 'white' }]}>Çözüldü</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Kullanıcı Düzenleme Modalı */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bilgileri Düzenle</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={22} color={COLORS.darkText} />
              </TouchableOpacity>
            </View>

            {selectedUser && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.userSummary}>
                  <View style={[styles.userAvatarLarge, { backgroundColor: COLORS.inputBg }]}>
                     <MaterialCommunityIcons name={getRoleIcon(selectedUser.role)} size={32} color={COLORS.primary} />
                  </View>
                  <Text style={styles.userSummaryName}>{selectedUser.full_name}</Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Telefon</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={editForm.phone}
                    onChangeText={(t) => setEditForm({ ...editForm, phone: t })}
                    placeholder="05XX XXX XX XX"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.rowInputs}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>Blok</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editForm.block_no}
                      onChangeText={(t) => setEditForm({ ...editForm, block_no: t })}
                      placeholder="A1"
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Daire</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editForm.apartment_no}
                      onChangeText={(t) => setEditForm({ ...editForm, apartment_no: t })}
                      placeholder="12"
                    />
                  </View>
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={saveUser}>
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryDark]}
                    start={{x:0, y:0}} end={{x:1, y:0}}
                    style={styles.saveButtonGradient}
                  >
                    <Text style={styles.saveButtonText}>Kaydet</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            )}
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
    marginBottom: 30,
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
  statsScroll: {
    marginBottom: 30,
    marginHorizontal: -24,
  },
  statsContainer: {
    paddingHorizontal: 24,
    gap: 15,
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    gap: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.lightText,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: COLORS.lightText,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 54,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.darkText,
    height: '100%',
  },
  userList: {
    gap: 12,
  },
  userCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 20,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  userRole: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  userDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBg,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.lightText,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    opacity: 0.6,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.lightText,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(31, 41, 55, 0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  closeButton: {
    padding: 4,
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
  },
  requestCard: {
    backgroundColor: COLORS.inputBg,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.darkText,
    textTransform: 'capitalize',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  requestDesc: {
    fontSize: 14,
    color: COLORS.darkText,
    marginBottom: 8,
    lineHeight: 20,
  },
  requestDate: {
    fontSize: 11,
    color: COLORS.lightText,
    marginBottom: 12,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnSmall: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  actionBtnTextSmall: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  userSummary: {
    alignItems: 'center',
    marginBottom: 24,
  },
  userAvatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userSummaryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkText,
    marginBottom: 8,
    marginLeft: 4,
  },
  modalInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: COLORS.darkText,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  saveButton: {
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});