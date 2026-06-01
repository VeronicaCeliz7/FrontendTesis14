import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { listarLotes } from '../services/lotes.service';
import LoteForm from '../components/forms/LoteForm';

const LotesPage = () => {
  const [lotes, setLotes] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const { token } = useAuth();

  const cargarLotes = async () => {
    const data = await listarLotes(token!);
    setLotes(data);
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
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          + Nuevo Lote
        </button>
      </div>

      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Crear Nuevo Lote</h2>
            <LoteForm onSuccess={() => {
              setMostrarFormulario(false);
              cargarLotes();
            }} />
            <button
              onClick={() => setMostrarFormulario(false)}
              className="mt-4 text-gray-500 underline"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lotes.map((lote: any) => (
          <div key={lote.id} className="border rounded-lg p-4 shadow">
            <h3 className="font-bold">{lote.nombre}</h3>
            <p className="text-sm text-gray-600">{lote.hectareas?.toFixed(2)} ha</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LotesPage;