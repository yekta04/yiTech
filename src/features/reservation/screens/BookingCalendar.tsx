import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  checkAvailability,
  createReservation,
  fetchMyReservations,
} from '../services/bookingService';
import { theme } from '../../../config/theme';

const FACILITIES = ['Tennis Court', 'Sauna', 'BBQ Area'];
const TIME_SLOTS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];

interface Reservation {
  id: number;
  facility_name: string;
  date: string;
  time_slot: string;
  created_at: string;
}

export const BookingScreen = () => {
  const [selectedFacility, setSelectedFacility] = useState(FACILITIES[0]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();
  const userId = session?.user?.id;

  useEffect(() => {
    if (userId) {
      loadMyReservations();
    }
  }, [userId]);

  const loadMyReservations = async () => {
    if (!userId) return;
    const { data, error } = await fetchMyReservations(userId);
    if (!error && data) {
      setMyReservations(data);
    }
  };

  const handleBooking = async () => {
    if (!userId) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    if (!selectedDate || !selectedTimeSlot) {
      Alert.alert('Error', 'Please select date and time slot');
      return;
    }

    setLoading(true);

    try {
      const isAvailable = await checkAvailability(
        selectedFacility,
        selectedDate,
        selectedTimeSlot
      );

      if (!isAvailable) {
        Alert.alert('Unavailable', 'This time slot is already booked');
        setLoading(false);
        return;
      }

      const { error } = await createReservation(
        selectedFacility,
        selectedDate,
        selectedTimeSlot,
        userId
      );

      if (error) {
        Alert.alert('Error', 'Failed to create reservation');
      } else {
        Alert.alert('Success', 'Reservation created successfully!');
        setSelectedTimeSlot('');
        loadMyReservations();
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Facility</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FACILITIES.map((facility) => (
            <TouchableOpacity
              key={facility}
              style={[
                styles.facilityButton,
                selectedFacility === facility && styles.facilityButtonActive,
              ]}
              onPress={() => setSelectedFacility(facility)}
            >
              <Text
                style={[
                  styles.facilityButtonText,
                  selectedFacility === facility && styles.facilityButtonTextActive,
                ]}
              >
                {facility}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.dateInput}
          placeholder="2024-12-25"
          value={selectedDate}
          onChangeText={setSelectedDate}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Time Slot</Text>
        <View style={styles.timeGrid}>
          {TIME_SLOTS.map((slot) => (
            <TouchableOpacity
              key={slot}
              style={[
                styles.timeSlot,
                selectedTimeSlot === slot && styles.timeSlotActive,
              ]}
              onPress={() => setSelectedTimeSlot(slot)}
            >
              <Text
                style={[
                  styles.timeSlotText,
                  selectedTimeSlot === slot && styles.timeSlotTextActive,
                ]}
              >
                {slot}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.bookButton, loading && styles.bookButtonDisabled]}
        onPress={handleBooking}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.bookButtonText}>Book Now</Text>
        )}
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Reservations</Text>
        {myReservations.length === 0 ? (
          <Text style={styles.emptyText}>No reservations yet</Text>
        ) : (
          myReservations.map((reservation) => (
            <View key={reservation.id} style={styles.reservationCard}>
              <Text style={styles.reservationFacility}>
                {reservation.facility_name}
              </Text>
              <Text style={styles.reservationDetails}>
                {reservation.date} at {reservation.time_slot}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  section: {
    padding: theme.spacing.l,
    backgroundColor: '#FFFFFF',
    marginBottom: theme.spacing.m,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
  },
  facilityButton: {
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    marginRight: theme.spacing.m,
  },
  facilityButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  facilityButtonText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  facilityButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dateInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.m,
    fontSize: 16,
    color: theme.colors.text,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.s,
  },
  timeSlot: {
    width: '30%',
    margin: theme.spacing.s,
    paddingVertical: theme.spacing.m,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  timeSlotActive: {
    backgroundColor: theme.colors.primary,
  },
  timeSlotText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  timeSlotTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bookButton: {
    backgroundColor: theme.colors.success,
    marginHorizontal: theme.spacing.l,
    marginVertical: theme.spacing.m,
    paddingVertical: theme.spacing.l,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    opacity: 0.6,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  reservationCard: {
    backgroundColor: '#F2F2F7',
    padding: theme.spacing.m,
    borderRadius: 8,
    marginBottom: theme.spacing.m,
  },
  reservationFacility: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  reservationDetails: {
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    paddingVertical: theme.spacing.l,
  },
});
