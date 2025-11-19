import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  fetchSpots,
  getCachedSpots,
  occupySpot,
  releaseSpot,
  subscribeToParkingUpdates,
} from '../services/parkingService';
import { theme } from '../../../config/theme';

interface ParkingSpot {
  id: number;
  location_code: string;
  is_occupied: boolean;
  occupied_by: string | null;
}

export const ParkingMapScreen = () => {
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();
  const userId = session?.user?.id;

  const loadSpots = async () => {
    const cachedData = await getCachedSpots();
    if (cachedData && cachedData.length > 0) {
      setSpots(cachedData);
      setLoading(false);
    }

    const { data, error } = await fetchSpots();
    if (error) {
      if (!cachedData) {
        Alert.alert('Error', 'Failed to load parking spots');
      }
    } else if (data) {
      setSpots(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSpots();

    const unsubscribe = subscribeToParkingUpdates((updatedSpot) => {
      setSpots((prev) =>
        prev.map((spot) => (spot.id === updatedSpot.id ? updatedSpot : spot))
      );
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSpotPress = async (spot: ParkingSpot) => {
    if (!userId) return;

    if (spot.is_occupied && spot.occupied_by !== userId) {
      Alert.alert('Occupied', 'This spot is already taken');
      return;
    }

    if (spot.occupied_by === userId) {
      Alert.alert('Leave Spot', 'Do you want to leave this parking spot?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          onPress: async () => {
            const { error } = await releaseSpot(spot.id);
            if (error) {
              Alert.alert('Error', 'Failed to release spot');
            }
          },
        },
      ]);
      return;
    }

    Alert.alert('Park Here', `Do you want to park at ${spot.location_code}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Park',
        onPress: async () => {
          const { error } = await occupySpot(spot.id, userId);
          if (error) {
            Alert.alert('Error', 'Failed to occupy spot');
          }
        },
      },
    ]);
  };

  const renderSpot = ({ item }: { item: ParkingSpot }) => {
    const isMyCar = item.occupied_by === userId;
    const isOccupied = item.is_occupied;

    let backgroundColor = theme.colors.success;
    let icon = 'checkmark-circle';
    let iconColor = '#FFFFFF';

    if (isMyCar) {
      backgroundColor = theme.colors.primary;
      icon = 'car';
      iconColor = '#FFFFFF';
    } else if (isOccupied) {
      backgroundColor = theme.colors.danger;
      icon = 'close-circle';
      iconColor = '#FFFFFF';
    }

    return (
      <TouchableOpacity
        style={[styles.spot, { backgroundColor }]}
        onPress={() => handleSpotPress(item)}
      >
        <Ionicons name={icon as any} size={24} color={iconColor} />
        <Text style={styles.spotText}>{item.location_code}</Text>
        {isMyCar && <Text style={styles.myCarText}>My Car</Text>}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Parking Map</Text>
      </View>

      <FlatList
        data={spots}
        renderItem={renderSpot}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        contentContainerStyle={styles.grid}
      />

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: theme.colors.success }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: theme.colors.primary }]} />
          <Text style={styles.legendText}>My Car</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: theme.colors.danger }]} />
          <Text style={styles.legendText}>Occupied</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.l,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  grid: {
    padding: theme.spacing.m,
  },
  spot: {
    flex: 1,
    margin: theme.spacing.s,
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  spotText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: theme.spacing.s,
  },
  myCarText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: theme.spacing.l,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: theme.spacing.s,
  },
  legendText: {
    fontSize: 12,
    color: theme.colors.text,
  },
});
