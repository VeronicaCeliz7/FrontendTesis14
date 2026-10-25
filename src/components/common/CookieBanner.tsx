import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Revisamos si el usuario ya aceptó
    const hasAccepted = localStorage.getItem('alfatrace_cookies_accepted');
    if (!hasAccepted) {
      // Mostramos con un pequeño delay para que no aparezca de golpe
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('alfatrace_cookies_accepted', 'true');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 animate-in slide-in-from-bottom duration-500">
      <div className="mx-auto max-w-4xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-start sm:items-center gap-3">
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full hidden sm:block">
            <Cookie className="h-6 w-6 text-[#0f7a50] dark:text-[#34d399]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Valoramos tu privacidad
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Usamos cookies para mantener tu sesión segura y mejorar tu experiencia en AlfaTrace.
            </p>
          </div>
        </div>

        <div className="flex w-full sm:w-auto">
          <Button 
            onClick={handleAccept}
            className="w-full sm:w-auto bg-[#0f7a50] hover:bg-[#064e3b] text-white whitespace-nowrap"
          >
            Aceptar cookies
          </Button>
        </div>

      </div>
    </div>
  );
}