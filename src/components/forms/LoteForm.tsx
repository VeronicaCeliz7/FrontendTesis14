import { useState } from 'react';
import DrawingMap from '../common/DrawingMap';
import { crearLote } from '../../services/lotes.service';
import { useAuth } from '../../hooks/useAuth';

interface LoteFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const LoteForm = ({ onSuccess, onCancel }: LoteFormProps) => {
  const [nombre, setNombre] = useState('');
  const [poligono, setPoligono] = useState<any>(null);
  const [hectareas, setHectareas] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('El nombre del lote es obligatorio');
      return;
    }
    if (!poligono) {
      setError('Dibujá el polígono del lote en el mapa');
      return;
    }

    setCargando(true);
    setError('');

    try {
      await crearLote(nombre, poligono, hectareas, token!);
      onSuccess();
    } catch (err) {
      setError('Error al guardar el lote');
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nombre del lote *
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
          placeholder="Ej: Lote Norte"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Dibujá el polígono del lote *
        </label>
        <DrawingMap onPolygonChange={(geo, area) => {
          setPoligono(geo);
          setHectareas(area);
        }} />
        {hectareas > 0 && (
          <p className="mt-2 text-sm text-green-600 dark:text-green-400">
            📐 Superficie calculada: {hectareas.toFixed(2)} hectáreas
          </p>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={cargando}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {cargando ? 'Guardando...' : 'Guardar Lote'}
        </button>
      </div>
    </form>
  );
};

export default LoteForm;