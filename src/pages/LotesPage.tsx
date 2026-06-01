import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { listarLotes } from '../services/lotes.service';
import LoteForm from '../components/forms/LoteForm';

const LotesPage = () => {
  const [lotes, setLotes] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(true);
  const { token } = useAuth();

  const cargarLotes = async () => {
    setCargando(true);
    try {
      const data = await listarLotes(token!);
      setLotes(data);
    } catch (error) {
      console.error('Error al cargar lotes:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarLotes();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Mis Lotes</h1>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Nuevo Lote
        </button>
      </div>

      {cargando ? (
        <p className="text-gray-500">Cargando lotes...</p>
      ) : lotes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No tenés lotes cargados todavía.</p>
          <button
            onClick={() => setMostrarFormulario(true)}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Crear mi primer lote
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lotes.map((lote: any) => (
            <div key={lote.id} className="border rounded-lg p-4 shadow hover:shadow-md transition">
              <h3 className="font-bold text-lg">{lote.nombre}</h3>
              <p className="text-sm text-gray-600">📐 {lote.hectareas?.toFixed(2)} ha</p>
            </div>
          ))}
        </div>
      )}

      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Crear Nuevo Lote</h2>
            <LoteForm
              onSuccess={() => {
                setMostrarFormulario(false);
                cargarLotes();
              }}
              onCancel={() => setMostrarFormulario(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LotesPage;