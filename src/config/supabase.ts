import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

const SUPABASE_URL = 'https://btbnvyatkpgaqxjnmmay.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0Ym52eWF0a3BnYXF4am5tbWF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MTk5OTcsImV4cCI6MjA3OTM5NTk5N30.VgiDauImPqJ-UkRVTeEzZLdWw_rk7u1SSmFBxqsQqsI';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'x-application-name': 'emlak-konut-app',
    },
  },
});
