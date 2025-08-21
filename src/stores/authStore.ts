import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cargo: string;
  nivel_acesso: 'admin_geral' | 'admin_loja' | 'gerente' | 'funcionario';
  lojas_associadas?: string[];
  status: 'ativo' | 'inativo';
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (email: string, password: string, userData: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  fetchUserProfile: (userId: string) => Promise<void>;
  clearError: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: false,
      error: null,
      isAuthenticated: false,

      clearError: () => set({ error: null }),

      initialize: async () => {
        try {
          set({ loading: true, error: null });
          
          // Get current session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            throw sessionError;
          }

          if (session?.user) {
            set({ user: session.user, isAuthenticated: true });
            await get().fetchUserProfile(session.user.id);
          } else {
            set({ user: null, profile: null, isAuthenticated: false });
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              set({ user: session.user, isAuthenticated: true, error: null });
              await get().fetchUserProfile(session.user.id);
            } else if (event === 'SIGNED_OUT') {
              set({ user: null, profile: null, isAuthenticated: false });
            }
          });

        } catch (error: any) {
          console.error('Auth initialization error:', error);
          set({ error: error.message || 'Erro na inicialização da autenticação' });
        } finally {
          set({ loading: false });
        }
      },

      fetchUserProfile: async (userId: string) => {
        try {
          // Use email to find user with correct field name
          const { data: profile, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', get().user?.email)
            .single();

          if (error) {
            if (error.code === 'PGRST116') {
              // User not found in usuarios table, create default profile
              const currentUser = get().user;
              if (currentUser) {
                const defaultProfile = {
                  nome_completo: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Usuário',
                  email: currentUser.email || '',
                  cargo: 'Funcionário',
                  nivel_acesso: 'funcionario' as const,
                  status: 'ativo' as const
                };

                const { data: newProfile, error: insertError } = await supabase
                  .from('usuarios')
                  .insert(defaultProfile)
                  .select()
                  .single();

                if (insertError) {
                  throw insertError;
                }

                set({ profile: newProfile as UserProfile });
              }
            } else {
              console.error('Error fetching user profile:', error);
              // Set default profile to prevent app crash
              set({ profile: {
                id: userId,
                nome: 'Usuário Padrão',
                email: get().user?.email || 'user@example.com',
                cargo: 'Funcionário',
                nivel_acesso: 'funcionario',
                status: 'ativo'
              } as UserProfile });
            }
          } else {
            // Map nome_completo to nome for compatibility
            const mappedProfile = {
              ...profile,
              nome: profile.nome_completo || profile.nome || 'Usuário'
            };
            set({ profile: mappedProfile as UserProfile });
          }
        } catch (error: any) {
          console.error('Error fetching user profile:', error);
          // Set default profile to prevent app crash
          set({ profile: {
            id: userId,
            nome: 'Usuário Padrão',
            email: get().user?.email || 'user@example.com',
            cargo: 'Funcionário',
            nivel_acesso: 'funcionario',
            status: 'ativo'
          } as UserProfile });
        }
      },

      login: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });

          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password
          });

          if (error) {
            set({ error: error.message });
            return { success: false, error: error.message };
          }

          if (data.user) {
            set({ user: data.user, isAuthenticated: true });
            await get().fetchUserProfile(data.user.id);
            return { success: true };
          }

          return { success: false, error: 'Falha na autenticação' };

        } catch (error: any) {
          const errorMessage = error.message || 'Erro durante o login';
          set({ error: errorMessage });
          return { success: false, error: errorMessage };
        } finally {
          set({ loading: false });
        }
      },

      register: async (email: string, password: string, userData: Partial<UserProfile>) => {
        try {
          set({ loading: true, error: null });

          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password: password,
            options: {
              data: {
                full_name: userData.nome || ''
              }
            }
          });

          if (error) {
            set({ error: error.message });
            return { success: false, error: error.message };
          }

          if (data.user) {
            // Create user profile in usuarios table
            const profileData = {
              id: data.user.id,
              nome: userData.nome || data.user.email?.split('@')[0] || 'Usuário',
              email: data.user.email || '',
              telefone: userData.telefone || null,
              cargo: userData.cargo || 'Funcionário',
              nivel_acesso: userData.nivel_acesso || 'funcionario',
              lojas_associadas: userData.lojas_associadas || null,
              status: 'ativo' as const
            };

            const { error: profileError } = await supabase
              .from('usuarios')
              .insert(profileData);

            if (profileError) {
              console.error('Error creating user profile:', profileError);
            }

            return { success: true };
          }

          return { success: false, error: 'Falha no registro' };

        } catch (error: any) {
          const errorMessage = error.message || 'Erro durante o registro';
          set({ error: errorMessage });
          return { success: false, error: errorMessage };
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        try {
          set({ loading: true, error: null });
          
          const { error } = await supabase.auth.signOut();
          
          if (error) {
            throw error;
          }

          set({ 
            user: null, 
            profile: null, 
            isAuthenticated: false 
          });

        } catch (error: any) {
          console.error('Logout error:', error);
          set({ error: error.message || 'Erro durante o logout' });
        } finally {
          set({ loading: false });
        }
      }
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);