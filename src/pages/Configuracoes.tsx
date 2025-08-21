import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, User, Bell, Shield, Database } from 'lucide-react';

export default function Configuracoes() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Gerencie as configurações do sistema</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Perfil do Usuário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Altere suas informações pessoais e senha</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-600" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Configure alertas e notificações do sistema</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Configurações de segurança e acesso</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-600" />
              Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Configurações gerais do sistema</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600" />
              Preferências
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Personalize sua experiência no sistema</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}