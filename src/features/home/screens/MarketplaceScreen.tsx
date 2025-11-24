import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../../config/supabase';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48 - 16) / 2; // 2 kolon, padding ve gap hesabı

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
};

interface MarketplaceItem {
  id: number;
  title: string;
  price: number;
  description: string;
  image_url: string;
  status: 'active' | 'sold';
  created_at: string;
}

// ÖRNEK VERİLER (Veritabanı boşsa bunlar gösterilecek)
// GÜNCELLEME: Kitaplık ve Mikrodalga resimleri yenilendi
const SAMPLE_ITEMS: MarketplaceItem[] = [
  {
    id: 1,
    title: 'Az Kullanılmış Dağ Bisikleti',
    price: 3500,
    description: 'Sadece 3 ay kullanıldı, balkonda duruyor. 26 jant, 21 vites. İhtiyaç fazlası.',
    image_url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=500&q=60',
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'TYT-AYT Hazırlık Kitapları',
    price: 0, // ÜCRETSİZ
    description: 'Üniversiteyi kazandım, ihtiyacı olan bir öğrenciye ücretsiz vermek istiyorum.',
    image_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=500&q=60',
    status: 'active',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 gün önce
  },
  {
    id: 3,
    title: 'IKEA Çalışma Masası',
    price: 750,
    description: 'Beyaz renk, 120x60 cm. Ufak bir çiziği var ama sağlam.',
    image_url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=500&q=60',
    status: 'active',
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 gün önce
  },
  {
    id: 4,
    title: 'Bebek Arabası (Travel Sistem)',
    price: 2200,
    description: 'Temiz kullanılmış, tüm aksesuarları mevcut. Kırmızı renk.',
    image_url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=500&q=60',
    status: 'active',
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 5,
    title: 'Ahşap Kitaplık',
    price: 0, // ÜCRETSİZ
    description: 'Taşınma nedeniyle veriyorum. Gelip alabilecek olan yazsın.',
    image_url: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=500&q=60', // YENİ GÖRSEL (Kitaplık)
    status: 'active',
    created_at: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    id: 6,
    title: 'Samsung Mikrodalga Fırın',
    price: 1500,
    description: 'Model yükselttiğim için satılık. Sorunsuz çalışıyor.',
    image_url: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=500&q=60', // YENİ GÖRSEL (Mikrodalga/Mutfak Aleti)
    status: 'active',
    created_at: new Date(Date.now() - 432000000).toISOString(),
  },
];

export const MarketplaceScreen = () => {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('marketplace_items')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Veri çekilemedi, örnek veriler gösteriliyor.');
        setItems(SAMPLE_ITEMS); // Hata durumunda örnek veri
      } else if (data && data.length > 0) {
        setItems(data);
      } else {
        setItems(SAMPLE_ITEMS); // Veri yoksa örnek veri
      }
    } catch (error) {
      console.error('Error loading items:', error);
      setItems(SAMPLE_ITEMS);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'ÜCRETSİZ';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const renderItem = ({ item }: { item: MarketplaceItem }) => (
    <TouchableOpacity style={styles.itemCard} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.itemImage} resizeMode="cover" />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: item.price === 0 ? '#FEF3C7' : '#ECFDF5' }]}>
            <MaterialCommunityIcons
              name={item.price === 0 ? 'gift-outline' : 'shopping-outline'}
              size={40}
              color={item.price === 0 ? COLORS.warning : COLORS.primary}
            />
          </View>
        )}
        
        <View style={[
          styles.priceBadge, 
          { backgroundColor: item.price === 0 ? COLORS.warning : COLORS.success }
        ]}>
          <Text style={styles.priceText}>{formatPrice(item.price)}</Text>
        </View>
      </View>

      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.userContainer}>
             <MaterialCommunityIcons name="account-circle-outline" size={16} color={COLORS.lightText} />
             <Text style={styles.footerText}>Site Sakini</Text>
          </View>
          <Text style={styles.dateText}>
             {new Date(item.created_at).toLocaleDateString('tr-TR')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
            <Text style={styles.greeting}>Site Pazarı</Text>
            <Text style={styles.headerTitle}>İkinci El & Paylaşım</Text>
          </View>
          <View style={styles.headerIconContainer}>
            <MaterialCommunityIcons name="storefront-outline" size={28} color={COLORS.primary} />
          </View>
        </View>

        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <MaterialCommunityIcons
                  name="shopping-search"
                  size={48}
                  color={COLORS.lightText}
                />
              </View>
              <Text style={styles.emptyText}>Henüz ilan yok</Text>
              <Text style={styles.emptySubtext}>
                İlk ilanı siz ekleyerek başlayabilirsiniz.
              </Text>
            </View>
          }
        />

        {/* FAB - Yeni İlan Ekle */}
        <TouchableOpacity style={styles.fabContainer} activeOpacity={0.8}>
          <LinearGradient
            colors={[COLORS.primary, '#2DD4BF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fab}
          >
            <MaterialCommunityIcons name="plus" size={32} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
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
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  itemCard: {
    width: ITEM_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 150, // Resim alanı biraz daha büyütüldü
    width: '100%',
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  priceText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemContent: {
    padding: 12,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    color: COLORS.lightText,
    marginBottom: 12,
    lineHeight: 18,
    height: 36, // 2 satır için yükseklik
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBg,
    paddingTop: 8,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    color: COLORS.lightText,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 10,
    color: COLORS.lightText,
  },
  // Empty State
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
  // FAB
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});