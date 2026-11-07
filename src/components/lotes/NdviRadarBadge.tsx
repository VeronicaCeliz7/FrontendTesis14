import { useState } from 'react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

export function NdviRadarBadge({ loteId }: { loteId: number }) {
  const [loading, setLoading] = useState(false);

  const handleCalcularRadar = async () => {
    setLoading(true);
    try {
      // Llamamos a la ruta que ya funciona en tu Backend
      const res = await api.get(`/ndvi/fallback/${loteId}`);
      
      if (res.data.success) {
        toast.success(`🛰️ NDVI Radar (GEE): ${res.data.ndvi.toFixed(2)}`, {
          duration: 5000,
          icon: '🌿',
        });
      }
    } catch (error: any) {
      console.error('Error radar:', error);
      toast.error(error.response?.data?.error || 'Error al calcular NDVI con radar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); // Para que no se abra el modal del mapa
        handleCalcularRadar();
      }}
      disabled={loading}
      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded border border-slate-300 mt-1 flex items-center gap-1 transition-colors"
      title="Calcular NDVI con Radar (para días nublados)"
    >
      {loading ? '⏳ Calculando...' : '🛰️ NDVI Radar'}
    </button>
  );
}