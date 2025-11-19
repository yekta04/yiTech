import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { InteractiveMap } from '../components/InteractiveMap';
import { theme } from '../../../config/theme';

const SITE_POIS = [
  {
    id: '1',
    title: 'Main Gate',
    coordinate: { latitude: 41.0082, longitude: 28.9784 },
  },
  {
    id: '2',
    title: 'Block A',
    coordinate: { latitude: 41.0092, longitude: 28.9794 },
  },
  {
    id: '3',
    title: 'Block B',
    coordinate: { latitude: 41.0072, longitude: 28.9774 },
  },
  {
    id: '4',
    title: 'Pool Area',
    coordinate: { latitude: 41.0082, longitude: 28.9804 },
  },
];

export const SiteMapScreen = () => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      try {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
      } catch (error) {
        setErrorMsg('Failed to get current location');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <Text style={styles.infoText}>
          Please enable location permissions in your device settings.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <InteractiveMap markers={SITE_POIS} userLocation={location} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.l,
  },
  loadingText: {
    marginTop: theme.spacing.m,
    fontSize: 16,
    color: theme.colors.text,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.danger,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.text,
    textAlign: 'center',
  },
});
