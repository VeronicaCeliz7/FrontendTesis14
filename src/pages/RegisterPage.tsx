import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import AlfalfaTraceLogo from '@/components/ui/AlfalfaTraceLogo';
import api from '../lib/axios';

const RegisterPage = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/auth/register', {
        nombre,
        email,
        password,
      });

      const data = res.data;

      // Login automático después del registro
      login(data.token, data.usuario);
      navigate('/lotes');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50/50 to-green-100/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md mx-auto">
        <Card className="w-full shadow-xl border border-gray-200/50 dark:border-gray-800/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <CardHeader className="space-y-4 text-center pt-8 pb-6 px-6 sm:px-8">
            {/* Logo AlfaTrace */}
            <div className="flex justify-center">
              <AlfalfaTraceLogo size={80} showText={true} animated={true} />
            </div>

            <CardTitle className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white pt-2">
              Crear cuenta
            </CardTitle>

            <CardDescription className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-medium">
              Registrate en AlfaTrace
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 px-6 sm:px-8">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-base font-semibold">
                  Nombre
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="nombre"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="pl-10 h-12 bg-white dark:bg-gray-800 focus:border-[#0f7a50] focus:ring-[#0f7a50]/20"
                    placeholder="Juan Pérez"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-semibold">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-white dark:bg-gray-800 focus:border-[#0f7a50] focus:ring-[#0f7a50]/20"
                    placeholder="usuario@alfatrace.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-semibold">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-white dark:bg-gray-800 focus:border-[#0f7a50] focus:ring-[#0f7a50]/20"
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirmar password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-base font-semibold">
                  Confirmar contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 h-12 bg-white dark:bg-gray-800 focus:border-[#0f7a50] focus:ring-[#0f7a50]/20"
                    placeholder="Repetí la contraseña"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 px-6 sm:px-8 pb-8 pt-4">
              {/* Botón con degradado AlfaTrace */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#0f7a50] to-[#064e3b] hover:from-[#0a6140] hover:to-[#022c22] text-white shadow-lg shadow-[#064e3b]/25 hover:shadow-[#064e3b]/40 transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creando cuenta...
                  </span>
                ) : (
                  'Crear cuenta'
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                ¿Ya tenés cuenta?{' '}
                <Link to="/login" className="text-[#0f7a50] hover:text-[#064e3b] dark:text-[#34d399] hover:underline font-medium">
                  Iniciá sesión
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;