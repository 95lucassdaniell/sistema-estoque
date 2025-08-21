import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Building2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/stores/authStore';
import { apiService } from '@/services/api';
import type { Empresa } from '@/types/database';

export default function Empresas() {
  const { profile } = useAuthStore();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    endereco: '',
    telefone: '',
    ativo: true
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Load empresas on component mount
  useEffect(() => {
    loadEmpresas();
  }, []);

  const loadEmpresas = async () => {
    setLoading(true);
    setError(null);
    
    const response = await apiService.getEmpresas();

    if (response.error) {
      setError(response.error);
    } else {
      setEmpresas(response.data || []);
    }
    
    setLoading(false);
  };

  // Reload when search term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      loadEmpresas();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleAddEmpresa = () => {
    setEditingEmpresa(null);
    setFormData({
      nome: '',
      cnpj: '',
      endereco: '',
      telefone: '',
      ativo: true
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleEditEmpresa = (empresa: Empresa) => {
    setEditingEmpresa(empresa);
    setFormData({
      nome: empresa.nome,
      cnpj: empresa.cnpj || '',
      endereco: empresa.endereco || '',
      telefone: empresa.telefone || '',
      ativo: empresa.ativo
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.nome?.trim()) errors.nome = 'Nome da empresa é obrigatório';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    console.log('🔧 BOTÃO SALVAR CLICADO!');
    console.log('🔧 Dados do formulário:', formData);
    console.log('🔧 Editando empresa:', editingEmpresa);
    
    if (!validateForm()) {
      console.log('🚨 Formulário inválido, parando execução');
      return;
    }

    setSaving(true);
    setError(null);

    const empresaData = {
      nome: formData.nome.trim(),
      cnpj: formData.cnpj?.trim() || null,
      endereco: formData.endereco?.trim() || null,
      telefone: formData.telefone?.trim() || null,
      ativo: formData.ativo
    };

    console.log('🔧 Dados preparados para API:', empresaData);

    let response;
    try {
      if (editingEmpresa) {
        console.log('🔧 Executando UPDATE empresa...');
        response = await apiService.updateEmpresa(editingEmpresa.id, empresaData);
      } else {
        console.log('🔧 Executando CREATE empresa...');
        response = await apiService.createEmpresa(empresaData);
      }
      
      console.log('🔧 Resposta da API:', response);
      
      if (response.error) {
        console.error('🚨 Erro retornado da API:', response.error);
        setError(response.error);
      } else {
        console.log('✅ Operação bem-sucedida!');
        setIsDialogOpen(false);
        setEditingEmpresa(null);
        setFormData({ nome: '', cnpj: '', endereco: '', telefone: '', ativo: true });
        await loadEmpresas(); // Reload the list
      }
    } catch (error) {
      console.error('🚨 Exception durante handleSave:', error);
      setError('Erro inesperado. Tente novamente.');
    }

    setSaving(false);
  };

  const handleDelete = async (empresa: Empresa) => {
    console.log('🔧 DEBUG: handleDelete chamado para empresa:', empresa);
    
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir a empresa "${empresa.nome}"?\n\n` +
      `⚠️ ATENÇÃO: Esta ação não pode ser desfeita!\n` +
      `Se a empresa possui lojas ou produtos associados, ela será desativada ao invés de excluída.`
    );
    
    console.log('🔧 DEBUG: Usuário confirmou exclusão?', confirmDelete);
    
    if (confirmDelete) {
      console.log('🔧 DEBUG: Iniciando processo de exclusão...');
      setError(null);
      
      try {
        const response = await apiService.deleteEmpresa(empresa.id);
        
        console.log('🔧 DEBUG: Resposta da API deleteEmpresa:', response);
        
        if (response.error) {
          console.error('🚨 DEBUG: Erro retornado:', response.error);
          
          // Check if it's a foreign key constraint error
          if (response.error.includes('foreign') || response.error.includes('constraint') || response.error.includes('violates')) {
            setError(`❌ Não é possível excluir esta empresa pois ela possui dados associados (lojas, produtos, etc). A empresa foi desativada ao invés de excluída.`);
            
            // Try to deactivate instead of delete
            console.log('🔧 DEBUG: Tentando desativar empresa ao invés de excluir...');
            const deactivateResponse = await apiService.updateEmpresa(empresa.id, { ativo: false });
            
            if (deactivateResponse.error) {
              console.error('🚨 DEBUG: Erro ao desativar:', deactivateResponse.error);
              setError(`❌ Erro ao desativar empresa: ${deactivateResponse.error}`);
            } else {
              console.log('✅ DEBUG: Empresa desativada com sucesso');
              await loadEmpresas(); // Reload the list
            }
          } else {
            setError(`❌ Erro ao excluir empresa: ${response.error}`);
          }
        } else {
          console.log('✅ DEBUG: Empresa excluída com sucesso');
          await loadEmpresas(); // Reload the list
        }
      } catch (error) {
        console.error('🚨 DEBUG: Exception durante exclusão:', error);
        setError(`❌ Erro inesperado ao excluir empresa. Tente novamente.`);
      }
    }
  };

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Filter empresas based on search
  const filteredEmpresas = empresas.filter(empresa => 
    empresa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (empresa.cnpj && empresa.cnpj.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Check permissions - only admin_geral can manage companies
  const canManageCompanies = profile?.nivel_acesso === 'admin_geral';

  if (!canManageCompanies) {
    return (
      <div className="p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-700">
            Acesso negado. Apenas administradores gerais podem gerenciar empresas.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Carregando empresas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Empresas</h1>
          <p className="text-gray-600 mt-1">Gerencie as empresas do sistema</p>
        </div>
        <Button onClick={handleAddEmpresa} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nova Empresa</span>
        </Button>
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

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar empresas</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Digite nome ou CNPJ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Empresas</p>
                <p className="text-2xl font-bold text-gray-900">{empresas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Empresas Ativas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {empresas.filter(e => e.ativo).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Empresas Inativas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {empresas.filter(e => !e.ativo).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Companies List */}
      <Card>
        <CardHeader>
          <CardTitle>Empresas Cadastradas ({filteredEmpresas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEmpresas.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma empresa encontrada</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Tente ajustar os filtros para encontrar empresas.' 
                  : 'Comece adicionando a primeira empresa.'}
              </p>
              {!searchTerm && (
                <Button onClick={handleAddEmpresa}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeira Empresa
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEmpresas.map((empresa) => (
                <Card key={empresa.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{empresa.nome}</h3>
                          <Badge variant={empresa.ativo ? 'default' : 'secondary'}>
                            {empresa.ativo ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          {empresa.cnpj && (
                            <div>
                              <p className="text-sm font-medium text-gray-600">CNPJ</p>
                              <p className="text-sm text-gray-900">{empresa.cnpj}</p>
                            </div>
                          )}
                          {empresa.telefone && (
                            <div>
                              <p className="text-sm font-medium text-gray-600">Telefone</p>
                              <p className="text-sm text-gray-900">{empresa.telefone}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-600">Cadastrada em</p>
                            <p className="text-sm text-gray-900">
                              {new Date(empresa.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>

                        {empresa.endereco && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-600">Endereço</p>
                            <p className="text-sm text-gray-900">{empresa.endereco}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditEmpresa(empresa)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(empresa)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEmpresa ? 'Editar Empresa' : 'Nova Empresa'}
            </DialogTitle>
            <DialogDescription>
              {editingEmpresa 
                ? 'Atualize as informações da empresa selecionada.'
                : 'Preencha os dados para cadastrar uma nova empresa.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome da Empresa *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => updateFormData('nome', e.target.value)}
                placeholder="Ex: GRUPO LET - Matriz"
              />
              {formErrors.nome && <p className="text-sm text-red-600 mt-1">{formErrors.nome}</p>}
            </div>
            
            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => updateFormData('cnpj', e.target.value)}
                placeholder="Ex: 12.345.678/0001-90"
              />
            </div>
            
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => updateFormData('telefone', e.target.value)}
                placeholder="Ex: (11) 3456-7890"
              />
            </div>

            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => updateFormData('endereco', e.target.value)}
                placeholder="Ex: Rua Principal, 100 - Centro"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => updateFormData('ativo', checked)}
              />
              <Label htmlFor="ativo">Empresa ativa</Label>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {editingEmpresa ? 'Atualizando...' : 'Cadastrando...'}
                  </>
                ) : (
                  editingEmpresa ? 'Atualizar Empresa' : 'Cadastrar Empresa'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}