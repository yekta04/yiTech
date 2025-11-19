import { supabase } from '../../../config/supabase';
import { storeData, getData } from '../../../services/offlineSync';

const CACHE_KEY = 'parking_spots_cache';

export const getCachedSpots = async () => {
  return await getData<any[]>(CACHE_KEY);
};

export const fetchSpots = async () => {
  const { data, error } = await supabase
    .from('parking_spots')
    .select('*')
    .order('location_code', { ascending: true });

  if (data && !error) {
    await storeData(CACHE_KEY, data);
  }

  return { data, error };
};

export const occupySpot = async (spotId: number, userId: string) => {
  const { data, error } = await supabase
    .from('parking_spots')
    .update({ is_occupied: true, occupied_by: userId })
    .eq('id', spotId);

  return { data, error };
};

export const releaseSpot = async (spotId: number) => {
  const { data, error } = await supabase
    .from('parking_spots')
    .update({ is_occupied: false, occupied_by: null })
    .eq('id', spotId);

  return { data, error };
};

export const subscribeToParkingUpdates = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel('parking_spots_channel')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'parking_spots',
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
