import { supabase } from '../../../config/supabase';

export const checkAvailability = async (
  facility: string,
  date: string,
  timeSlot: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from('reservations')
    .select('id')
    .eq('facility_name', facility)
    .eq('date', date)
    .eq('time_slot', timeSlot)
    .single();

  if (error && error.code === 'PGRST116') {
    return true;
  }

  return !data;
};

export const createReservation = async (
  facility: string,
  date: string,
  timeSlot: string,
  userId: string
) => {
  const { data, error } = await supabase.from('reservations').insert({
    user_id: userId,
    facility_name: facility,
    date,
    time_slot: timeSlot,
  });

  return { data, error };
};

export const fetchMyReservations = async (userId: string) => {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })
    .order('time_slot', { ascending: true });

  return { data, error };
};
