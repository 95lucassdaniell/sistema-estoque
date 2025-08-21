import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '@/services/api';
import type { Empresa } from '@/types/database';

interface CompanyStore {
  companies: Empresa[];
  selectedCompany: Empresa | null;
  loading: boolean;
  setSelectedCompany: (company: Empresa | null) => void;
  loadCompanies: () => Promise<void>;
}

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set, get) => ({
      companies: [],
      selectedCompany: null,
      loading: false,

      setSelectedCompany: (company) => {
        console.log('Setting selected company:', company);
        set({ selectedCompany: company });
      },

      loadCompanies: async () => {
        console.log('Loading companies from database...');
        set({ loading: true });
        
        try {
          const response = await apiService.getEmpresas();
          console.log('Companies API response:', response);
          
          if (response.data && !response.error) {
            const companies = response.data;
            const current = get();
            
            console.log('Loaded companies:', companies);
            set({ companies, loading: false });
            
            // Auto-select first company if none selected or if selected company no longer exists
            const selectedExists = current.selectedCompany && 
              companies.find(c => c.id === current.selectedCompany?.id);
            
            if (!selectedExists && companies.length > 0) {
              console.log('Auto-selecting first company:', companies[0]);
              set({ selectedCompany: companies[0] });
            }
          } else {
            console.error('Error loading companies:', response.error);
            set({ companies: [], loading: false });
          }
        } catch (error) {
          console.error('Error loading companies:', error);
          set({ companies: [], loading: false });
        }
      },
    }),
    {
      name: 'company-storage',
      partialize: (state) => ({ selectedCompany: state.selectedCompany }),
    }
  )
);