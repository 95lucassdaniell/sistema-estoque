import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { initializeMockData } from '@/hooks/useLocalStorage';
import { LoadingPage } from '@/components/common/LoadingSpinner';

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Initialize mock data for demo
    initializeMockData();
    
    if (!isLoading) {
      if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  return <LoadingPage />;
}