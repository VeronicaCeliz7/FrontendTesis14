import { useState, useEffect, useRef, useCallback } from 'react';
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
import toast from 'react-hot-toast';

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
// HELPERS
// =============================================
const formatearArea = (hectareas: any): string => {
  if (hectareas === null || hectareas === undefined) return '0.00';
  const num = typeof hectareas === 'number' ? hectareas : parseFloat(hectareas);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

const formatearNDVI = (ndvi: any): string => {
  if (ndvi === null || ndvi === undefined) return 'N/A';
  const num = typeof ndvi === 'number' ? ndvi : parseFloat(ndvi);
  return isNaN(num) ? 'N/A' : num.toFixed(3);
};

// =============================================
// INTERFACE
// =============================================
interface LotesPageProps {
  searchQuery?: string;
}

// =============================================
// CONSTANTES DE COPERNICUS (desde .env)
// =============================================
// =============================================
// CONSTANTES DE COPERNICUS (desde .env)
// =============================================
const COPERNICUS_INSTANCE_ID = import.meta.env.PUBLIC_COPERNICUS_INSTANCE_ID;
const COPERNICUS_TOKEN = import.meta.env.PUBLIC_COPERNICUS_TOKEN;



// =============================================
// COMPONENTE PRINCIPAL
// =============================================
const LotesPage = ({ searchQuery = '' }: LotesPageProps) => {
  // ============================================
  // ESTADOS
  // ============================================
  const [lotes, setLotes] = useState<any[]>([]);
  const [campos, setCampos] = useState<Campo[]>([]);
  const [campoSeleccionado, setCampoSeleccionado] = useState<Campo | null>(null);
  const [loteSeleccionadoId, setLoteSeleccionadoId] = useState<number | null>(null);
  const [loteEditando, setLoteEditando] = useState<any | null>(null);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [modoDibujo, setModoDibujo] = useState(false);
  const [puntos, setPuntos] = useState<any[]>([]);
  const [filteredLotes, setFilteredLotes] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [cargandoLotes, setCargandoLotes] = useState(false);
  const [mapaListo, setMapaListo] = useState(false);
  const [errorMapa, setErrorMapa] = useState<string | null>(null);
  
  // ✅ ESTADOS PARA COPERNICUS NDVI
  const [mostrarNDVI, setMostrarNDVI] = useState(false);
  const [capaNDVI, setCapaNDVI] = useState<L.Layer | null>(null);

  // 🆕 ESTADO PARA REDIBUJO DE POLÍGONO
  const [redibujandoLoteId, setRedibujandoLoteId] = useState<number | null>(null);
  // 🆕 ESTADO PARA EL CLIP PATH DEL NDVI (recorte SVG)
  const [clipPaths, setClipPaths] = useState<string[]>([]);

  // 🆕 ESTADOS PARA MODAL DE NOMBRE DE NUEVO LOTE
  const [mostrarModalNombre, setMostrarModalNombre] = useState(false);
  const [nombreNuevoLote, setNombreNuevoLote] = useState('');
  // 🆕 ESTADO PARA LA TAB ACTIVA (Gráfico vs Lotes)
  const [tabActiva, setTabActiva] = useState<'grafico' | 'lotes'>('lotes');
  // ============================================
  // REFS
  // ============================================
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const lotesLayerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef<any[]>([]);
  const lineasRef = useRef<any>(null);
  const puntosRef = useRef<any[]>([]);
  const modoDibujoRef = useRef(false);
  const lastSelectedCampoRef = useRef<Campo | null>(null);
  const mountedRef = useRef(true);
  const decisionesRef = useRef<Map<number, DecisionCorte>>(new Map());
  const mapInitRef = useRef(false);

  // 🆕 REF PARA EL POLÍGONO DE REFERENCIA (gris punteado)
  const poligonoReferenciaRef = useRef<L.Polygon | null>(null);

  // ============================================
  // FUNCIÓN PARA COPERNICUS NDVI
  // ============================================
  const toggleCapaNDVI = useCallback(() => {
    if (!mapInstanceRef.current) return;

    if (capaNDVI) {
      mapInstanceRef.current.removeLayer(capaNDVI);
      setCapaNDVI(null);
      setMostrarNDVI(false);
      toast('🌿 Mapa de calor NDVI desactivado', { icon: 'ℹ️' });
      return;
    }

    if (!COPERNICUS_INSTANCE_ID || !COPERNICUS_TOKEN) {
      toast.error('⚠️ Configuración de Copernicus faltante. Revisa el archivo .env');
      console.error('❌ COPERNICUS_INSTANCE_ID o COPERNICUS_TOKEN no definidos');
      return;
    }

    const layer = L.tileLayer.wms(
      `https://sh.dataspace.copernicus.eu/ogc/wms/${COPERNICUS_INSTANCE_ID}`,
      {
        layers: 'NDVI',
        format: 'image/png',
        transparent: true,
        opacity: 0.6,
        styles: 'green_yellow_red',
        className: 'ndvi-clip-layer',
        headers: {
          Authorization: `Bearer ${COPERNICUS_TOKEN}`,
        },
      } as any
    );

    layer.addTo(mapInstanceRef.current);
    setCapaNDVI(layer);
    setMostrarNDVI(true);
    toast.success('🌿 Mapa de calor NDVI activado');
  }, [capaNDVI]);

  // ============================================
  // 🆕 ACTUALIZAR CLIP PATH DEL NDVI
  // ============================================
  const actualizarClipPath = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!lotes || lotes.length === 0) {
      setClipPaths([]);
      return;
    }

    const paths: string[] = [];

    lotes.forEach((lote) => {
      try {
        if (!lote.poligono_geojson?.coordinates) return;

        const geojson = typeof lote.poligono_geojson === 'string'
          ? JSON.parse(lote.poligono_geojson)
          : lote.poligono_geojson;

        const coords = geojson.coordinates[0];
        if (!coords || coords.length === 0) return;

        const pathParts = coords.map((p: number[], i: number) => {
          const point = map.latLngToLayerPoint([p[1], p[0]]);
          return `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
        });

        paths.push(pathParts.join(' ') + ' Z');
      } catch (err) {
        console.warn('Error generando clip path para lote', lote?.id, err);
      }
    });

    setClipPaths(paths);
  }, [lotes]);

  useEffect(() => {
    if (!mapaListo) return;
    actualizarClipPath();
  }, [lotes, mapaListo, actualizarClipPath]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMove = () => {
      actualizarClipPath();
    };

    map.on('moveend', handleMove);
    map.on('zoomend', handleMove);

    return () => {
      map.off('moveend', handleMove);
      map.off('zoomend', handleMove);
    };
  }, [actualizarClipPath]);

  // ============================================
  // INICIALIZAR MAPA
  // ============================================
  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstanceRef.current) return;
    if (mapInitRef.current) return;

    try {
      const map = L.map(mapRef.current, {
        center: [-32.1612, -63.4616],
        zoom: 13,
      });

      mapInstanceRef.current = map;
      mapInitRef.current = true;

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

      lotesLayerRef.current = L.layerGroup().addTo(map);

      map.on('click', agregarPuntoCallback);

      setTimeout(() => {
        try {
          map.invalidateSize();
        } catch (e) {}
        setMapaListo(true);
      }, 200);

    } catch (error) {
      console.error('Error creando mapa:', error);
      setErrorMapa(String(error));
    }

    return () => {
      mountedRef.current = false;
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.off('click', agregarPuntoCallback);
        }
      } catch (e) {}
    };
  }, []);

  // ============================================
  // CALLBACK DE AGREGAR PUNTO
  // ============================================
  const agregarPuntoCallback = useCallback((e: L.LeafletMouseEvent) => {
    if (!modoDibujoRef.current) return;
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    const nuevoPunto = [e.latlng.lng, e.latlng.lat];
    puntosRef.current = [...puntosRef.current, nuevoPunto];
    setPuntos(puntosRef.current);

    const marker = L.marker([e.latlng.lat, e.latlng.lng], {
      icon: L.divIcon({
        html: '<div style="background:#22c55e; width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.4);"></div>',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      }),
    }).addTo(map);
    markersRef.current.push(marker);

    if (lineasRef.current) {
      try { map.removeLayer(lineasRef.current); } catch (e) {}
      lineasRef.current = null;
    }

    if (puntosRef.current.length >= 2) {
      const lineCoords = puntosRef.current.map(p => [p[1], p[0]]);
      if (puntosRef.current.length >= 3) {
        lineasRef.current = L.polygon(lineCoords as any, {
          color: '#ef4444',
          weight: 3,
          fillColor: '#ef4444',
          fillOpacity: 0.1,
        }).addTo(map);
      } else {
        lineasRef.current = L.polyline(lineCoords as any, {
          color: '#ef4444',
          weight: 3,
        }).addTo(map);
      }
    }
  }, []);

  // ============================================
  // DIBUJAR LOTES
  // ============================================
  const dibujarLotesGuardados = useCallback((lotesADibujar: any[]) => {
    const layer = lotesLayerRef.current;
    if (!layer || !mapInstanceRef.current) return;

    try {
      layer.clearLayers();
    } catch (e) {}

    if (!lotesADibujar || lotesADibujar.length === 0) return;

    lotesADibujar.forEach((lote) => {
      try {
        if (!lote.poligono_geojson?.coordinates) return;

        const geojson = typeof lote.poligono_geojson === 'string'
          ? JSON.parse(lote.poligono_geojson)
          : lote.poligono_geojson;

        const coords = geojson.coordinates[0].map((p: number[]) => [p[1], p[0]]);

        const decision = decisionesRef.current.get(lote.id);
        const semaforo = decision?.semaforo || '🟡 Esperar';

        const colorMap: Record<string, string> = {
          '🟢 Corte': '#22c55e',
          '🟡 Esperar': '#eab308',
          '🔴 Riesgo': '#ef4444',
        };
        const color = colorMap[semaforo] || '#3b82f6';

        const popupHTML = `
          <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 220px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 24px;">🌾</span>
              <strong style="font-size: 16px;">${lote.nombre || 'Sin nombre'}</strong>
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
              <span style="font-weight: 500;">${formatearNDVI(decision?.ndvi_actual)}</span>
            </div>
            <hr style="margin: 6px 0; border: 0.5px solid #e5e7eb;">
            <div style="font-size: 12px; color: #4b5563; line-height: 1.4;">
              <div style="font-weight: 600; color: #1f2937;">📝 Recomendación</div>
              <div style="margin-top: 2px;">${decision?.recomendacion || 'Esperando datos...'}</div>
            </div>
          </div>
        `;

        const popup = L.popup().setContent(popupHTML);
        popup.on('popupopen', () => {
          if (mountedRef.current) setLoteSeleccionadoId(lote.id);
        });

        L.polygon(coords as any, {
          color: color,
          weight: 3,
          fillColor: color,
          fillOpacity: 0.2,
        }).bindPopup(popup).addTo(layer);

      } catch (err) {
        console.error('Error dibujando lote:', lote?.nombre, err);
      }
    });
  }, []);

  // ============================================
  // CARGAR LOTES DEL CAMPO
  // ============================================
  const cargarLotesDelCampo = useCallback(async (campo: Campo | null) => {
    if (!campo) {
      setLotes([]);
      setFilteredLotes([]);
      try { lotesLayerRef.current?.clearLayers(); } catch (e) {}
      setLoteSeleccionadoId(null);
      decisionesRef.current.clear();
      return;
    }

    setCargandoLotes(true);
    try {
      const data = await listarLotesPorCampo(campo.id);
      if (!mountedRef.current) return;

      setLotes(data);
      setFilteredLotes(data);
      decisionesRef.current.clear();

      data.forEach((lote: any) => {
        obtenerUltimaDecision(lote.id)
          .then(decision => {
            if (decision && mountedRef.current) {
              decisionesRef.current.set(lote.id, decision);
              dibujarLotesGuardados(data);
            }
          })
          .catch(err => console.error('Error cargando decisión:', err));
      });

      setTimeout(() => {
        dibujarLotesGuardados(data);
      }, 100);

    } catch (error) {
      console.error('Error cargando lotes:', error);
      toast.error('Error al cargar los lotes');
    } finally {
      if (mountedRef.current) setCargandoLotes(false);
    }
  }, [dibujarLotesGuardados]);

  // ============================================
  // CARGAR CAMPOS
  // ============================================
  const cargarCampos = useCallback(async () => {
    try {
      const data = await listarCampos();
      if (!mountedRef.current) return;

      setCampos(data);
      if (data.length > 0) {
        setCampoSeleccionado(data[0]);
        lastSelectedCampoRef.current = data[0];
      }
    } catch (error) {
      console.error('Error cargando campos:', error);
      toast.error('Error al cargar los campos');
    }
  }, []);

  useEffect(() => {
    cargarCampos();
  }, [cargarCampos]);

  // ============================================
  // ✅ EFECTO 1: CARGAR LOTES CUANDO CAMBIA EL CAMPO
  // ============================================
  useEffect(() => {

    // 🆕 Resetear tab al cambiar de campo
  setTabActiva('lotes');
 setLoteSeleccionadoId(null);

    if (!campoSeleccionado) {
      setLotes([]);
      setFilteredLotes([]);
      try { lotesLayerRef.current?.clearLayers(); } catch (e) {}
      setLoteSeleccionadoId(null);
      decisionesRef.current.clear();
      return;
    }

    console.log('🔄 Cargando lotes para campo:', campoSeleccionado.nombre);
    cargarLotesDelCampo(campoSeleccionado);
  }, [campoSeleccionado]);

  // ============================================
  // ✅ EFECTO 2: ZOOM AL CAMPO
  // ============================================
  useEffect(() => {
    if (!campoSeleccionado || !mapInstanceRef.current) return;
    if (lotes.length === 0) return;

    console.log('📍 Haciendo zoom a:', campoSeleccionado.nombre, 'con', lotes.length, 'lotes');

    try {
      let latSum = 0, lngSum = 0, count = 0;
      
      lotes.forEach((lote) => {
        if (lote.poligono_geojson?.coordinates) {
          const geojson = typeof lote.poligono_geojson === 'string'
            ? JSON.parse(lote.poligono_geojson)
            : lote.poligono_geojson;
          const coords = geojson.coordinates[0];
          if (coords && coords.length > 0) {
            coords.forEach((p: number[]) => {
              if (p && p.length === 2) {
                lngSum += p[0];
                latSum += p[1];
                count++;
              }
            });
          }
        }
      });

      if (count > 0) {
        const centerLat = latSum / count;
        const centerLng = lngSum / count;
        console.log('📍 Centro calculado desde TODOS los lotes:', centerLat, centerLng);
        mapInstanceRef.current.flyTo([centerLat, centerLng], 13);
      } else {
        console.warn('⚠️ No hay lotes con coordenadas, usando James Craik');
        mapInstanceRef.current.flyTo([-32.1612, -63.4616], 13);
      }
    } catch (e) {
      console.warn('Error calculando centro:', e);
      mapInstanceRef.current.flyTo([-32.1612, -63.4616], 13);
    }
  }, [lotes, campoSeleccionado]);

  // ============================================
  // REDIBUJAR CUANDO CAMBIAN LOS LOTES
  // ============================================
  useEffect(() => {
    if (lotes.length > 0 && mapaListo) {
      dibujarLotesGuardados(lotes);
    }
  }, [lotes, dibujarLotesGuardados, mapaListo]);

  // ============================================
  // BUSCADOR
  // ============================================
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLotes(lotes);
      return;
    }

    const searchLower = searchQuery.toLowerCase();
    const campoEncontrado = campos.find(campo =>
      campo.nombre?.toLowerCase().includes(searchLower)
    );

    if (campoEncontrado && campoEncontrado.id !== campoSeleccionado?.id) {
      setCampoSeleccionado(campoEncontrado);
      lastSelectedCampoRef.current = campoEncontrado;
    }

    if (campoEncontrado) {
      setFilteredLotes(lotes);
    } else {
      setFilteredLotes([]);
    }
  }, [searchQuery, campos, lotes, campoSeleccionado]);

  // ============================================
  // ZOOM AL LOTE
  // ============================================
  useEffect(() => {
    if (!loteSeleccionadoId || !mapInstanceRef.current || lotes.length === 0) return;

    const lote = lotes.find(l => l.id === loteSeleccionadoId);
    if (!lote) return;

    if (!lote.poligono_geojson?.coordinates) {
      if (campoSeleccionado) {
        mapInstanceRef.current.flyTo(
          [campoSeleccionado.latitud_centro || -32.1612, campoSeleccionado.longitud_centro || -63.4616],
          13
        );
      }
      return;
    }

    try {
      const geojson = typeof lote.poligono_geojson === 'string'
        ? JSON.parse(lote.poligono_geojson)
        : lote.poligono_geojson;

      const coords = geojson.coordinates[0];
      if (!coords || coords.length === 0) return;

      let latSum = 0, lngSum = 0, count = 0;
      coords.forEach((p: number[]) => {
        if (p && p.length === 2) {
          lngSum += p[0];
          latSum += p[1];
          count++;
        }
      });

      if (count === 0) return;

      const centerLat = latSum / count;
      const centerLng = lngSum / count;

      mapInstanceRef.current.flyTo([centerLat, centerLng], 15, { duration: 1.5 });
    } catch (error) {
      console.error('Error al hacer zoom al lote:', error);
    }
  }, [loteSeleccionadoId, lotes, campoSeleccionado]);

  // ============================================
  // FUNCIONES DE DIBUJO
  // ============================================
  const limpiarMarcadoresDibujo = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach(m => {
      try { map.removeLayer(m); } catch (e) {}
    });
    markersRef.current = [];

    if (lineasRef.current) {
      try { map.removeLayer(lineasRef.current); } catch (e) {}
      lineasRef.current = null;
    }
  };

  const activarDibujo = () => {
    if (!campoSeleccionado) {
      toast.error('⚠️ Primero seleccioná o creá un campo');
      return;
    }
    limpiarMarcadoresDibujo();
    puntosRef.current = [];
    setPuntos([]);
    modoDibujoRef.current = true;
    setModoDibujo(true);
  };

  // 🆕 ACTIVAR REDIBUJO DE UN LOTE EXISTENTE
  const activarRedibujo = (lote: any) => {
    if (!mapInstanceRef.current) return;

    setMostrarModalEdicion(false);
    limpiarMarcadoresDibujo();
    puntosRef.current = [];
    setPuntos([]);

    try {
      const geojson = typeof lote.poligono_geojson === 'string'
        ? JSON.parse(lote.poligono_geojson)
        : lote.poligono_geojson;
      const coords = geojson.coordinates[0].map((p: number[]) => [p[1], p[0]]);

      if (poligonoReferenciaRef.current) {
        try { mapInstanceRef.current.removeLayer(poligonoReferenciaRef.current); } catch (e) {}
      }

      poligonoReferenciaRef.current = L.polygon(coords as any, {
        color: '#6b7280',
        weight: 2,
        dashArray: '8,8',
        fillColor: '#9ca3af',
        fillOpacity: 0.15,
        interactive: false,
      }).addTo(mapInstanceRef.current);

      const bounds = poligonoReferenciaRef.current.getBounds();
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });

    } catch (err) {
      console.error('Error mostrando referencia:', err);
    }

    setRedibujandoLoteId(lote.id);
    modoDibujoRef.current = true;
    setModoDibujo(true);

    toast('🔄 Modo redibujo activado. Marcá los nuevos vértices.', { icon: '✏️' });
  };

  const terminarDibujo = async () => {
    if (puntosRef.current.length < 3) {
      toast.error(`Marcá al menos 3 puntos (actual: ${puntosRef.current.length})`);
      return;
    }

    // 🆕 SI ESTAMOS REDIBUJANDO → guardar directo sin pedir nombre
    if (redibujandoLoteId) {
      const loteOriginal = lotes.find(l => l.id === redibujandoLoteId);
      if (!loteOriginal) {
        toast.error('No se encontró el lote a redibujar');
        return;
      }

      const polygonCoords = [...puntosRef.current, puntosRef.current[0]];
      const polygonGeoJSON = { type: 'Polygon' as const, coordinates: [polygonCoords] };
      const areaMetros = turf.area(polygonGeoJSON);
      const areaHectareas = areaMetros / 10000;

      try {
        setIsUpdating(true);

        await actualizarLote(redibujandoLoteId, {
          nombre: loteOriginal.nombre,
          hectareas: areaHectareas,
          poligono_geojson: polygonGeoJSON,
          campo_id: campoSeleccionado?.id!,
        });

        if (!mountedRef.current) return;

        limpiarMarcadoresDibujo();
        if (poligonoReferenciaRef.current) {
          try { mapInstanceRef.current?.removeLayer(poligonoReferenciaRef.current); } catch (e) {}
          poligonoReferenciaRef.current = null;
        }
        puntosRef.current = [];
        setPuntos([]);
        modoDibujoRef.current = false;
        setModoDibujo(false);
        setRedibujandoLoteId(null);

        setTimeout(async () => {
          if (mountedRef.current && campoSeleccionado) {
            await cargarLotesDelCampo(campoSeleccionado);
          }
        }, 50);
        toast.success(`✅ Polígono del lote "${loteOriginal.nombre}" actualizado (${areaHectareas.toFixed(2)} ha)`);

      } catch (error: any) {
        console.error('Error actualizando polígono:', error);
        toast.error(error?.response?.data?.error || 'Error al actualizar el polígono');
      } finally {
        if (mountedRef.current) setIsUpdating(false);
      }
      return;
    }

    // 🔽 FLUJO ORIGINAL DE "CREAR NUEVO LOTE"
    if (!campoSeleccionado) {
      toast.error('No hay campo seleccionado');
      return;
    }

    // 🆕 Abrir modal para pedir el nombre (reemplaza window.prompt)
    setNombreNuevoLote('');
    setMostrarModalNombre(true);
  };

  const cancelarDibujo = () => {
    limpiarMarcadoresDibujo();

    if (poligonoReferenciaRef.current) {
      try { mapInstanceRef.current?.removeLayer(poligonoReferenciaRef.current); } catch (e) {}
      poligonoReferenciaRef.current = null;
    }

    puntosRef.current = [];
    setPuntos([]);
    modoDibujoRef.current = false;
    setModoDibujo(false);
    setRedibujandoLoteId(null);
  };

  // 🆕 NUEVA FUNCIÓN: Guardar lote nuevo (llamada desde el modal)
  const handleGuardarNuevoLote = async () => {
    if (!nombreNuevoLote.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    if (!campoSeleccionado) {
      toast.error('No hay campo seleccionado');
      return;
    }

    if (puntosRef.current.length < 3) {
      toast.error('Marcá al menos 3 puntos');
      return;
    }

    const polygonCoords = [...puntosRef.current, puntosRef.current[0]];
    const polygonGeoJSON = { type: 'Polygon' as const, coordinates: [polygonCoords] };
    const areaMetros = turf.area(polygonGeoJSON);
    const areaHectareas = areaMetros / 10000;

    try {
      setIsUpdating(true);

      await crearLote(nombreNuevoLote.trim(), polygonGeoJSON, areaHectareas, campoSeleccionado.id);
      if (!mountedRef.current) return;

      setMostrarModalNombre(false);
      setNombreNuevoLote('');
      limpiarMarcadoresDibujo();
      puntosRef.current = [];
      setPuntos([]);
      modoDibujoRef.current = false;
      setModoDibujo(false);

      await cargarLotesDelCampo(campoSeleccionado);
      toast.success(`✅ Lote "${nombreNuevoLote}" guardado`);
    } catch (error) {
      console.error('Error guardando lote:', error);
      toast.error('Error al guardar');
    } finally {
      if (mountedRef.current) setIsUpdating(false);
    }
  };

  // 🆕 Cancelar el modal de nombre
  const handleCancelarModalNombre = () => {
    setMostrarModalNombre(false);
    setNombreNuevoLote('');
  };

  // ============================================
  // FUNCIONES DE EDICIÓN
  // ============================================
  const handleEditarLote = (lote: any) => {
    setLoteEditando({ ...lote, hectareas: lote.hectareas || 0 });
    setMostrarModalEdicion(true);
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loteEditando) return;
    if (!campoSeleccionado) {
      toast.error('No hay campo seleccionado');
      return;
    }

    const nombre = String(loteEditando.nombre || '').trim();
    if (!nombre) {
      toast.error('El nombre del lote es obligatorio');
      return;
    }

    try {
      setIsUpdating(true);

      await actualizarLote(loteEditando.id, {
        nombre,
        hectareas: parseFloat(loteEditando.hectareas) || 0,
        poligono_geojson: loteEditando.poligono_geojson,
        campo_id: campoSeleccionado.id,
      });

      if (!mountedRef.current) return;

      setMostrarModalEdicion(false);
      setLoteEditando(null);

      toast.success('✅ Lote actualizado correctamente');

      setTimeout(async () => {
        if (mountedRef.current && campoSeleccionado) {
          await cargarLotesDelCampo(campoSeleccionado);
          try { mapInstanceRef.current?.invalidateSize(); } catch (e) {}
        }
      }, 50);

    } catch (error: any) {
      console.error('Error al actualizar:', error);
      toast.error(error?.response?.data?.error || 'Error al actualizar el lote');
    } finally {
      if (mountedRef.current) setIsUpdating(false);
    }
  };

  const handleEliminarLote = async (loteId: number, loteNombre: string) => {
    if (!confirm(`¿Eliminar el lote "${loteNombre}"?`)) return;
    if (!campoSeleccionado) {
      toast.error('No hay campo seleccionado');
      return;
    }

    try {
      await eliminarLote(loteId, campoSeleccionado.id);
      if (!mountedRef.current) return;
      await cargarLotesDelCampo(campoSeleccionado);
      toast.success(`✅ Lote "${loteNombre}" eliminado`);
    } catch (error) {
      console.error('Error eliminando:', error);
      toast.error('Error al eliminar');
    }
  };

  // ============================================
  // CREAR NUEVO CAMPO
  // ============================================
  const crearNuevoCampo = async () => {
    const nombre = window.prompt('📌 Nombre del nuevo campo:', 'Mi Campo');
    if (!nombre || !nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    try {
      const nuevoCampo = await crearCampo({
        nombre: nombre.trim(),
        ubicacion: '',
        latitud_centro: -32.1612,
        longitud_centro: -63.4616,
      });

      if (!mountedRef.current) return;

      setCampos(prev => [...prev, nuevoCampo]);
      setCampoSeleccionado(nuevoCampo);
      lastSelectedCampoRef.current = nuevoCampo;
      toast.success(`✅ Campo "${nombre}" creado correctamente`);
    } catch (error: any) {
      console.error('Error creando campo:', error);
      toast.error('Error al crear campo: ' + (error?.response?.data?.error || error.message));
    }
  };

  // ============================================
  // RENDER
  // ============================================
    return (
    <div className="h-full flex flex-col gap-3">
      {/* 🆕 SVG OCULTO CON LOS PATHS DE RECORTE DEL NDVI */}
      <svg
        style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <defs>
          <clipPath id="ndvi-clip-path" clipPathUnits="userSpaceOnUse">
            {clipPaths.map((path, i) => (
              <path key={i} d={path} />
            ))}
          </clipPath>
        </defs>
      </svg>

      {/* 🆕 ESTILO PARA APLICAR EL CLIP A LA CAPA NDVI */}
      <style>{`
        .ndvi-clip-layer {
          clip-path: url(#ndvi-clip-path);
        }
      `}</style>

      {/* HEADER COMPACTO: Título + Botones */}
      <div className="flex items-center justify-between gap-2 flex-shrink-0">
        <h1 className="text-lg sm:text-2xl font-extrabold text-gray-900 dark:text-white">
          Mis Lotes
        </h1>
        <div className="flex gap-2">
          {!modoDibujo ? (
            <button
              onClick={activarDibujo}
              disabled={isUpdating}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
            >
              ✏️ Dibujar
            </button>
          ) : (
            <>
              <button onClick={terminarDibujo} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium">
                ✅ Terminar
              </button>
              <button onClick={cancelarDibujo} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium">
                ❌ Cancelar
              </button>
            </>
          )}
        </div>
      </div>

      {/* SELECTOR DE CAMPO COMPACTO */}
      <div className="flex gap-2 flex-shrink-0">
        <select
          className="px-3 py-1.5 border rounded-lg text-sm flex-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
          value={campoSeleccionado?.id?.toString() ?? ''}
          onChange={(e) => {
            const selectedId = e.target.value === '' ? null : parseInt(e.target.value);
            const campo = campos.find(c => c.id === selectedId) || null;
            setCampoSeleccionado(campo);
            setLoteSeleccionadoId(null);
             setTabActiva('lotes');  
            if (campo) lastSelectedCampoRef.current = campo;
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
          className="bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          + Campo
        </button>
      </div>

      {/* MAPA: ocupa el espacio disponible (flex-1) */}
      <div className="flex-1 min-h-[200px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 relative">
        <div
          ref={mapRef}
          className="w-full h-full"
          style={{ backgroundColor: '#e8f0f8' }}
        />
        {errorMapa && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50/90">
            <p className="text-red-600 text-sm">❌ Error: {errorMapa}</p>
          </div>
        )}
        {cargandoLotes && (
          <div className="absolute top-2 right-2 z-[1000] bg-white/95 dark:bg-gray-900/95 px-2 py-1 rounded shadow text-xs text-gray-700 dark:text-gray-300">
            🔄 Cargando...
          </div>
        )}
        
        <button
          onClick={toggleCapaNDVI}
          className={`absolute bottom-2 left-2 z-[1000] px-3 py-1.5 rounded-lg shadow-lg text-xs font-medium transition-colors ${
            mostrarNDVI
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {mostrarNDVI ? '❌ Ocultar NDVI' : '🌿 Mostrar NDVI'}
        </button>
      </div>

      {/* MODO DIBUJO (aviso) */}
      {modoDibujo && (
        <div className={`p-2 text-center text-xs rounded-lg flex-shrink-0 ${
          redibujandoLoteId
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
        }`}>
          {redibujandoLoteId
            ? `🔄 Redibujando "${lotes.find(l => l.id === redibujandoLoteId)?.nombre}" — ${puntos.length} puntos`
            : `✏️ Modo dibujo: hacé clic en el mapa (${puntos.length} puntos)`
          }
        </div>
      )}

      {/* TABS: Gráfico / Lotes */}
      <div className="flex-shrink-0 flex gap-2 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setTabActiva('grafico')}
          className={`flex-1 py-2 text-sm font-medium transition-colors border-b-2 ${
            tabActiva === 'grafico'
              ? 'text-green-600 dark:text-green-400 border-green-600 dark:border-green-400'
              : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          📊 Gráfico NDVI
        </button>
        <button
          onClick={() => setTabActiva('lotes')}
          className={`flex-1 py-2 text-sm font-medium transition-colors border-b-2 ${
            tabActiva === 'lotes'
              ? 'text-green-600 dark:text-green-400 border-green-600 dark:border-green-400'
              : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          📦 Lotes ({filteredLotes.length})
        </button>
      </div>

      {/* CONTENIDO DE LA TAB ACTIVA */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {tabActiva === 'grafico' ? (
          // ─── TAB GRÁFICO ───
          <div>
            {loteSeleccionadoId ? (
              <div key={`grafico-wrapper-${loteSeleccionadoId}`}>
                <GraficoNDVI
                  loteId={loteSeleccionadoId}
                  loteNombre={lotes.find(l => l.id === loteSeleccionadoId)?.nombre}
                />
              </div>
            ) : (
              <div className="flex justify-center items-center h-full py-12">
                <p className="text-gray-500 text-sm">Seleccioná un lote para ver su gráfico NDVI</p>
              </div>
            )}
          </div>
        ) : (
          // ─── TAB LOTES ───
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredLotes.length > 0 ? (
              filteredLotes.map((lote) => {
                const decision = decisionesRef.current.get(lote.id);
                const semaforo = decision?.semaforo || '🟡 Esperar';
                const ndvi = formatearNDVI(decision?.ndvi_actual);

                const colorMap: Record<string, string> = {
                  '🟢 Corte': 'border-green-500 bg-green-50 dark:bg-green-950/30',
                  '🟡 Esperar': 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30',
                  '🔴 Riesgo': 'border-red-500 bg-red-50 dark:bg-red-950/30',
                };
                const borderColor = colorMap[semaforo] || 'border-gray-300 bg-white dark:bg-gray-800';

                return (
                  <div
                    key={lote.id}
                    className={`rounded-lg p-2 shadow-sm text-sm flex justify-between items-center cursor-pointer hover:shadow-md transition border-l-4 ${borderColor} ${loteSeleccionadoId === lote.id ? 'ring-2 ring-green-500' : ''}`}
                    onClick={() => {
                      setLoteSeleccionadoId(lote.id);
                      setTabActiva('grafico');   // 🆕 Auto-switch al gráfico
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl flex-shrink-0" title={decision?.motivo || 'Sin decisión'}>
                        {semaforo}
                      </span>
                      <div className="truncate">
                        <b className="truncate block text-gray-900 dark:text-white text-sm">{lote.nombre}</b>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                          {formatearArea(lote.hectareas)} ha
                          {ndvi !== 'N/A' && <> • {ndvi}</>}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0 ml-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditarLote(lote); }}
                        className="text-blue-500 hover:text-blue-700 text-sm px-1"
                        title="Editar lote"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEliminarLote(lote.id, lote.nombre); }}
                        className="text-red-500 hover:text-red-700 text-sm px-1"
                        title="Eliminar lote"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-gray-500 dark:text-gray-400 text-sm col-span-full text-center py-8">
                {cargandoLotes ? '🔄 Cargando lotes...' : searchQuery ? '🔍 No se encontró ningún campo' : '📭 No hay lotes en este campo'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL DE EDICIÓN (sin cambios) */}
      {mostrarModalEdicion && loteEditando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">✏️ Editar Lote</h3>
            <form onSubmit={handleGuardarEdicion}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre del Lote *
                </label>
                <input
                  type="text"
                  value={loteEditando.nombre || ''}
                  onChange={(e) => setLoteEditando({ ...loteEditando, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hectáreas *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={loteEditando.hectareas || ''}
                  onChange={(e) => setLoteEditando({ ...loteEditando, hectareas: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ID del Lote (solo lectura)
                </label>
                <input
                  type="text"
                  value={loteEditando.id}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                />
              </div>

              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-200 mb-2">
                  💡 ¿El polígono está mal dibujado? Podés redibujarlo manteniendo el mismo lote y su historial.
                </p>
                <button
                  type="button"
                  onClick={() => activarRedibujo(loteEditando)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium"
                >
                  🔄 Redibujar Polígono
                </button>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => {
                    if (isUpdating) return;
                    setMostrarModalEdicion(false);
                    setLoteEditando(null);
                  }}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded-md transition-colors font-medium"
                >
                  {isUpdating ? '⏳ Guardando...' : '💾 Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE NOMBRE DE NUEVO LOTE (sin cambios) */}
      {mostrarModalNombre && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">📝 Nombrar el lote</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Ingresá un nombre para el nuevo lote
            </p>
            <input
              type="text"
              value={nombreNuevoLote}
              onChange={(e) => setNombreNuevoLote(e.target.value)}
              placeholder="Ej: Potrero Norte"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleGuardarNuevoLote();
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelarModalNombre}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGuardarNuevoLote}
                disabled={isUpdating || !nombreNuevoLote.trim()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded-md transition-colors font-medium"
              >
                {isUpdating ? '⏳ Guardando...' : '💾 Guardar Lote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



export default LotesPage;