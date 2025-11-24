import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/hooks/useAuth';
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
  success: '#6BCB77',
  warning: '#F59E0B',
  info: '#3B82F6',
};

interface ServiceRequest {
  id: number;
  category: 'maintenance' | 'cleaning' | 'security';
  description: string;
  status: 'pending' | 'in_progress' | 'resolved';
  created_at: string;
}

const CATEGORIES = [
  { value: 'maintenance', label: 'Bakım/Onarım', icon: 'tools' },
  { value: 'cleaning', label: 'Temizlik', icon: 'broom' },
  { value: 'security', label: 'Güvenlik', icon: 'shield-check' },
];

export const SupportScreen = () => {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const [category, setCategory] = useState<string>('maintenance');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    if (userId) {
      loadRequests();
    }
  }, [userId]);

  const loadRequests = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert('Hata', 'Kullanıcı oturumu bulunamadı');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Hata', 'Lütfen açıklama giriniz');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('service_requests')
        .insert({
          user_id: userId,
          category: category,
          description: description.trim(),
        } as any);

      if (error) throw error;

      Alert.alert('Başarılı', 'Talebiniz başarıyla oluşturuldu');
      setDescription('');
      loadRequests();
    } catch (error) {
      console.error('Error creating request:', error);
      Alert.alert('Hata', 'Talep oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Beklemede', color: COLORS.warning, bg: '#FEF3C7' };
      case 'in_progress':
        return { label: 'İşlemde', color: COLORS.info, bg: '#E0F2FE' };
      case 'resolved':
        return { label: 'Çözüldü', color: COLORS.success, bg: '#DCFCE7' };
      default:
        return { label: status, color: COLORS.lightText, bg: '#F3F4F6' };
    }
  };

  const getCategoryLabel = (cat: string) => {
    const found = CATEGORIES.find((c) => c.value === cat);
    return found ? found.label : cat;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
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
            <Text style={styles.greeting}>Yardım Merkezi</Text>
            <Text style={styles.headerTitle}>Destek Talebi</Text>
          </View>
          <View style={styles.headerIconContainer}>
            <MaterialCommunityIcons
              name="face-agent"
              size={28}
              color={COLORS.primary}
            />
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Create New Request Form */}
          <View style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBg}>
                <MaterialCommunityIcons name="pencil-plus-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.sectionTitle}>Yeni Talep Oluştur</Text>
            </View>

            {/* Category Selector */}
            <Text style={styles.label}>Kategori Seçiniz</Text>
            <View style={styles.categoryContainer}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryButton,
                    category === cat.value && styles.categoryButtonActive,
                  ]}
                  onPress={() => setCategory(cat.value)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={cat.icon as any}
                    size={24}
                    color={category === cat.value ? COLORS.primary : COLORS.lightText}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      category === cat.value && styles.categoryTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Description Input */}
            <Text style={styles.label}>Açıklama</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Sorununuzu detaylı olarak açıklayın..."
              placeholderTextColor={COLORS.lightText}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              editable={!loading}
            />

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButtonContainer}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[COLORS.primary, '#2DD4BF']}
                start={{x:0, y:0}} end={{x:1, y:0}}
                style={styles.submitButton}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.submitText}>Talebi Gönder</Text>
                    <MaterialCommunityIcons
                      name="send"
                      size={20}
                      color="#FFFFFF"
                    />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* My Requests List */}
          <View style={styles.requestsSection}>
            <Text style={styles.listTitle}>Taleplerim</Text>

            {loadingRequests ? (
              <ActivityIndicator
                size="large"
                color={COLORS.primary}
                style={styles.loader}
              />
            ) : requests.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <MaterialCommunityIcons
                    name="clipboard-text-outline"
                    size={48}
                    color={COLORS.lightText}
                  />
                </View>
                <Text style={styles.emptyText}>Henüz talep yok</Text>
                <Text style={styles.emptySubtext}>
                  Oluşturduğunuz talepler burada listelenecektir.
                </Text>
              </View>
            ) : (
              requests.map((request) => {
                const statusConfig = getStatusConfig(request.status);
                
                return (
                  <View key={request.id} style={styles.requestCard}>
                    <View style={styles.requestHeader}>
                      <View style={styles.requestCategory}>
                        <View style={styles.categoryIconBg}>
                          <MaterialCommunityIcons
                            name={
                              CATEGORIES.find((c) => c.value === request.category)
                                ?.icon as any
                            }
                            size={20}
                            color={COLORS.primary}
                          />
                        </View>
                        <Text style={styles.requestCategoryText}>
                          {getCategoryLabel(request.category)}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: statusConfig.bg },
                        ]}
                      >
                        <Text style={[styles.statusText, { color: statusConfig.color }]}>
                          {statusConfig.label}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.requestDescription}>
                      {request.description}
                    </Text>

                    <View style={styles.requestFooter}>
                      <View style={styles.dateContainer}>
                        <MaterialCommunityIcons
                          name="clock-time-four-outline"
                          size={14}
                          color={COLORS.lightText}
                        />
                        <Text style={styles.requestDate}>
                          {formatDate(request.created_at)}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
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
    paddingBottom: 100,
  },
  // Form Card
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  sectionIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkText,
    marginBottom: 12,
    marginLeft: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  categoryButton: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    backgroundColor: '#F0FDFA', // Light teal bg
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 11,
    color: COLORS.lightText,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  textArea: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: COLORS.darkText,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  submitButtonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButton: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  // Requests List
  requestsSection: {
    marginTop: 8,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 16,
  },
  loader: {
    marginVertical: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.white,
    borderRadius: 20,
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
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.lightText,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 18,
  },
  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestCategoryText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.darkText,
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
  requestDescription: {
    fontSize: 14,
    color: COLORS.lightText,
    lineHeight: 20,
    marginBottom: 12,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBg,
    paddingTop: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  requestDate: {
    fontSize: 12,
    color: COLORS.lightText,
    fontWeight: '500',
  },
});