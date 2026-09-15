import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sprout, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../lib/axios';
const LoginPage = () => {
  const [email, setEmail] = useState('campo@alfalfa.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
            const res = await api.post('/auth/login', { email, password });
      const data = res.data;

      login(data.token, data.usuario);
      navigate('/lotes');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50/50 to-green-100/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md mx-auto">
        <Card className="w-full shadow-xl border border-gray-200/50 dark:border-gray-800/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <CardHeader className="space-y-4 text-center pt-8 pb-6 px-6 sm:px-8">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-600/20">
                <Sprout className="h-10 w-10 text-white" />
              </div>
            </div>
            
            <CardTitle className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              AlfalfaTrace
            </CardTitle>
            
            <CardDescription className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-medium">
              Sistema de gestión y monitoreo de lotes de alfalfa
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 px-6 sm:px-8">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 sm:h-14 text-base sm:text-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:border-green-500 focus:ring-green-500/20 text-gray-900 dark:text-white placeholder:text-gray-400"
                    placeholder="usuario@alfalfatrace.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200">
                    Contraseña
                  </Label>
                  <a href="#" className="text-sm sm:text-base text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium transition-colors">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 sm:h-14 text-base sm:text-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:border-green-500 focus:ring-green-500/20 text-gray-900 dark:text-white placeholder:text-gray-400"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3 sm:p-4 text-sm sm:text-base text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 px-6 sm:px-8 pb-8 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-600/25 hover:shadow-green-600/40 transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center gap-3">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Ingresando...
                  </span>
                ) : (
                  'Ingresar al sistema'
                )}
              </Button>

              <p className="text-center text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium">
                Sistema de gestión agrícola profesional
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;