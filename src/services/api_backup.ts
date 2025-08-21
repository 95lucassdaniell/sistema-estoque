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

      if (options.limit) {
        const from = (options.page || 0) * options.limit;
        query = query.range(from, from + options.limit - 1);
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

  async deleteLoja(id: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase.from('lojas').delete().eq('id', id);
      if (error) throw error;
      return { data: null, error: null };
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

  async deleteProduto(id: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase.from('produtos').delete().eq('id', id);
      if (error) throw error;
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  // MATÉRIA PRIMA
  async getMateriaPrima(options: QueryOptions = {}): Promise<ApiResponse<MateriaPrima[]>> {
    try {
      let query = supabase.from('materia_prima').select('*');
      
      if (options.filters?.categoria) {
        query = query.eq('categoria', options.filters.categoria);
      }
      
      if (options.filters?.search) {
        query = query.ilike('nome', `%${options.filters.search}%`);
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

  async createMateriaPrima(materiaPrima: Omit<MateriaPrima, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<MateriaPrima>> {
    try {
      const { data, error } = await supabase
        .from('materia_prima')
        .insert(materiaPrima)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async updateMateriaPrima(id: string, updates: Partial<MateriaPrima>): Promise<ApiResponse<MateriaPrima>> {
    try {
      const { data, error } = await supabase
        .from('materia_prima')
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

  async deleteMateriaPrima(id: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase.from('materia_prima').delete().eq('id', id);
      if (error) throw error;
      return { data: null, error: null };
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
      
      if (options.filters?.status) {
        if (options.filters.status === 'baixo') {
          query = query.filter('quantidade_atual', 'lt', 'quantidade_minima');
        } else if (options.filters.status === 'ok') {
          query = query.filter('quantidade_atual', 'gte', 'quantidade_minima');
        }
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data || [], error: null, count };
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
      console.log('API: Iniciando getMovimentacoes com filtros:', options.filters);
      
      let query = supabase.from('movimentacoes').select(`
        *,
        loja:lojas!loja_id(id, nome),
        produto:produtos!produto_id(id, nome),
        materia_prima:materia_prima!materia_prima_id(id, nome),
        usuario:usuarios!usuario_id(id, nome_completo, email)
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

      console.log('API: Executando query no Supabase...');
      const { data, error, count } = await query;
      
      if (error) {
        console.error('API: Erro no Supabase:', error);
        throw error;
      }
      
      console.log('API: Dados retornados:', data?.length, 'registros');
      console.log('API: Primeira movimentação (se existir):', data?.[0]);
      
      return { data: data || [], error: null, count };
    } catch (error) {
      console.error('API: Exception em getMovimentacoes:', error);
      return { data: null, error: this.handleError(error) };
    }
  }

  async createMovimentacao(movimentacaoData: any): Promise<ApiResponse<any>> {
    console.log('API: === INÍCIO createMovimentacao ===');
    console.log('API: 1. Dados recebidos:', movimentacaoData);
    
    // DEBUG SUPABASE CLIENT
    console.log('API: 1.1. === DEBUG CLIENTE SUPABASE ===');
    console.log('API: 1.2. URL:', process.env.VITE_SUPABASE_URL);
    console.log('API: 1.3. Key preview:', process.env.VITE_SUPABASE_ANON_KEY?.substring(0, 50) + '...');
    console.log('API: 1.4. Cliente existe:', !!supabase);
    console.log('API: 1.5. Cliente auth:', !!supabase?.auth);
    console.log('API: 1.6. Cliente from:', typeof supabase?.from);
    
    try {
      // TESTE DE CONEXÃO COM TIMEOUT E DEBUG DETALHADO
      console.log('API: 2. === TESTE DE CONEXÃO DETALHADO ===');
      console.log('API: 2.1. Iniciando ping para Supabase...');
      
      const timeStart = performance.now();
      
      // Criar promise de conexão e timeout
      const connectionPromise = supabase.from('produtos').select('count');
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('TIMEOUT após 10 segundos')), 10000)
      );
      
      console.log('API: 2.2. Aguardando resposta (max 10s)...');
      
      const pingResult = await Promise.race([connectionPromise, timeoutPromise]);
      
      const timeEnd = performance.now();
      console.log('API: 2.3. ✅ RESPOSTA RECEBIDA! Tempo:', Math.round(timeEnd - timeStart), 'ms');
      console.log('API: 2.4. Resultado ping:', pingResult);
      
      if (pingResult?.error) {
        console.error('API: 2.5. ❌ ERRO no ping:', pingResult.error);
        return { data: null, error: `Erro de conexão Supabase: ${pingResult.error.message}` };
      }
      
      console.log('API: 2.6. ✅ CONEXÃO SUPABASE FUNCIONANDO!');
      console.log('API: 3. Continuando verificações...');</to_replace>
</Editor.edit_file_by_replace>

<Editor.edit_file_by_replace>
<file_name>src/services/api.ts</file_name>
<to_replace>    } catch (error) {
      console.error('API: 21. EXCEPTION em createMovimentacao:', error);
      console.error('API: 22. Stack trace:', error.stack);
      console.log('API: === FIM createMovimentacao ERROR ===');
      return { data: null, error: this.handleError(error) };
    }</to_replace>
<new_content>    } catch (error) {
      console.error('API: 21. ❌ EXCEPTION em createMovimentacao:', error);
      console.error('API: 22. Tipo do erro:', typeof error);
      console.error('API: 23. Nome do erro:', error?.name);
      console.error('API: 24. Mensagem:', error?.message);
      console.error('API: 25. Stack trace:', error?.stack);
      
      // Verificar se é timeout
      if (error?.message?.includes('TIMEOUT')) {
        console.error('API: 26. 🚨 PROBLEMA: TIMEOUT NA CONEXÃO SUPABASE!');
        return { data: null, error: 'Timeout de conexão com o banco de dados. Verifique sua internet.' };
      }
      
      // Verificar se é erro de rede
      if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
        console.error('API: 27. 🚨 PROBLEMA: ERRO DE REDE!');
        return { data: null, error: 'Erro de rede. Verifique sua conexão com a internet.' };
      }
      
      console.log('API: === FIM createMovimentacao ERROR ===');
      return { data: null, error: this.handleError(error) };
    }

      // PASSO 2: Verificar se tabela movimentacoes existe
      console.log('API: 4. Verificando existência da tabela movimentacoes...');
      const tableCheck = await supabase
        .from('movimentacoes')
        .select('id')
        .limit(1);
      console.log('API: 5. Verificação da tabela:', tableCheck);

      // PASSO 3: Transformar dados
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
      
      console.log('API: 6. Dados transformados para DB:', movimentacaoForDB);

      // PASSO 4: Verificar se IDs existem nas tabelas relacionadas
      console.log('API: 7. Verificando se produto existe...');
      const produtoExists = await supabase
        .from('produtos')
        .select('id')
        .eq('id', movimentacaoData.produto_id)
        .single();
      console.log('API: 8. Produto existe?', produtoExists);

      console.log('API: 9. Verificando se loja existe...');
      const lojaExists = await supabase
        .from('lojas')
        .select('id')
        .eq('id', movimentacaoData.loja_id)
        .single();
      console.log('API: 10. Loja existe?', lojaExists);

      console.log('API: 11. Verificando se usuário existe...');
      const usuarioExists = await supabase
        .from('usuarios')
        .select('id')
        .eq('id', movimentacaoData.usuario_id)
        .single();
      console.log('API: 12. Usuário existe?', usuarioExists);

      // PASSO 5: Executar INSERT
      console.log('API: 13. EXECUTANDO INSERT na tabela movimentacoes...');
      
      const { data, error } = await supabase
        .from('movimentacoes')
        .insert([movimentacaoForDB])
        .select(`
          *,
          loja:lojas!loja_id(id, nome),
          produto:produtos!produto_id(id, nome),
          usuario:usuarios!usuario_id(id, nome_completo, email)
        `);

      console.log('API: 14. Response do INSERT:', { data, error });

      if (error) {
        console.error('API: 15. ERRO no Supabase INSERT:', error);
        console.error('API: 16. Código do erro:', error.code);
        console.error('API: 17. Mensagem do erro:', error.message);
        console.error('API: 18. Detalhes do erro:', error.details);
        throw error;
      }

      if (!data || data.length === 0) {
        console.error('API: 19. ERRO: INSERT não retornou dados');
        throw new Error('INSERT executou mas não retornou dados');
      }
      
      console.log('API: 20. SUCCESS - Movimentação criada:', data[0]);
      console.log('API: === FIM createMovimentacao SUCCESS ===');
      return { data: data[0], error: null };
      
    } catch (error) {
      console.error('API: 21. EXCEPTION em createMovimentacao:', error);
      console.error('API: 22. Stack trace:', error.stack);
      console.log('API: === FIM createMovimentacao ERROR ===');
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

  // REAL-TIME SUBSCRIPTIONS
  subscribeToTable(table: string, callback: (payload: any) => void) {
    return supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
      .subscribe();
  }

  // AUTHENTICATION HELPERS
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  async getCurrentUserProfile(): Promise<ApiResponse<Usuario>> {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Use email to find user with correct field name
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error) {
        // If user not found, create a basic profile
        if (error.code === 'PGRST116') {
          const defaultProfile = {
            nome_completo: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
            email: user.email || '',
            cargo: 'Funcionário',
            nivel_acesso: 'funcionario' as const,
            status: 'ativo' as const
          };
          
          const { data: newData, error: insertError } = await supabase
            .from('usuarios')
            .insert(defaultProfile)
            .select()
            .single();
          
          if (insertError) throw insertError;
          return { data: newData, error: null };
        }
        throw error;
      }
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