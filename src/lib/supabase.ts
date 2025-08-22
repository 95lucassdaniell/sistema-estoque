import { createClient } from '@supabase/supabase-js';

// Environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ymybesaxedfvaigljnox.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlteWJlc2F4ZWRmdmFpZ2xqbm94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NDMzNTgsImV4cCI6MjA3MTExOTM1OH0.Di24g5Pwb11We6v_SYuRVDPLUcxdITdPbAW0aQG4T8U';

// Debug logging for production troubleshooting
console.log('Supabase Config Debug:', {
  urlExists: !!supabaseUrl,
  keyExists: !!supabaseAnonKey,
  urlValue: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'MISSING',
  keyValue: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING'
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Environment variables check:', {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    allEnvVars: Object.keys(import.meta.env)
  });
  throw new Error(`Missing Supabase environment variables. URL: ${!!supabaseUrl}, Key: ${!!supabaseAnonKey}`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Verify connection
supabase.from('empresas').select('count').limit(1).then(
  () => console.log('✅ Supabase connection successful'),
  (error) => console.error('❌ Supabase connection failed:', error)
);

export type Database = {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string;
          nome: string;
          email: string;
          telefone: string | null;
          cargo: string;
          nivel_acesso: 'admin_geral' | 'admin_loja' | 'gerente' | 'funcionario';
          lojas_associadas: string[] | null;
          status: 'ativo' | 'inativo';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          email: string;
          telefone?: string | null;
          cargo: string;
          nivel_acesso: 'admin_geral' | 'admin_loja' | 'gerente' | 'funcionario';
          lojas_associadas?: string[] | null;
          status?: 'ativo' | 'inativo';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          email?: string;
          telefone?: string | null;
          cargo?: string;
          nivel_acesso?: 'admin_geral' | 'admin_loja' | 'gerente' | 'funcionario';
          lojas_associadas?: string[] | null;
          status?: 'ativo' | 'inativo';
          created_at?: string;
          updated_at?: string;
        };
      };
      lojas: {
        Row: {
          id: string;
          nome: string;
          endereco: string;
          telefone: string | null;
          status: 'ativa' | 'inativa';
          created_at: string;
          updated_at: string;
        };
      };
      produtos: {
        Row: {
          id: string;
          nome: string;
          categoria: string;
          codigo_barras: string | null;
          preco: number;
          unidade_medida: string;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};