import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** Sesja w sessionStorage – po zamknięciu przeglądarki wymagane ponowne logowanie. */
function createSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    return createClient(
      'https://placeholder.supabase.co',
      'placeholder-anon-key',
      {
        auth: {
          persistSession: true,
          storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
        },
      }
    );
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
    },
  });
}

export const supabase = createSupabaseClient();