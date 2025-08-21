import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, ArrowUpDown, AlertTriangle, Plus, TrendingUp, TrendingDown, Calendar, Building2, User } from 'lucide-react';
import { apiService } from '@/services/api';
import { useCompanyStore } from '@/stores/companyStore';
import { useAuthStore } from '@/stores/authStore';
import type { Produto, Loja } from '@/types/database';

interface Movimentacao {
  id: string;
  tipo: 'entrada' | 'saida';
  produto: Produto;
  loja: Loja;
  usuario: {
    id: string;
    nome_completo: string;
    email: string;
  };
  quantidade: number;
  data: string;
  observacoes?: string;
  created_at: string;
}

export default function Movimentacoes() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [showMovimentacaoDialog, setShowMovimentacaoDialog] = useState(false);
  const [movimentacaoData, setMovimentacaoData] = useState({
    tipo: 'entrada' as 'entrada' | 'saida',
    produto_id: '',
    quantidade: '',
    data: new Date().toISOString().split('T')[0],
    observacoes: ''
  });

  // Get current company and user from stores
  const { selectedCompany } = useCompanyStore();
  const { user, profile } = useAuthStore();

  useEffect(() => {
    fetchMovimentacoes();
    fetchProdutos();
  }, [tipoFilter]);

  const fetchMovimentacoes = async () => {
    console.log('=== INÍCIO FETCH MOVIMENTAÇÕES ===');
    
    try {
      setLoading(true);
      
      console.log('1. Filtros aplicados:', {
        tipo: tipoFilter !== 'all' ? tipoFilter : undefined,
        loja_id: selectedCompany?.id
      });
      
      // Use real API call to fetch movimentacoes
      const response = await apiService.getMovimentacoes({
        filters: {
          tipo: tipoFilter !== 'all' ? tipoFilter : undefined,
          loja_id: selectedCompany?.id
        }
      });
      
      console.log('2. Response do getMovimentacoes:', response);
      
      if (response.error) {
        console.error('3. ERRO na API:', response.error);
        setError(response.error);
        setMovimentacoes([]);
      } else {
        console.log('4. Dados brutos recebidos:', response.data);
        console.log('5. Quantidade de registros:', response.data?.length || 0);
        
        // Transform the data to match our interface
        const transformedData = (response.data || []).map((item, index) => {
          console.log(`6.${index} Transformando item:`, item);
          
          const transformed = {
            id: item.id,
            tipo: item.tipo,
            produto: item.produto || { id: item.produto_id || '', nome: 'Produto não encontrado' },
            loja: item.loja || selectedCompany || { id: item.loja_id || '', nome: 'Loja não encontrada' },
            usuario: item.usuario ? {
              id: item.usuario.id,
              nome_completo: item.usuario.nome_completo || 'Usuário não encontrado',
              email: item.usuario.email || ''
            } : {
              id: item.usuario_id || '',
              nome_completo: 'Usuário não encontrado',
              email: ''
            },
            quantidade: item.quantidade,
            data: item.data_hora?.split('T')[0] || item.created_at?.split('T')[0] || '',
            observacoes: item.observacoes,
            created_at: item.data_hora || item.created_at
          };
          
          console.log(`6.${index} Resultado transformado:`, transformed);
          return transformed;
        });
        
        console.log('7. Dados finais transformados:', transformedData);
        setMovimentacoes(transformedData);
      }
    } catch (error) {
      console.error('8. ERRO EXCEPTION no fetch:', error);
      setError('Erro ao carregar movimentações do banco de dados');
      setMovimentacoes([]);
    } finally {
      setLoading(false);
      console.log('9. Loading finalizado');
    }
    
    console.log('=== FIM FETCH MOVIMENTAÇÕES ===');
  };

  const fetchProdutos = async () => {
    try {
      const response = await apiService.getProdutos();
      if (!response.error && response.data) {
        setProdutos(response.data);
        console.log('Produtos carregados:', response.data.length);
      } else {
        console.error('Erro na resposta da API:', response.error);
        setError('Erro ao carregar produtos da base de dados');
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setError('Erro ao conectar com a base de dados');
    }
  };

  const handleNovaMovimentacao = () => {
    if (!selectedCompany) {
      setError('Selecione uma empresa no sidebar antes de criar movimentação');
      return;
    }
    if (!user) {
      setError('Usuário não encontrado. Faça login novamente');
      return;
    }
    
    setShowMovimentacaoDialog(true);
    setMovimentacaoData({
      tipo: 'entrada',
      produto_id: '',
      quantidade: '',
      data: new Date().toISOString().split('T')[0],
      observacoes: ''
    });
    setError(null);
  };

  const handleSalvarMovimentacao = async () => {
    console.log('=== INÍCIO SAVE MOVIMENTAÇÃO ===');
    
    try {
      const quantidade = parseInt(movimentacaoData.quantidade);
      
      console.log('1. Dados do formulário:', movimentacaoData);
      console.log('2. Empresa selecionada:', selectedCompany);
      console.log('3. Usuário:', user);
      console.log('4. Profile:', profile);
      
      // Validações
      if (!movimentacaoData.produto_id) {
        setError('Selecione um produto');
        return;
      }
      if (!selectedCompany) {
        setError('Nenhuma empresa selecionada');
        return;
      }
      if (!user) {
        setError('Usuário não encontrado');
        return;
      }
      if (!movimentacaoData.quantidade || quantidade <= 0) {
        setError('Quantidade deve ser maior que zero');
        return;
      }
      if (!movimentacaoData.data) {
        setError('Data é obrigatória');
        return;
      }

      // Prepare data for API call (matching database schema)
      const movimentacaoToSave = {
        tipo: movimentacaoData.tipo,
        produto_id: movimentacaoData.produto_id,
        loja_id: selectedCompany.id,
        usuario_id: user.id,
        quantidade: quantidade,
        observacoes: movimentacaoData.observacoes || null,
        motivo: movimentacaoData.observacoes || `${movimentacaoData.tipo === 'entrada' ? 'Entrada' : 'Saída'} de ${produtos.find(p => p.id === movimentacaoData.produto_id)?.nome || 'produto'}`,
        data_hora: new Date().toISOString()
      };

      console.log('5. Dados preparados para API:', movimentacaoToSave);

      // Real API call to save movimentação
      console.log('6. Chamando apiService.createMovimentacao...');
      const response = await apiService.createMovimentacao(movimentacaoToSave);
      
      console.log('7. Response da API:', response);
      
      if (response.error) {
        console.error('8. ERRO NA API:', response.error);
        setError(`Erro ao salvar movimentação: ${response.error}`);
        return;
      }

      if (!response.data) {
        console.error('9. ERRO: Response.data é null/undefined');
        setError('Erro: Dados não foram salvos corretamente');
        return;
      }

      console.log('10. SUCESSO - Movimentação salva:', response.data);

      // Success - close dialog and reset form
      setShowMovimentacaoDialog(false);
      setMovimentacaoData({
        tipo: 'entrada',
        produto_id: '',
        quantidade: '',
        data: new Date().toISOString().split('T')[0],
        observacoes: ''
      });

      console.log('11. Recarregando lista de movimentações...');
      // Refresh the movimentacoes list to show the newly created item
      await fetchMovimentacoes();

      setError(null);
      console.log('12. PROCESSO COMPLETO - Movimentação salva e lista atualizada');
      
    } catch (error) {
      console.error('13. ERRO EXCEPTION:', error);
      setError(`Erro ao salvar movimentação: ${error.message || error}`);
    }
    
    console.log('=== FIM SAVE MOVIMENTAÇÃO ===');
  };

  const getTipoBadge = (tipo: 'entrada' | 'saida') => {
    if (tipo === 'entrada') {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <TrendingUp className="h-3 w-3 mr-1" />
          Entrada
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="bg-red-100 text-red-800">
        <TrendingDown className="h-3 w-3 mr-1" />
        Saída
      </Badge>
    );
  };

  const filteredMovimentacoes = movimentacoes.filter(movimentacao => {
    const matchesSearch = !searchTerm || 
      movimentacao.produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movimentacao.loja.nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Movimentações de Estoque</h1>
          <p className="text-gray-600">Controle entradas e saídas de produtos</p>
        </div>
        <Button onClick={handleNovaMovimentacao}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Movimentação
        </Button>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por produto ou loja..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de movimentação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="entrada">📤 Entradas</SelectItem>
                <SelectItem value="saida">📥 Saídas</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setTipoFilter('all');
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Movimentações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Histórico de Movimentações ({filteredMovimentacoes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovimentacoes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Nenhuma movimentação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMovimentacoes.map((movimentacao) => (
                    <TableRow key={movimentacao.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {new Date(movimentacao.data).toLocaleDateString('pt-BR')}
                        </div>
                      </TableCell>
                      <TableCell>{getTipoBadge(movimentacao.tipo)}</TableCell>
                      <TableCell className="font-medium">{movimentacao.produto.nome}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{movimentacao.usuario.nome_completo}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{movimentacao.quantidade}</TableCell>
                      <TableCell className="text-gray-600">
                        {movimentacao.observacoes || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Nova Movimentação Dialog */}
      <Dialog open={showMovimentacaoDialog} onOpenChange={setShowMovimentacaoDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5" />
              Nova Movimentação
            </DialogTitle>
            <DialogDescription>
              Registre uma nova movimentação de entrada ou saída de estoque.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="tipo">Tipo de Movimentação *</Label>
              <Select 
                value={movimentacaoData.tipo} 
                onValueChange={(value) => setMovimentacaoData(prev => ({ ...prev, tipo: value as 'entrada' | 'saida' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">📤 Entrada de Produtos</SelectItem>
                  <SelectItem value="saida">📥 Saída de Produtos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="produto">Produto *</Label>
              <Select 
                value={movimentacaoData.produto_id}
                onValueChange={(value) => setMovimentacaoData(prev => ({ ...prev, produto_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={produtos.length > 0 ? "Selecionar produto" : "Carregando produtos..."} />
                </SelectTrigger>
                <SelectContent>
                  {produtos.length > 0 ? (
                    produtos.map((produto) => (
                      <SelectItem key={produto.id} value={produto.id}>
                        {produto.nome}
                        {produto.preco && (
                          <span className="text-sm text-gray-500 ml-2">
                            - R$ {produto.preco.toFixed(2)}
                          </span>
                        )}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-products" disabled>
                      Nenhum produto cadastrado
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {produtos.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Cadastre produtos na página "Produtos" primeiro
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="loja">Loja</Label>
              <div className="p-2 bg-gray-50 rounded border flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <span className="font-medium">
                  {selectedCompany?.nome || 'Nenhuma loja selecionada no sidebar'}
                </span>
              </div>
              {!selectedCompany && (
                <p className="text-xs text-red-500 mt-1">
                  Selecione uma empresa no sidebar primeiro
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantidade">Quantidade *</Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="1"
                  placeholder="0"
                  value={movimentacaoData.quantidade}
                  onChange={(e) => setMovimentacaoData(prev => ({ ...prev, quantidade: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  value={movimentacaoData.data}
                  onChange={(e) => setMovimentacaoData(prev => ({ ...prev, data: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Digite observações sobre a movimentação..."
                value={movimentacaoData.observacoes}
                onChange={(e) => setMovimentacaoData(prev => ({ ...prev, observacoes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowMovimentacaoDialog(false);
                  setError(null);
                }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSalvarMovimentacao}
                disabled={!movimentacaoData.produto_id || !selectedCompany || !movimentacaoData.quantidade || !user}
              >
                {movimentacaoData.tipo === 'entrada' ? '📤 Confirmar Entrada' : '📥 Confirmar Saída'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}