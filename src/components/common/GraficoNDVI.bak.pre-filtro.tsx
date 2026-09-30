import { useEffect, useState, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { listarMediciones, Medicion } from '../../services/mediciones.service';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface GraficoNDVIProps {
    loteId: number;
    loteNombre?: string;
}

const GraficoNDVI = ({ loteId, loteNombre }: GraficoNDVIProps) => {
    const [mediciones, setMediciones] = useState<Medicion[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        const cargarMediciones = async () => {
            if (!loteId || loteId === 0) {
                if (mountedRef.current) {
                    setCargando(false);
                    setMediciones([]);
                }
                return;
            }
            try {
                setCargando(true);
                const data = await listarMediciones(loteId);
                if (mountedRef.current) {
                    setMediciones(data);
                    setError(null);
                }
            } catch (err) {
                console.error('Error al cargar mediciones:', err);
                if (mountedRef.current) {
                    setError('No se pudieron cargar las mediciones');
                }
            } finally {
                if (mountedRef.current) {
                    setCargando(false);
                }
            }
        };

        cargarMediciones();
    }, [loteId]);

    if (cargando) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Cargando mediciones...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (mediciones.length === 0) {
        return (
            <div className="flex justify-center items-center h-64 flex-col gap-2">
                <p className="text-gray-500">No hay mediciones NDVI para este lote</p>
                <p className="text-sm text-gray-400">Las mediciones se recolectan automáticamente cada 5 días</p>
            </div>
        );
    }

    const ultimoNDVI = mediciones[mediciones.length - 1]?.ndvi;
    const ndviValido = typeof ultimoNDVI === 'number' && !isNaN(ultimoNDVI) ? ultimoNDVI : 0;
    const fechaUltima = mediciones[mediciones.length - 1]?.fecha || '';

    const getEstadoCultivo = (ndvi: number) => {
        if (ndvi >= 0.6) return { texto: 'Excelente', color: 'text-green-600' };
        if (ndvi >= 0.4) return { texto: 'Bueno', color: 'text-blue-600' };
        if (ndvi >= 0.2) return { texto: 'Regular', color: 'text-yellow-600' };
        return { texto: 'Bajo', color: 'text-red-600' };
    };

    const estado = getEstadoCultivo(ndviValido);

    const medicionesValidas = mediciones.filter(m => typeof m.ndvi === 'number' && !isNaN(m.ndvi));
    
    const chartData = {
        labels: medicionesValidas.map(m => new Date(m.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })),
        datasets: [
            {
                label: 'NDVI',
                data: medicionesValidas.map(m => m.ndvi),
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                fill: true,
                tension: 0.3,
                pointBackgroundColor: medicionesValidas.map(m => {
                    const ndvi = m.ndvi;
                    if (ndvi >= 0.6) return '#22c55e';
                    if (ndvi >= 0.4) return '#3b82f6';
                    if (ndvi >= 0.2) return '#eab308';
                    return '#ef4444';
                }),
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    usePointStyle: true,
                    padding: 20,
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        return `NDVI: ${context.parsed.y.toFixed(3)}`;
                    },
                },
            },
        },
        scales: {
            y: {
                min: 0,
                max: 1,
                ticks: {
                    stepSize: 0.1,
                },
                grid: {
                    color: 'rgba(0,0,0,0.05)',
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        📊 Evolución NDVI
                    </h3>
                    {loteNombre && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Lote: {loteNombre}
                        </p>
                    )}
                </div>
                <div className="text-right">
                    <span className={`text-sm font-medium ${estado.color}`}>
                        {estado.texto}
                    </span>
                    <p className="text-xs text-gray-400">
                        Última medición: {fechaUltima ? new Date(fechaUltima).toLocaleDateString('es-AR') : 'Sin fecha'}
                    </p>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        NDVI: {ndviValido.toFixed(3)}
                    </p>
                </div>
            </div>

            <div className="h-64">
                <Line data={chartData} options={chartOptions} />
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>📅 {medicionesValidas.length} mediciones</span>
                    <span>🛰️ Fuente: {mediciones[0]?.fuente || 'sentinel-2'}</span>
                    <span>📈 Promedio: {(medicionesValidas.reduce((sum, m) => sum + m.ndvi, 0) / medicionesValidas.length).toFixed(3)}</span>
                </div>
            </div>
        </div>
    );
};

export default GraficoNDVI;