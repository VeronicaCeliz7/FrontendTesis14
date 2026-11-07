import { useState, useEffect } from 'react';
import api from '../../lib/axios';

export function SemaforoBadge({ loteId }: { loteId: number }) {
  const [semaforo, setSemaforo] = useState<any>(null);

  useEffect(() => {
    // Hacemos la petición al backend
    api.get(`/lotes/semaforo/${loteId}`) 
      .then(res => {
        setSemaforo(res.data.data);
      })
      .catch(err => {
        console.error('Error cargando semáforo:', err);
      });
  }, [loteId]);

  // Si no hay datos o está cargando, no mostramos nada
  if (!semaforo) return null;

  // Definimos los colores según el estado
  const colores: Record<string, string> = {
    verde: 'bg-green-500',
    amarillo: 'bg-yellow-400',
    rojo: 'bg-red-500',
  };

  // Si por alguna razón no viene un color, usamos el rojo por defecto
  const colorActual = colores[semaforo.color] || 'bg-red-500';

  return (
    <div className="flex items-center gap-2 mt-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
      <div className={`h-3 w-3 rounded-full ${colorActual} shadow-sm flex-shrink-0`} />
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
        {semaforo.mensaje}
      </span>
    </div>
  );
}