import { supabase } from '@/lib/supabase';
import type { 
  Empresa,
  Loja, 
  Produto, 
  Estoque, 
  Movimentacao, 
  Usuario, 
  Alerta,
  MateriaPrima,
  ApiResponse,
  QueryOptions 
} from '@/types/database';

// Generic CRUD operations with error handling
class SupabaseService {
  private handleError(error: any): string {
    console.error('Supabase error:', error);
    if (error.message) return error.message;
    if (typeof error === 'string') return error;
    return 'Erro inesperado. Tente novamente.';
  }

  // EMPRESAS
  async getEmpresas(): Promise<ApiResponse<Empresa[]>> {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('ativo', true)
        .order('nome', { ascending: true });
      
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async createEmpresa(empresa: Omit<Empresa, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Empresa>> {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .insert({
          ...empresa,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async updateEmpresa(id: string, updates: Partial<Empresa>): Promise<ApiResponse<Empresa>> {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async deleteEmpresa(id: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from('empresas')
        .update({ 
          ativo: false, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);
        
      if (error) throw error;
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  // LOJAS
  async getLojas(options: QueryOptions = {}): Promise<ApiResponse<Loja[]>> {
    try {
      let query = supabase.from('lojas').select('*');
      
      if (options.filters?.status) {
        query = query.eq('status', options.filters.status);
      }
      
      if (options.filters?.search) {
        query = query.or(`nome.ilike.%${options.filters.search}%,endereco.ilike.%${options.filters.search}%`);
      }

      if (options.orderBy) {
        query = query.order(options.orderBy, { ascending: options.orderDirection === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data || [], error: null, count };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async createLoja(loja: Omit<Loja, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Loja>> {
    try {
      const { data, error } = await supabase
        .from('lojas')
        .insert(loja)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async updateLoja(id: string, updates: Partial<Loja>): Promise<ApiResponse<Loja>> {
    try {
      const { data, error } = await supabase
        .from('lojas')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  // PRODUTOS
  async getProdutos(options: QueryOptions = {}): Promise<ApiResponse<Produto[]>> {
    try {
      let query = supabase.from('produtos').select('*');
      
      if (options.filters?.categoria) {
        query = query.eq('categoria', options.filters.categoria);
      }
      
      if (options.filters?.empresa_id) {
        query = query.eq('empresa_id', options.filters.empresa_id);
      }
      
      if (options.filters?.search) {
        query = query.or(`nome.ilike.%${options.filters.search}%,codigo.ilike.%${options.filters.search}%`);
      }

      if (options.orderBy) {
        query = query.order(options.orderBy, { ascending: options.orderDirection === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data || [], error: null, count };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async createProduto(produto: Omit<Produto, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Produto>> {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .insert(produto)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async updateProduto(id: string, updates: Partial<Produto>): Promise<ApiResponse<Produto>> {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  // ESTOQUE
  async getEstoque(options: QueryOptions = {}): Promise<ApiResponse<Estoque[]>> {
    try {
      let query = supabase.from('estoque').select(`
        *,
        loja:lojas!loja_id(*),
        produto:produtos!produto_id(*),
        materia_prima:materia_prima!materia_prima_id(*)
      `);
      
      if (options.filters?.loja_id) {
        query = query.eq('loja_id', options.filters.loja_id);
      }

      const { data, error, count } = await query;
      
      // Apply status filter in JavaScript (frontend filtering)
      let filteredData = data;
      if (data && options.filters?.status === 'baixo') {
        filteredData = data.filter(item => item.quantidade_atual < item.quantidade_minima);
      } else if (data && options.filters?.status === 'ok') {
        filteredData = data.filter(item => item.quantidade_atual >= item.quantidade_minima);
      }
      
      if (error) throw error;
      return { data: filteredData || [], error: null, count };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async createEstoque(estoque: Omit<Estoque, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Estoque>> {
    try {
      const { data, error } = await supabase
        .from('estoque')
        .insert(estoque)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async updateEstoque(id: string, updates: Partial<Estoque>): Promise<ApiResponse<Estoque>> {
    try {
      const { data, error } = await supabase
        .from('estoque')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  // MOVIMENTAÇÕES
  async getMovimentacoes(options: QueryOptions = {}): Promise<ApiResponse<any[]>> {
    try {
      let query = supabase.from('movimentacoes').select(`
        *,
        produto:produtos!produto_id(id, nome),
        materia_prima:materia_prima!materia_prima_id(id, nome),
        empresas!loja_id(nome)
      `);
      
      if (options.filters?.tipo) {
        query = query.eq('tipo', options.filters.tipo);
      }
      
      if (options.filters?.loja_id) {
        query = query.eq('loja_id', options.filters.loja_id);
      }

      if (options.filters?.dataInicio && options.filters?.dataFim) {
        query = query.gte('data_hora', options.filters.dataInicio)
                    .lte('data_hora', options.filters.dataFim);
      }

      query = query.order('data_hora', { ascending: false });

      const { data: movimentacoes, error, count } = await query;
      
      if (error) throw error;
      
      // Attach simplified user data to movements
      const movimentacoesWithUsers = movimentacoes?.map(mov => ({
        ...mov,
        usuario: mov.usuario_id ? { nome_completo: 'Usuário do Sistema' } : null
      })) || [];

      return { data: movimentacoesWithUsers, error: null, count };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async createMovimentacao(movimentacaoData: any): Promise<ApiResponse<any>> {
    try {
      const movimentacaoForDB = {
        data_hora: new Date().toISOString(),
        tipo: movimentacaoData.tipo,
        loja_id: movimentacaoData.loja_id,
        produto_id: movimentacaoData.produto_id || null,
        materia_prima_id: movimentacaoData.materia_prima_id || null,
        quantidade: movimentacaoData.quantidade,
        motivo: movimentacaoData.observacoes || movimentacaoData.motivo || `Movimentação de ${movimentacaoData.tipo}`,
        observacoes: movimentacaoData.observacoes || null,
        usuario_id: movimentacaoData.usuario_id,
        status: 'concluida'
      };

      const { data, error } = await supabase
        .from('movimentacoes')
        .insert([movimentacaoForDB])
        .select(`
          *,
          produto:produtos!produto_id(id, nome),
          empresas!loja_id(nome)
        `);

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('INSERT executou mas não retornou dados');
      }
      
      return { data: data[0], error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  // USUARIOS
  async getUsuarios(options: QueryOptions = {}): Promise<ApiResponse<Usuario[]>> {
    try {
      let query = supabase.from('usuarios').select('*');
      
      if (options.filters?.nivel_acesso) {
        query = query.eq('nivel_acesso', options.filters.nivel_acesso);
      }
      
      if (options.filters?.status) {
        query = query.eq('status', options.filters.status);
      }
      
      if (options.filters?.search) {
        query = query.or(`nome_completo.ilike.%${options.filters.search}%,email.ilike.%${options.filters.search}%`);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data || [], error: null, count };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async updateUsuario(id: string, updates: Partial<Usuario>): Promise<ApiResponse<Usuario>> {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  // ALERTAS
  async getAlertas(options: QueryOptions = {}): Promise<ApiResponse<Alerta[]>> {
    try {
      let query = supabase.from('alertas').select(`
        *,
        loja:lojas!loja_id(*),
        usuario:usuarios!usuario_responsavel(*)
      `);
      
      if (options.filters?.tipo) {
        query = query.eq('tipo', options.filters.tipo);
      }
      
      if (options.filters?.prioridade) {
        query = query.eq('prioridade', options.filters.prioridade);
      }
      
      if (options.filters?.status) {
        query = query.eq('status', options.filters.status);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data || [], error: null, count };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async createAlerta(alerta: Omit<Alerta, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Alerta>> {
    try {
      const { data, error } = await supabase
        .from('alertas')
        .insert(alerta)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async updateAlerta(id: string, updates: Partial<Alerta>): Promise<ApiResponse<Alerta>> {
    try {
      const { data, error } = await supabase
        .from('alertas')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  // DASHBOARD STATS
  async getDashboardStats(): Promise<ApiResponse<any>> {
    try {
      const [lojasRes, produtosRes, estoqueRes, movimentacoesRes] = await Promise.all([
        supabase.from('lojas').select('id, status'),
        supabase.from('produtos').select('id'),
        supabase.from('estoque').select('id, quantidade_atual, quantidade_minima'),
        supabase.from('movimentacoes').select('id').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      const stats = {
        totalLojas: lojasRes.data?.length || 0,
        lojasAtivas: lojasRes.data?.filter(l => l.status === 'ativa').length || 0,
        totalProdutos: produtosRes.data?.length || 0,
        estoquesBaixos: estoqueRes.data?.filter(e => e.quantidade_atual < e.quantidade_minima).length || 0,
        movimentacoesSemana: movimentacoesRes.data?.length || 0
      };

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }
}

// Export singleton instance
export const apiService = new SupabaseService();

// Export types for use in components
export type { 
  Loja, 
  Produto, 
  MateriaPrima, 
  Estoque, 
  Movimentacao, 
  Usuario, 
  Alerta,
  ApiResponse,
  QueryOptions 
};