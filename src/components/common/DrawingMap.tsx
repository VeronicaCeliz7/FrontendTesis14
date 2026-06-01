import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TerraDraw } from 'terra-draw';
import { TerraDrawLeafletAdapter } from 'terra-draw-leaflet-adapter';
import { TerraDrawPolygonMode } from 'terra-draw';

interface DrawingMapProps {
  onPolygonChange: (polygonGeoJSON: any, areaHectareas: number) => void;
}

const DrawingMap = ({ onPolygonChange }: DrawingMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const drawRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current).setView([-34.6, -58.4], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
    }).addTo(map);

    const draw = new TerraDraw({
      adapter: new TerraDrawLeafletAdapter({
        lib: L,
        map: map,
        coordinatePrecision: 9,
      }),
      modes: [new TerraDrawPolygonMode()],  // ✅ solo un modo para empezar
    });

    draw.start();
    draw.setMode('polygon');
    drawRef.current = draw;

    // ✅ Usar on('change') en lugar de setOnChange
    draw.on('change', () => {
      const snapshot = draw.getSnapshot();
      const polygons = snapshot.filter((f: any) => f.geometry.type === 'Polygon');
      
      if (polygons.length > 0) {
        const polygon = polygons[0];
        const areaMetros = calculateArea(polygon.geometry);
        const areaHectareas = areaMetros / 10000;
        onPolygonChange(polygon.geometry, areaHectareas);
      } else {
        onPolygonChange(null, 0);
      }
    });

    return () => {
      draw.stop();
      map.remove();
    };
  }, [onPolygonChange]);

  return <div ref={mapRef} style={{ width: '100%', height: '400px' }} />;
};

function calculateArea(polygon: any): number {
  const coords = polygon.coordinates[0];
  let area = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const [x1, y1] = coords[i];
    const [x2, y2] = coords[i + 1];
    area += x1 * y2 - x2 * y1;
  }
  area = Math.abs(area) / 2;
  return area;
}

export default DrawingMap;