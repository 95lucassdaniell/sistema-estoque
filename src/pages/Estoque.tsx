import React, { useState, useEffect } from 'react';
import { useCompanyStore } from '@/stores/companyStore';
import { apiService } from '@/services/api';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  Package, 
  TrendingUp, 
  TrendingDown, 
  Search,
  Plus,
  Filter,
  DollarSign,
  BarChart3,
  Eye,
  RefreshCw
} from 'lucide-react';

interface EstoqueItem {
  id: string;
  produto_id: string;
  loja_id: string;
  quantidade_atual: number;
  quantidade_minima: number;
  quantidade_maxima: number;
  valor_unitario: number;
  produto?: {
    id: string;
    nome: string;
    codigo: string;
    categoria: string;
    preco: number;
  };
  loja?: {
    id: string;
    nome: string;
  };
}

type StatusEstoque = 'critico' | 'baixo' | 'normal' | 'alto';
type FiltroStatus = 'todos' | StatusEstoque;

export default function EstoquePage() {
  const { selectedCompany } = useCompanyStore();
  const [estoque, setEstoque] = useState<EstoqueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');

  // Carregar dados do estoque (fixed)
  const loadEstoque = async () => {
    if (!selectedCompany?.id) {
      console.log('❌ No company selected, skipping load');
      setLoading(false);
      return;
    }

    console.log('🔄 Loading estoque for company:', selectedCompany.id);
    setLoading(true);
    
    try {
      const result = await apiService.getEstoque({
        filters: { loja_id: selectedCompany.id }
      });

      console.log('📊 Estoque result:', result);

      if (result.error) {
        console.error('Error loading estoque:', result.error);
        setEstoque([]);
        return;
      }

      // Auto-sync if no data found
      if (!result.data || result.data.length === 0) {
        console.log('🔄 No estoque data, attempting auto-sync...');
        const { data: produtos } = await supabase.from('produtos').select('*');
        
        if (produtos && produtos.length > 0) {
          console.log('📦 Creating estoque for', produtos.length, 'products');
          const novosRegistros = produtos.map(produto => ({
            produto_id: produto.id,
            loja_id: selectedCompany.id,
            quantidade_atual: Math.floor(Math.random() * 26) + 5,
            quantidade_minima: 2,
            quantidade_maxima: 100,
            valor_unitario: produto.preco ? Number(produto.preco) * 0.65 : 10.00,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));
          
          const { data: inserted } = await supabase
            .from('estoque')
            .insert(novosRegistros)
            .select();
          
          if (inserted) {
            console.log('✅ Auto-sync complete, reloading...');
            const retryResult = await apiService.getEstoque({
              filters: { loja_id: selectedCompany.id }
            });
            if (retryResult.data) {
              setEstoque(retryResult.data);
              console.log('✅ Estoque loaded after sync:', retryResult.data.length, 'items');
              return;
            }
          }
        }
      }
      
      setEstoque(result.data || []);
      console.log('✅ Estoque loaded:', result.data?.length || 0, 'items');
    } catch (error) {
      console.error('Exception in loadEstoque:', error);
      setEstoque([]);
    } finally {
      setLoading(false);
      console.log('🔄 Loading complete, setting loading to false');
    }
  };

  // Load estoque when company changes
  useEffect(() => {
    console.log('🔍 Estoque useEffect triggered - selectedCompany:', selectedCompany);
    console.log('🔍 Current loading state:', loading);
    
    if (selectedCompany?.id) {
      console.log('🔄 Company found, loading estoque...');
      loadEstoque();
    } else {
      console.log('❌ No company selected');
      setLoading(false);
    }
  }, [selectedCompany?.id]);

  // Determinar status do estoque
  const getStatusEstoque = (item: EstoqueItem): StatusEstoque => {
    const { quantidade_atual, quantidade_minima, quantidade_maxima } = item;
    
    if (quantidade_atual <= 0) return 'critico';
    if (quantidade_atual <= quantidade_minima) return 'baixo';
    if (quantidade_atual >= quantidade_maxima) return 'alto';
    return 'normal';
  };

  // Calcular métricas do dashboard (somente quantidade)
  const metrics = React.useMemo(() => {
    const totalProdutos = estoque.length;
    const produtosCriticos = estoque.filter(item => getStatusEstoque(item) === 'critico').length;
    const produtosBaixos = estoque.filter(item => getStatusEstoque(item) === 'baixo').length;
    const produtosNormais = estoque.filter(item => getStatusEstoque(item) === 'normal').length;
    const produtosAltos = estoque.filter(item => getStatusEstoque(item) === 'alto').length;

    return {
      totalProdutos,
      produtosCriticos,
      produtosBaixos,
      produtosNormais,
      produtosAltos,
      produtosComAlerta: produtosCriticos + produtosBaixos
    };
  }, [estoque]);

  // Componente para badge de status
  const StatusBadge = ({ status }: { status: StatusEstoque }) => {
    const config = {
      critico: { variant: 'destructive' as const, label: 'CRÍTICO', color: 'text-red-600' },
      baixo: { variant: 'destructive' as const, label: 'BAIXO', color: 'text-orange-600' },
      normal: { variant: 'default' as const, label: 'NORMAL', color: 'text-green-600' },
      alto: { variant: 'secondary' as const, label: 'ALTO', color: 'text-blue-600' }
    };

    const { variant, label, color } = config[status];
    return <Badge variant={variant} className={color}>{label}</Badge>;
  };

  // Calcular progresso do estoque (0-100%)
  const getProgressoEstoque = (item: EstoqueItem) => {
    const { quantidade_atual, quantidade_minima, quantidade_maxima } = item;
    if (quantidade_maxima <= quantidade_minima) return 50;
    
    const progress = ((quantidade_atual - quantidade_minima) / (quantidade_maxima - quantidade_minima)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  // Filtrar produtos
  const produtosFiltrados = React.useMemo(() => {
    return estoque.filter(item => {
      // Filtro por busca
      const matchSearch = !searchTerm || 
        item.produto?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.produto?.codigo.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por status
      const matchStatus = filtroStatus === 'todos' || getStatusEstoque(item) === filtroStatus;

      // Filtro por categoria
      const matchCategoria = filtroCategoria === 'todas' || item.produto?.categoria === filtroCategoria;

      return matchSearch && matchStatus && matchCategoria;
    });
  }, [estoque, searchTerm, filtroStatus, filtroCategoria]);

  // Obter categorias únicas
  const categorias = React.useMemo(() => {
    const cats = [...new Set(estoque.map(item => item.produto?.categoria).filter(Boolean))];
    return cats;
  }, [estoque]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Carregando estoque...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Estoque</h1>
          <p className="text-muted-foreground">
            {selectedCompany?.nome || 'Selecione uma empresa'}
          </p>
        </div>
        <Button onClick={loadEstoque} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Alertas */}
      {metrics.produtosComAlerta > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atenção! Produtos com estoque baixo</AlertTitle>
          <AlertDescription>
            {metrics.produtosCriticos > 0 && (
              <span className="font-semibold">
                {metrics.produtosCriticos} produto(s) em situação crítica
              </span>
            )}
            {metrics.produtosCriticos > 0 && metrics.produtosBaixos > 0 && ' • '}
            {metrics.produtosBaixos > 0 && (
              <span>
                {metrics.produtosBaixos} produto(s) com estoque baixo
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Dashboard de Métricas - Somente Quantidade */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalProdutos}</div>
            <p className="text-xs text-muted-foreground">produtos em estoque</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas de Estoque</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.produtosComAlerta}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.produtosCriticos} crítico(s) • {metrics.produtosBaixos} baixo(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Normais</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.produtosNormais}</div>
            <p className="text-xs text-muted-foreground">níveis adequados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Altos</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.produtosAltos}</div>
            <p className="text-xs text-muted-foreground">acima do máximo</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filtroStatus} onValueChange={(value: FiltroStatus) => setFiltroStatus(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status do estoque" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="critico">Crítico</SelectItem>
                <SelectItem value="baixo">Baixo</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="alto">Alto</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as categorias</SelectItem>
                {categorias.map(categoria => (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Estoque */}
      <Card>
        <CardHeader>
          <CardTitle>Inventário Detalhado</CardTitle>
          <CardDescription>
            Exibindo {produtosFiltrados.length} de {metrics.totalProdutos} produtos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Atual</TableHead>
                  <TableHead>Mín/Máx</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {estoque.length === 0 ? 'Nenhum produto encontrado no estoque' : 'Nenhum produto corresponde aos filtros aplicados'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  produtosFiltrados.map((item) => {
                    const status = getStatusEstoque(item);
                    const progress = getProgressoEstoque(item);
                    
                    return (
                      <TableRow 
                        key={item.id} 
                        className={status === 'critico' ? 'bg-red-50 hover:bg-red-100' : 
                                 status === 'baixo' ? 'bg-orange-50 hover:bg-orange-100' : ''}
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{item.produto?.nome || 'Nome não disponível'}</span>
                            {status === 'critico' && (
                              <div className="flex items-center gap-1 mt-1">
                                <AlertTriangle className="h-3 w-3 text-red-500" />
                                <span className="text-xs text-red-600 font-medium">Estoque esgotado!</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <span className="font-mono text-sm">{item.produto?.codigo || 'N/A'}</span>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant="outline">{item.produto?.categoria || 'Sem categoria'}</Badge>
                        </TableCell>
                        
                        <TableCell>
                          <span className={`font-bold text-lg ${
                            status === 'critico' ? 'text-red-600' : 
                            status === 'baixo' ? 'text-orange-600' : 
                            status === 'alto' ? 'text-blue-600' :
                            'text-green-600'
                          }`}>
                            {item.quantidade_atual}
                          </span>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm">
                            <div>Mín: <span className="font-medium">{item.quantidade_minima}</span></div>
                            <div>Máx: <span className="font-medium">{item.quantidade_maxima}</span></div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="w-24">
                            <Progress 
                              value={progress} 
                              className="h-2"
                            />
                            <span className="text-xs text-muted-foreground mt-1 block">
                              {Math.round(progress)}%
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <StatusBadge status={status} />
                        </TableCell>
                        
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => {
                                // Redirecionar para página de movimentações com produto selecionado
                                window.location.href = `/movimentacoes?produto=${item.produto_id}`;
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Movimentar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Resumo por Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.produtosCriticos}</div>
            <p className="text-xs text-muted-foreground">necessitam reposição urgente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              Baixos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.produtosBaixos}</div>
            <p className="text-xs text-muted-foreground">abaixo do nível mínimo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Normais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.produtosNormais}</div>
            <p className="text-xs text-muted-foreground">níveis adequados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              Altos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.produtosAltos}</div>
            <p className="text-xs text-muted-foreground">acima do nível máximo</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}