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

    // ✅ Solo Copernicus
    const medicionesFiltradas: Medicion[] = mediciones
        .filter(m => m.fuente === 'copernicus')
        .filter(m => m.ndvi !== null && m.ndvi !== undefined && !isNaN(m.ndvi))
        .sort((a, b) =>
            new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        );

    if (medicionesFiltradas.length === 0) {
        return (
            <div className="flex justify-center items-center h-64 flex-col gap-2">
                <p className="text-gray-500">No hay mediciones de Copernicus para este lote</p>
                <p className="text-sm text-gray-400">Esperando la próxima recolección satelital</p>
            </div>
        );
    }

    const ultimoNDVI = medicionesFiltradas[medicionesFiltradas.length - 1]?.ndvi;
    const ndviValido = typeof ultimoNDVI === 'number' && !isNaN(ultimoNDVI) ? ultimoNDVI : 0;
    const fechaUltima = medicionesFiltradas[medicionesFiltradas.length - 1]?.fecha || '';

    const getEstadoCultivo = (ndvi: number) => {
        if (ndvi >= 0.80) return { texto: 'Máximo / saturado', color: 'text-yellow-600' };
        if (ndvi >= 0.65) return { texto: 'Ventana de corte', color: 'text-green-600' };
        if (ndvi >= 0.45) return { texto: 'Crecimiento', color: 'text-blue-600' };
        if (ndvi >= 0.25) return { texto: 'Rebrote', color: 'text-yellow-600' };
        return { texto: 'Rastrojo / post-corte', color: 'text-gray-600' };
    };

    const estado = getEstadoCultivo(ndviValido);

    const medicionesValidas = medicionesFiltradas.filter(m => typeof m.ndvi === 'number' && !isNaN(m.ndvi));

    // ✅ Contar cortes, outliers y baja confianza
    const cortesDetectados = medicionesValidas.filter(m => m.es_corte === true).length;
    const outliersDetectados = medicionesValidas.filter(m => m.es_outlier === true).length;
    const bajaConfianzaDetectados = medicionesValidas.filter(m => m.baja_confianza === true).length;

    const etiquetaFuente = 'Copernicus';

    const chartData = {
        labels: medicionesValidas.map(m => {
            const fecha = new Date(m.fecha);
            return fecha.toLocaleDateString('es-AR', {
                day: '2-digit',
                month: 'short',
                timeZone: 'America/Argentina/Buenos_Aires'
            });
        }),
        datasets: [
            {
                label: 'NDVI (Copernicus)',
                data: medicionesValidas.map(m => m.ndvi),
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                fill: true,
                tension: 0,
                // ✅ Tamaño del punto: más grande si es corte u outlier
                pointRadius: medicionesValidas.map(m => {
                    if (m.es_corte) return 8;
                    if (m.es_outlier) return 7;
                    if (m.baja_confianza) return 4;
                    return 4;
                }),
                // ✅ Color del punto
                pointBackgroundColor: medicionesValidas.map(m => {
                    if (m.es_corte) return '#ef4444';            // 🔴 rojo = corte
                    if (m.es_outlier) return '#9ca3af';          // ⚪ gris = outlier
                    if (m.baja_confianza) return '#fbbf24';      // 🟡 amarillo = baja confianza
                    const ndvi = m.ndvi;
                    if (ndvi >= 0.80) return '#eab308';
                    if (ndvi >= 0.65) return '#22c55e';
                    if (ndvi >= 0.45) return '#3b82f6';
                    if (ndvi >= 0.25) return '#eab308';
                    return '#6b7280';
                }),
                pointBorderColor: medicionesValidas.map(m => {
                    if (m.es_corte) return '#991b1b';
                    if (m.es_outlier) return '#4b5563';
                    if (m.baja_confianza) return '#92400e';
                    return '#ffffff';
                }),
                pointBorderWidth: medicionesValidas.map(m => {
                    if (m.es_corte) return 2;
                    if (m.es_outlier) return 2;
                    if (m.baja_confianza) return 2;
                    return 1;
                }),
                // ✅ Borde punteado para baja confianza
                pointStyle: medicionesValidas.map(m => {
                    if (m.baja_confianza) return 'rectRot';
                    return 'circle';
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
                        const index = context.dataIndex;
                        const medicion = medicionesValidas[index];
                        const fuente = medicion?.fuente || 'copernicus';
                        let label = `NDVI: ${context.parsed.y.toFixed(3)} (${fuente})`;
                        if (medicion?.es_corte) label += ' ✂️ CORTE';
                        if (medicion?.es_outlier) label += ' ⚠️ Dato dudoso';
                        if (medicion?.baja_confianza) label += ' ⚠️ Baja confianza';
                        return label;
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
                        Última medición: {fechaUltima ? new Date(fechaUltima).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }) : 'Sin fecha'}
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
                    <span>🛰️ Fuente: {etiquetaFuente}</span>
                    <span>📈 Mediana: {(medicionesValidas.reduce((sum, m) => sum + m.ndvi, 0) / medicionesValidas.length).toFixed(3)}</span>
                </div>
                {/* ✅ Leyenda de cortes, outliers y baja confianza */}
                {(cortesDetectados > 0 || outliersDetectados > 0 || bajaConfianzaDetectados > 0) && (
                    <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400 mt-2 flex-wrap">
                        {cortesDetectados > 0 && (
                            <span className="flex items-center gap-1">
                                <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                                {cortesDetectados} corte{cortesDetectados > 1 ? 's' : ''} detectado{cortesDetectados > 1 ? 's' : ''}
                            </span>
                        )}
                        {outliersDetectados > 0 && (
                            <span className="flex items-center gap-1">
                                <span className="w-3 h-3 rounded-full bg-gray-400 inline-block"></span>
                                {outliersDetectados} dato{outliersDetectados > 1 ? 's' : ''} dudoso{outliersDetectados > 1 ? 's' : ''}
                            </span>
                        )}
                        {bajaConfianzaDetectados > 0 && (
                            <span className="flex items-center gap-1">
                                <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span>
                                {bajaConfianzaDetectados} con baja confianza
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GraficoNDVI;