import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

const SUPABASE_URL = 'https://imnoyclzlqskdnmfbwme.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imltbm95Y2x6bHFza2RubWZid21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NjE1MDAsImV4cCI6MjA3OTEzNzUwMH0.aGYMjstsAceB9J1OlhYmj9j-B7ZlIJS5Rot--jhg_MI';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
