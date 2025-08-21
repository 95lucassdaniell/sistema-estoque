// Core types for the inventory management system

export interface User {
  id: string;
  nome: string;
  email: string;
  nivel_acesso: 'admin_geral' | 'gerente_loja' | 'operador' | 'consulta';
  lojas_permitidas: string[];
  status: 'ativo' | 'inativo';
  created_at: string;
  updated_at: string;
}

export interface Loja {
  id: string;
  nome: string;
  endereco: string;
  telefone: string;
  responsavel: string;
  status: 'ativo' | 'inativo';
  created_at: string;
  updated_at: string;
}

export interface Categoria {
  id: string;
  nome: string;
  descricao?: string;
  created_at: string;
}

export interface Fornecedor {
  id: string;
  nome: string;
  cnpj: string;
  contato: string;
  telefone: string;
  email: string;
  endereco: string;
  created_at: string;
}

export interface Produto {
  id: string;
  nome: string;
  codigo_sku: string;
  categoria_id: string;
  categoria?: Categoria;
  descricao: string;
  unidade_medida: string;
  fornecedor_id: string;
  fornecedor?: Fornecedor;
  foto_url?: string;
  codigo_barras?: string;
  status: 'ativo' | 'inativo';
  created_at: string;
  updated_at: string;
}

export interface MateriaPrima {
  id: string;
  nome: string;
  unidade: string;
  fornecedor_id: string;
  fornecedor?: Fornecedor;
  lote: string;
  data_fabricacao: string;
  data_validade: string;
  especificacoes?: string;
  status: 'ativo' | 'vencido' | 'vencendo';
  created_at: string;
}

export interface Estoque {
  id: string;
  produto_id: string;
  produto?: Produto;
  loja_id: string;
  loja?: Loja;
  quantidade_atual: number;
  estoque_minimo: number;
  estoque_maximo: number;
  updated_at: string;
}

export interface Movimentacao {
  id: string;
  produto_id: string;
  produto?: Produto;
  loja_id: string;
  loja?: Loja;
  tipo: 'entrada' | 'saida';
  subtipo: 'compra' | 'venda' | 'transferencia' | 'ajuste' | 'producao' | 'perda' | 'devolucao';
  quantidade: number;
  quantidade_anterior: number;
  motivo: string;
  usuario_id: string;
  usuario?: User;
  observacoes?: string;
  documento_url?: string;
  loja_destino_id?: string; // Para transferências
  created_at: string;
}

export interface Receita {
  id: string;
  nome: string;
  produto_final_id: string;
  descricao?: string;
  tempo_producao: number; // em minutos
  rendimento: number;
  created_at: string;
}

export interface ReceitaItem {
  id: string;
  receita_id: string;
  materia_prima_id: string;
  materia_prima?: MateriaPrima;
  quantidade: number;
  unidade: string;
}

export interface DashboardMetrics {
  total_lojas: number;
  total_produtos: number;
  total_movimentacoes_hoje: number;
  produtos_estoque_baixo: number;
  lojas_ativas: number;
}

export interface EstoqueBaixo {
  produto: Produto;
  loja: Loja;
  quantidade_atual: number;
  estoque_minimo: number;
  diferenca: number;
}

export interface AlertaVencimento {
  materia_prima: MateriaPrima;
  dias_para_vencer: number;
}

export interface MovimentacaoChart {
  data: string;
  entradas: number;
  saidas: number;
}

// Filters and pagination
export interface FilterOptions {
  loja_id?: string;
  categoria_id?: string;
  fornecedor_id?: string;
  data_inicio?: string;
  data_fim?: string;
  tipo?: string;
  status?: string;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  total?: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    nome: string;
    nivel_acesso: string;
    lojas_permitidas: string[];
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nome: string;
  email: string;
  password: string;
  nivel_acesso: 'admin_geral' | 'gerente_loja' | 'operador' | 'consulta';
  lojas_permitidas: string[];
}