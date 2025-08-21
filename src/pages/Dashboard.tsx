import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Store, 
  Package, 
  ArrowUpDown, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Eye,
  RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DashboardMetrics, EstoqueBaixo, MovimentacaoChart } from '@/types';
import { apiService } from '@/services/api';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [estoqueBaixo, setEstoqueBaixo] = useState<EstoqueBaixo[]>([]);
  const [chartData, setChartData] = useState<MovimentacaoChart[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { currentLoja, lojas } = useAppStore();
  const { userProfile, hasAccessToLoja } = useAuthStore();

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load dashboard stats
      const statsResponse = await apiService.getDashboardStats();
      if (statsResponse.data) {
        const stats = statsResponse.data;
        setMetrics({
          total_lojas: stats.totalLojas,
          total_produtos: stats.totalProdutos,
          total_movimentacoes_hoje: stats.movimentacoesSemana, // Using week data as proxy
          produtos_estoque_baixo: stats.estoquesBaixos
        });
      }

      // Load low stock items
      const estoqueResponse = await apiService.getEstoque({
        filters: { status: 'baixo' },
        limit: 5
      });
      if (estoqueResponse.data) {
        const estoqueBaixoData = estoqueResponse.data.map(item => ({
          produto: { nome: item.produto?.nome || item.materia_prima?.nome || 'Item desconhecido' },
          loja: { nome: item.loja?.nome || 'Loja desconhecida' },
          quantidade_atual: item.quantidade_atual,
          estoque_minimo: item.quantidade_minima,
          diferenca: Math.max(0, item.quantidade_minima - item.quantidade_atual)
        }));
        setEstoqueBaixo(estoqueBaixoData);
      }

      // Load recent movements for chart
      const movResponse = await apiService.getMovimentacoes({
        limit: 10,
        orderBy: 'created_at',
        orderDirection: 'desc'
      });
      if (movResponse.data) {
        // Group by date and type
        const chartData = movResponse.data.reduce((acc: any[], mov) => {
          const date = new Date(mov.created_at).toLocaleDateString('pt-BR');
          const existing = acc.find(item => item.data === date);
          
          if (existing) {
            if (mov.tipo === 'entrada') existing.entradas += mov.quantidade;
            if (mov.tipo === 'saida') existing.saidas += mov.quantidade;
          } else {
            acc.push({
              data: date,
              entradas: mov.tipo === 'entrada' ? mov.quantidade : 0,
              saidas: mov.tipo === 'saida' ? mov.quantidade : 0
            });
          }
          return acc;
        }, []);
        setChartData(chartData.slice(0, 7)); // Last 7 days
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, [currentLoja, selectedPeriod]);

  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendValue, 
    color = 'blue' 
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: 'up' | 'down';
    trendValue?: string;
    color?: 'blue' | 'green' | 'yellow' | 'red';
  }) => {
    const colorClasses = {
      blue: 'bg-blue-500 text-blue-50',
      green: 'bg-green-500 text-green-50',
      yellow: 'bg-yellow-500 text-yellow-50',
      red: 'bg-red-500 text-red-50'
    };

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold">{value}</p>
              {trend && trendValue && (
                <div className="flex items-center mt-2">
                  {trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {trendValue}
                  </span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-full ${colorClasses[color]}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do sistema de estoque</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Lojas"
          value={metrics?.total_lojas || 0}
          icon={Store}
          color="blue"
        />
        <MetricCard
          title="Produtos Cadastrados"
          value={metrics?.total_produtos || 0}
          icon={Package}
          color="green"
        />
        <MetricCard
          title="Movimentações Hoje"
          value={metrics?.total_movimentacoes_hoje || 0}
          icon={ArrowUpDown}
          color="blue"
        />
        <MetricCard
          title="Estoque Baixo"
          value={metrics?.produtos_estoque_baixo || 0}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Movement Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Movimentações por Período</CardTitle>
            <CardDescription>
              Entradas e saídas dos últimos {selectedPeriod} dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="entradas" fill="#10b981" name="Entradas" />
                <Bar dataKey="saidas" fill="#ef4444" name="Saídas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stock Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status do Estoque</CardTitle>
            <CardDescription>
              Produtos com estoque abaixo do mínimo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {estoqueBaixo.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Todos os produtos estão com estoque adequado</p>
                </div>
              ) : (
                estoqueBaixo.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.produto.nome}</p>
                      <p className="text-sm text-gray-600">{item.loja.nome}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">
                        {item.quantidade_atual} / {item.estoque_minimo}
                      </Badge>
                      <p className="text-xs text-red-600 mt-1">
                        Faltam {item.diferenca} unidades
                      </p>
                    </div>
                  </div>
                ))
              )}
              {estoqueBaixo.length > 5 && (
                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver todos ({estoqueBaixo.length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>
            Últimas movimentações do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* This would show recent movements */}
            <div className="text-center py-8 text-gray-500">
              <ArrowUpDown className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma movimentação recente</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}