import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Search, Beaker, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { apiService } from '@/services/api';
import type { MateriaPrima } from '@/types/database';

export default function MateriaPrimaPage() {
  const [materiasPrimas, setMateriasPrimas] = useState<MateriaPrima[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMateriasPrimas();
  }, []);

  const fetchMateriasPrimas = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMateriaPrima();

      if (response.error) {
        setError(response.error);
      } else {
        setMateriasPrimas(response.data || []);
      }
    } catch (error) {
      setError('Erro ao carregar matéria-prima');
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterias = materiasPrimas.filter(materia =>
    materia.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    materia.categoria.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">Matéria-Prima</h1>
          <p className="text-gray-600">Gerencie a matéria-prima utilizada na produção</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Matéria-Prima
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
              placeholder="Buscar matéria-prima..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Matéria-Prima */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5" />
            Matérias-Primas ({filteredMaterias.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Preço Unitário</TableHead>
                  <TableHead>Cadastrado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterias.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {searchTerm ? 'Nenhuma matéria-prima encontrada' : 'Nenhuma matéria-prima cadastrada'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMaterias.map((materia) => (
                    <TableRow key={materia.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{materia.nome}</p>
                          {materia.descricao && (
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {materia.descricao}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{materia.categoria}</Badge>
                      </TableCell>
                      <TableCell>{materia.unidade_medida}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(materia.preco_unitario)}
                      </TableCell>
                      <TableCell>
                        {new Date(materia.created_at).toLocaleDateString('pt-BR')}
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