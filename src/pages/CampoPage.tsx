import { GrabadoraVoz } from '../components/lotes/GrabadoraVoz';
import AlfalfaTraceLogo from '@/components/ui/AlfalfaTraceLogo';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function CampoPage() {
  return (
    <div className="min-h-screen bg-green-50/50 p-4 flex flex-col items-center justify-start pt-10">
      
      {/* Botón para volver al Dashboard */}
      <div className="w-full max-w-md mb-6">
        <Link to="/" className="flex items-center gap-2 text-[#0f7a50] font-medium hover:underline">
          <ArrowLeft size={18} /> Volver al inicio
        </Link>
      </div>

      <AlfalfaTraceLogo size={80} showText={true} animated={true} />
      
      <div className="mt-8 w-full max-w-md bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">Modo Campo</h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          Grabá tus notas. Se guardarán acá y se enviarán cuando tengas internet.
        </p>
        
        {/* Usamos un loteId genérico (0) para el campo */}
        <GrabadoraVoz loteId={0} />
      </div>
    </div>
  );
}