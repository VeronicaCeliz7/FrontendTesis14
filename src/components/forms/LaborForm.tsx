import { useState } from 'react';
import { crearLabor } from '../../services/labores.service';
import { useAuth } from '../../hooks/useAuth';

interface LaborFormProps {
  loteId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const LaborForm = ({ loteId, onSuccess, onCancel }: LaborFormProps) => {
  const [tipo, setTipo] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [producto, setProducto] = useState('');
  const [dosis, setDosis] = useState('');
  const [plaga, setPlaga] = useState('');
  const [semilla, setSemilla] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();

  const tipos = ['siembra', 'fumigacion', 'fertilizacion', 'doble_accion'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      await crearLabor(
        loteId,
        tipo,
        fecha,
        producto,
        dosis ? parseFloat(dosis) : 0,
        plaga,
        semilla,
        observaciones,
        token!
      );
      onSuccess();
    } catch (err) {
      setError('Error al guardar la labor');
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Tipo de labor *</label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        >
          <option value="">Seleccionar</option>
          {tipos.map((t) => (
            <option key={t} value={t}>
              {t.replace('_', ' ').toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Fecha *</label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Producto</label>
        <input
          type="text"
          value={producto}
          onChange={(e) => setProducto(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Ej: Glifosato"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Dosis (L/ha)</label>
        <input
          type="number"
          step="0.1"
          value={dosis}
          onChange={(e) => setDosis(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Ej: 2.5"
        />
      </div>

      {tipo === 'fumigacion' && (
        <div>
          <label className="block text-sm font-medium mb-1">Plaga objetivo</label>
          <input
            type="text"
            value={plaga}
            onChange={(e) => setPlaga(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Ej: Gusano cogollero"
          />
        </div>
      )}

      {tipo === 'siembra' && (
        <div>
          <label className="block text-sm font-medium mb-1">Semilla</label>
          <input
            type="text"
            value={semilla}
            onChange={(e) => setSemilla(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Ej: Alfalfa WL903"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Observaciones</label>
        <textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          rows={2}
          placeholder="Observaciones adicionales..."
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={cargando}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {cargando ? 'Guardando...' : 'Guardar Labor'}
        </button>
      </div>
    </form>
  );
};

export default LaborForm;