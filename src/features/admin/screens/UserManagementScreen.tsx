import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
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
};

interface User {
  id: string;
  full_name: string;
  role: 'resident' | 'admin' | 'cleaner' | 'security';
  phone?: string;
  address?: string;
  block_no?: string;
  apartment_no?: string;
}

export const UserManagementScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [addUserModalVisible, setAddUserModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    block_no: '',
    apartment_no: '',
    role: 'resident' as 'resident' | 'admin' | 'cleaner' | 'security',
  });
  const [newUserData, setNewUserData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'resident' as 'resident' | 'admin' | 'cleaner' | 'security',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name');

    if (data) setUsers(data);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      full_name: user.full_name,
      phone: user.phone || '',
      address: user.address || '',
      block_no: user.block_no || '',
      apartment_no: user.apartment_no || '',
      role: user.role,
    });
    setModalVisible(true);
  };

  const saveUser = async () => {
    if (!selectedUser) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
        address: formData.address,
        block_no: formData.block_no,
        apartment_no: formData.apartment_no,
        role: formData.role,
      })
      .eq('id', selectedUser.id);

    if (error) {
      Alert.alert('Hata', 'Kullanıcı güncellenemedi');
    } else {
      Alert.alert('Başarılı', 'Kullanıcı güncellendi');
      setModalVisible(false);
      fetchUsers();
    }
  };

  const addNewUser = async () => {
    if (!newUserData.email || !newUserData.password || !newUserData.full_name) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    try {
      const { data, error } = await (supabase.rpc as any)('create_user_with_role', {
        user_email: newUserData.email,
        user_password: newUserData.password,
        user_name: newUserData.full_name,
        user_role: newUserData.role,
      });

      if (error) {
        Alert.alert('Hata', error.message);
      } else {
        Alert.alert('Başarılı', 'Yeni kullanıcı oluşturuldu');
        setAddUserModalVisible(false);
        setNewUserData({
          email: '',
          password: '',
          full_name: '',
          role: 'resident',
        });
        fetchUsers();
      }
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Kullanıcı oluşturulamadı');
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

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin': return 'Yönetici';
      case 'cleaner': return 'Temizlik';
      case 'security': return 'Güvenlik';
      default: return 'Sakin';
    }
  };

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => openEditModal(item)}
      activeOpacity={0.7}
    >
      <View style={styles.userCardInner}>
        <View style={styles.userHeader}>
          <View
            style={[
              styles.userIcon,
              { backgroundColor: COLORS.inputBg },
            ]}
          >
            <MaterialCommunityIcons
              name={getRoleIcon(item.role)}
              size={26}
              color={COLORS.primary}
            />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.full_name}</Text>
            <Text style={[styles.userRole, { color: COLORS.primaryDark }]}>
              {getRoleName(item.role)}
            </Text>
          </View>
          <View style={styles.chevronContainer}>
             <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.lightText} />
          </View>
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
      </View>
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
              <Text style={styles.greeting}>Yönetim</Text>
              <Text style={styles.pageTitle}>Kullanıcılar</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setAddUserModalVisible(true)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.addButtonGradient}
                start={{x:0, y:0}} end={{x:1, y:1}}
              >
                <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Stats Overview - Dashboard Stili */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.statCircle}
              >
                <Text style={styles.statNumber}>{users.length}</Text>
              </LinearGradient>
              <Text style={styles.statLabel}>Toplam</Text>
            </View>

            <View style={styles.statItem}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.statCircle}
              >
                <Text style={styles.statNumber}>
                  {users.filter(u => u.role === 'resident').length}
                </Text>
              </LinearGradient>
              <Text style={styles.statLabel}>Sakin</Text>
            </View>

            <View style={styles.statItem}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.statCircle}
              >
                <Text style={styles.statNumber}>
                  {users.filter(u => u.role !== 'resident').length}
                </Text>
              </LinearGradient>
              <Text style={styles.statLabel}>Personel</Text>
            </View>
          </View>

          {/* Users List */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Kişi Listesi</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{users.length} Kişi</Text>
              </View>
            </View>
            
            {users.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="account-group-outline"
                  size={50}
                  color={COLORS.lightText}
                />
                <Text style={styles.emptyTitle}>Kullanıcı bulunamadı</Text>
                <Text style={styles.emptySubtitle}>
                  Sağ üstteki + butonundan yeni kullanıcı ekleyebilirsiniz.
                </Text>
              </View>
            ) : (
              <FlatList
                data={users}
                renderItem={renderUser}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.userList}
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* --- MODALLAR --- */}

      {/* Edit User Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kullanıcı Düzenle</Text>
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
                  <Text style={[styles.userSummaryRole, { color: COLORS.primaryDark }]}>
                    {getRoleName(selectedUser.role)}
                  </Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Ad Soyad</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={formData.full_name}
                    onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                    placeholder="Ad Soyad"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Telefon</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    placeholder="05XX XXX XX XX"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.rowInputs}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>Blok</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={formData.block_no}
                      onChangeText={(text) => setFormData({ ...formData, block_no: text })}
                      placeholder="A1"
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Daire</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={formData.apartment_no}
                      onChangeText={(text) => setFormData({ ...formData, apartment_no: text })}
                      placeholder="12"
                    />
                  </View>
                </View>

                <Text style={styles.label}>Kullanıcı Rolü</Text>
                <View style={styles.roleButtons}>
                  {(['resident', 'admin', 'cleaner', 'security'] as const).map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleButton,
                        formData.role === role && styles.roleButtonActive,
                        { borderColor: formData.role === role ? COLORS.primary : COLORS.inputBg }
                      ]}
                      onPress={() => setFormData({ ...formData, role })}
                    >
                      <Text
                        style={[
                          styles.roleButtonText,
                          formData.role === role && styles.roleButtonTextActive,
                        ]}
                      >
                        {getRoleName(role)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={saveUser}>
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryDark]}
                    style={styles.saveButtonGradient}
                  >
                    <Text style={styles.saveButtonText}>Değişiklikleri Kaydet</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Add User Modal */}
      <Modal
        visible={addUserModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setAddUserModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Kullanıcı</Text>
              <TouchableOpacity onPress={() => setAddUserModalVisible(false)} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={22} color={COLORS.darkText} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email Adresi</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newUserData.email}
                  onChangeText={(text) => setNewUserData({ ...newUserData, email: text })}
                  placeholder="ornek@site.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Şifre</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newUserData.password}
                  onChangeText={(text) => setNewUserData({ ...newUserData, password: text })}
                  placeholder="Minimum 6 karakter"
                  secureTextEntry
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Ad Soyad</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newUserData.full_name}
                  onChangeText={(text) => setNewUserData({ ...newUserData, full_name: text })}
                  placeholder="Ad Soyad"
                />
              </View>

              <Text style={styles.label}>Kullanıcı Rolü</Text>
              <View style={styles.roleButtons}>
                {(['resident', 'admin', 'cleaner', 'security'] as const).map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleButton,
                      newUserData.role === role && styles.roleButtonActive,
                      { borderColor: newUserData.role === role ? COLORS.primary : COLORS.inputBg }
                    ]}
                    onPress={() => setNewUserData({ ...newUserData, role })}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        newUserData.role === role && styles.roleButtonTextActive,
                      ]}
                    >
                      {getRoleName(role)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={addNewUser}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>Kullanıcıyı Oluştur</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
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
    marginBottom: 24,
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
  addButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  addButtonGradient: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
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
  // Liste Başlığı
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
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  // Kullanıcı Kartları
  userList: {
    gap: 12,
  },
  userCard: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    backgroundColor: COLORS.white,
  },
  userCardInner: {
    padding: 16,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  userRole: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  chevronContainer: {
    width: 24,
    alignItems: 'center',
  },
  userDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
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
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.inputBg,
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
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
  // Modallar
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
    maxHeight: '85%',
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
  // Modal Form Elemanları
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
  userSummaryRole: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
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
  roleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
    marginTop: 8,
  },
  roleButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.inputBg,
  },
  roleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleButtonText: {
    fontSize: 13,
    color: COLORS.lightText,
    fontWeight: '600',
  },
  roleButtonTextActive: {
    color: COLORS.white,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});