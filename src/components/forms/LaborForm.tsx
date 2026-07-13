import { useState } from 'react';
import { crearLabor } from '../../services/labores.service';
import { useAuth } from '../../hooks/useAuth';

interface LaborFormProps {
  loteId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

type TipoLabor = 'siembra' | 'fumigacion' | 'fertilizacion' | 'riego' | 'cosecha';

const LaborForm = ({ loteId, onSuccess, onCancel }: LaborFormProps) => {
  const [tipo, setTipo] = useState<TipoLabor | ''>('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [observaciones, setObservaciones] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();

  // Campos específicos según tipo
  const [variedad, setVariedad] = useState('');
  const [densidad, setDensidad] = useState('');
  const [producto, setProducto] = useState('');
  const [dosis, setDosis] = useState('');
  const [plaga, setPlaga] = useState('');
  const [volumen, setVolumen] = useState('');
  const [duracion, setDuracion] = useState('');
  const [rendimiento, setRendimiento] = useState('');
  const [humedad, setHumedad] = useState('');

  const tipos: { value: TipoLabor; label: string }[] = [
    { value: 'siembra', label: '🌱 Siembra' },
    { value: 'fumigacion', label: '💨 Fumigación' },
    { value: 'fertilizacion', label: '💚 Fertilización' },
    { value: 'riego', label: '💧 Riego' },
    { value: 'cosecha', label: '🌾 Cosecha' },
  ];

  const construirMetadata = () => {
    switch (tipo) {
      case 'siembra':
        return { 
          variedad, 
          densidad: parseFloat(densidad) || 0, 
          unidad_densidad: 'kg/ha' 
        };
      case 'fumigacion':
        return { 
          producto, 
          dosis: parseFloat(dosis) || 0, 
          unidad_dosis: 'l/ha', 
          plaga 
        };
      case 'fertilizacion':
        return { 
          producto, 
          dosis: parseFloat(dosis) || 0, 
          unidad_dosis: 'kg/ha' 
        };
      case 'riego':
        return { 
          volumen: parseFloat(volumen) || 0, 
          unidad_volumen: 'mm', 
          duracion_horas: parseFloat(duracion) || 0 
        };
      case 'cosecha':
        return { 
          rendimiento: parseFloat(rendimiento) || 0, 
          unidad_rendimiento: 'tn/ha', 
          humedad: parseFloat(humedad) || 0 
        };
      default:
        return {};
    }
  };

  const validarCampos = (): boolean => {
    if (!tipo) { setError('Seleccioná un tipo de labor'); return false; }
    if (!fecha) { setError('La fecha es obligatoria'); return false; }

    switch (tipo) {
      case 'siembra':
        if (!variedad) { setError('Ingresá la variedad'); return false; }
        if (!densidad || parseFloat(densidad) <= 0) { setError('Ingresá una densidad válida'); return false; }
        break;
      case 'fumigacion':
        if (!producto) { setError('Ingresá el producto'); return false; }
        if (!dosis || parseFloat(dosis) <= 0) { setError('Ingresá una dosis válida'); return false; }
        break;
      case 'fertilizacion':
        if (!producto) { setError('Ingresá el producto'); return false; }
        if (!dosis || parseFloat(dosis) <= 0) { setError('Ingresá una dosis válida'); return false; }
        break;
      case 'riego':
        if (!volumen || parseFloat(volumen) <= 0) { setError('Ingresá un volumen válido'); return false; }
        break;
      case 'cosecha':
        if (!rendimiento || parseFloat(rendimiento) <= 0) { setError('Ingresá un rendimiento válido'); return false; }
        break;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validarCampos()) return;

    setCargando(true);
    try {
      const metadata = construirMetadata();
      
      await crearLabor(
        loteId,
        tipo as string,
        fecha,
        '', // producto (ya va en metadata)
        0,  // dosis (ya va en metadata)
        '', // plaga (ya va en metadata)
        '', // semilla (ya va en metadata)
        observaciones,
        token!,
        metadata  // ✅ Enviar metadata
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
      {/* Tipo de labor */}
      <div>
        <label className="block text-sm font-medium mb-1">Tipo de labor *</label>
        <select
          value={tipo}
          onChange={(e) => {
            setTipo(e.target.value as TipoLabor);
            setError('');
          }}
          className="w-full px-3 py-2 border rounded-md"
          required
        >
          <option value="">Seleccionar</option>
          {tipos.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Fecha */}
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

      {/* Campos dinámicos según tipo */}
      {tipo === 'siembra' && (
        <div className="space-y-3 border-l-4 border-green-500 pl-4">
          <p className="text-sm font-semibold text-green-700">🌱 Siembra</p>
          <div>
            <label className="block text-sm font-medium mb-1">Variedad *</label>
            <input
              type="text"
              value={variedad}
              onChange={(e) => setVariedad(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Ej: WL 903, Alfalfa 55"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Densidad (kg/ha) *</label>
            <input
              type="number"
              step="0.1"
              value={densidad}
              onChange={(e) => setDensidad(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Ej: 25"
            />
          </div>
        </div>
      )}

      {tipo === 'fumigacion' && (
        <div className="space-y-3 border-l-4 border-red-500 pl-4">
          <p className="text-sm font-semibold text-red-700">💨 Fumigación</p>
          <div>
            <label className="block text-sm font-medium mb-1">Producto *</label>
            <input
              type="text"
              value={producto}
              onChange={(e) => setProducto(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Ej: Glifosato, Lorsban"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Dosis (l/ha) *</label>
            <input
              type="number"
              step="0.1"
              value={dosis}
              onChange={(e) => setDosis(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Ej: 2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Plaga objetivo</label>
            <input
              type="text"
              value={plaga}
              onChange={(e) => setPlaga(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Ej: Pulgón, Arañuela"
            />
          </div>
        </div>
      )}

      {tipo === 'fertilizacion' && (
        <div className="space-y-3 border-l-4 border-blue-500 pl-4">
          <p className="text-sm font-semibold text-blue-700">💚 Fertilización</p>
          <div>
            <label className="block text-sm font-medium mb-1">Producto *</label>
            <input
              type="text"
              value={producto}
              onChange={(e) => setProducto(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Ej: MAP, Urea, KCl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Dosis (kg/ha) *</label>
            <input
              type="number"
              step="0.1"
              value={dosis}
              onChange={(e) => setDosis(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Ej: 150"
            />
          </div>
        </div>
      )}

      {tipo === 'riego' && (
        <div className="space-y-3 border-l-4 border-cyan-500 pl-4">
          <p className="text-sm font-semibold text-cyan-700">💧 Riego</p>
          <div>
            <label className="block text-sm font-medium mb-1">Volumen (mm) *</label>
            <input
              type="number"
              step="0.1"
              value={volumen}
              onChange={(e) => setVolumen(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Ej: 30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duración (horas)</label>
            <input
              type="number"
              step="0.5"
              value={duracion}
              onChange={(e) => setDuracion(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Ej: 4"
            />
          </div>
        </div>
      )}

      {tipo === 'cosecha' && (
        <div className="space-y-3 border-l-4 border-yellow-500 pl-4">
          <p className="text-sm font-semibold text-yellow-700">🌾 Cosecha</p>
          <div>
            <label className="block text-sm font-medium mb-1">Rendimiento (tn/ha) *</label>
            <input
              type="number"
              step="0.1"
              value={rendimiento}
              onChange={(e) => setRendimiento(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Ej: 10.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Humedad (%)</label>
            <input
              type="number"
              step="0.1"
              value={humedad}
              onChange={(e) => setHumedad(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Ej: 12"
            />
          </div>
        </div>
      )}

      {/* Observaciones */}
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