import { useState, useEffect } from 'react';
import DrawingMap from '../common/DrawingMap';
import { crearLote, listarLotesPorCampo } from '../../services/lotes.service';
import CampoForm from './CampoForm';
import { Campo } from '../../services/campos.service';

interface LoteFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const LoteForm = ({ onSuccess, onCancel }: LoteFormProps) => {
  const [nombreLote, setNombreLote] = useState('');
  const [poligono, setPoligono] = useState<any>(null);
  const [hectareas, setHectareas] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  

  const [campoSeleccionado, setCampoSeleccionado] = useState<Campo | null>(null);
  const [paso, setPaso] = useState<'campo' | 'lote'>('campo');
  const [mapaCentro, setMapaCentro] = useState<{ lat: number; lng: number } | undefined>(undefined);
  
  // ✅ Estado para los lotes guardados del campo
  const [lotesGuardados, setLotesGuardados] = useState<any[]>([]);

  // ✅ Cargar lotes cuando se selecciona un campo
   // ✅ Cargar lotes cuando se selecciona un campo
  useEffect(() => {
    const cargarLotesDelCampo = async () => {
      if (campoSeleccionado) {
        try {
          const lotes = await listarLotesPorCampo(campoSeleccionado.id);
          setLotesGuardados(lotes);
        } catch (err) {
          console.error('Error al cargar lotes del campo:', err);
        }
      } else {
        setLotesGuardados([]);
      }
    };
    
    cargarLotesDelCampo();
  }, [campoSeleccionado]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!campoSeleccionado) {
      setError('Primero seleccioná o creá un campo');
      return;
    }
    if (!nombreLote.trim()) {
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
            await crearLote(nombreLote, poligono, hectareas, campoSeleccionado.id);
      
      // ✅ Recargar los lotes del campo después de guardar
            const lotesActualizados = await listarLotesPorCampo(campoSeleccionado.id);
      setLotesGuardados(lotesActualizados);
      
      onSuccess();
    } catch (err) {
      console.error(err);
      setError('Error al guardar el lote');
    } finally {
      setCargando(false);
    }
  };

  const handleCampoSeleccionado = (campo: Campo | null) => {
    setCampoSeleccionado(campo);
    if (campo && campo.latitud_centro && campo.longitud_centro) {
      setMapaCentro({ lat: campo.latitud_centro, lng: campo.longitud_centro });
    }
    if (campo) {
      setPaso('lote');
    }
  };

  const handlePolygonChange = (geo: any, area: number, nombre: string) => {
    setPoligono(geo);
    setHectareas(area);
    setNombreLote(nombre);
  };

  if (paso === 'campo') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Seleccionar o crear un campo</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Primero seleccioná el campo (propiedad) donde vas a dibujar el lote.
        </p>
        <CampoForm 
          onCampoSeleccionado={handleCampoSeleccionado}
          campoSeleccionadoId={campoSeleccionado?.id}
          mapaCentro={mapaCentro}
        />
        <button
          type="button"
          onClick={onCancel}
          className="mt-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-medium">Campo seleccionado:</span>{' '}
          {campoSeleccionado?.nombre}
          {campoSeleccionado?.ubicacion && ` - ${campoSeleccionado.ubicacion}`}
        </p>
        <button
          type="button"
          onClick={() => setPaso('campo')}
          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-1"
        >
          ← Cambiar campo
        </button>
      </div>

      {/* ✅ Mostrar el nombre del lote (viene del modal) */}
      {nombreLote && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Nombre del lote:</span> {nombreLote}
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Dibujá el polígono del lote *
        </label>
        <DrawingMap 
          centroInicial={mapaCentro}
          onPolygonChange={handlePolygonChange}
          onCentroCambiado={setMapaCentro}
          lotesGuardados={lotesGuardados}  // ✅ Pasamos los lotes guardados
        />
        {hectareas > 0 && (
          <p className="mt-2 text-sm text-green-600 dark:text-green-400">
            📐 Superficie calculada: {hectareas.toFixed(2)} hectáreas
          </p>
        )}
        {lotesGuardados.length > 0 && (
          <p className="mt-1 text-xs text-gray-500">
            📦 {lotesGuardados.length} lotes existentes en este campo
          </p>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={cargando || !nombreLote || !poligono}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {cargando ? 'Guardando...' : 'Guardar Lote'}
        </button>
      </div>
    </form>
  );
};

export default LoteForm;