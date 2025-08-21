import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Search, Users, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { apiService } from '@/services/api';
import type { Usuario } from '@/types/database';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsuarios();

      if (response.error) {
        setError(response.error);
      } else {
        setUsuarios(response.data || []);
      }
    } catch (error) {
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const getNivelBadge = (nivel: string) => {
    const colors = {
      'admin_geral': 'bg-red-100 text-red-800',
      'admin_loja': 'bg-orange-100 text-orange-800', 
      'gerente': 'bg-blue-100 text-blue-800',
      'funcionario': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={colors[nivel as keyof typeof colors]}>
        {nivel.replace('_', ' ')}
      </Badge>
    );
  };

  const filteredUsuarios = usuarios.filter(usuario =>
    (usuario.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (usuario.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-600">Gerencie os usuários do sistema</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* Barra de Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar usuários..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuários ({filteredUsuarios.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Nível de Acesso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{usuario.nome}</p>
                          {usuario.telefone && (
                            <p className="text-sm text-gray-500">{usuario.telefone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>{usuario.cargo}</TableCell>
                      <TableCell>{getNivelBadge(usuario.nivel_acesso)}</TableCell>
                      <TableCell>
                        <Badge variant={usuario.status === 'ativo' ? 'default' : 'secondary'}>
                          {usuario.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}