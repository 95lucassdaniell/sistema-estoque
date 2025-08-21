import { useAuthStore } from '@/stores/authStore';
import { Navigate, Outlet } from 'react-router-dom';
import { Sidebar, MobileSidebar } from './Sidebar';
import { useEffect } from 'react';

export function AppLayout() {
  const { isAuthenticated, loading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b bg-white">
          <MobileSidebar />
          <div>
            <h1 className="text-lg font-semibold">GRUPO LET</h1>
            <p className="text-sm text-gray-500">Sistema de Estoque</p>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto ml-2.5">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}