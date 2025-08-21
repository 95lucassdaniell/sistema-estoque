import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Package, AlertCircle, Filter, Settings, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuthStore } from '@/stores/authStore';
import { useCompanyStore } from '@/stores/companyStore';
import { apiService } from '@/services/api';

interface Produto {
  id: string;
  nome: string;
  codigo: string;
  categoria: string;
  descricao?: string;
  estoque_minimo?: number;
  unidade: string;
  empresa_id: string;
  ativo: boolean;
  created_at: string;
  updated_at?: string;
}

const DEFAULT_CATEGORIAS = [
  'Eletrônicos',
  'Roupas & Acessórios',
  'Casa & Jardim',
  'Esporte & Lazer',
  'Alimentação',
  'Móveis',
  'Ferramentas',
  'Livros',
  'Outros'
];

const UNIDADES = [
  { value: 'un', label: 'Unidade' },
  { value: 'kg', label: 'Quilograma' },
  { value: 'g', label: 'Grama' },
  { value: 'lt', label: 'Litro' },
  { value: 'ml', label: 'Mililitro' },
  { value: 'm', label: 'Metro' },
  { value: 'cm', label: 'Centímetro' },
  { value: 'pc', label: 'Peça' },
  { value: 'cx', label: 'Caixa' },
  { value: 'pct', label: 'Pacote' }
];

type SortField = 'nome' | 'codigo' | 'categoria' | 'created_at';
type SortDirection = 'asc' | 'desc';

export default function Produtos() {
  const { profile } = useAuthStore();
  const { selectedCompany } = useCompanyStore();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<string[]>(DEFAULT_CATEGORIAS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Dialogs
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Produto | null>(null);
  
  // Forms
  const [productFormData, setProductFormData] = useState({
    nome: '',
    codigo: '',
    categoria: '',
    descricao: '',
    estoque_minimo: '',
    unidade: 'un',
    ativo: true
  });
  
  const [categoryFormData, setCategoryFormData] = useState({
    nome: '',
    descricao: '',
    icone: ''
  });
  
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Load products on component mount and when company changes
  useEffect(() => {
    loadProdutos();
  }, [selectedCompany]);

  const loadProdutos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getProdutos({
        filters: selectedCompany ? { empresa_id: selectedCompany.id } : undefined
      });

      if (response.error) {
        setError(response.error);
      } else {
        setProdutos(response.data || []);
      }
    } catch (err) {
      setError('Erro ao carregar produtos');
    }
    
    setLoading(false);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const handleAddProduto = () => {
    if (!selectedCompany) {
      setError('Selecione uma empresa para cadastrar produtos.');
      return;
    }

    setEditingProduto(null);
    setProductFormData({
      nome: '',
      codigo: '',
      categoria: '',
      descricao: '',
      estoque_minimo: '',
      unidade: 'un',
      ativo: true
    });
    setFormErrors({});
    setIsProductDialogOpen(true);
  };

  const handleEditProduto = (produto: Produto) => {
    setEditingProduto(produto);
    setProductFormData({
      nome: produto.nome,
      codigo: produto.codigo,
      categoria: produto.categoria,
      descricao: produto.descricao || '',
      estoque_minimo: produto.estoque_minimo?.toString() || '',
      unidade: produto.unidade,
      ativo: produto.ativo
    });
    setFormErrors({});
    setIsProductDialogOpen(true);
  };

  const validateProductForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!productFormData.nome?.trim()) errors.nome = 'Nome do produto é obrigatório';
    if (!productFormData.codigo?.trim()) errors.codigo = 'Código do produto é obrigatório';
    if (!productFormData.categoria?.trim()) errors.categoria = 'Categoria é obrigatória';
    if (productFormData.estoque_minimo && isNaN(parseInt(productFormData.estoque_minimo))) {
      errors.estoque_minimo = 'Estoque mínimo deve ser um número';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProduct = async () => {
    if (!validateProductForm() || !selectedCompany) return;

    setSaving(true);
    setError(null);

    const produtoData = {
      nome: productFormData.nome.trim(),
      codigo: productFormData.codigo.trim().toUpperCase(),
      categoria: productFormData.categoria,
      descricao: productFormData.descricao?.trim() || undefined,
      estoque_minimo: productFormData.estoque_minimo ? parseInt(productFormData.estoque_minimo) : undefined,
      unidade_medida: productFormData.unidade,
      status: productFormData.ativo ? 'ativo' : 'inativo',
      ...(editingProduto ? {} : { empresa_id: selectedCompany.id })
    };

    let response;
    if (editingProduto) {
      response = await apiService.updateProduto(editingProduto.id, produtoData);
    } else {
      response = await apiService.createProduto(produtoData as any);
    }

    if (response.error) {
      setError(response.error);
    } else {
      setIsProductDialogOpen(false);
      setEditingProduto(null);
      setProductFormData({
        nome: '', codigo: '', categoria: '', descricao: '',
        estoque_minimo: '', unidade: 'un', ativo: true
      });
      await loadProdutos();
    }

    setSaving(false);
  };

  const handleDelete = async (produto: Produto) => {
    const response = await apiService.deleteProduto(produto.id);
    
    if (response.error) {
      setError(response.error);
    } else {
      setShowDeleteConfirm(null);
      await loadProdutos();
    }
  };

  const updateProductFormData = (field: string, value: string | boolean) => {
    setProductFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getCategoryIcon = (categoryName: string): string => {
    const icons: Record<string, string> = {
      'Eletrônicos': '📱',
      'Roupas & Acessórios': '👕',
      'Casa & Jardim': '🏠',
      'Esporte & Lazer': '⚽',
      'Alimentação': '🍎',
      'Móveis': '🪑',
      'Ferramentas': '🔧',
      'Livros': '📚',
      'Outros': '📦'
    };
    return icons[categoryName] || '📂';
  };

  // Filter and sort products
  const filteredAndSortedProdutos = produtos
    .filter(produto => {
      const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           produto.codigo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategoria || selectedCategoria === 'all' || produto.categoria === selectedCategoria;
      const matchesStatus = !selectedStatus || selectedStatus === 'all' || 
                           (selectedStatus === 'ativo' && produto.ativo) ||
                           (selectedStatus === 'inativo' && !produto.ativo);
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Check permissions
  const canManageProducts = profile?.nivel_acesso === 'admin_geral' || profile?.nivel_acesso === 'admin_empresa';

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Carregando produtos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Produtos</h1>
          <p className="text-gray-600 mt-1">
            {selectedCompany ? `Produtos da ${selectedCompany.nome}` : 'Selecione uma empresa'}
          </p>
        </div>
        {canManageProducts && (
          <div className="flex space-x-2">
            <Button onClick={handleAddProduto} disabled={!selectedCompany}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Company Warning */}
      {!selectedCompany && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Selecione uma empresa no menu lateral para visualizar e gerenciar produtos.
          </AlertDescription>
        </Alert>
      )}

      {selectedCompany && (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Buscar produtos</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Digite nome ou código..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="w-48">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categorias.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-48">
                  <Label htmlFor="status">Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Produtos Cadastrados ({filteredAndSortedProdutos.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredAndSortedProdutos.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || selectedCategoria ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || selectedCategoria 
                      ? 'Tente ajustar os filtros para encontrar produtos.' 
                      : 'Comece adicionando o primeiro produto.'}
                  </p>
                  {!searchTerm && !selectedCategoria && canManageProducts && (
                    <Button onClick={handleAddProduto}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Primeiro Produto
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50" 
                          onClick={() => handleSort('codigo')}
                        >
                          <div className="flex items-center">
                            Código
                            {getSortIcon('codigo')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50" 
                          onClick={() => handleSort('nome')}
                        >
                          <div className="flex items-center">
                            Nome
                            {getSortIcon('nome')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50" 
                          onClick={() => handleSort('categoria')}
                        >
                          <div className="flex items-center">
                            Categoria
                            {getSortIcon('categoria')}
                          </div>
                        </TableHead>
                        <TableHead>Estoque Mín.</TableHead>
                        <TableHead>Unidade</TableHead>
                        <TableHead>Status</TableHead>
                        {canManageProducts && <TableHead>Ações</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedProdutos.map((produto) => (
                        <TableRow key={produto.id} className="hover:bg-gray-50">
                          <TableCell className="font-mono text-sm">{produto.codigo}</TableCell>
                          <TableCell className="font-medium">{produto.nome}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{produto.categoria}</Badge>
                          </TableCell>
                          <TableCell>{produto.estoque_minimo || '-'}</TableCell>
                          <TableCell>{produto.unidade}</TableCell>
                          <TableCell>
                            <Badge variant={produto.ativo ? 'default' : 'secondary'}>
                              {produto.ativo ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          {canManageProducts && (
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditProduto(produto)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowDeleteConfirm(produto)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Product Form Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduto ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
            <DialogDescription>
              {editingProduto 
                ? 'Atualize as informações do produto selecionado.'
                : 'Preencha os dados para cadastrar um novo produto.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome do Produto *</Label>
                <Input
                  id="nome"
                  value={productFormData.nome}
                  onChange={(e) => updateProductFormData('nome', e.target.value)}
                  placeholder="Ex: Notebook Dell Inspiron"
                />
                {formErrors.nome && <p className="text-sm text-red-600 mt-1">{formErrors.nome}</p>}
              </div>
              
              <div>
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  id="codigo"
                  value={productFormData.codigo}
                  onChange={(e) => updateProductFormData('codigo', e.target.value.toUpperCase())}
                  placeholder="Ex: NB001"
                />
                {formErrors.codigo && <p className="text-sm text-red-600 mt-1">{formErrors.codigo}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categoria">Categoria *</Label>
                <Select value={productFormData.categoria} onValueChange={(value) => updateProductFormData('categoria', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.categoria && <p className="text-sm text-red-600 mt-1">{formErrors.categoria}</p>}
              </div>

              <div>
                <Label htmlFor="unidade">Unidade</Label>
                <Select value={productFormData.unidade} onValueChange={(value) => updateProductFormData('unidade', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIDADES.map((unidade) => (
                      <SelectItem key={unidade.value} value={unidade.value}>{unidade.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="estoque_minimo">Estoque Mínimo</Label>
              <Input
                id="estoque_minimo"
                type="number"
                min="0"
                value={productFormData.estoque_minimo}
                onChange={(e) => updateProductFormData('estoque_minimo', e.target.value)}
                placeholder="Ex: 5"
              />
              {formErrors.estoque_minimo && <p className="text-sm text-red-600 mt-1">{formErrors.estoque_minimo}</p>}
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={productFormData.descricao}
                onChange={(e) => updateProductFormData('descricao', e.target.value)}
                placeholder="Descrição detalhada do produto..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="ativo"
                checked={productFormData.ativo}
                onCheckedChange={(checked) => updateProductFormData('ativo', checked)}
              />
              <Label htmlFor="ativo">Produto ativo</Label>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsProductDialogOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleSaveProduct} disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {editingProduto ? 'Atualizando...' : 'Cadastrando...'}
                  </>
                ) : (
                  editingProduto ? 'Atualizar Produto' : 'Cadastrar Produto'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o produto "{showDeleteConfirm?.nome}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
            >
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}