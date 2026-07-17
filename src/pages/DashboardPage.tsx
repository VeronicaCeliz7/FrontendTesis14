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

const DashboardPage = () => {
  const [resumen, setResumen] = useState({ verde: 0, amarillo: 0, rojo: 0, total: 0 });
  const [decisionesRecientes, setDecisionesRecientes] = useState<DecisionCorte[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        const [resumenData, decisionesData] = await Promise.all([
          obtenerResumenDecisiones(),
          obtenerDecisionesRecientes()
        ]);
        setResumen(resumenData);
        setDecisionesRecientes(decisionesData);
      } catch (error) {
        console.error('❌ Error cargando dashboard:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // Datos para la dona
  const datosDona = [
    { name: '🟢 Corte', value: resumen.verde, color: '#22c55e' },
    { name: '🟡 Esperar', value: resumen.amarillo, color: '#eab308' },
    { name: '🔴 Riesgo', value: resumen.rojo, color: '#ef4444' }
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

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800">📊 Dashboard de Lotes</h1>

      {/* TARJETAS DE RESUMEN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-500">
          <div className="text-sm text-gray-500">Total de Lotes</div>
          <div className="text-3xl font-bold">{resumen.total}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
          <div className="text-sm text-gray-500">🟢 Listos para Cortar</div>
          <div className="text-3xl font-bold text-green-600">{resumen.verde}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-yellow-500">
          <div className="text-sm text-gray-500">🟡 En Espera</div>
          <div className="text-3xl font-bold text-yellow-600">{resumen.amarillo}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-500">
          <div className="text-sm text-gray-500">🔴 En Riesgo</div>
          <div className="text-3xl font-bold text-red-600">{resumen.rojo}</div>
        </div>
      </div>

      {/* GRÁFICO DE DONA Y ÚLTIMAS DECISIONES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DONA */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Estado de Corte</h2>
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
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
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
          <h2 className="text-lg font-semibold mb-4">Últimas Decisiones</h2>
          <div className="overflow-auto max-h-[300px]">
            {decisionesRecientes.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left p-2">Lote</th>
                    <th className="text-left p-2">Fecha</th>
                    <th className="text-center p-2">Estado</th>
                    <th className="text-left p-2">NDVI</th>
                  </tr>
                </thead>
                <tbody>
                  {decisionesRecientes.slice(0, 10).map((dec) => (
                    <tr key={dec.id} className="border-t hover:bg-gray-50">
                      <td className="p-2 font-medium">Lote #{dec.lote_id}</td>
                      <td className="p-2 text-gray-500">
                        {new Date(dec.fecha_analisis).toLocaleDateString()}
                      </td>
                      <td className="p-2 text-center">
                        <span className="text-2xl">{dec.semaforo}</span>
                      </td>
                      <td className="p-2">
                        {dec.ndvi_actual !== null && dec.ndvi_actual !== undefined
                          ? dec.ndvi_actual.toFixed(3)
                          : 'N/A'}
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