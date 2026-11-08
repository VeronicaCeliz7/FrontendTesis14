import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios';
import { ArrowLeft, UploadCloud, Trash2 } from 'lucide-react';

export default function NotasPage() {
  const [notas, setNotas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const cargarNotas = async () => {
    try {
      const res = await api.get('/notas');
      setNotas(res.data);
    } catch (error) {
      console.error('Error cargando notas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarNotas();
  }, []);

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta nota de voz?')) return;
    
    try {
      await api.delete(`/notas/${id}`);
      setNotas(notas.filter(n => n.id !== id)); 
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar la nota');
    }
  };

  const handleCargarLabor = (nota: any) => {
    navigate('/labores', { state: { loteId: nota.lote_id } });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/" className="text-[#0f7a50] hover:underline flex items-center gap-1">
          <ArrowLeft size={16} /> Volver al inicio
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-4">Mis Notas de Voz</h1>

      {loading ? (
        <p>Cargando notas...</p>
      ) : notas.length === 0 ? (
        <p className="text-gray-500">No hay notas guardadas.</p>
      ) : (
        <div className="space-y-4">
          {notas.map((nota) => (
            <div key={nota.id} className="bg-white p-4 rounded-lg shadow border flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Nota #{nota.id}</span>
                <span className="text-xs text-gray-500">{new Date(nota.fecha).toLocaleString()}</span>
                {nota.lote_id && <span className="text-xs text-[#0f7a50]">Lote: {nota.lote_id}</span>}
              </div>

              <audio 
                controls 
                src={`data:audio/webm;base64,${nota.audio_base64}`} 
                className="w-full md:w-64 h-10" 
              />

              <div className="flex gap-2">
                <button 
                  onClick={() => handleCargarLabor(nota)}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 hover:bg-blue-700"
                >
                  <UploadCloud size={16} /> Cargar en Labores
                </button>
                <button 
                  onClick={() => handleEliminar(nota.id)} // 👈 CORREGIDO ACÁ
                  className="bg-red-100 text-red-600 px-3 py-1.5 rounded text-sm flex items-center gap-1 hover:bg-red-200"
                >
                  <Trash2 size={16} /> Borrar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}