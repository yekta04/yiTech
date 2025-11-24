import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
  success: '#06B6D4',
  warning: '#FFD93D',
};

interface Transaction {
  id: number;
  amount: number;
  type: 'aidat' | 'demirbas' | 'ceza';
  status: 'paid' | 'unpaid';
  due_date: string;
  created_at: string;
}

export const FinanceScreen = () => {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalDebt, setTotalDebt] = useState(0);

  useEffect(() => {
    if (userId) {
      loadTransactions();
    }
  }, [userId]);

  const loadTransactions = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: false });

      if (error) throw error;
      if (data) {
        setTransactions(data);
        calculateDebt(data);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDebt = (txns: Transaction[]) => {
    const debt = txns
      .filter((t) => t.status === 'unpaid')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    setTotalDebt(debt);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'aidat':
        return 'Aidat';
      case 'demirbas':
        return 'Demirbaş';
      case 'ceza':
        return 'Ceza';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      month: 'long',
      year: 'numeric',
      day: 'numeric',
    });
  };

  const handlePayNow = () => {
    Alert.alert(
      'Ödeme',
      'Ödeme özelliği çok yakında hizmetinizde!',
      [{ text: 'Tamam' }]
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
      
      {/* Arkaplan Dekorasyonu */}
      <View style={styles.bgDecoration} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Finansal Durum</Text>
            <Text style={styles.headerTitle}>Ödemelerim</Text>
          </View>
          <View style={styles.headerIconContainer}>
            <MaterialCommunityIcons
              name="wallet-outline"
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
          {/* Hero Card - Total Debt */}
          <View style={styles.heroCardContainer}>
            <LinearGradient
              colors={
                totalDebt > 0
                  ? [COLORS.danger, '#DC2626']
                  : [COLORS.success, '#059669']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <View style={styles.heroContent}>
                <View style={styles.heroTextContainer}>
                  <Text style={styles.heroLabel}>Toplam Borç</Text>
                  {totalDebt > 0 ? (
                    <>
                      <Text style={styles.heroAmount}>
                        {formatCurrency(totalDebt)}
                      </Text>
                      <Text style={styles.heroSubtext}>
                        Lütfen ödemenizi zamanında yapınız.
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.heroAmount}>0,00 ₺</Text>
                      <Text style={styles.heroSubtext}>
                        Harika! Hiç borcunuz bulunmuyor.
                      </Text>
                    </>
                  )}
                </View>
                <View style={styles.heroIconCircle}>
                  <MaterialCommunityIcons
                    name={totalDebt > 0 ? "alert-circle-outline" : "check-circle-outline"}
                    size={40}
                    color={totalDebt > 0 ? COLORS.danger : COLORS.success}
                  />
                </View>
              </View>

              {totalDebt > 0 && (
                <TouchableOpacity
                  style={styles.payButton}
                  onPress={handlePayNow}
                  activeOpacity={0.9}
                >
                  <Text style={[styles.payButtonText, { color: COLORS.danger }]}>Şimdi Öde</Text>
                  <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.danger} />
                </TouchableOpacity>
              )}
            </LinearGradient>
          </View>

          {/* Transaction History */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Geçmiş İşlemler</Text>

            {transactions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <MaterialCommunityIcons
                    name="receipt"
                    size={48}
                    color={COLORS.lightText}
                  />
                </View>
                <Text style={styles.emptyText}>Henüz işlem yok</Text>
                <Text style={styles.emptySubtext}>
                  Yapılan ödemeler ve borçlar burada listelenecektir.
                </Text>
              </View>
            ) : (
              transactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionCard}>
                  <View style={styles.transactionLeft}>
                    <View
                      style={[
                        styles.transactionIconBox,
                        {
                          backgroundColor:
                            transaction.status === 'paid'
                              ? '#ECFDF5' // Light green
                              : '#FEF2F2', // Light red
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={
                          transaction.type === 'aidat'
                            ? 'home-outline'
                            : transaction.type === 'demirbas'
                            ? 'tools'
                            : 'alert-circle-outline'
                        }
                        size={24}
                        color={
                          transaction.status === 'paid' ? COLORS.success : COLORS.danger
                        }
                      />
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionType}>
                        {getTypeLabel(transaction.type)}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {formatDate(transaction.due_date)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.transactionRight}>
                    <Text style={styles.transactionAmount}>
                      {formatCurrency(transaction.amount)}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            transaction.status === 'paid'
                              ? '#ECFDF5'
                              : '#FEF2F2',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              transaction.status === 'paid'
                                ? COLORS.success
                                : COLORS.danger,
                          },
                        ]}
                      >
                        {transaction.status === 'paid' ? 'Ödendi' : 'Ödenmedi'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
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
    paddingBottom: 100,
  },
  // Hero Card
  heroCardContainer: {
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  heroGradient: {
    borderRadius: 24,
    padding: 24,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginBottom: 8,
  },
  heroAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 4,
  },
  heroSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  heroIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  // Transaction History
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 16,
  },
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
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: COLORS.lightText,
    fontWeight: '500',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 6,
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
});