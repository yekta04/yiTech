import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View, Animated, TouchableOpacity, Platform } from 'react-native';
import { DashboardScreen } from '../features/home/screens/DashboardScreen';
import { ParkingMapScreen } from '../features/parking/screens/FindCarScreen';
import { SiteMapScreen } from '../features/map/screens/SiteMapScreen';
import { BookingScreen } from '../features/reservation/screens/BookingCalendar';
import { AnnouncementsScreen } from '../features/home/screens/AnnouncementsScreen';
import { SupportScreen } from '../features/home/screens/SupportScreen';
import { FinanceScreen } from '../features/home/screens/FinanceScreen';
import { GuestListScreen } from '../features/home/screens/GuestListScreen';
import { CreateGuestScreen } from '../features/home/screens/CreateGuestScreen';
import { MarketplaceScreen } from '../features/home/screens/MarketplaceScreen';
import { EventsScreen } from '../features/home/screens/EventsScreen';
import { UserManagementScreen } from '../features/admin/screens/UserManagementScreen';
import { AdminDashboard } from '../features/admin/screens/AdminDashboard';
import { CleanerDashboard } from '../features/services/screens/CleanerDashboard';
import { ResidentServiceScreen } from '../features/services/screens/ResidentServiceScreen';
import { SecurityDashboard } from '../features/security/screens/SecurityDashboard';
import { useAuth } from '../features/auth/hooks/useAuth';

const Tab = createBottomTabNavigator();

// TURKUAZ RENK PALETİ
const COLORS = {
  active: '#06B6D4',       // TURKUAZ MAVİSİ (aktif buton)
  inactive: '#94A3B8',     // AÇIK GRI (inaktif buton)
  background: '#FFFFFF',   // Arkaplan
};

// Animasyonlu Tab Butonu Component
const AnimatedTabButton = ({ focused, iconName, label, onPress, accessibilityState }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const translateYAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (focused) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          friction: 5,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: -5,
          friction: 5,
          tension: 50,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          friction: 5,
          tension: 50,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [focused]);

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={styles.tabButton}
      activeOpacity={0.8}
    >
      <Animated.View style={[
        styles.tabIconContainer,
        focused && styles.tabIconContainerActive,
        {
          transform: [
            { scale: scaleAnim },
            { translateY: translateYAnim }
          ]
        }
      ]}>
        <MaterialCommunityIcons 
          name={iconName} 
          size={26} 
          color={focused ? COLORS.active : COLORS.inactive} 
        />
      </Animated.View>
      <Animated.Text style={[
        styles.tabLabel,
        focused && styles.tabLabelActive
      ]}>
        {label}
      </Animated.Text>
    </TouchableOpacity>
  );
};

// Custom Tab Bar Component
const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabsContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        
        // Eğer tabBarButton null ise (gizli ekranlar için), butonu render etme
        if (options.tabBarButton && options.tabBarButton() === null) {
          return null;
        }

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // İkon ve Etiket belirleme
        const iconName = options.tabBarIconName || getIconName(route.name);
        const label = options.tabBarLabel || route.name;

        return (
          <AnimatedTabButton
            key={route.key}
            focused={isFocused}
            iconName={iconName}
            label={label}
            onPress={onPress}
          />
        );
      })}
    </View>
  );
};

// İkon eşleştirme yardımcısı
const getIconName = (routeName) => {
  const icons: {[key: string]: any} = {
    'Dashboard': 'home',
    'Services': 'room-service',
    'GuestList': 'account-multiple',
    'Parking': 'car',
    'AdminDashboard': 'shield-crown',
    'Users': 'account-group',
    'CleanerDashboard': 'broom',
    'Support': 'face-agent',
    'SecurityDashboard': 'qrcode-scan',
  };
  return icons[routeName] || 'circle';
};

export const AppTabs = () => {
  const { role } = useAuth();

  // Ortak gizli ekranlar (Navigation çalışması için gerekli ama tab'da görünmez)
  const CommonHiddenScreens = () => (
    <>
      <Tab.Screen name="Finance" component={FinanceScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="Announcements" component={AnnouncementsScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="CreateGuest" component={CreateGuestScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="Marketplace" component={MarketplaceScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="Events" component={EventsScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="Booking" component={BookingScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="Map" component={SiteMapScreen} options={{ tabBarButton: () => null }} />
      {/* Eğer Support tab bar'da yoksa buraya eklenmeli */}
      {role !== 'cleaner' && <Tab.Screen name="Support" component={SupportScreen} options={{ tabBarButton: () => null }} />}
    </>
  );

  // ADMIN
  if (role === 'admin') {
    return (
      <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tab.Screen name="AdminDashboard" component={AdminDashboard} options={{ tabBarLabel: 'Panel' }} />
        <Tab.Screen name="Users" component={UserManagementScreen} options={{ tabBarLabel: 'Kullanıcılar' }} />
        <Tab.Screen name="GuestList" component={GuestListScreen} options={{ tabBarLabel: 'Misafirler' }} />
        {CommonHiddenScreens()}
      </Tab.Navigator>
    );
  }

  // TEMİZLİKÇİ
  if (role === 'cleaner') {
    return (
      <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tab.Screen name="CleanerDashboard" component={CleanerDashboard} options={{ tabBarLabel: 'Görevler' }} />
        {/* Temizlikçi için Support ekranı gizli değilse buraya ekleyin, gizliyse CommonHiddenScreens içinde */}
        {CommonHiddenScreens()}
      </Tab.Navigator>
    );
  }

  // GÜVENLİK
  if (role === 'security') {
    return (
      <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tab.Screen name="SecurityDashboard" component={SecurityDashboard} options={{ tabBarLabel: 'QR Tara' }} />
        <Tab.Screen name="GuestList" component={GuestListScreen} options={{ tabBarLabel: 'Misafirler' }} />
        {CommonHiddenScreens()}
      </Tab.Navigator>
    );
  }

  // SAKİN (Varsayılan)
  return (
    <Tab.Navigator 
      tabBar={(props) => <CustomTabBar {...props} />} 
      screenOptions={{ headerShown: false }}
    >
      {/* Görünür Tablar */}
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Ana Sayfa' }} />
      <Tab.Screen name="Services" component={ResidentServiceScreen} options={{ tabBarLabel: 'Hizmetler' }} />
      <Tab.Screen name="GuestList" component={GuestListScreen} options={{ tabBarLabel: 'Misafirler' }} />
      <Tab.Screen name="Parking" component={ParkingMapScreen} options={{ tabBarLabel: 'Otopark' }} />
      
      {/* Gizli Ekranlar (Navigasyon için şart) */}
      {CommonHiddenScreens()}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    height: 74,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background, // Şeffaf değil, beyaz yapıldı ki gölge görünsün
    borderRadius: 24,
    shadowColor: COLORS.active,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.1)',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    padding: 8,
    borderRadius: 20,
  },
  tabIconContainerActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.1)', // Turkuaz transparan
  },
  tabLabel: {
    fontSize: 10,
    color: COLORS.inactive,
    fontWeight: '600',
    textAlign: 'center',
  },
  tabLabelActive: {
    color: COLORS.active,
    fontWeight: '700',
    fontSize: 10,
  },
});