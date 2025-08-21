import { create } from 'zustand';
import { Loja, Categoria, Fornecedor } from '@/types';

interface AppState {
  // UI State
  sidebarCollapsed: boolean;
  currentLoja: string | null;
  
  // Data cache
  lojas: Loja[];
  categorias: Categoria[];
  fornecedores: Fornecedor[];
  
  // Loading states
  isLoadingLojas: boolean;
  isLoadingCategorias: boolean;
  isLoadingFornecedores: boolean;
  
  // Actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCurrentLoja: (lojaId: string | null) => void;
  setLojas: (lojas: Loja[]) => void;
  setCategorias: (categorias: Categoria[]) => void;
  setFornecedores: (fornecedores: Fornecedor[]) => void;
  setLoadingLojas: (loading: boolean) => void;
  setLoadingCategorias: (loading: boolean) => void;
  setLoadingFornecedores: (loading: boolean) => void;
  
  // Getters
  getLoja: (id: string) => Loja | undefined;
  getCategoria: (id: string) => Categoria | undefined;
  getFornecedor: (id: string) => Fornecedor | undefined;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  sidebarCollapsed: false,
  currentLoja: null,
  lojas: [],
  categorias: [],
  fornecedores: [],
  isLoadingLojas: false,
  isLoadingCategorias: false,
  isLoadingFornecedores: false,

  // Actions
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setCurrentLoja: (lojaId) => set({ currentLoja: lojaId }),
  setLojas: (lojas) => set({ lojas }),
  setCategorias: (categorias) => set({ categorias }),
  setFornecedores: (fornecedores) => set({ fornecedores }),
  setLoadingLojas: (loading) => set({ isLoadingLojas: loading }),
  setLoadingCategorias: (loading) => set({ isLoadingCategorias: loading }),
  setLoadingFornecedores: (loading) => set({ isLoadingFornecedores: loading }),

  // Getters
  getLoja: (id) => get().lojas.find(loja => loja.id === id),
  getCategoria: (id) => get().categorias.find(categoria => categoria.id === id),
  getFornecedor: (id) => get().fornecedores.find(fornecedor => fornecedor.id === id),
}));