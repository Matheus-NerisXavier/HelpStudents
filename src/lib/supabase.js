import { createClient } from '@supabase/supabase-js';

// Essas variáveis virão do seu painel do Supabase. 
// Por enquanto, deixarei os placeholders para você substituir.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sua-url-do-supabase.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sua-chave-anon-aqui';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
