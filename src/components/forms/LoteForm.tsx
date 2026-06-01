import { useState } from 'react';
import DrawingMap from '../common/DrawingMap';
import { crearLote } from '../../services/lotes.service';
import { useAuth } from '../../hooks/useAuth';  // ✅ ahora sí existe

const LoteForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [nombre, setNombre] = useState('');
  const [poligono, setPoligono] = useState<any>(null);
  const [hectareas, setHectareas] = useState(0);
  const [cargando, setCargando] = useState(false);
  const { token } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !poligono) {
      alert('Completá el nombre y dibujá el polígono');
      return;
    }

    setCargando(true);
    try {
      await crearLote(nombre, poligono, hectareas, token!);
      alert('Lote creado correctamente');
      onSuccess();
    } catch (error) {
      console.error(error);
      alert('Error al crear el lote');
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Nombre del lote</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Dibujá el polígono del lote</label>
        <DrawingMap onPolygonChange={(geo, area) => {
          setPoligono(geo);
          setHectareas(area);
        }} />
        {hectareas > 0 && (
          <p className="mt-2 text-sm text-green-600">📐 Superficie: {hectareas.toFixed(2)} hectáreas</p>
        )}
      </div>

      <button
        type="submit"
        disabled={cargando}
        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
      >
        {cargando ? 'Guardando...' : 'Guardar Lote'}
      </button>
    </form>
  );
};

export default LoteForm;