
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const getSupabaseClient = (url?: string, key?: string): SupabaseClient | null => {
  // Tenta obter das props ou de forma segura do process.env
  const envUrl = typeof process !== 'undefined' ? process.env.SUPABASE_URL : '';
  const envKey = typeof process !== 'undefined' ? process.env.SUPABASE_ANON_KEY : '';

  const finalUrl = (url || envUrl || '').trim();
  const finalKey = (key || envKey || '').trim();

  // Se os dados mínimos não existirem, retorna null silenciosamente
  // para que o App entre em modo 'Offline/Local' sem crashar.
  if (!finalUrl || !finalKey || !finalUrl.startsWith('http')) {
    return null;
  }
  
  try {
    return createClient(finalUrl, finalKey);
  } catch (e) {
    console.error("Erro ao inicializar Supabase:", e);
    return null;
  }
};
