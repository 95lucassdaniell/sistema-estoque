import { Bell, Search, User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Header() {
  const { profile, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  const getUserInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getNivelAcessoLabel = (nivel: string) => {
    const labels = {
      admin_geral: 'Admin Geral',
      gerente_loja: 'Gerente',
      operador: 'Operador',
      consulta: 'Consulta'
    };
    return labels[nivel as keyof typeof labels] || nivel;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16">
      <div className="flex items-center justify-between px-6 h-full">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LET</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">GRUPO LET</h1>
              <p className="text-xs text-gray-500">Sistema de Estoque</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar produtos, lojas..."
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              3
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                    {profile ? getUserInitials(profile.nome) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {profile?.nome || 'Usuário'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {profile ? getNivelAcessoLabel(profile.nivel_acesso) : ''}
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}