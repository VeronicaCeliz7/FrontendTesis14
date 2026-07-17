import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as turf from '@turf/turf';
import { 
    listarLotesPorCampo, 
    crearLote, 
    actualizarLote,
    eliminarLote 
} from '../services/lotes.service';
import { listarCampos, crearCampo, Campo } from '../services/campos.service';
import GraficoNDVI from '../components/common/GraficoNDVI';
import { obtenerUltimaDecision } from '../services/decisiones.service';
import { DecisionCorte } from '../types/DecisionCorte';

// =============================================
// CONFIGURACIÓN DE LEAFLET
// =============================================
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// =============================================
// FUNCIÓN PARA FORMATEAR ÁREA
// =============================================
const formatearArea = (hectareas: any): string => {
  if (hectareas === null || hectareas === undefined) return '0.00';
  const num = typeof hectareas === 'number' ? hectareas : parseFloat(hectareas);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

// =============================================
// ✅ FUNCIÓN SEGURA PARA FORMATEAR NDVI
// =============================================
const formatearNDVI = (ndvi: any): string => {
  if (ndvi === null || ndvi === undefined) return 'N/A';
  const num = typeof ndvi === 'number' ? ndvi : parseFloat(ndvi);
  return isNaN(num) ? 'N/A' : num.toFixed(3);
};

// =============================================
// ✅ FUNCIÓN SEGURA PARA FORMATEAR RADIACIÓN
// =============================================
const formatearRadiacion = (radiacion: any): string | null => {
  if (radiacion === null || radiacion === undefined) return null;
  const num = typeof radiacion === 'number' ? radiacion : parseFloat(radiacion);
  return isNaN(num) ? null : `${num.toFixed(1)} MJ/m²`;
};

// =============================================
// COMPONENTE PRINCIPAL
// =============================================
const LotesPage = () => {
  // =============================================
  // ESTADOS
  // =============================================
  const [lotes, setLotes] = useState<any[]>([]);
  const [campos, setCampos] = useState<Campo[]>([]);
  const [campoSeleccionado, setCampoSeleccionado] = useState<Campo | null>(null);
  const [loteSeleccionadoId, setLoteSeleccionadoId] = useState<number | null>(null);
  
  const [loteEditando, setLoteEditando] = useState<any | null>(null);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  
  const [modoDibujo, setModoDibujo] = useState(false);
  const [puntos, setPuntos] = useState<any[]>([]);

  const [decisiones, setDecisiones] = useState<Map<number, DecisionCorte>>(new Map());
  const [cargandoDecisiones, setCargandoDecisiones] = useState<Set<number>>(new Set());

  // =============================================
  // REFERENCIAS (REFS)
  // =============================================
  const puntosRef = useRef<any[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<any[]>([]);
  const lineasRef = useRef<any>(null);
  const lotesLayerRef = useRef<any>(null);
  const modoDibujoRef = useRef(false);

  // =============================================
  // FUNCIONES DEL MAPA
  // =============================================
  const dibujarLotesGuardados = (lotesADibujar: any[]) => {
    console.log('🗺️ dibujarLotesGuardados llamado con', lotesADibujar?.length || 0, 'lotes');
    if (!mapInstanceRef.current) {
      console.log('❌ mapInstanceRef.current es null, abortando dibujo');
      return;
    }

    if (!lotesADibujar || lotesADibujar.length === 0) {
      console.log('⚠️ No hay lotes para dibujar');
      return;
    }

    if (lotesLayerRef.current) {
      console.log('🧹 Limpiando capa vieja');
      lotesLayerRef.current.clearLayers();
      lotesLayerRef.current.remove();
      lotesLayerRef.current = null;
    }

    lotesLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    console.log('✅ Capa nueva creada');

    lotesADibujar.forEach((lote) => {
      console.log('📌 Dibujando lote:', lote.nombre, 'campo_id:', lote.campo_id);
      if (lote.poligono_geojson?.coordinates) {
        const coords = lote.poligono_geojson.coordinates[0].map((p: number[]) => [p[1], p[0]]);
        
        const decision = decisiones.get(lote.id);
        const semaforo = decision?.semaforo || '🟡 Esperar';
        const ndvi = formatearNDVI(decision?.ndvi_actual);
        const radiacion = formatearRadiacion(decision?.radiacion_mj_m2);
        const motivo = decision?.motivo || 'Sin decisión aún';
        const recomendacion = decision?.recomendacion || 'Esperando datos del satélite.';
        
        const colorMap: Record<string, string> = {
          '🟢 Corte': '#22c55e',
          '🟡 Esperar': '#eab308',
          '🔴 Riesgo': '#ef4444'
        };
        const color = colorMap[semaforo] || '#3b82f6';
        
        const popupHTML = `
          <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 220px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 24px;">🌾</span>
              <strong style="font-size: 16px;">${lote.nombre}</strong>
            </div>
            
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <span style="font-size: 28px;">${semaforo}</span>
              <span style="font-weight: bold; font-size: 14px;">${semaforo.split(' ')[1] || 'Esperar'}</span>
            </div>
            
            <hr style="margin: 6px 0; border: 0.5px solid #e5e7eb;">
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px 8px; font-size: 13px;">
              <span style="color: #6b7280;">📐 Hectáreas</span>
              <span style="font-weight: 500;">${formatearArea(lote.hectareas)} ha</span>
              
              <span style="color: #6b7280;">📊 NDVI</span>
              <span style="font-weight: 500; ${ndvi !== 'N/A' && parseFloat(ndvi) > 0.7 ? 'color: #22c55e;' : parseFloat(ndvi) > 0.4 ? 'color: #eab308;' : 'color: #ef4444;'}">${ndvi}</span>
              
              ${radiacion ? `
                <span style="color: #6b7280;">☀️ Radiación</span>
                <span style="font-weight: 500;">${radiacion}</span>
              ` : ''}
            </div>
            
            <hr style="margin: 6px 0; border: 0.5px solid #e5e7eb;">
            
            <div style="font-size: 12px; color: #4b5563; line-height: 1.4;">
              <div style="font-weight: 600; color: #1f2937;">📝 Recomendación</div>
              <div style="margin-top: 2px;">${recomendacion}</div>
              ${motivo && motivo !== recomendacion ? `
                <div style="margin-top: 4px; font-size: 11px; color: #6b7280; font-style: italic;">${motivo}</div>
              ` : ''}
            </div>
          </div>
        `;

        const popup = L.popup()
          .setContent(popupHTML)
          .on('popupopen', () => {
            setLoteSeleccionadoId(lote.id);
          });

        L.polygon(coords as any, {
          color: color,
          weight: 3,
          fillColor: color,
          fillOpacity: 0.2,
        }).bindPopup(popup).addTo(lotesLayerRef.current);
      } else {
        console.log('⚠️ Lote sin coordenadas:', lote.nombre);
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

  // =============================================
  // FUNCIONES DE LOTES
  // =============================================
  const cargarLotesDelCampo = async (campo: Campo | null) => {
    console.log('🟢 cargarLotesDelCampo llamado para campo:', campo?.id, campo?.nombre);
    if (!campo) {
      setLotes([]);
      dibujarLotesGuardados([]);
      setLoteSeleccionadoId(null);
      setDecisiones(new Map());
      return;
    }
    try {
      const data = await listarLotesPorCampo(campo.id);
      console.log('✅ Lotes recibidos:', data.length);
      setLotes(data);
      setDecisiones(new Map());
      dibujarLotesGuardados(data);
      if (data.length > 0) {
        setLoteSeleccionadoId(data[0].id);
        data.forEach(lote => cargarDecision(lote.id));
      }
    } catch (error) {
      console.error('Error cargando lotes:', error);
      setLotes([]);
      dibujarLotesGuardados([]);
      setLoteSeleccionadoId(null);
      setDecisiones(new Map());
    }
  };

  const cargarDecision = async (loteId: number) => {
    if (cargandoDecisiones.has(loteId)) return;
    if (decisiones.has(loteId)) return;

    setCargandoDecisiones(prev => new Set(prev).add(loteId));
    
    try {
      const decision = await obtenerUltimaDecision(loteId);
      if (decision) {
        setDecisiones(prev => new Map(prev).set(loteId, decision));
        dibujarLotesGuardados(lotes);
      }
    } catch (error) {
      console.error(`❌ Error cargando decisión para lote ${loteId}:`, error);
    } finally {
      setCargandoDecisiones(prev => {
        const newSet = new Set(prev);
        newSet.delete(loteId);
        return newSet;
      });
    }
  };

  const cargarCampos = async () => {
    try {
      const data = await listarCampos();
      setCampos(data);
      if (data.length > 0) {
        setCampoSeleccionado(data[0]);
      }
    } catch (error) {
      console.error('Error cargando campos:', error);
    }
  };

  const crearNuevoCampo = async () => {
    const nombre = window.prompt('📌 Nombre del nuevo campo:', 'Mi Campo');
    if (!nombre || !nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }
    try {
      const nuevoCampo = await crearCampo({
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

  // =============================================
  // FUNCIONES DE DIBUJO
  // =============================================
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
    const polygonGeoJSON = { type: 'Polygon' as const, coordinates: [polygonCoords] };
    const areaMetros = turf.area(polygonGeoJSON);
    const areaHectareas = areaMetros / 10000;

    try {
      await crearLote(nombre.trim(), polygonGeoJSON, areaHectareas, campoSeleccionado.id);
      markersRef.current.forEach(m => mapInstanceRef.current?.removeLayer(m));
      markersRef.current = [];
      if (lineasRef.current) mapInstanceRef.current?.removeLayer(lineasRef.current);
      puntosRef.current = [];
      setPuntos([]);
      modoDibujoRef.current = false;
      setModoDibujo(false);
      await cargarLotesDelCampo(campoSeleccionado);
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

  // =============================================
  // FUNCIONES DE EDICIÓN
  // =============================================
  const handleEditarLote = (lote: any) => {
    setLoteEditando({
      ...lote,
      hectareas: lote.hectareas || 0
    });
    setMostrarModalEdicion(true);
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loteEditando) return;
    if (!campoSeleccionado) {
      alert('No hay campo seleccionado');
      return;
    }

    if (!loteEditando.nombre || loteEditando.nombre.trim() === '') {
      alert('El nombre del lote es obligatorio');
      return;
    }

    try {
      console.log('📝 Actualizando lote:', loteEditando.id, loteEditando.nombre);
      
      await actualizarLote(loteEditando.id, {
        nombre: loteEditando.nombre.trim(),
        hectareas: parseFloat(loteEditando.hectareas) || 0,
        poligono_geojson: loteEditando.poligono_geojson,
        campo_id: campoSeleccionado.id,
      });

      await cargarLotesDelCampo(campoSeleccionado);
      
      setMostrarModalEdicion(false);
      setLoteEditando(null);
      
      alert('✅ Lote actualizado correctamente');
    } catch (error: any) {
      console.error('Error al actualizar:', error);
      alert(error.response?.data?.error || 'Error al actualizar el lote');
    }
  };

  const handleEliminarLote = async (loteId: number, loteNombre: string) => {
    if (!confirm(`¿Eliminar el lote "${loteNombre}"?`)) return;
    
    if (!campoSeleccionado) {
      alert('No hay campo seleccionado');
      return;
    }

    try {
      await eliminarLote(loteId, campoSeleccionado.id);
      await cargarLotesDelCampo(campoSeleccionado);
      alert(`✅ Lote "${loteNombre}" eliminado`);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar');
    }
  };

  // =============================================
  // EFECTOS (useEffect)
  // =============================================
  
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

    return () => { map.remove(); };
  }, []);

  useEffect(() => {
    cargarCampos();
  }, []);

  useEffect(() => {
    console.log('🔄 useEffect campoSeleccionado cambió a:', campoSeleccionado?.id);
    if (campoSeleccionado) {
      cargarLotesDelCampo(campoSeleccionado);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(
          [campoSeleccionado.latitud_centro || -32.1612, campoSeleccionado.longitud_centro || -63.4616],
          13
        );
      }
    } else {
      setLotes([]);
      dibujarLotesGuardados([]);
      setLoteSeleccionadoId(null);
      setDecisiones(new Map());
    }
  }, [campoSeleccionado]);

  useEffect(() => {
    if (loteSeleccionadoId) {
      cargarDecision(loteSeleccionadoId);
    }
  }, [loteSeleccionadoId]);

  useEffect(() => {
    if (lotes.length > 0 && decisiones.size > 0) {
      dibujarLotesGuardados(lotes);
    }
  }, [decisiones]);

  useEffect(() => {
    if (!loteSeleccionadoId || !mapInstanceRef.current || lotes.length === 0) return;

    const lote = lotes.find(l => l.id === loteSeleccionadoId);
    if (!lote) return;

    console.log(`🗺️ Volando al lote: ${lote.nombre} (ID: ${lote.id})`);

    if (!lote.poligono_geojson || !lote.poligono_geojson.coordinates) {
      console.log('⚠️ Lote sin polígono, volando al campo');
      if (campoSeleccionado) {
        mapInstanceRef.current.flyTo(
          [campoSeleccionado.latitud_centro || -32.1612, campoSeleccionado.longitud_centro || -63.4616],
          13,
          { duration: 1.5 }
        );
      }
      return;
    }

    try {
      const coords = lote.poligono_geojson.coordinates[0];
      if (!coords || coords.length === 0) {
        console.log('⚠️ Polígono sin coordenadas');
        return;
      }

      let latSum = 0, lngSum = 0;
      let count = 0;
      coords.forEach((p: number[]) => {
        if (p && p.length === 2) {
          lngSum += p[0];
          latSum += p[1];
          count++;
        }
      });

      if (count === 0) {
        console.log('⚠️ No hay coordenadas válidas');
        return;
      }

      const centerLat = latSum / count;
      const centerLng = lngSum / count;

      console.log(`📍 Centro del lote: ${centerLat.toFixed(4)}, ${centerLng.toFixed(4)}`);

      mapInstanceRef.current.flyTo([centerLat, centerLng], 15, {
        duration: 1.5,
      });

    } catch (error) {
      console.error('❌ Error al hacer zoom al lote:', error);
    }
  }, [loteSeleccionadoId, lotes, campoSeleccionado]);

  // =============================================
  // RENDER
  // =============================================
  return (
    <div className="h-full flex flex-col">
      {/* HEADER */}
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
            value={campoSeleccionado?.id?.toString() ?? ""}
            onChange={(e) => {
              const selectedId = e.target.value === "" ? null : parseInt(e.target.value);
              const campo = campos.find(c => c.id === selectedId);
              console.log('🔵 Selector cambió a:', selectedId, '→ campo encontrado:', campo?.nombre);
              setCampoSeleccionado(campo || null);
            }}
          >
            <option value="">-- Seleccionar campo --</option>
            {campos.map(campo => (
              <option key={campo.id} value={campo.id.toString()}>
                📍 {campo.nombre}
              </option>
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

      {/* MAPA */}
      <div className="flex-1">
        <div ref={mapRef} style={{ width: '100%', height: '500px', backgroundColor: '#f0f0f0' }} />
      </div>

      {/* MODO DIBUJO */}
      {modoDibujo && (
        <div className="bg-yellow-100 p-2 text-center text-sm">
          ✏️ Modo dibujo: hacé clic en el mapa ({puntos.length} puntos)
        </div>
      )}

      {/* GRÁFICO NDVI */}
      <div className="p-4 bg-gray-50 border-t">
        <GraficoNDVI 
          loteId={loteSeleccionadoId || 0} 
          loteNombre={lotes.find(l => l.id === loteSeleccionadoId)?.nombre} 
        />
      </div>

      {/* LISTA DE LOTES */}
      <div className="bg-gray-50 border-t p-4">
        <h2 className="font-semibold mb-2">📦 Lotes</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {lotes && lotes.length > 0 ? (
            lotes.map((lote) => {
              const decision = decisiones.get(lote.id);
              const semaforo = decision?.semaforo || '🟡 Esperar';
              const ndvi = formatearNDVI(decision?.ndvi_actual);
              
              const colorMap: Record<string, string> = {
                '🟢 Corte': 'border-green-500 bg-green-50',
                '🟡 Esperar': 'border-yellow-500 bg-yellow-50',
                '🔴 Riesgo': 'border-red-500 bg-red-50'
              };
              const borderColor = colorMap[semaforo] || 'border-gray-300 bg-white';
              
              return (
                <div 
                  key={lote.id} 
                  className={`rounded p-2 shadow text-sm flex justify-between items-center cursor-pointer hover:shadow-md transition border-l-4 ${borderColor} ${
                    loteSeleccionadoId === lote.id ? 'border-2 border-green-500' : ''
                  }`}
                  onClick={() => setLoteSeleccionadoId(lote.id)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-2xl flex-shrink-0" title={decision?.motivo || 'Sin decisión'}>
                      {semaforo}
                    </span>
                    <div className="truncate">
                      <b className="truncate block">{lote.nombre}</b>
                      <span className="text-gray-500 text-xs">
                        {formatearArea(lote.hectareas)} ha
                        {ndvi !== 'N/A' && (
                          <> • NDVI: {ndvi}</>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditarLote(lote);
                      }}
                      className="text-blue-500 hover:text-blue-700 text-base px-1"
                      title="Editar lote"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEliminarLote(lote.id, lote.nombre);
                      }}
                      className="text-red-500 hover:text-red-700 text-base px-1"
                      title="Eliminar lote"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-gray-500 text-sm col-span-full">No hay lotes en este campo</div>
          )}
        </div>
      </div>

      {/* ============================================= */}
      {/* MODAL DE EDICIÓN - CON Z-INDEX ARREGLADO */}
      {/* ============================================= */}
      {mostrarModalEdicion && loteEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold mb-4">✏️ Editar Lote</h3>
            
            <form onSubmit={handleGuardarEdicion}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Lote *
                </label>
                <input
                  type="text"
                  value={loteEditando.nombre || ''}
                  onChange={(e) => setLoteEditando({
                    ...loteEditando,
                    nombre: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hectáreas *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={loteEditando.hectareas || ''}
                  onChange={(e) => setLoteEditando({
                    ...loteEditando,
                    hectareas: parseFloat(e.target.value) || 0
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID del Lote (solo lectura)
                </label>
                <input
                  type="text"
                  value={loteEditando.id}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500"
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarModalEdicion(false);
                    setLoteEditando(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  💾 Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LotesPage;