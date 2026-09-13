import { useState, useEffect } from 'react';
import { listarCampos, crearCampo, eliminarCampo, Campo } from '../../services/campos.service';


interface CampoFormProps {
  onCampoSeleccionado: (campo: Campo | null) => void;
  campoSeleccionadoId?: number;
  mapaCentro?: { lat: number; lng: number };
}

const CampoForm = ({ onCampoSeleccionado, campoSeleccionadoId, mapaCentro }: CampoFormProps) => {
  const [campos, setCampos] = useState<Campo[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaUbicacion, setNuevaUbicacion] = useState('');
  const [cargando, setCargando] = useState(false);
  

  const cargarCampos = async () => {
    try {
      const data = await listarCampos();
      

      setCampos(data);
    } catch (error) {
      console.error('Error al cargar campos:', error);
    }
  };

  useEffect(() => {
    cargarCampos();
  }, []);

  const handleCrearCampo = async () => {
    console.log('🟢 Creando campo...', { nuevoNombre, nuevaUbicacion });
    
    if (!nuevoNombre.trim()) {
      alert('El nombre del campo es obligatorio');
      return;
    }
    
    setCargando(true);
    try {
      const campo = await crearCampo({
  nombre: nuevoNombre,
  ubicacion: nuevaUbicacion,
  latitud_centro: mapaCentro?.lat || -32.1612,
  longitud_centro: mapaCentro?.lng || -63.4616
});

      console.log('✅ Campo creado:', campo);
      setCampos([...campos, campo]);
      setMostrarFormulario(false);
      setNuevoNombre('');
      setNuevaUbicacion('');
      onCampoSeleccionado(campo);
    } catch (error) {
      console.error('❌ Error al crear campo:', error);
      alert('Error al crear el campo');
    } finally {
      setCargando(false);
    }
  };

  const handleEliminarCampo = async (id: number) => {
    if (confirm('¿Eliminar este campo?')) {
      try {
        await eliminarCampo(id);
        setCampos(campos.filter(c => c.id !== id));
        if (campoSeleccionadoId === id) {
          onCampoSeleccionado(null);
        }
      } catch (error) {
        console.error('Error al eliminar campo:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Selector de campo existente */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Seleccionar campo existente
        </label>
        <select
          className="w-full border rounded-md p-2"
          value={campoSeleccionadoId || ''}
          onChange={(e) => {
            const campo = campos.find(c => c.id === Number(e.target.value));
            onCampoSeleccionado(campo || null);
          }}
        >
          <option value="">-- Seleccionar campo --</option>
          {campos.map(campo => (
            <option key={campo.id} value={campo.id}>
              {campo.nombre} {campo.ubicacion && `(${campo.ubicacion})`}
            </option>
          ))}
        </select>
      </div>

      {/* Botón o formulario de nuevo campo */}
      {!mostrarFormulario ? (
        <button
          type="button"
          onClick={() => setMostrarFormulario(true)}
          className="text-blue-600 text-sm hover:text-blue-800"
        >
          + Crear nuevo campo
        </button>
      ) : (
        <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
          <h4 className="font-medium">Nuevo Campo</h4>
          
          <input
            type="text"
            placeholder="Nombre del campo (ej: Campo Paterno)"
            className="w-full border rounded-md p-2"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
          />
          
          <input
            type="text"
            placeholder="Ubicación (ej: James Craik, Córdoba)"
            className="w-full border rounded-md p-2"
            value={nuevaUbicacion}
            onChange={(e) => setNuevaUbicacion(e.target.value)}
          />
          
          <div className="text-xs text-gray-500">
            📍 Ubicación: {mapaCentro?.lat?.toFixed(4) || '-32.1612'}, {mapaCentro?.lng?.toFixed(4) || '-63.4616'}
          </div>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCrearCampo}
              disabled={cargando}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {cargando ? 'Guardando...' : 'Guardar Campo'}
            </button>
            <button
              type="button"
              onClick={() => setMostrarFormulario(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de campos */}
      {campos.length > 0 && (
        <div className="text-xs text-gray-500 border-t pt-3 mt-3">
          <p className="font-medium mb-2">Tus campos:</p>
          {campos.map(campo => (
            <div key={campo.id} className="flex justify-between items-center py-1">
              <span>📌 {campo.nombre}</span>
              <button
                onClick={() => handleEliminarCampo(campo.id)}
                className="text-red-500 hover:text-red-700 text-xs"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CampoForm;