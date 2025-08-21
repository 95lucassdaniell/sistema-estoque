import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { login, register, loading, error, clearError, isAuthenticated, initialize } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    cargo: '',
    password: '',
    confirmPassword: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const validateLoginForm = () => {
    const errors: Record<string, string> = {};
    
    if (!loginForm.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(loginForm.email)) {
      errors.email = 'Email inválido';
    }
    
    if (!loginForm.password) {
      errors.password = 'Senha é obrigatória';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegisterForm = () => {
    const errors: Record<string, string> = {};
    
    if (!registerForm.nome.trim()) {
      errors.nome = 'Nome é obrigatório';
    }
    
    if (!registerForm.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(registerForm.email)) {
      errors.email = 'Email inválido';
    }
    
    if (!registerForm.cargo.trim()) {
      errors.cargo = 'Cargo é obrigatório';
    }
    
    if (!registerForm.password) {
      errors.password = 'Senha é obrigatória';
    } else if (registerForm.password.length < 6) {
      errors.password = 'Senha deve ter no mínimo 6 caracteres';
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      errors.confirmPassword = 'Senhas não coincidem';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLoginForm()) return;

    clearError();
    
    const result = await login(loginForm.email, loginForm.password);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRegisterForm()) return;

    clearError();
    
    const result = await register(registerForm.email, registerForm.password, {
      nome: registerForm.nome,
      telefone: registerForm.telefone || undefined,
      cargo: registerForm.cargo,
      nivel_acesso: 'funcionario'
    });
    
    if (result.success) {
      setActiveTab('login');
      setRegisterForm({
        nome: '',
        email: '',
        telefone: '',
        cargo: '',
        password: '',
        confirmPassword: ''
      });
      alert('Conta criada com sucesso! Faça login para continuar.');
    }
  };

  const handleDemoLogin = async () => {
    clearError();
    const result = await login('admin@gruplet.com', 'admin123');
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Sistema GRUPO LET
          </CardTitle>
          <p className="text-gray-600">Controle de Estoque Multi-Lojas</p>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Registro</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginForm.email}
                    onChange={(e) => {
                      setLoginForm(prev => ({ ...prev, email: e.target.value }));
                      if (formErrors.email) {
                        setFormErrors(prev => ({ ...prev, email: '' }));
                      }
                    }}
                    className={formErrors.email ? 'border-red-500' : ''}
                    disabled={loading}
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Sua senha"
                      value={loginForm.password}
                      onChange={(e) => {
                        setLoginForm(prev => ({ ...prev, password: e.target.value }));
                        if (formErrors.password) {
                          setFormErrors(prev => ({ ...prev, password: '' }));
                        }
                      }}
                      className={formErrors.password ? 'border-red-500 pr-10' : 'pr-10'}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Entrar
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Ou teste com conta demo:</p>
                <Button 
                  variant="outline" 
                  onClick={handleDemoLogin}
                  disabled={loading}
                  className="w-full"
                >
                  Login Demo (admin@gruplet.com)
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    placeholder="Seu nome completo"
                    value={registerForm.nome}
                    onChange={(e) => {
                      setRegisterForm(prev => ({ ...prev, nome: e.target.value }));
                      if (formErrors.nome) {
                        setFormErrors(prev => ({ ...prev, nome: '' }));
                      }
                    }}
                    className={formErrors.nome ? 'border-red-500' : ''}
                    disabled={loading}
                  />
                  {formErrors.nome && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.nome}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={registerForm.email}
                    onChange={(e) => {
                      setRegisterForm(prev => ({ ...prev, email: e.target.value }));
                      if (formErrors.email) {
                        setFormErrors(prev => ({ ...prev, email: '' }));
                      }
                    }}
                    className={formErrors.email ? 'border-red-500' : ''}
                    disabled={loading}
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="telefone">Telefone (opcional)</Label>
                  <Input
                    id="telefone"
                    placeholder="(11) 99999-9999"
                    value={registerForm.telefone}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, telefone: e.target.value }))}
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    placeholder="Ex: Gerente, Funcionário"
                    value={registerForm.cargo}
                    onChange={(e) => {
                      setRegisterForm(prev => ({ ...prev, cargo: e.target.value }));
                      if (formErrors.cargo) {
                        setFormErrors(prev => ({ ...prev, cargo: '' }));
                      }
                    }}
                    className={formErrors.cargo ? 'border-red-500' : ''}
                    disabled={loading}
                  />
                  {formErrors.cargo && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.cargo}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="register-password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={registerForm.password}
                      onChange={(e) => {
                        setRegisterForm(prev => ({ ...prev, password: e.target.value }));
                        if (formErrors.password) {
                          setFormErrors(prev => ({ ...prev, password: '' }));
                        }
                      }}
                      className={formErrors.password ? 'border-red-500 pr-10' : 'pr-10'}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirm-password">Confirmar Senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirme sua senha"
                    value={registerForm.confirmPassword}
                    onChange={(e) => {
                      setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }));
                      if (formErrors.confirmPassword) {
                        setFormErrors(prev => ({ ...prev, confirmPassword: '' }));
                      }
                    }}
                    className={formErrors.confirmPassword ? 'border-red-500' : ''}
                    disabled={loading}
                  />
                  {formErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Criar Conta
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}