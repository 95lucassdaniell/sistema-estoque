import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Bell, CheckCircle } from 'lucide-react';
import { apiService } from '@/services/api';
import type { Alerta } from '@/types/database';

export default function Alertas() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAlertas();
  }, []);

  const fetchAlertas = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAlertas();

      if (response.error) {
        setError(response.error);
      } else {
        setAlertas(response.data || []);
      }
    } catch (error) {
      setError('Erro ao carregar alertas');
    } finally {
      setLoading(false);
    }
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const colors = {
      'alta': 'bg-red-100 text-red-800',
      'media': 'bg-yellow-100 text-yellow-800',
      'baixa': 'bg-green-100 text-green-800'
    };
    
    return (
      <Badge className={colors[prioridade as keyof typeof colors]}>
        {prioridade.charAt(0).toUpperCase() + prioridade.slice(1)}
      </Badge>
    );
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Alertas</h1>
          <p className="text-gray-600">Acompanhe as notificações do sistema</p>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabela de Alertas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertas do Sistema ({alertas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Mensagem</TableHead>
                  <TableHead>Loja</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alertas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      Nenhum alerta ativo
                    </TableCell>
                  </TableRow>
                ) : (
                  alertas.map((alerta) => (
                    <TableRow key={alerta.id}>
                      <TableCell>
                        <Badge variant="outline">{alerta.tipo}</Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="truncate">{alerta.mensagem}</p>
                      </TableCell>
                      <TableCell>{alerta.loja?.nome}</TableCell>
                      <TableCell>{getPrioridadeBadge(alerta.prioridade)}</TableCell>
                      <TableCell>
                        <Badge variant={alerta.status === 'ativo' ? 'destructive' : 'default'}>
                          {alerta.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(alerta.created_at).toLocaleDateString('pt-BR')}
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