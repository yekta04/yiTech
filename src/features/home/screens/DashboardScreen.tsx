import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeContainer } from '../../../components/SafeContainer';
import { useAuth } from '../../auth/hooks/useAuth';
import { theme } from '../../../config/theme';

export const DashboardScreen = () => {
  const { session } = useAuth();
  const navigation = useNavigation();

  const getUserName = () => {
    if (!session?.user?.email) return 'User';
    const emailName = session.user.email.split('@')[0];
    return emailName.charAt(0).toUpperCase() + emailName.slice(1);
  };

  const handleEmergencyPress = () => {
    Alert.alert(
      'Emergency Alert',
      'Are you sure you want to send an emergency alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Alert',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Alert Sent', 'Emergency services have been notified.');
          },
        },
      ]
    );
  };

  const quickActions = [
    {
      id: 'map',
      title: 'Site Map',
      icon: 'map-outline',
      color: theme.colors.primary,
      onPress: () => navigation.navigate('Map' as never),
    },
    {
      id: 'parking',
      title: 'Parking',
      icon: 'car-outline',
      color: '#5856D6',
      onPress: () => navigation.navigate('Parking' as never),
    },
    {
      id: 'booking',
      title: 'Reservations',
      icon: 'calendar-outline',
      color: '#FF9500',
      onPress: () => navigation.navigate('Booking' as never),
    },
    {
      id: 'qr',
      title: 'My QR Code',
      icon: 'qr-code-outline',
      color: theme.colors.success,
      onPress: () => Alert.alert('QR Code', 'QR Code feature coming soon!'),
    },
  ];

  return (
    <SafeContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome,</Text>
          <Text style={styles.userName}>{getUserName()}</Text>
        </View>

        {/* Emergency Button */}
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={handleEmergencyPress}
          activeOpacity={0.8}
        >
          <Ionicons name="warning" size={32} color="#FFFFFF" />
          <Text style={styles.emergencyText}>Emergency Alert</Text>
          <Text style={styles.emergencySubtext}>Tap to notify security</Text>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.actionIconContainer,
                    { backgroundColor: action.color + '20' },
                  ]}
                >
                  <Ionicons
                    name={action.icon as any}
                    size={28}
                    color={action.color}
                  />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notices Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Announcements</Text>
          <View style={styles.noticeCard}>
            <View style={styles.noticeHeader}>
              <Ionicons
                name="megaphone-outline"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.noticeDate}>Today</Text>
            </View>
            <Text style={styles.noticeTitle}>Pool Maintenance</Text>
            <Text style={styles.noticeText}>
              The swimming pool will be closed for maintenance this Sunday from
              8:00 AM to 2:00 PM. We apologize for any inconvenience.
            </Text>
          </View>

          <View style={styles.noticeCard}>
            <View style={styles.noticeHeader}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={theme.colors.success}
              />
              <Text style={styles.noticeDate}>This Week</Text>
            </View>
            <Text style={styles.noticeTitle}>Community Meeting</Text>
            <Text style={styles.noticeText}>
              Monthly community meeting scheduled for Friday at 7:00 PM in the
              main hall.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.m,
  },
  header: {
    marginBottom: theme.spacing.l,
  },
  greeting: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  emergencyButton: {
    backgroundColor: theme.colors.danger,
    borderRadius: 16,
    padding: theme.spacing.l,
    alignItems: 'center',
    marginBottom: theme.spacing.l,
    shadowColor: theme.colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emergencyText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: theme.spacing.s,
  },
  emergencySubtext: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
    marginTop: 4,
  },
  section: {
    marginBottom: theme.spacing.l,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  noticeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.s,
  },
  noticeDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  noticeText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
});
