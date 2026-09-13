import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { listarLotes } from '../services/lotes.service';
import { listarLaboresPorLote, eliminarLabor } from '../services/labores.service';
import LaborFormModal from '../components/forms/LaborFormModal';

interface Lote {
  id: number;
  nombre: string;
}

interface Labor {
  id: number;
  lote_id: number;
  tipo: string;
  fecha: string;
  producto: string;
  dosis: number;
  plaga: string;
  semilla: string;
  observaciones: string;
  metadata: any; // ✅ Agregar metadata
}

const LaboresPage = () => {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [labores, setLabores] = useState<Labor[]>([]);
  const [cargando, setCargando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [loteSeleccionadoId, setLoteSeleccionadoId] = useState<number | null>(null);
  const { token } = useAuth();

  const cargarLotes = async () => {
    
        const data = await listarLotes();
    setLotes(data);
    if (data.length > 0) setLoteSeleccionadoId(data[0].id);
  };

  const cargarLabores = async (loteId: number) => {
    setCargando(true);
    const data = await listarLaboresPorLote(loteId, token!);
    setLabores(data);
    setCargando(false);
  };

  const handleEliminar = async (id: number, loteId: number) => {
    if (confirm('¿Eliminar esta labor?')) {
      await eliminarLabor(id, loteId, token!);
      if (loteSeleccionadoId) cargarLabores(loteSeleccionadoId);
    }
  };

  // ✅ Función para mostrar el detalle de la labor según el tipo
  const renderDetalleLabor = (labor: Labor) => {
    const meta = labor.metadata || {};
    
    switch (labor.tipo) {
      case 'siembra':
        return `${meta.variedad || 'N/A'} (${meta.densidad || 0} kg/ha)`;
      case 'fumigacion':
        return `${meta.producto || labor.producto || 'N/A'} (${meta.dosis || labor.dosis || 0} ${meta.unidad_dosis || 'l/ha'})`;
      case 'fertilizacion':
        return `${meta.producto || labor.producto || 'N/A'} (${meta.dosis || labor.dosis || 0} kg/ha)`;
      case 'riego':
        return `${meta.volumen || 0} mm - ${meta.duracion_horas || 0} hs`;
      case 'cosecha':
        return `${meta.rendimiento || 0} tn/ha (${meta.humedad || 0}% humedad)`;
      default:
        return labor.producto || '-';
    }
  };

  useEffect(() => {
    cargarLotes();
  }, []);

  useEffect(() => {
    if (loteSeleccionadoId) cargarLabores(loteSeleccionadoId);
  }, [loteSeleccionadoId]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-700">Labores</h1>
        <button
          onClick={() => setModalAbierto(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Nueva Labor
        </button>
      </div>

      {/* Selector de lote para ver historial */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Ver labores de:</label>
        <select
          value={loteSeleccionadoId || ''}
          onChange={(e) => setLoteSeleccionadoId(Number(e.target.value))}
          className="px-3 py-2 border rounded-md w-64"
        >
          {lotes.map((lote) => (
            <option key={lote.id} value={lote.id}>
              {lote.nombre}
            </option>
          ))}
        </select>
      </div>

      {cargando ? (
        <p>Cargando labores...</p>
      ) : labores.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p>No hay labores registradas para este lote.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Fecha</th>
                <th className="p-2 text-left">Tipo</th>
                <th className="p-2 text-left">Detalle</th>
                <th className="p-2 text-left">Plaga / Observaciones</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {labores.map((labor) => (
                <tr key={labor.id} className="border-b">
                  <td className="p-2">{new Date(labor.fecha).toLocaleDateString()}</td>
                  <td className="p-2 capitalize">{labor.tipo.replace('_', ' ')}</td>
                  <td className="p-2">{renderDetalleLabor(labor)}</td>
                  <td className="p-2">
                    {labor.metadata?.plaga || labor.plaga || '-'}
                    {labor.observaciones && <span className="text-xs text-gray-400 ml-2">📝 {labor.observaciones}</span>}
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => handleEliminar(labor.id, labor.lote_id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal con selector de lote y formulario */}
            <LaborFormModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onSuccess={() => {
          setModalAbierto(false);
          if (loteSeleccionadoId) cargarLabores(loteSeleccionadoId);
        }}
        lotes={lotes}
      />
    </div>
  );
};

export default LaboresPage;