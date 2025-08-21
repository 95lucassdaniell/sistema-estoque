import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Empresas from '@/pages/Empresas';
import Produtos from '@/pages/Produtos';

import Estoque from '@/pages/Estoque';
import Movimentacoes from '@/pages/Movimentacoes';
import Usuarios from '@/pages/Usuarios';
import Alertas from '@/pages/Alertas';
import Configuracoes from '@/pages/Configuracoes';
import Relatorios from '@/pages/Relatorios';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/empresas" element={<Empresas />} />
            <Route path="/produtos" element={<Produtos />} />

            <Route path="/estoque" element={<Estoque />} />
            <Route path="/movimentacoes" element={<Movimentacoes />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/alertas" element={<Alertas />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;