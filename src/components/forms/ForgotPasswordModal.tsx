import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
// import api from '../../lib/axios'; // 👈 Descomentá esto cuando tu backend tenga la ruta lista

export function ForgotPasswordModal() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🔴 ACÁ VA LA LLAMADA A TU BACKEND (Cuando lo tengas listo)
      // await api.post('/auth/forgot-password', { email });

      // 🟢 Por ahora simulamos la espera para la demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSent(true);
      toast.success('Correo enviado. Revisá tu bandeja de entrada.');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al enviar el correo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) setSent(false); }}>
      <DialogTrigger asChild>
        <button type="button" className="text-sm sm:text-base text-[#0f7a50] hover:text-[#064e3b] dark:text-[#34d399] dark:hover:text-[#6ee7b7] font-medium transition-colors">
          ¿Olvidaste tu contraseña?
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recuperar contraseña</DialogTitle>
          <DialogDescription>
            {sent 
              ? 'Te enviamos un correo con las instrucciones para restablecer tu contraseña.'
              : 'Ingresá tu correo electrónico y te enviaremos un link para crear una nueva.'}
          </DialogDescription>
        </DialogHeader>

        {!sent ? (
          <form onSubmit={handleReset} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="usuario@alfatrace.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-[#0f7a50] hover:bg-[#064e3b]">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Enviar link de recuperación'}
            </Button>
          </form>
        ) : (
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cerrar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}