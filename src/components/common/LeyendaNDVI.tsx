interface LeyendaNDVIProps {
  visible: boolean;
}

// 🎨 Paleta estándar Copernicus (coincide con el backend)
const RANGOS = [
  { min: 0.8, max: 1.0, color: '#006400', label: 'Muy alto' },
  { min: 0.6, max: 0.8, color: '#00CC00', label: 'Alto' },
  { min: 0.4, max: 0.6, color: '#7FFF00', label: 'Medio' },
  { min: 0.3, max: 0.4, color: '#FFFF00', label: 'Moderado' },
  { min: 0.2, max: 0.3, color: '#A0522D', label: 'Bajo' },
  { min: 0.1, max: 0.2, color: '#8B4513', label: 'Muy bajo' },
  { min: 0.0, max: 0.1, color: '#333333', label: 'Suelo' },
  { min: -1, max: 0.0, color: '#0000FF', label: 'Agua / Nubes' },
];

export function LeyendaNDVI({ visible }: LeyendaNDVIProps) {
  if (!visible) return null;

  return (
    <div className="absolute bottom-12 right-2 z-[1000] bg-white/95 dark:bg-gray-900/95 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-3 w-48">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm">📊</span>
        <h3 className="text-xs font-bold text-gray-900 dark:text-white">
          NDVI
        </h3>
      </div>

      <div className="space-y-1">
        {RANGOS.map((rango) => (
          <div key={rango.label} className="flex items-center gap-2 text-xs">
            <div
              className="w-4 h-4 rounded-sm border border-gray-300 dark:border-gray-600 flex-shrink-0"
              style={{ backgroundColor: rango.color }}
            />
            <span className="text-gray-600 dark:text-gray-400 flex-1">
              {rango.label}
            </span>
            <span className="text-gray-500 dark:text-gray-500 text-[10px]">
              {rango.min.toFixed(1)}-{rango.max.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}