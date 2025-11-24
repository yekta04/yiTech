import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  Platform,
  StatusBar 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { listenToAlerts } from '../services/emergencySocket';
import * as ttsHandler from '../utils/ttsHandler';

const { width, height } = Dimensions.get('window');

// Acil durum için özel renk paleti
const COLORS = {
  dangerStart: '#EF4444',
  dangerEnd: '#DC2626',
  white: '#FFFFFF',
  pulse: 'rgba(255, 255, 255, 0.3)',
  shadow: 'rgba(0, 0, 0, 0.25)',
};

interface Alert {
  id: number;
  type: string;
  message: string;
  active: boolean;
}

export const EmergencyOverlay = () => {
  const [alert, setAlert] = useState<Alert | null>(null);
  
  // Animasyon Değerleri
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const iconShake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsubscribe = listenToAlerts((payload) => {
      if (payload.active) {
        setAlert(payload);
        ttsHandler.speak(payload.message);
        startAnimations();
      }
    });

    return () => {
      unsubscribe();
      ttsHandler.stop();
    };
  }, []);

  const startAnimations = () => {
    // Nabız Animasyonu (Arka plan halkaları için)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // İkon Sallanma Animasyonu
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconShake, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(iconShake, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(iconShake, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(iconShake, { toValue: 0, duration: 100, useNativeDriver: true }),
        Animated.delay(1000) // Her sallanmadan sonra biraz bekle
      ])
    ).start();
  };

  const handleClose = () => {
    ttsHandler.stop();
    setAlert(null);
    // Animasyonları sıfırla
    pulseAnim.setValue(1);
    iconShake.setValue(0);
  };

  if (!alert) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.dangerEnd} />
      
      {/* Arkaplan Gradient */}
      <LinearGradient
        colors={[COLORS.dangerStart, COLORS.dangerEnd]}
        style={styles.background}
      />

      {/* Animasyonlu Arkaplan Halkaları */}
      <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]} />
      <Animated.View style={[styles.pulseCircle, { transform: [{ scale: Animated.multiply(pulseAnim, 0.8) }], opacity: 0.5 }]} />

      <View style={styles.content}>
        {/* Uyarı İkonu */}
        <Animated.View style={{ transform: [{ translateX: iconShake }] }}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="alert-octagon-outline" size={80} color={COLORS.dangerStart} />
          </View>
        </Animated.View>

        {/* Başlık ve Mesaj */}
        <Text style={styles.title}>ACİL DURUM!</Text>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{alert.type.toUpperCase()}</Text>
        </View>
        
        <Text style={styles.message}>{alert.message}</Text>

        {/* Aksiyon Butonu */}
        <TouchableOpacity 
          style={styles.buttonContainer} 
          onPress={handleClose}
          activeOpacity={0.9}
        >
          <View style={styles.button}>
            <MaterialCommunityIcons name="check-circle" size={28} color={COLORS.dangerStart} />
            <Text style={styles.buttonText}>Güvendeyim / Kapat</Text>
          </View>
          <Text style={styles.buttonHint}>Alarmı susturmak için dokunun</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 9999, // Android için en üst katman
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  pulseCircle: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 1,
  },
  content: {
    zIndex: 2,
    alignItems: 'center',
    paddingHorizontal: 30,
    width: '100%',
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: 10,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  typeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  typeText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 20,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 28,
    fontWeight: '500',
    opacity: 0.95,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    width: '100%',
    paddingVertical: 20,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  buttonText: {
    color: COLORS.dangerStart,
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonHint: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    marginTop: 12,
  },
});