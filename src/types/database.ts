// Database types aligned with Supabase schema
export interface Empresa {
  id: string;
  nome: string;
  cnpj: string | null;
  endereco: string | null;
  telefone: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Loja {
  id: string;
  nome: string;
  codigo: string;
  endereco: string;
  telefone: string | null;
  status: 'ativa' | 'inativa';
  empresa_id: string;
  created_at: string;
  updated_at: string;
}

export interface Produto {
  id: string;
  nome: string;
  categoria: string;
  codigo_barras: string | null;
  preco: number;
  unidade_medida: string;
  empresa_id: string;
  created_at: string;
  updated_at: string;
}

export interface MateriaPrima {
  id: string;
  nome: string;
  categoria: string;
  unidade_medida: string;
  created_at: string;
  updated_at: string;
}

export interface Estoque {
  id: string;
  loja_id: string;
  produto_id: string | null;
  materia_prima_id: string | null;
  quantidade_atual: number;
  quantidade_minima: number;
  quantidade_maxima: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  loja?: Loja;
  produto?: Produto;
  materia_prima?: MateriaPrima;
}

export interface Movimentacao {
  id: string;
  loja_id: string;
  produto_id: string | null;
  materia_prima_id: string | null;
  tipo: 'entrada' | 'saida' | 'ajuste' | 'transferencia';
  quantidade: number;
  motivo: string;
  usuario_id: string;
  created_at: string;
  // Joined fields
  loja?: Loja;
  produto?: Produto;
  materia_prima?: MateriaPrima;
  usuario?: Usuario;
}

export interface Usuario {
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
}

export interface Alerta {
  id: string;
  tipo: 'estoque' | 'vencimento' | 'transferencia' | 'sistema';
  prioridade: 'critico' | 'alto' | 'medio' | 'baixo';
  titulo: string;
  descricao: string;
  loja_id: string | null;
  status: 'novo' | 'lido' | 'resolvido';
  usuario_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  loja?: Loja;
  usuario?: Usuario;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  count?: number;
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
}