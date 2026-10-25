import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import AlfalfaTraceLogo from '@/components/ui/AlfalfaTraceLogo';
import { toast } from 'react-hot-toast';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return toast.error('Las contraseñas no coinciden');
    }

    if (password.length < 6) {
      return toast.error('La contraseña debe tener al menos 6 caracteres');
    }

    setLoading(true);

    try {
      // 🔴 ACÁ IRÍA LA LLAMADA A TU BACKEND EN EL FUTURO
      // await api.post('/auth/update-password', { password });
      
      // 🟢 Simulamos la actualización para la demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      toast.success('Contraseña actualizada con éxito');
    } catch (error) {
      toast.error('Error al actualizar la contraseña');
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
              <AlfalfaTraceLogo size={80} showText={true} animated={true} />
            </div>
            <CardDescription className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-medium">
              Creá tu nueva contraseña
            </CardDescription>
          </CardHeader>

          {!success ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5 px-6 sm:px-8">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-base font-semibold text-gray-700 dark:text-gray-200">
                    Nueva contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 bg-white dark:bg-gray-800"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-base font-semibold text-gray-700 dark:text-gray-200">
                    Confirmar nueva contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 bg-white dark:bg-gray-800"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 px-6 sm:px-8 pb-8 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 font-semibold bg-gradient-to-r from-[#0f7a50] to-[#064e3b] text-white shadow-lg"
                >
                  {loading ? 'Actualizando...' : 'Guardar nueva contraseña'}
                </Button>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
              <CheckCircle2 className="h-16 w-16 text-[#0f7a50]" />
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">¡Contraseña actualizada!</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tu contraseña ha sido cambiada exitosamente. Ya podés iniciar sesión con tu nueva clave.
              </p>
              <Button 
                onClick={() => navigate('/login')} 
                className="mt-4 bg-[#0f7a50] hover:bg-[#064e3b]"
              >
                Ir al inicio de sesión
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}