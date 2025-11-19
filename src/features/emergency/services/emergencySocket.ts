import { supabase } from '../../../config/supabase';

export const listenToAlerts = (onAlertReceived: (payload: any) => void) => {
  const channel = supabase
    .channel('emergency_alerts_channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'emergency_alerts',
      },
      (payload) => {
        onAlertReceived(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
