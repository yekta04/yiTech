import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../hooks/useAuth';
import { SafeContainer } from '../../../components/SafeContainer';
import { Loading } from '../../../components/Loading';
import { theme } from '../../../config/theme';

export const QrEntryScreen = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return <Loading message="Loading your ID..." />;
  }

  if (!session?.user) {
    return (
      <SafeContainer>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Please log in to view your QR code</Text>
        </View>
      </SafeContainer>
    );
  }

  const qrData = JSON.stringify({
    uid: session.user.id,
    timestamp: Date.now(),
  });

  return (
    <SafeContainer>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>My ID Card</Text>

          <View style={styles.qrContainer}>
            <QRCode value={qrData} size={200} />
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.label}>User ID</Text>
            <Text style={styles.value}>{session.user.id.substring(0, 8)}...</Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{session.user.email}</Text>
          </View>

          <Text style={styles.instruction}>
            Show this QR code at the gate for entry
          </Text>
        </View>
      </View>
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.l,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
  },
  qrContainer: {
    padding: theme.spacing.l,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: theme.spacing.xl,
  },
  infoContainer: {
    width: '100%',
    marginBottom: theme.spacing.m,
  },
  label: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  instruction: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: theme.spacing.l,
    fontStyle: 'italic',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.l,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.danger,
    textAlign: 'center',
  },
});
