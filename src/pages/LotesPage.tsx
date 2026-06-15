import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as turf from '@turf/turf';
import { useAuth } from '../hooks/useAuth';
import { listarLotes, crearLote, eliminarLote } from '../services/lotes.service';
import { listarCampos, crearCampo, Campo } from '../services/campos.service';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const formatearArea = (hectareas: any): string => {
  if (hectareas === null || hectareas === undefined) return '0.00';
  const num = typeof hectareas === 'number' ? hectareas : parseFloat(hectareas);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

const LotesPage = () => {
  const [lotes, setLotes] = useState<any[]>([]);
  const [campos, setCampos] = useState<Campo[]>([]);
  const [campoSeleccionado, setCampoSeleccionado] = useState<Campo | null>(null);
  const { token } = useAuth();

  const [modoDibujo, setModoDibujo] = useState(false);
  const [puntos, setPuntos] = useState<any[]>([]);
  
  const puntosRef = useRef<any[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<any[]>([]);
  const lineasRef = useRef<any>(null);
  const lotesLayerRef = useRef<any>(null);
  const modoDibujoRef = useRef(false);

  // ✅ Eliminar lote - CORREGIDO
  const handleEliminarLote = async (loteId: number, loteNombre: string) => {
    if (confirm(`¿Eliminar el lote "${loteNombre}"?`)) {
      try {
        await eliminarLote(loteId, campoSeleccionado!.id, token!);
        await cargarLotes();
        setTimeout(() => dibujarLotesGuardados(), 100);
        alert(`✅ Lote "${loteNombre}" eliminado`);
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar');
      }
    }
  };

  // Crear nuevo campo
  const crearNuevoCampo = async () => {
    const nombre = window.prompt('📌 Nombre del nuevo campo:', 'Mi Campo');
    if (!nombre || !nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }
    
    try {
      const nuevoCampo = await crearCampo(token!, {
        nombre: nombre.trim(),
        ubicacion: '',
        latitud_centro: -32.1612,
        longitud_centro: -63.4616
      });
      
      setCampos(prev => [...prev, nuevoCampo]);
      setCampoSeleccionado(nuevoCampo);
      alert(`✅ Campo "${nombre}" creado correctamente`);
    } catch (error: any) {
      console.error(error);
      alert('Error al crear campo: ' + (error.response?.data?.error || error.message));
    }
  };

  const cargarCampos = async () => {
    try {
      const data = await listarCampos(token!);
      setCampos(data);
    } catch (error) {
      console.error(error);
    }
  };

  const cargarLotes = async () => {
    if (!campoSeleccionado) return;
    try {
      const data = await listarLotes(token!);
      const filtrados = data.filter((l: any) => l.campo_id === campoSeleccionado.id);
      setLotes(filtrados);
    } catch (error) {
      console.error(error);
    }
  };

  const dibujarLotesGuardados = () => {
    if (!mapInstanceRef.current) return;

    if (lotesLayerRef.current) {
      lotesLayerRef.current.clearLayers();
    } else {
      lotesLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    lotes.forEach((lote) => {
      if (lote.poligono_geojson?.coordinates) {
        const coords = lote.poligono_geojson.coordinates[0].map((p: number[]) => [p[1], p[0]]);
        L.polygon(coords as any, {
          color: '#3b82f6',
          weight: 3,
          fillColor: '#3b82f6',
          fillOpacity: 0.2,
        }).bindPopup(`<b>🌾 ${lote.nombre}</b><br/>📐 ${formatearArea(lote.hectareas)} ha`)
          .addTo(lotesLayerRef.current);
      }
    });
  };

  const agregarPunto = (e: L.LeafletMouseEvent) => {
    if (!modoDibujoRef.current) return;

    const nuevoPunto = [e.latlng.lng, e.latlng.lat];
    puntosRef.current = [...puntosRef.current, nuevoPunto];
    setPuntos(puntosRef.current);
    
    const marker = L.marker([e.latlng.lat, e.latlng.lng], {
      icon: L.divIcon({
        html: '<div style="background:#22c55e; width:12px;height:12px;border-radius:50%;border:2px solid white;"></div>',
        iconSize: [12, 12],
      }),
    }).addTo(mapInstanceRef.current!);
    markersRef.current.push(marker);
    
    if (lineasRef.current) mapInstanceRef.current?.removeLayer(lineasRef.current);
    
    if (puntosRef.current.length > 1) {
      const lineCoords = puntosRef.current.map(p => [p[1], p[0]]);
      if (puntosRef.current.length >= 3) {
        lineasRef.current = L.polygon(lineCoords as any, { 
          color: '#ef4444', weight: 3, fillColor: '#ef4444', fillOpacity: 0.1 
        }).addTo(mapInstanceRef.current!);
      } else {
        lineasRef.current = L.polyline(lineCoords as any, { color: '#ef4444', weight: 3 })
          .addTo(mapInstanceRef.current!);
      }
    }
  };

  const activarDibujo = () => {
    if (!campoSeleccionado) {
      alert('⚠️ Primero seleccioná o creá un campo');
      return;
    }
    
    markersRef.current.forEach(m => mapInstanceRef.current?.removeLayer(m));
    markersRef.current = [];
    if (lineasRef.current) mapInstanceRef.current?.removeLayer(lineasRef.current);
    puntosRef.current = [];
    setPuntos([]);
    modoDibujoRef.current = true;
    setModoDibujo(true);
  };

  const terminarDibujo = async () => {
    if (puntosRef.current.length < 3) {
      alert(`Marcá al menos 3 puntos (actual: ${puntosRef.current.length})`);
      return;
    }

    const nombre = window.prompt('📝 Ingresá el nombre del lote:', 'Lote Nuevo');
    if (!nombre || !nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    if (!campoSeleccionado) {
      alert('No hay campo seleccionado');
      return;
    }

    const polygonCoords = [...puntosRef.current, puntosRef.current[0]];
    const polygonGeoJSON = { type: 'Polygon', coordinates: [polygonCoords] };
    const areaMetros = turf.area(polygonGeoJSON);
    const areaHectareas = areaMetros / 10000;

    try {
      await crearLote(nombre.trim(), polygonGeoJSON, areaHectareas, campoSeleccionado.id, token!);
      
      markersRef.current.forEach(m => mapInstanceRef.current?.removeLayer(m));
      markersRef.current = [];
      if (lineasRef.current) mapInstanceRef.current?.removeLayer(lineasRef.current);
      puntosRef.current = [];
      setPuntos([]);
      modoDibujoRef.current = false;
      setModoDibujo(false);
      
      await cargarLotes();
      dibujarLotesGuardados();
      
      alert(`✅ Lote "${nombre}" guardado`);
    } catch (error) {
      console.error(error);
      alert('Error al guardar');
    }
  };

  const cancelarDibujo = () => {
    markersRef.current.forEach(m => mapInstanceRef.current?.removeLayer(m));
    markersRef.current = [];
    if (lineasRef.current) mapInstanceRef.current?.removeLayer(lineasRef.current);
    puntosRef.current = [];
    setPuntos([]);
    modoDibujoRef.current = false;
    setModoDibujo(false);
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current).setView([-32.1612, -63.4616], 13);
    mapInstanceRef.current = map;

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri',
      maxZoom: 19,
    }).addTo(map);

    L.tileLayer('https://{s}.google.com/vt/lyrs=h&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google Maps',
      maxZoom: 19,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      opacity: 0.7,
    }).addTo(map);

    map.on('click', agregarPunto);

    return () => map.remove();
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && lotes.length > 0) {
      dibujarLotesGuardados();
    }
  }, [lotes]);

  useEffect(() => {
    cargarCampos();
  }, []);

  useEffect(() => {
    if (campoSeleccionado) {
      cargarLotes();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([campoSeleccionado.latitud_centro || -32.1612, campoSeleccionado.longitud_centro || -63.4616], 13);
      }
    } else {
      setLotes([]);
    }
  }, [campoSeleccionado]);

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Mis Lotes</h1>
          <div className="flex gap-2">
            {!modoDibujo ? (
              <button onClick={activarDibujo} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                ✏️ Dibujar Lote
              </button>
            ) : (
              <>
                <button onClick={terminarDibujo} className="bg-green-600 text-white px-4 py-2 rounded-lg">
                  ✅ Terminar
                </button>
                <button onClick={cancelarDibujo} className="bg-red-600 text-white px-4 py-2 rounded-lg">
                  ❌ Cancelar
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <select
            className="px-3 py-1.5 border rounded-lg text-sm flex-1"
            value={campoSeleccionado?.id || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '') {
                setCampoSeleccionado(null);
              } else {
                const campo = campos.find(c => c.id === Number(value));
                setCampoSeleccionado(campo || null);
              }
            }}
          >
            <option value="">-- Seleccionar campo --</option>
            {campos.map(campo => (
              <option key={campo.id} value={campo.id}>📍 {campo.nombre}</option>
            ))}
          </select>
          
          <button
            onClick={crearNuevoCampo}
            className="bg-gray-200 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-300"
          >
            + Nuevo Campo
          </button>
        </div>

        {campoSeleccionado && (
          <div className="mt-2 text-xs text-green-600">
            ✅ Campo: <strong>{campoSeleccionado.nombre}</strong>
          </div>
        )}
        {!campoSeleccionado && (
          <div className="mt-2 text-xs text-orange-500">
            ⚠️ Seleccioná o creá un campo
          </div>
        )}
      </div>

      <div className="flex-1">
        <div ref={mapRef} style={{ width: '100%', height: '500px', backgroundColor: '#f0f0f0' }} />
      </div>

      {modoDibujo && (
        <div className="bg-yellow-100 p-2 text-center text-sm">
          ✏️ Modo dibujo: hacé clic en el mapa ({puntos.length} puntos)
        </div>
      )}

      <div className="bg-gray-50 border-t p-4">
        <h2 className="font-semibold mb-2">📦 Lotes</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {lotes.map((lote) => (
            <div key={lote.id} className="bg-white rounded p-2 shadow text-sm flex justify-between items-center">
              <div>
                <b>{lote.nombre}</b><br />
                {formatearArea(lote.hectareas)} ha
              </div>
              <button
                onClick={() => handleEliminarLote(lote.id, lote.nombre)}
                className="text-red-500 hover:text-red-700 text-lg px-2"
                title="Eliminar lote"
              >
                🗑️
              </button>
            </div>
          ))}
          {lotes.length === 0 && campoSeleccionado && (
            <div className="text-gray-500 text-sm">No hay lotes</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LotesPage;