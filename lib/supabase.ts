import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Sesja w sessionStorage – po zamknięciu przeglądarki wymagane ponowne logowanie. */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage:
      typeof window !== 'undefined' ? window.sessionStorage : undefined,
  },
});