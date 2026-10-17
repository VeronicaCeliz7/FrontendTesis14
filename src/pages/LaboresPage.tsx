// src/pages/LaboresPage.tsx
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { listarLotes } from '../services/lotes.service';
import { listarLaboresPorLote, eliminarLabor } from '../services/labores.service';
import LaborFormModal from '../components/forms/LaborFormModal';
import { exportarLaboresPDF } from '../utils/exportarLaboresPDF';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../components/ui/dialog';
import {
    Eye, Trash2, Plus, Settings2, ArrowUpDown, Pencil, Download,
} from 'lucide-react';
import toast from 'react-hot-toast';

// =============================================
// TIPOS
// =============================================
interface Lote {
    id: number;
    nombre: string;
}

interface Labor {
    id: number;
    lote_id: number;
    lote_nombre?: string;
    categoria: string;
    tipo: string;
    fecha: string;
    producto?: string;
    dosis?: number;
    plaga?: string;
    semilla?: string;
    observaciones?: string;
    clima?: {
        lluvia_ultimos_3_dias?: number;
        temp_max_ultimos_3_dias?: number;
        lluvia_prox_48h?: number;
        lluvia_prox_72h?: number;
        temp_max_prox_3d?: number;
    };
    metadata?: {
        operador?: string;
        maquinaria?: string;
        tipo_maquina?: string;
        clasificacion?: string;
        marca_modelo?: string;
        hectareas?: number;
        horas?: number;
        unidad?: string;
        costo?: number;
        cantidad_total?: number;
        calidad?: {
            excelente?: number;
            buena?: number;
            media?: number;
        };
        receta_url?: string;
        fotos?: string[];
    };
    created_at?: string;
    updated_at?: string;
}

// =============================================
// COLUMNAS
// =============================================
const COLUMNAS = {
    fecha: 'Fecha',
    categoria: 'Categoría',
    tipo: 'Tipo',
    maquina: 'Máquina',
    cantidad: 'Cantidad',
    calidad: 'Calidad',
    operador: 'Operador',
    hectareas: 'Hectáreas',
    clima: 'Clima',
    archivos: 'Archivos',
    acciones: 'Acciones',
};

const COLUMNAS_DEFAULT = ['fecha', 'categoria', 'tipo', 'cantidad', 'acciones'];

// =============================================
// COLORES POR CATEGORÍA (sin emojis)
// =============================================
const colorCategoria = (categoria: string) => {
    switch (categoria) {
        case 'Siembra': return 'bg-green-100 text-green-800';
        case 'Riego': return 'bg-cyan-100 text-cyan-800';
        case 'Fumigación': return 'bg-red-100 text-red-800';
        case 'Corte': return 'bg-yellow-100 text-yellow-800';
        case 'Rastrillado': return 'bg-lime-100 text-lime-800';
        case 'Henificación': return 'bg-amber-100 text-amber-800';
        case 'Labranza': return 'bg-orange-100 text-orange-800';
        case 'Arreglos y mantenimiento': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

// =============================================
// Helper: detectar si es PDF
// =============================================
function esPdf(url: string) {
    return url.toLowerCase().includes('.pdf');
}

// =============================================
// Helper: formatear número a 1 decimal
// =============================================
function fmt(valor: number | undefined | null) {
    if (valor === undefined || valor === null) return '—';
    return Number(valor).toFixed(1);
}

// =============================================
// COMPONENTE
// =============================================
const LaboresPage = () => {
    const [lotes, setLotes] = useState<Lote[]>([]);
    const [labores, setLabores] = useState<Labor[]>([]);
    const [cargando, setCargando] = useState(false);

    // Modales
    const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
    const [laborAEditar, setLaborAEditar] = useState<Labor | null>(null);

    const [loteSeleccionadoId, setLoteSeleccionadoId] = useState<number | null>(null);
    const [laborAEliminar, setLaborAEliminar] = useState<Labor | null>(null);
    const [laborDetalle, setLaborDetalle] = useState<Labor | null>(null);

    // Imagen/PDF abierto en modal
    const [archivoAbierto, setArchivoAbierto] = useState<string | null>(null);

    // Filtros
    const [filtroDesde, setFiltroDesde] = useState<string>('');
    const [filtroHasta, setFiltroHasta] = useState<string>('');

    // Orden
    const [ordenPor, setOrdenPor] = useState<string>('fecha');
    const [ordenDireccion, setOrdenDireccion] = useState<'asc' | 'desc'>('desc');

    // Columnas visibles
    const [columnasVisibles, setColumnasVisibles] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('labores_columnas');
            return saved ? JSON.parse(saved) : COLUMNAS_DEFAULT;
        } catch {
            return COLUMNAS_DEFAULT;
        }
    });

    const { token } = useAuth();

    // =============================================
    // CARGA
    // =============================================
    const cargarLotes = async () => {
        try {
            const data = await listarLotes();
            setLotes(data);
            if (data.length > 0 && !loteSeleccionadoId) {
                setLoteSeleccionadoId(data[0].id);
            }
        } catch (err) {
            toast.error('Error al cargar lotes');
        }
    };

    const cargarLabores = async (loteId: number) => {
        setCargando(true);
        try {
            const filtros = {
                desde: filtroDesde || undefined,
                hasta: filtroHasta || undefined,
            };
            const data = await listarLaboresPorLote(loteId, token!, filtros);
            setLabores(data);
        } catch (err) {
            toast.error('Error al cargar labores');
        } finally {
            setCargando(false);
        }
    };

    // =============================================
    // EXPORTAR PDF
    // =============================================
    const handleExportarPDF = () => {
        const loteActual = lotes.find(l => l.id === loteSeleccionadoId);
        if (!loteActual) {
            toast.error('Seleccioná un lote primero');
            return;
        }
        if (labores.length === 0) {
            toast.error('No hay labores para exportar');
            return;
        }

        try {
            exportarLaboresPDF({
                labores: laboresOrdenadas,
                lote: loteActual,
                usuario: null,
                desde: filtroDesde,
                hasta: filtroHasta,
            });
            toast.success('PDF generado');
        } catch (err) {
            console.error(err);
            toast.error('Error al generar el PDF');
        }
    };

    // =============================================
    // ELIMINAR
    // =============================================
    const handleEliminar = async () => {
        if (!laborAEliminar) return;
        try {
            await eliminarLabor(laborAEliminar.id, laborAEliminar.lote_id, token!);
            toast.success('Labor eliminada');
            setLaborAEliminar(null);
            if (loteSeleccionadoId) cargarLabores(loteSeleccionadoId);
        } catch (err) {
            toast.error('Error al eliminar');
        }
    };

    // =============================================
    // COLUMNAS
    // =============================================
    useEffect(() => {
        localStorage.setItem('labores_columnas', JSON.stringify(columnasVisibles));
    }, [columnasVisibles]);

    const toggleColumna = (col: string) => {
        setColumnasVisibles(prev =>
            prev.includes(col)
                ? prev.filter(c => c !== col)
                : [...prev, col]
        );
    };

    const mostrarTodas = () => {
        setColumnasVisibles(Object.keys(COLUMNAS));
    };

    const ocultarTodas = () => {
        setColumnasVisibles(COLUMNAS_DEFAULT);
    };

    // =============================================
    // ORDEN
    // =============================================
    const handleOrden = (col: string) => {
        if (ordenPor === col) {
            setOrdenDireccion(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setOrdenPor(col);
            setOrdenDireccion('desc');
        }
    };

    const laboresOrdenadas = useMemo(() => {
        const copia = [...labores];
        copia.sort((a, b) => {
            let valA: any, valB: any;

            switch (ordenPor) {
                case 'fecha':
                    valA = new Date(a.fecha).getTime();
                    valB = new Date(b.fecha).getTime();
                    break;
                case 'categoria':
                    valA = a.categoria;
                    valB = b.categoria;
                    break;
                case 'tipo':
                    valA = a.tipo;
                    valB = b.tipo;
                    break;
                case 'cantidad':
                    valA = a.metadata?.cantidad_total || 0;
                    valB = b.metadata?.cantidad_total || 0;
                    break;
                default:
                    return 0;
            }

            if (valA < valB) return ordenDireccion === 'asc' ? -1 : 1;
            if (valA > valB) return ordenDireccion === 'asc' ? 1 : -1;
            return 0;
        });
        return copia;
    }, [labores, ordenPor, ordenDireccion]);

    // =============================================
    // EFFECTS
    // =============================================
    useEffect(() => {
        cargarLotes();
    }, []);

    useEffect(() => {
        if (loteSeleccionadoId) cargarLabores(loteSeleccionadoId);
    }, [loteSeleccionadoId, filtroDesde, filtroHasta]);

    // =============================================
    // RENDER
    // =============================================
    const ver = (col: string) => columnasVisibles.includes(col);

    const adjuntosDetalle = laborDetalle
        ? [
            ...(laborDetalle.metadata?.receta_url ? [laborDetalle.metadata.receta_url] : []),
            ...(laborDetalle.metadata?.fotos || [])
        ]
        : [];

    const loteNombreDetalle = laborDetalle
        ? lotes.find(l => l.id === laborDetalle.lote_id)?.nombre || laborDetalle.lote_nombre || 'Sin lote'
        : '';

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-green-700">Labores</h1>
                    <p className="text-sm text-gray-500">Trazabilidad digital</p>
                </div>
                <div className="flex gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Settings2 className="mr-2 h-4 w-4" /> Columnas
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {Object.entries(COLUMNAS).map(([key, label]) => (
                                <DropdownMenuCheckboxItem
                                    key={key}
                                    checked={ver(key)}
                                    onCheckedChange={() => toggleColumna(key)}
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    {label}
                                </DropdownMenuCheckboxItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem
                                checked={false}
                                onSelect={mostrarTodas}
                            >
                                Mostrar todas
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={false}
                                onSelect={ocultarTodas}
                            >
                                Restablecer
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        variant="outline"
                        onClick={handleExportarPDF}
                        disabled={labores.length === 0}
                    >
                        <Download className="mr-2 h-4 w-4" /> Exportar PDF
                    </Button>

                    <Button
                        onClick={() => setModalCrearAbierto(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Nueva Labor
                    </Button>
                </div>
            </div>

            {/* Filtros */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label className="text-xs">Lote</Label>
                            <Select
                                value={loteSeleccionadoId ? String(loteSeleccionadoId) : ''}
                                onValueChange={(v) => setLoteSeleccionadoId(Number(v))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar lote" />
                                </SelectTrigger>
                                <SelectContent>
                                    {lotes.map((lote) => (
                                        <SelectItem key={lote.id} value={String(lote.id)}>
                                            {lote.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-xs">Desde</Label>
                            <Input
                                type="date"
                                value={filtroDesde}
                                onChange={(e) => setFiltroDesde(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label className="text-xs">Hasta</Label>
                            <Input
                                type="date"
                                value={filtroHasta}
                                onChange={(e) => setFiltroHasta(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabla */}
            {cargando ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">Cargando labores...</p>
                </div>
            ) : labores.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <p className="text-gray-500">No hay labores registradas para este lote.</p>
                        <Button
                            onClick={() => setModalCrearAbierto(true)}
                            variant="outline"
                            className="mt-4"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Registrar la primera
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {ver('fecha') && (
                                    <TableHead
                                        className="cursor-pointer select-none"
                                        onClick={() => handleOrden('fecha')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Fecha
                                            {ordenPor === 'fecha' && <ArrowUpDown className="h-3 w-3" />}
                                        </div>
                                    </TableHead>
                                )}
                                {ver('categoria') && (
                                    <TableHead
                                        className="cursor-pointer select-none"
                                        onClick={() => handleOrden('categoria')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Categoría
                                            {ordenPor === 'categoria' && <ArrowUpDown className="h-3 w-3" />}
                                        </div>
                                    </TableHead>
                                )}
                                {ver('tipo') && (
                                    <TableHead
                                        className="cursor-pointer select-none"
                                        onClick={() => handleOrden('tipo')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Tipo
                                            {ordenPor === 'tipo' && <ArrowUpDown className="h-3 w-3" />}
                                        </div>
                                    </TableHead>
                                )}
                                {ver('maquina') && <TableHead>Máquina</TableHead>}
                                {ver('cantidad') && (
                                    <TableHead
                                        className="cursor-pointer select-none"
                                        onClick={() => handleOrden('cantidad')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Cantidad
                                            {ordenPor === 'cantidad' && <ArrowUpDown className="h-3 w-3" />}
                                        </div>
                                    </TableHead>
                                )}
                                {ver('calidad') && <TableHead>Calidad</TableHead>}
                                {ver('operador') && <TableHead>Operador</TableHead>}
                                {ver('hectareas') && <TableHead>Hectáreas</TableHead>}
                                {ver('clima') && <TableHead>Clima</TableHead>}
                                {ver('archivos') && <TableHead>Archivos</TableHead>}
                                {ver('acciones') && <TableHead className="text-right">Acciones</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {laboresOrdenadas.map((labor) => {
                                const adjuntos = [
                                    ...(labor.metadata?.receta_url ? [labor.metadata.receta_url] : []),
                                    ...(labor.metadata?.fotos || [])
                                ];
                                return (
                                    <TableRow key={labor.id}>
                                        {ver('fecha') && (
                                            <TableCell className="whitespace-nowrap">
                                                {new Date(labor.fecha).toLocaleDateString('es-AR')}
                                            </TableCell>
                                        )}
                                        {ver('categoria') && (
                                            <TableCell>
                                                <Badge className={colorCategoria(labor.categoria)}>
                                                    {labor.categoria}
                                                </Badge>
                                            </TableCell>
                                        )}
                                        {ver('tipo') && (
                                            <TableCell className="font-medium">{labor.tipo}</TableCell>
                                        )}
                                        {ver('maquina') && (
                                            <TableCell>
                                                {labor.metadata?.tipo_maquina || labor.metadata?.maquinaria || '—'}
                                                {labor.metadata?.clasificacion && (
                                                    <span className="text-xs text-gray-500 ml-1">
                                                        ({labor.metadata.clasificacion})
                                                    </span>
                                                )}
                                            </TableCell>
                                        )}
                                        {ver('cantidad') && (
                                            <TableCell>
                                                {labor.metadata?.cantidad_total
                                                    ? `${labor.metadata.cantidad_total}`
                                                    : '—'}
                                            </TableCell>
                                        )}
                                        {ver('calidad') && (
                                            <TableCell>
                                                {labor.metadata?.calidad ? (
                                                    <div className="flex gap-2 text-xs">
                                                        {labor.metadata.calidad.excelente ? <span>E: {labor.metadata.calidad.excelente}</span> : null}
                                                        {labor.metadata.calidad.buena ? <span>B: {labor.metadata.calidad.buena}</span> : null}
                                                        {labor.metadata.calidad.media ? <span>M: {labor.metadata.calidad.media}</span> : null}
                                                    </div>
                                                ) : '—'}
                                            </TableCell>
                                        )}
                                        {ver('operador') && (
                                            <TableCell>{labor.metadata?.operador || '—'}</TableCell>
                                        )}
                                        {ver('hectareas') && (
                                            <TableCell>
                                                {labor.metadata?.hectareas ? `${labor.metadata.hectareas} ha` : '—'}
                                            </TableCell>
                                        )}
                                        {ver('clima') && (
                                            <TableCell>
                                                {labor.clima?.lluvia_ultimos_3_dias !== undefined ? (
                                                    <div className="flex gap-2 text-xs">
                                                        <span>{fmt(labor.clima.lluvia_ultimos_3_dias)}mm</span>
                                                        <span>{fmt(labor.clima.temp_max_ultimos_3_dias)}°C</span>
                                                    </div>
                                                ) : '—'}
                                            </TableCell>
                                        )}
                                        {ver('archivos') && (
                                            <TableCell>
                                                <div className="flex gap-2 text-xs">
                                                    {adjuntos.length > 0 ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => setArchivoAbierto(adjuntos[0])}
                                                                className="text-blue-600 hover:underline"
                                                            >
                                                                Ver archivo
                                                            </button>
                                                            {adjuntos.length > 1 && (
                                                                <span className="text-gray-600">
                                                                    +{adjuntos.length - 1}
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : '—'}
                                                </div>
                                            </TableCell>
                                        )}
                                        {ver('acciones') && (
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setLaborDetalle(labor)}
                                                        title="Ver detalle"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setLaborAEditar(labor)}
                                                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                                        title="Editar"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setLaborAEliminar(labor)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Card>
            )}

            {/* Modal CREAR */}
            <LaborFormModal
                isOpen={modalCrearAbierto}
                onClose={() => setModalCrearAbierto(false)}
                onSuccess={() => {
                    setModalCrearAbierto(false);
                    if (loteSeleccionadoId) cargarLabores(loteSeleccionadoId);
                }}
                lotes={lotes}
                laborInicial={null}
            />

            {/* Modal EDITAR */}
            <LaborFormModal
                isOpen={!!laborAEditar}
                onClose={() => setLaborAEditar(null)}
                onSuccess={() => {
                    setLaborAEditar(null);
                    if (loteSeleccionadoId) cargarLabores(loteSeleccionadoId);
                }}
                lotes={lotes}
                laborInicial={laborAEditar}
            />

            {/* Modal detalle */}
            <Dialog open={!!laborDetalle} onOpenChange={() => setLaborDetalle(null)}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">
                            {laborDetalle?.tipo}
                        </DialogTitle>
                    </DialogHeader>
                    {laborDetalle && (
                        <div className="space-y-4 text-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-gray-500">
                                    {new Date(laborDetalle.fecha).toLocaleDateString('es-AR')}
                                </p>
                                <p className="text-gray-500">
                                    Lote: {loteNombreDetalle}
                                </p>
                            </div>

                            <Badge className={colorCategoria(laborDetalle.categoria)}>
                                {laborDetalle.categoria}
                            </Badge>

                            {laborDetalle.metadata?.tipo_maquina && (
                                <div>
                                    <p className="font-semibold text-xs text-gray-500 uppercase tracking-wide">Máquina</p>
                                    <p>{laborDetalle.metadata.tipo_maquina}</p>
                                    {laborDetalle.metadata.clasificacion && (
                                        <p className="text-xs text-gray-500">{laborDetalle.metadata.clasificacion}</p>
                                    )}
                                    {laborDetalle.metadata.marca_modelo && (
                                        <p className="text-xs text-gray-500">{laborDetalle.metadata.marca_modelo}</p>
                                    )}
                                </div>
                            )}

                            {laborDetalle.metadata?.cantidad_total && (
                                <div>
                                    <p className="font-semibold text-xs text-gray-500 uppercase tracking-wide">Producción</p>
                                    <p>Total: {laborDetalle.metadata.cantidad_total}</p>
                                    {laborDetalle.metadata.calidad && (
                                        <div className="text-xs text-gray-600 mt-1">
                                            {laborDetalle.metadata.calidad.excelente ? <p>Excelente: {laborDetalle.metadata.calidad.excelente}</p> : null}
                                            {laborDetalle.metadata.calidad.buena ? <p>Buena: {laborDetalle.metadata.calidad.buena}</p> : null}
                                            {laborDetalle.metadata.calidad.media ? <p>Media: {laborDetalle.metadata.calidad.media}</p> : null}
                                        </div>
                                    )}
                                </div>
                            )}

                            {laborDetalle.producto && (
                                <div>
                                    <p className="font-semibold text-xs text-gray-500 uppercase tracking-wide">Insumo</p>
                                    <p>
                                        {laborDetalle.producto}
                                        {laborDetalle.dosis && ` - ${laborDetalle.dosis} ${laborDetalle.metadata?.unidad || ''}`}
                                    </p>
                                    {laborDetalle.plaga && <p className="text-xs text-gray-500">Plaga: {laborDetalle.plaga}</p>}
                                    {laborDetalle.semilla && <p className="text-xs text-gray-500">Variedad: {laborDetalle.semilla}</p>}
                                </div>
                            )}

                            {(laborDetalle.metadata?.operador || laborDetalle.metadata?.maquinaria || laborDetalle.metadata?.hectareas || laborDetalle.metadata?.horas || laborDetalle.metadata?.costo) && (
                                <div>
                                    <p className="font-semibold text-xs text-gray-500 uppercase tracking-wide">Ejecución</p>
                                    {laborDetalle.metadata.operador && <p>Operador: {laborDetalle.metadata.operador}</p>}
                                    {laborDetalle.metadata.maquinaria && <p>Maquinaria: {laborDetalle.metadata.maquinaria}</p>}
                                    {laborDetalle.metadata.hectareas && <p>Hectáreas: {laborDetalle.metadata.hectareas} ha</p>}
                                    {laborDetalle.metadata.horas && <p>Horas: {laborDetalle.metadata.horas} hs</p>}
                                    {laborDetalle.metadata.costo && <p>Costo: ${laborDetalle.metadata.costo}</p>}
                                </div>
                            )}

                            {laborDetalle.clima && (
                                <div>
                                    <p className="font-semibold text-xs text-gray-500 uppercase tracking-wide">Clima</p>
                                    <div className="text-xs space-y-0.5">
                                        {laborDetalle.clima.lluvia_ultimos_3_dias !== undefined && (
                                            <p>Lluvia (3 días): {fmt(laborDetalle.clima.lluvia_ultimos_3_dias)} mm</p>
                                        )}
                                        {laborDetalle.clima.temp_max_ultimos_3_dias !== undefined && (
                                            <p>Temp máx (3 días): {fmt(laborDetalle.clima.temp_max_ultimos_3_dias)} °C</p>
                                        )}
                                        {laborDetalle.clima.lluvia_prox_48h !== undefined && (
                                            <p>Lluvia próx 48h: {fmt(laborDetalle.clima.lluvia_prox_48h)} mm</p>
                                        )}
                                        {laborDetalle.clima.temp_max_prox_3d !== undefined && (
                                            <p>Temp máx próx 3d: {fmt(laborDetalle.clima.temp_max_prox_3d)} °C</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {adjuntosDetalle.length > 0 && (
                                <div>
                                    <p className="font-semibold text-xs text-gray-500 uppercase tracking-wide">
                                        Archivos ({adjuntosDetalle.length})
                                    </p>
                                    <div className="space-y-2 mt-1">
                                        {adjuntosDetalle.map((url, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setArchivoAbierto(url)}
                                                    className="text-blue-600 hover:underline text-sm"
                                                >
                                                    Ver archivo {i + 1}
                                                </button>
                                                {!esPdf(url) && (
                                                    <img
                                                        src={url}
                                                        alt=""
                                                        className="w-12 h-12 object-cover rounded border cursor-pointer"
                                                        onClick={() => setArchivoAbierto(url)}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {laborDetalle.observaciones && (
                                <div>
                                    <p className="font-semibold text-xs text-gray-500 uppercase tracking-wide">Observaciones</p>
                                    <p className="italic text-gray-700">{laborDetalle.observaciones}</p>
                                </div>
                            )}

                            <div className="flex gap-2 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        const labor = laborDetalle;
                                        setLaborDetalle(null);
                                        setLaborAEditar(labor);
                                    }}
                                    className="flex-1"
                                >
                                    <Pencil className="mr-2 h-4 w-4" /> Editar
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        const labor = laborDetalle;
                                        setLaborDetalle(null);
                                        setLaborAEliminar(labor);
                                    }}
                                    className="flex-1 text-red-600 hover:text-red-700 border-red-200"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Modal de imagen/PDF */}
            <Dialog open={!!archivoAbierto} onOpenChange={() => setArchivoAbierto(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Vista previa</DialogTitle>
                    </DialogHeader>
                    {archivoAbierto && (
                        <div className="flex items-center justify-center">
                            {esPdf(archivoAbierto) ? (
                                <iframe
                                    src={archivoAbierto}
                                    className="w-full h-[70vh] rounded"
                                    title="PDF"
                                />
                            ) : (
                                <img
                                    src={archivoAbierto}
                                    alt="Adjunto"
                                    className="max-w-full max-h-[70vh] object-contain rounded"
                                />
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* AlertDialog eliminar */}
            <AlertDialog open={!!laborAEliminar} onOpenChange={() => setLaborAEliminar(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar esta labor?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Estás por eliminar la labor <strong>{laborAEliminar?.tipo}</strong> del{' '}
                            <strong>{laborAEliminar && new Date(laborAEliminar.fecha).toLocaleDateString('es-AR')}</strong>.
                            <br /><br />
                            Esta acción <strong>no se puede deshacer</strong>.
                            {laborAEliminar?.metadata?.fotos && laborAEliminar.metadata.fotos.length > 0 && (
                                <>
                                    <br /><br />
                                    También se eliminarán los {laborAEliminar.metadata.fotos.length} archivos adjuntos.
                                </>
                            )}
                            {laborAEliminar?.metadata?.receta_url && (
                                <>
                                    <br />
                                    También se eliminará el archivo principal adjunto.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleEliminar}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Sí, eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default LaboresPage;