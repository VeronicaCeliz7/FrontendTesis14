import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as turf from '@turf/turf';

// Arreglar íconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface DrawingMapProps {
  onPolygonChange: (polygonGeoJSON: any, areaHectareas: number, nombreLote: string) => void;
  centroInicial?: { lat: number; lng: number };
  onCentroCambiado?: (centro: { lat: number; lng: number }) => void;
  lotesGuardados?: any[];
}

const DrawingMap = ({ 
  onPolygonChange, 
  centroInicial, 
  onCentroCambiado,
  lotesGuardados = []
}: DrawingMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const pointsRef = useRef<[number, number][]>([]);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null); // ✅ Cambiado de Polygon a Polyline
  const polygonRef = useRef<L.Polygon | null>(null);
  const lotesLayerRef = useRef<L.LayerGroup | null>(null);
  
  const modoDibujoRef = useRef(false);
  const [modoDibujo, setModoDibujo] = useState(false);
  
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nombreLote, setNombreLote] = useState('');
  const [poligonoTemp, setPoligonoTemp] = useState<any>(null);
  const [areaTemp, setAreaTemp] = useState(0);
  const [puntosCount, setPuntosCount] = useState(0);
  const [areaDinamica, setAreaDinamica] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [centroActual, setCentroActual] = useState<{ lat: number; lng: number } | null>(null);

  const JAMES_CRAIK: [number, number] = [-32.1612, -63.4616];

  const capitalizar = (texto: string) => {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  };

  const dibujarLotesGuardados = (map: L.Map) => {
    if (lotesLayerRef.current) {
      lotesLayerRef.current.clearLayers();
    } else {
      lotesLayerRef.current = L.layerGroup().addTo(map);
    }

    if (!lotesGuardados || lotesGuardados.length === 0) return;

    lotesGuardados.forEach((lote) => {
      if (lote.poligono_geojson && lote.poligono_geojson.coordinates) {
        try {
          const coords = lote.poligono_geojson.coordinates[0].map((p: number[]) => [p[1], p[0]]);
          
          const polygon = L.polygon(coords as L.LatLngExpression[], {
            color: '#3b82f6',
            weight: 3,
            fillColor: '#3b82f6',
            fillOpacity: 0.2,
          }).bindPopup(`
            <div style="font-family: system-ui; min-width: 150px;">
              <strong style="font-size: 14px;">🌾 ${lote.nombre}</strong><br/>
              <span style="font-size: 12px; color: #666;">📐 ${lote.hectareas?.toFixed(2) || '0.00'} ha</span>
            </div>
          `);
          
          polygon.addTo(lotesLayerRef.current!);
        } catch (error) {
          console.error('Error dibujando lote:', lote.nombre, error);
        }
      }
    });
  };

  const agregarPunto = (e: L.LeafletMouseEvent) => {
    if (!modoDibujoRef.current) return;
    
    const point: [number, number] = [e.latlng.lng, e.latlng.lat];
    pointsRef.current.push(point);
    setPuntosCount(pointsRef.current.length);
    
    const marker = L.marker([point[1], point[0]], {
      icon: L.divIcon({
        className: 'punto-marcador',
        html: `<div style="background-color: #22c55e; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 1px black;"></div>`,
        iconSize: [14, 14]
      })
    }).addTo(mapInstanceRef.current!);
    markersRef.current.push(marker);
    
    if (pointsRef.current.length > 1) {
      if (polylineRef.current) {
        mapInstanceRef.current?.removeLayer(polylineRef.current);
      }
      
      const puntosMostrar = pointsRef.current.map(p => [p[1], p[0]]);
      polylineRef.current = L.polyline(puntosMostrar as L.LatLngExpression[], {
        color: '#ef4444',
        weight: 4,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(mapInstanceRef.current!);
    }
    
    if (pointsRef.current.length >= 3) {
      const polygonCoords = [...pointsRef.current, pointsRef.current[0]];
      const polygonGeoJSON = {
        type: 'Polygon',
        coordinates: [polygonCoords]
      };
      const areaMetros = turf.area(polygonGeoJSON);
      setAreaDinamica(areaMetros / 10000);
    }
  };

  const activarModoDibujo = () => {
    limpiarDibujo();
    modoDibujoRef.current = true;
    setModoDibujo(true);
    setPuntosCount(0);
    setAreaDinamica(0);
    pointsRef.current = [];
  };

  const terminarDibujo = () => {
    if (pointsRef.current.length < 3) {
      alert('Marcá al menos 3 puntos para dibujar el lote');
      return;
    }
    
    const polygonCoords = [...pointsRef.current, pointsRef.current[0]];
    
    if (polylineRef.current) {
      mapInstanceRef.current?.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }
    
    if (polygonRef.current) {
      mapInstanceRef.current?.removeLayer(polygonRef.current);
    }
    
    const puntosMostrar = polygonCoords.map(p => [p[1], p[0]]);
    polygonRef.current = L.polygon(puntosMostrar as L.LatLngExpression[], {
      color: '#22c55e',
      weight: 3,
      fillColor: '#3b82f6',
      fillOpacity: 0.25
    }).addTo(mapInstanceRef.current!);
    
    const polygonGeoJSON = {
      type: 'Polygon',
      coordinates: [polygonCoords]
    };
    const areaMetros = turf.area(polygonGeoJSON);
    const areaHectareas = areaMetros / 10000;
    
    setPoligonoTemp(polygonGeoJSON);
    setAreaTemp(areaHectareas);
    setMostrarModal(true);
    
    modoDibujoRef.current = false;
    setModoDibujo(false);
  };

  const limpiarDibujo = () => {
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = [];
    
    if (polylineRef.current) {
      mapInstanceRef.current?.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }
    
    if (polygonRef.current) {
      mapInstanceRef.current?.removeLayer(polygonRef.current);
      polygonRef.current = null;
    }
    
    pointsRef.current = [];
    setPuntosCount(0);
    setAreaDinamica(0);
  };

  const guardarLote = () => {
    if (!nombreLote.trim()) {
      alert('Ingresá un nombre para el lote');
      return;
    }
    
    if (poligonoTemp && areaTemp > 0) {
      onPolygonChange(poligonoTemp, areaTemp, capitalizar(nombreLote));
      
      setMostrarModal(false);
      setNombreLote('');
      setPoligonoTemp(null);
      setAreaTemp(0);
      limpiarDibujo();
    }
  };

  const cancelarModal = () => {
    setMostrarModal(false);
    setNombreLote('');
    limpiarDibujo();
  };

  const cancelarTodo = () => {
    limpiarDibujo();
    modoDibujoRef.current = false;
    setModoDibujo(false);
    setMostrarModal(false);
    setNombreLote('');
  };

  const volverAJamesCraik = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(JAMES_CRAIK, 12, { duration: 1 });
      setCentroActual({ lat: JAMES_CRAIK[0], lng: JAMES_CRAIK[1] });
      onCentroCambiado?.({ lat: JAMES_CRAIK[0], lng: JAMES_CRAIK[1] });
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const centro = centroInicial 
      ? [centroInicial.lat, centroInicial.lng] 
      : JAMES_CRAIK;
    const zoom = centroInicial ? 15 : 12;

    const map = L.map(mapRef.current).setView(centro as L.LatLngExpression, zoom);
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

    map.on('moveend', () => {
      const center = map.getCenter();
      setCentroActual({ lat: center.lat, lng: center.lng });
      onCentroCambiado?.({ lat: center.lat, lng: center.lng });
    });

    map.on('click', agregarPunto);

    dibujarLotesGuardados(map);

    return () => {
      map.remove();
    };
  }, [lotesGuardados]);

  return (
    <div style={{ position: 'relative' }}>
      {/* Modal para nombre del lote */}
      {mostrarModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            width: '90%',
            maxWidth: '400px'
          }}>
            <h3 style={{ margin: '0 0 8px 0' }}>📝 Nombrar el lote</h3>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              Área: <strong>{areaTemp.toFixed(2)} hectáreas</strong>
            </p>
            
            <input
              type="text"
              value={nombreLote}
              onChange={(e) => setNombreLote(e.target.value)}
              placeholder="Ej: Potrero Norte"
              autoFocus
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                marginBottom: '20px',
                boxSizing: 'border-box'
              }}
            />
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={guardarLote} style={{ flex: 1, backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>
                ✅ Aceptar
              </button>
              <button onClick={cancelarModal} style={{ flex: 1, backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botones */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1000,
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        display: 'flex',
        gap: '8px'
      }}>
        {!modoDibujo ? (
          <button onClick={activarModoDibujo} style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
            ✏️ Dibujar Lote
          </button>
        ) : (
          <>
            <button onClick={terminarDibujo} style={{ backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
              ✅ Terminar
            </button>
            <button onClick={cancelarTodo} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
              ❌ Cancelar
            </button>
          </>
        )}
        <button onClick={volverAJamesCraik} style={{ backgroundColor: '#6b7280', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
          📍 James Craik
        </button>
      </div>

      {/* Contador */}
      {modoDibujo && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: '#22c55e',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          📍 Puntos: {puntosCount}<br/>
          {areaDinamica > 0 && `📐 ${areaDinamica.toFixed(2)} ha`}
        </div>
      )}

      {/* Instrucciones */}
      {!modoDibujo && puntosCount === 0 && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          zIndex: 1000,
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '12px 18px',
          borderRadius: '8px',
          fontSize: '13px'
        }}>
          <strong>📐 Cómo dibujar:</strong><br/>
          1. Click en <strong style={{color: '#3b82f6'}}>"Dibujar Lote"</strong><br/>
          2. Click en el mapa para marcar esquinas<br/>
          3. Click en <strong style={{color: '#22c55e'}}>"Terminar"</strong><br/>
          4. Escribí el nombre y click en <strong>"Aceptar"</strong>
        </div>
      )}

      {lotesGuardados.length > 0 && !modoDibujo && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: '#3b82f6',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '12px'
        }}>
          📦 {lotesGuardados.length} lotes cargados
        </div>
      )}

      <div ref={mapRef} style={{ width: '100%', height: '600px', borderRadius: '12px', border: '1px solid #ccc' }} />
    </div>
  );
};

export default DrawingMap;