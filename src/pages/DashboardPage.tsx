// TesisFrontend/src/pages/DashboardPage.tsx
import { useState, useEffect } from 'react';
import { 
  obtenerResumenDecisiones, 
  obtenerDecisionesRecientes,
  DecisionCorte
} from '../services/decisiones.service';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

// ✅ FUNCIÓN SEGURA PARA FORMATEAR NDVI
const formatearNDVI = (ndvi: any): string => {
  if (ndvi === null || ndvi === undefined) return 'N/A';
  const num = typeof ndvi === 'number' ? ndvi : parseFloat(ndvi);
  return isNaN(num) ? 'N/A' : num.toFixed(3);
};

// ✅ FORMATEAR FECHA CON TIMEZONE ARGENTINA
const formatearFecha = (fecha: any): string => {
  if (!fecha) return 'Sin fecha';
  try {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'America/Argentina/Buenos_Aires'
    });
  } catch {
    return 'Sin fecha';
  }
};

const DashboardPage = () => {
  const [resumen, setResumen] = useState({
    total: 0,
    ventana_corte: 0,
    crecimiento: 0,
    rebrote: 0,
    rastrojo: 0,
    maximo: 0
  });
  const [decisionesRecientes, setDecisionesRecientes] = useState<DecisionCorte[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError(null);
        
        console.log('📊 Cargando resumen de decisiones...');
        const resumenData = await obtenerResumenDecisiones();
        console.log('📊 Resumen recibido:', resumenData);
        setResumen(resumenData);

        console.log('📋 Cargando decisiones recientes...');
        const decisionesData = await obtenerDecisionesRecientes();
        console.log('📋 Decisiones recibidas:', decisionesData);
        setDecisionesRecientes(decisionesData);
        
      } catch (error: any) {
        console.error('❌ Error cargando dashboard:', error);
        setError(error.message || 'Error al cargar los datos');
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // Datos para la dona
  const datosDona = [
    { name: 'Ventana de corte', value: resumen.ventana_corte, color: '#22c55e' },
    { name: 'Crecimiento', value: resumen.crecimiento, color: '#3b82f6' },
    { name: 'Rebrote', value: resumen.rebrote, color: '#eab308' },
    { name: 'Rastrojo', value: resumen.rastrojo, color: '#64748b' },
    { name: 'Máximo', value: resumen.maximo, color: '#f97316' }
  ].filter(item => item.value > 0);

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center text-red-600">
          <p className="text-4xl mb-2">❌</p>
          <p className="text-lg font-semibold">Error al cargar el dashboard</p>
          <p className="text-sm text-gray-500">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800">📊 Dashboard de Lotes</h1>

      {/* TARJETAS DE RESUMEN */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</div>
          <div className="text-2xl font-semibold text-gray-900 mt-1">{resumen.total}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm border-l-4 border-l-green-500">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ventana de corte</div>
          <div className="text-2xl font-semibold text-gray-900 mt-1">{resumen.ventana_corte}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm border-l-4 border-l-blue-500">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Crecimiento</div>
          <div className="text-2xl font-semibold text-gray-900 mt-1">{resumen.crecimiento}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm border-l-4 border-l-amber-500">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rebrote</div>
          <div className="text-2xl font-semibold text-gray-900 mt-1">{resumen.rebrote}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm border-l-4 border-l-slate-500">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rastrojo</div>
          <div className="text-2xl font-semibold text-gray-900 mt-1">{resumen.rastrojo}</div>
        </div>
      </div>

      {/* GRÁFICO DE DONA Y ÚLTIMAS DECISIONES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DONA */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Distribución de estados</h2>
          {datosDona.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={datosDona}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {datosDona.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              <div className="text-center">
                <p className="text-4xl mb-2">📭</p>
                <p>No hay datos aún.</p>
                <p className="text-sm">Esperando la primera recolección de NDVI.</p>
              </div>
            </div>
          )}
        </div>

        {/* ÚLTIMAS DECISIONES */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Últimas decisiones</h2>
          <div className="overflow-auto max-h-[300px]">
            {decisionesRecientes.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left p-2">Lote</th>
                    <th className="text-left p-2">Fecha</th>
                    <th className="text-left p-2">Estado</th>
                    <th className="text-right p-2">NDVI</th>
                  </tr>
                </thead>
                <tbody>
                  {decisionesRecientes.slice(0, 10).map((dec) => (
                    <tr key={dec.id} className="border-t hover:bg-gray-50">
                      <td className="p-2 font-medium">Lote #{dec.lote_id}</td>
                      <td className="p-2 text-gray-500">
                        {formatearFecha(dec.fecha_analisis)}
                      </td>
                      <td className="p-2 text-gray-700">
                        {dec.estado || 'Sin estado'}
                      </td>
                      <td className="p-2 text-right font-mono">
                        {formatearNDVI(dec.ndvi_actual)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <div className="text-center">
                  <p className="text-4xl mb-2">📋</p>
                  <p>No hay decisiones registradas aún.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;