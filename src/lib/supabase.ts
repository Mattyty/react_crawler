import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wfanbaefeuxczqxzqfdk.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmYW5iYWVmZXV4Y3pxeHpxZmRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNjUxNDUsImV4cCI6MjA5Mzk0MTE0NX0.gJcN6z4JO-aQNof41_JL0ZkZOrRIBgbtjgiKhHrXbeE';

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: typeof window !== 'undefined' ? AsyncStorage : undefined,
        persistSession: typeof window !== 'undefined',
        autoRefreshToken: typeof window !== 'undefined',
        detectSessionInUrl: false,
      },
    });
  }
  return _supabase;
}

// Keep backward compat
export const supabase = typeof window !== 'undefined'
  ? getSupabase()
  : createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
