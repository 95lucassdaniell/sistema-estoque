import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCompanyStore } from '@/stores/companyStore';
import {
  LayoutDashboard,
  Package,
  Store,
  Archive,
  ArrowUpDown,
  Users,
  AlertTriangle,
  Settings,
  BarChart3,
  Menu,
  LogOut,
  Building2
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Visão geral do sistema'
  },
  {
    title: 'Empresas',
    href: '/empresas',
    icon: Building2,
    description: 'Gerenciar empresas'
  },
  {
    title: 'Produtos',
    href: '/produtos',
    icon: Package,
    description: 'Gerenciar produtos'
  },

  {
    title: 'Estoque',
    href: '/estoque',
    icon: Archive,
    description: 'Controle de estoque'
  },
  {
    title: 'Movimentações',
    href: '/movimentacoes',
    icon: ArrowUpDown,
    description: 'Histórico de movimentações'
  },
  {
    title: 'Usuários',
    href: '/usuarios',
    icon: Users,
    description: 'Gerenciar usuários'
  },
  {
    title: 'Alertas',
    href: '/alertas',
    icon: AlertTriangle,
    description: 'Alertas do sistema'
  },
  {
    title: 'Relatórios',
    href: '/relatorios',
    icon: BarChart3,
    description: 'Relatórios e análises'
  },
  {
    title: 'Configurações',
    href: '/configuracoes',
    icon: Settings,
    description: 'Configurações do sistema'
  }
];

interface SidebarProps {
  className?: string;
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const { logout, profile } = useAuthStore();
  const { selectedCompany, companies, setSelectedCompany, loadCompanies, loading } = useCompanyStore();

  // Load companies on component mount
  React.useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const handleLogout = async () => {
    await logout();
    onNavigate?.();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">GRUPO LET</h2>
        <p className="text-sm text-gray-500">Sistema de Estoque</p>
      </div>

      {/* Company Selector */}
      <div className="px-6 pb-4 border-b border-gray-200">
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Empresa Ativa
          </label>
          <Select 
            value={selectedCompany?.id || ''} 
            onValueChange={(value) => {
              const company = companies.find(c => c.id === value);
              console.log('Selected company:', company);
              setSelectedCompany(company || null);
            }}
          >
            <SelectTrigger className="w-full text-sm" disabled={loading}>
              <SelectValue placeholder={loading ? "Carregando..." : "Selecionar empresa"}>
                {selectedCompany && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span className="truncate">{selectedCompany.nome}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="text-sm">
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id} className="text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span className="truncate">{company.nome}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-3 border-t">
        {profile && (
          <div className="mb-3 px-3 py-2">
            <p className="text-xs font-medium text-gray-900 truncate">
              {profile.nome}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {profile.email}
            </p>
          </div>
        )}
        
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn('hidden border-r bg-white lg:block lg:w-64', className)}>
      <SidebarContent />
    </div>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0 w-64">
        <SidebarContent onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}