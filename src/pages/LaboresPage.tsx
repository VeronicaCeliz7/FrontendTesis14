import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { listarLotes } from '../services/lotes.service';
import { listarLaboresPorLote } from '../services/labores.service';
import LaborForm from '../components/forms/LaborForm';

interface Lote {
  id: number;
  nombre: string;
}

interface Labor {
  id: number;
  tipo: string;
  fecha: string;
  producto: string;
  dosis: number;
  plaga: string;
  semilla: string;
  observaciones: string;
}

const LaboresPage = () => {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loteSeleccionado, setLoteSeleccionado] = useState<number | null>(null);
  const [labores, setLabores] = useState<Labor[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(false);
  const { token } = useAuth();

  const cargarLotes = async () => {
    const data = await listarLotes(token!);
    setLotes(data);
    if (data.length > 0) setLoteSeleccionado(data[0].id);
  };

  const cargarLabores = async (loteId: number) => {
    setCargando(true);
    const data = await listarLaboresPorLote(loteId, token!);
    setLabores(data);
    setCargando(false);
  };

  useEffect(() => {
    cargarLotes();
  }, []);

  useEffect(() => {
    if (loteSeleccionado) {
      cargarLabores(loteSeleccionado);
    }
  }, [loteSeleccionado]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-700">Labores</h1>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Nueva Labor
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Seleccionar Lote</label>
        <select
          value={loteSeleccionado || ''}
          onChange={(e) => setLoteSeleccionado(Number(e.target.value))}
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
          <p>No hay labores registradas en este lote.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Fecha</th>
                <th className="p-2 text-left">Tipo</th>
                <th className="p-2 text-left">Producto</th>
                <th className="p-2 text-left">Dosis</th>
                <th className="p-2 text-left">Plaga/Semilla</th>
                <th className="p-2 text-left">Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {labores.map((labor) => (
                <tr key={labor.id} className="border-b">
                  <td className="p-2">{new Date(labor.fecha).toLocaleDateString()}</td>
                  <td className="p-2 capitalize">{labor.tipo.replace('_', ' ')}</td>
                  <td className="p-2">{labor.producto || '-'}</td>
                  <td className="p-2">{labor.dosis || '-'}</td>
                  <td className="p-2">{labor.plaga || labor.semilla || '-'}</td>
                  <td className="p-2">{labor.observaciones || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mostrarFormulario && loteSeleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Nueva Labor</h2>
            <LaborForm
              loteId={loteSeleccionado}
              onSuccess={() => {
                setMostrarFormulario(false);
                cargarLabores(loteSeleccionado);
              }}
              onCancel={() => setMostrarFormulario(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LaboresPage;