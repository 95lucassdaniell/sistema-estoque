import { useState, useEffect } from 'react';

// Mock data for demonstration since Supabase is not enabled
export const mockData = {
  lojas: [
    {
      id: '1',
      nome: 'Loja Centro',
      endereco: 'Rua Principal, 123 - Centro',
      telefone: '(11) 1234-5678',
      responsavel: 'Ana Silva',
      status: 'ativo' as const,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      nome: 'Loja Shopping',
      endereco: 'Shopping Center, Loja 45',
      telefone: '(11) 8765-4321',
      responsavel: 'Carlos Santos',
      status: 'ativo' as const,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z'
    }
  ],
  categorias: [
    {
      id: '1',
      nome: 'Eletrônicos',
      descricao: 'Produtos eletrônicos diversos',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      nome: 'Roupas',
      descricao: 'Vestuário em geral',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      nome: 'Casa e Jardim',
      descricao: 'Produtos para casa e jardim',
      created_at: '2024-01-01T00:00:00Z'
    }
  ],
  fornecedores: [
    {
      id: '1',
      nome: 'Tech Fornecedor Ltda',
      cnpj: '12.345.678/0001-90',
      contato: 'João Oliveira',
      telefone: '(11) 5555-0001',
      email: 'contato@techfornecedor.com',
      endereco: 'Av. Tecnologia, 500',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      nome: 'Moda & Estilo',
      cnpj: '98.765.432/0001-10',
      contato: 'Maria Costa',
      telefone: '(11) 5555-0002',
      email: 'vendas@modaestilo.com',
      endereco: 'Rua da Moda, 200',
      created_at: '2024-01-01T00:00:00Z'
    }
  ],
  produtos: [
    {
      id: '1',
      nome: 'Smartphone XYZ',
      codigo_sku: 'PHONE-001',
      categoria_id: '1',
      fornecedor_id: '1',
      descricao: 'Smartphone com tela de 6.5 polegadas',
      unidade_medida: 'un',
      valor_unitario: 800.00,
      preco: 1200.00,
      status: 'ativo' as const,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      nome: 'Camiseta Básica',
      codigo_sku: 'SHIRT-001',
      categoria_id: '2',
      fornecedor_id: '2',
      descricao: 'Camiseta 100% algodão',
      unidade_medida: 'un',
      valor_unitario: 15.00,
      preco: 35.00,
      status: 'ativo' as const,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  usuarios: [
    {
      id: '1',
      nome: 'Administrador',
      email: 'admin@gruplet.com',
      nivel_acesso: 'admin_geral' as const,
      lojas_permitidas: ['1', '2'],
      status: 'ativo' as const,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      nome: 'Gerente Centro',
      email: 'gerente@gruplet.com',
      nivel_acesso: 'gerente_loja' as const,
      lojas_permitidas: ['1'],
      status: 'ativo' as const,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  estoque: [
    {
      id: '1',
      produto_id: '1',
      loja_id: '1',
      quantidade_atual: 15,
      estoque_minimo: 5,
      estoque_maximo: 50,
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      produto_id: '2',
      loja_id: '1',
      quantidade_atual: 3,
      estoque_minimo: 10,
      estoque_maximo: 100,
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  movimentacoes: [
    {
      id: '1',
      produto_id: '1',
      loja_id: '1',
      tipo: 'entrada' as const,
      subtipo: 'compra' as const,
      quantidade: 20,
      quantidade_anterior: 0,
      motivo: 'Compra inicial',
      usuario_id: '1',
      created_at: '2024-01-01T10:00:00Z'
    },
    {
      id: '2',
      produto_id: '1',
      loja_id: '1',
      tipo: 'saida' as const,
      subtipo: 'venda' as const,
      quantidade: 5,
      quantidade_anterior: 20,
      motivo: 'Venda para cliente',
      usuario_id: '2',
      created_at: '2024-01-01T14:00:00Z'
    }
  ]
};

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

// Initialize mock data in localStorage if not present
export function initializeMockData() {
  Object.entries(mockData).forEach(([key, data]) => {
    const storageKey = `estoque_let_${key}`;
    if (!localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, JSON.stringify(data));
    }
  });
}