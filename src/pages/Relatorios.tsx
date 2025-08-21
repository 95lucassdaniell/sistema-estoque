import React, { useState, useEffect } from 'react';
import { useCompanyStore } from '@/stores/companyStore';
import { apiService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  FileText, 
  Download, 
  Filter,
  AlertTriangle,
  Package,
  TrendingUp,
  TrendingDown,
  Calendar,
  RefreshCw,
  Search
} from 'lucide-react';

interface ReportData {
  id: string;
  produto?: {
    nome: string;
    codigo: string;
    categoria: string;
  };
  quantidade_atual?: number;
  quantidade_minima?: number;
  quantidade_maxima?: number;
  tipo?: string;
  quantidade?: number;
  data?: string;
  usuario?: string;
}

const REPORT_TYPES = [
  {
    id: 'estoque-critico',
    title: 'Estoque Crítico',
    description: 'Produtos com estoque esgotado ou abaixo do mínimo',
    icon: AlertTriangle,
    color: 'text-red-600'
  },
  {
    id: 'estoque-alto',
    title: 'Estoque Alto',
    description: 'Produtos com estoque acima do máximo',
    icon: TrendingUp,
    color: 'text-blue-600'
  },
  {
    id: 'produtos-categoria',
    title: 'Produtos por Categoria',
    description: 'Distribuição de produtos por categoria',
    icon: Package,
    color: 'text-green-600'
  },
  {
    id: 'movimentacoes-periodo',
    title: 'Movimentações por Período',
    description: 'Histórico de movimentações em período específico',
    icon: Calendar,
    color: 'text-purple-600'
  }
];

export default function RelatoriosPage() {
  const { selectedCompany } = useCompanyStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [selectedReport, setSelectedReport] = useState<string>('');
  
  // Filters
  const [dateFilter, setDateFilter] = useState({
    inicio: '',
    fim: ''
  });
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadReportData = async (reportType: string) => {
    if (!selectedCompany?.id) {
      setError('Selecione uma empresa para gerar relatórios');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      let data: ReportData[] = [];
      
      switch (reportType) {
        case 'estoque-critico':
          const estoqueResult = await apiService.getEstoque({
            filters: { loja_id: selectedCompany.id }
          });
          if (estoqueResult.data) {
            data = estoqueResult.data
              .filter(item => item.quantidade_atual <= item.quantidade_minima)
              .map(item => ({
                id: item.id,
                produto: item.produto,
                quantidade_atual: item.quantidade_atual,
                quantidade_minima: item.quantidade_minima,
                quantidade_maxima: item.quantidade_maxima
              }));
          }
          break;
          
        case 'estoque-alto':
          const estoqueAltoResult = await apiService.getEstoque({
            filters: { loja_id: selectedCompany.id }
          });
          if (estoqueAltoResult.data) {
            data = estoqueAltoResult.data
              .filter(item => item.quantidade_atual >= item.quantidade_maxima)
              .map(item => ({
                id: item.id,
                produto: item.produto,
                quantidade_atual: item.quantidade_atual,
                quantidade_minima: item.quantidade_minima,
                quantidade_maxima: item.quantidade_maxima
              }));
          }
          break;
          
        case 'produtos-categoria':
          const produtosResult = await apiService.getProdutos({
            filters: { empresa_id: selectedCompany.id }
          });
          if (produtosResult.data) {
            data = produtosResult.data.map(produto => ({
              id: produto.id,
              produto: {
                nome: produto.nome,
                codigo: produto.codigo,
                categoria: produto.categoria
              }
            }));
          }
          break;
          
        case 'movimentacoes-periodo':
          const movimentacoesResult = await apiService.getMovimentacoes({
            filters: { 
              loja_id: selectedCompany.id,
              ...(dateFilter.inicio && { data_inicio: dateFilter.inicio }),
              ...(dateFilter.fim && { data_fim: dateFilter.fim })
            }
          });
          if (movimentacoesResult.data) {
            data = movimentacoesResult.data.map(mov => ({
              id: mov.id,
              produto: mov.produto,
              tipo: mov.tipo,
              quantidade: mov.quantidade,
              data: mov.created_at,
              usuario: mov.usuario?.nome || 'N/A'
            }));
          }
          break;
      }
      
      setReportData(data);
    } catch (err) {
      setError('Erro ao carregar relatório');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = (reportType: string) => {
    setSelectedReport(reportType);
    loadReportData(reportType);
  };

  const exportToCSV = () => {
    if (!reportData.length) return;
    
    const headers = getReportHeaders(selectedReport);
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => getReportRow(row, selectedReport).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${selectedReport}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getReportHeaders = (reportType: string): string[] => {
    switch (reportType) {
      case 'estoque-critico':
      case 'estoque-alto':
        return ['Código', 'Produto', 'Categoria', 'Atual', 'Mínimo', 'Máximo'];
      case 'produtos-categoria':
        return ['Código', 'Produto', 'Categoria'];
      case 'movimentacoes-periodo':
        return ['Produto', 'Tipo', 'Quantidade', 'Data', 'Usuário'];
      default:
        return [];
    }
  };

  const getReportRow = (item: ReportData, reportType: string): string[] => {
    switch (reportType) {
      case 'estoque-critico':
      case 'estoque-alto':
        return [
          item.produto?.codigo || '',
          item.produto?.nome || '',
          item.produto?.categoria || '',
          item.quantidade_atual?.toString() || '0',
          item.quantidade_minima?.toString() || '0',
          item.quantidade_maxima?.toString() || '0'
        ];
      case 'produtos-categoria':
        return [
          item.produto?.codigo || '',
          item.produto?.nome || '',
          item.produto?.categoria || ''
        ];
      case 'movimentacoes-periodo':
        return [
          item.produto?.nome || '',
          item.tipo || '',
          item.quantidade?.toString() || '',
          item.data ? new Date(item.data).toLocaleDateString('pt-BR') : '',
          item.usuario || ''
        ];
      default:
        return [];
    }
  };

  const filteredData = reportData.filter(item => {
    if (!searchTerm) return true;
    return item.produto?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
           item.produto?.codigo.toLowerCase().includes(searchTerm.toLowerCase());
  }).filter(item => {
    if (!categoryFilter || categoryFilter === 'all') return true;
    return item.produto?.categoria === categoryFilter;
  });

  const getStatusBadge = (item: ReportData) => {
    if (!item.quantidade_atual || !item.quantidade_minima || !item.quantidade_maxima) return null;
    
    if (item.quantidade_atual <= 0) {
      return <Badge variant="destructive">CRÍTICO</Badge>;
    } else if (item.quantidade_atual <= item.quantidade_minima) {
      return <Badge variant="destructive">BAIXO</Badge>;
    } else if (item.quantidade_atual >= item.quantidade_maxima) {
      return <Badge variant="secondary">ALTO</Badge>;
    }
    return <Badge>NORMAL</Badge>;
  };

  const categories = [...new Set(reportData.map(item => item.produto?.categoria).filter(Boolean))];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">
            {selectedCompany?.nome || 'Selecione uma empresa'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedReport && reportData.length > 0 && (
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Company Warning */}
      {!selectedCompany && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Selecione uma empresa no menu lateral para gerar relatórios.
          </AlertDescription>
        </Alert>
      )}

      {selectedCompany && (
        <>
          {/* Report Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {REPORT_TYPES.map((report) => {
              const Icon = report.icon;
              return (
                <Card 
                  key={report.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedReport === report.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => generateReport(report.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${report.color}`} />
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{report.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Filters */}
          {selectedReport === 'movimentacoes-periodo' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros de Período
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="data-inicio">Data Início</Label>
                    <Input
                      id="data-inicio"
                      type="date"
                      value={dateFilter.inicio}
                      onChange={(e) => setDateFilter(prev => ({ ...prev, inicio: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="data-fim">Data Fim</Label>
                    <Input
                      id="data-fim"
                      type="date"
                      value={dateFilter.fim}
                      onChange={(e) => setDateFilter(prev => ({ ...prev, fim: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Button onClick={() => loadReportData(selectedReport)}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar Relatório
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Report Results */}
          {selectedReport && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {REPORT_TYPES.find(r => r.id === selectedReport)?.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
                    <span className="text-sm text-muted-foreground">
                      {filteredData.length} registro(s)
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Category Filter */}
                {reportData.length > 0 && (
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar produto..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    {categories.length > 0 && (
                      <div className="w-48">
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Carregando relatório...</span>
                  </div>
                ) : filteredData.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum dado encontrado
                    </h3>
                    <p className="text-gray-500">
                      {reportData.length === 0 
                        ? 'Não há dados disponíveis para este relatório.'
                        : 'Nenhum registro corresponde aos filtros aplicados.'}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {getReportHeaders(selectedReport).map(header => (
                            <TableHead key={header}>{header}</TableHead>
                          ))}
                          {(selectedReport === 'estoque-critico' || selectedReport === 'estoque-alto') && (
                            <TableHead>Status</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.map((item, index) => (
                          <TableRow key={item.id || index}>
                            {getReportRow(item, selectedReport).map((cell, cellIndex) => (
                              <TableCell key={cellIndex}>{cell}</TableCell>
                            ))}
                            {(selectedReport === 'estoque-critico' || selectedReport === 'estoque-alto') && (
                              <TableCell>{getStatusBadge(item)}</TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}