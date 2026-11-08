
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth'; // Ajustá la ruta si es necesario

export function BotonFlotanteGrabador() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth(); // Solo mostramos si está logueado

  // Ocultamos el botón si ya estamos en la pantalla de campo o en el login
  const ocultar = !isAuthenticated || location.pathname === '/campo' || location.pathname === '/login' || location.pathname === '/registro';

  if (ocultar) return null;

  return (
    <button
      onClick={() => navigate('/campo')}
      className="fixed bottom-6 right-6 z-[9999] bg-[#0f7a50] hover:bg-[#064e3b] text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105"
      title="Abrir Modo Campo (Grabadora)"
    >
      <Mic size={28} />
    </button>
  );
}