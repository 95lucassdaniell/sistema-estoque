import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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