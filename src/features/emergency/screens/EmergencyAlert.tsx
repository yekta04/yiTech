import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { listenToAlerts } from '../services/emergencySocket';
import * as ttsHandler from '../utils/ttsHandler';
import { theme } from '../../../config/theme';

interface Alert {
  id: number;
  type: string;
  message: string;
  active: boolean;
}

export const EmergencyOverlay = () => {
  const [alert, setAlert] = useState<Alert | null>(null);

  useEffect(() => {
    const unsubscribe = listenToAlerts((payload) => {
      if (payload.active) {
        setAlert(payload);
        ttsHandler.speak(payload.message);
      }
    });

    return () => {
      unsubscribe();
      ttsHandler.stop();
    };
  }, []);

  const handleClose = () => {
    ttsHandler.stop();
    setAlert(null);
  };

  if (!alert) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.content}>
        <Ionicons name="warning" size={80} color="#FFFFFF" />

        <Text style={styles.title}>{alert.type}</Text>

        <Text style={styles.message}>{alert.message}</Text>

        <TouchableOpacity style={styles.button} onPress={handleClose}>
          <Text style={styles.buttonText}>I'm Safe / Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: theme.spacing.l,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  message: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: 8,
  },
  buttonText: {
    color: theme.colors.danger,
    fontSize: 16,
    fontWeight: '600',
  },
});
