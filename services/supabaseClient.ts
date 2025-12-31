
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const getSupabaseClient = (url?: string, key?: string): SupabaseClient | null => {
  // Limpa espaços em branco e garante que sejam strings válidas
  const finalUrl = (url || '').trim();
  const finalKey = (key || '').trim();

  // Se algum dos campos obrigatórios estiver vazio, retorna null IMEDIATAMENTE
  // Isso evita que o SDK do Supabase lance o erro "supabaseUrl is required"
  if (!finalUrl || !finalKey || finalUrl === '' || finalKey === '') {
    return null;
  }
  
  try {
    // Validação básica de formato de URL antes de instanciar o cliente
    if (!finalUrl.startsWith('http')) {
      return null;
    }
    return createClient(finalUrl, finalKey);
  } catch (e) {
    console.warn("Falha ao instanciar Supabase Client:", e);
    return null;
  }
};
