// TesisFrontend/src/pages/DashboardPage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { listarLotes } from '../services/lotes.service';
import { obtenerStock, listarVentas, eliminarVenta } from '../services/ventas.service';
import VentaModal from '../components/forms/VentaModal';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';
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
import { Badge } from '../components/ui/badge';
import { Plus, Trash2, Package, Scale } from 'lucide-react';
import toast from 'react-hot-toast';

// =============================================
// TIPOS
// =============================================
interface Lote { id: number; nombre: string; }

interface Venta {
    id: number;
    fecha: string;
    comprador: string;
    tipo_venta: 'por_unidad' | 'por_peso';
    calidad_vendida: 'Excelente' | 'Media';
    cantidad_rollos: number;
    cantidad_kg?: number;
    costo_total: number;
    pagado: boolean;
}

interface Stock {
    total: { producido: number; vendido: number; stock: number };
    excelente: { producido: number; vendido: number; stock: number };
    media: { producido: number; vendido: number; stock: number };
    kilos_vendidos: number;
}

// =============================================
// HELPERS
// =============================================
const fmtFecha = (fecha: string) => new Date(fecha).toLocaleDateString('es-AR');

const DashboardPage = () => {
    const { token } = useAuth();
    const [lotes, setLotes] = useState<Lote[]>([]);
    const [loteSeleccionadoId, setLoteSeleccionadoId] = useState<number | null>(null);
    const [stock, setStock] = useState<Stock | null>(null);
    const [ventas, setVentas] = useState<Venta[]>([]);
    const [cargando, setCargando] = useState(true);
    const [modalVentaAbierto, setModalVentaAbierto] = useState(false);
    const [ventaAEliminar, setVentaAEliminar] = useState<Venta | null>(null);

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

    const cargarDatosLote = async (loteId: number) => {
        setCargando(true);
        try {
            const [stockData, ventasData] = await Promise.all([
                obtenerStock(loteId, token!),
                listarVentas(loteId, token!)
            ]);
            setStock(stockData);
            setVentas(ventasData);
        } catch (err) {
            toast.error('Error al cargar datos del lote');
        } finally {
            setCargando(false);
        }
    };

    const handleEliminarVenta = async () => {
        if (!ventaAEliminar || !loteSeleccionadoId) return;
        try {
            await eliminarVenta(ventaAEliminar.id, loteSeleccionadoId, token!);
            toast.success('Venta eliminada');
            setVentaAEliminar(null);
            cargarDatosLote(loteSeleccionadoId);
        } catch (err) {
            toast.error('Error al eliminar');
        }
    };

    useEffect(() => { cargarLotes(); }, []);
    useEffect(() => { if (loteSeleccionadoId) cargarDatosLote(loteSeleccionadoId); }, [loteSeleccionadoId]);

    const loteActual = lotes.find(l => l.id === loteSeleccionadoId);

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white"> Stock y ventas</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Control de inventario de rollos por lote</p>
                </div>

                <div className="flex items-center gap-3">
                    <Select
                        value={loteSeleccionadoId ? String(loteSeleccionadoId) : ''}
                        onValueChange={(v) => setLoteSeleccionadoId(Number(v))}
                    >
                        <SelectTrigger className="w-[200px] bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
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

                    <Button
                        onClick={() => setModalVentaAbierto(true)}
                        className="bg-[#0f7a50] hover:bg-[#064e3b] text-white dark:bg-[#0f7a50] dark:hover:bg-[#064e3b]"
                        disabled={!stock || stock.total.stock === 0}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Registrar venta
                    </Button>
                </div>
            </div>

            {cargando ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0f7a50] mx-auto"></div>
                    <p className="mt-4 text-gray-500 dark:text-gray-400">Cargando datos...</p>
                </div>
            ) : !stock ? (
                <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                    No hay datos disponibles para este lote.
                </div>
            ) : (
                <>
                    {/* TARJETAS DE STOCK (Con dark mode) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 border-l-4 border-l-gray-400 dark:border-l-gray-500">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Stock total</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stock.total.stock}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Rollos en stock</p>
                                    </div>
                                    <Package className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 border-l-4 border-l-[#0f7a50]">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-[#0f7a50] dark:text-[#34d399]">Excelente</p>
                                        <p className="text-3xl font-bold text-[#064e3b] dark:text-white">{stock.excelente.stock}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Producidos: {stock.excelente.producido} | Vendidos: {stock.excelente.vendido}</p>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-[#0f7a50]/10 dark:bg-[#0f7a50]/20 flex items-center justify-center">
                                        <span className="text-[#0f7a50] dark:text-[#34d399] font-bold">E</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 border-l-4 border-l-amber-500">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Media</p>
                                        <p className="text-3xl font-bold text-amber-700 dark:text-white">{stock.media.stock}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Producidos: {stock.media.producido} | Vendidos: {stock.media.vendido}</p>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                        <span className="text-amber-600 dark:text-amber-400 font-bold">M</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* HISTORIAL DE VENTAS (Con dark mode) */}
                    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                                <Scale className="h-5 w-5 text-gray-500 dark:text-gray-400" /> Historial de ventas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {ventas.length === 0 ? (
                                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                                    No hay ventas registradas para este lote.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-gray-200 dark:border-gray-800">
                                            <TableHead className="text-gray-900 dark:text-gray-300">Fecha</TableHead>
                                            <TableHead className="text-gray-900 dark:text-gray-300">Comprador</TableHead>
                                            <TableHead className="text-gray-900 dark:text-gray-300">Calidad</TableHead>
                                            <TableHead className="text-gray-900 dark:text-gray-300">Tipo</TableHead>
                                            <TableHead className="text-right text-gray-900 dark:text-gray-300">Rollos</TableHead>
                                            <TableHead className="text-right text-gray-900 dark:text-gray-300">Kilos</TableHead>
                                            <TableHead className="text-right text-gray-900 dark:text-gray-300">Total ($)</TableHead>
                                            <TableHead className="text-gray-900 dark:text-gray-300">Estado</TableHead>
                                            <TableHead className="text-right text-gray-900 dark:text-gray-300">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {ventas.map((venta) => (
                                            <TableRow key={venta.id} className="border-gray-200 dark:border-gray-800">
                                                <TableCell className="text-gray-700 dark:text-gray-300">{fmtFecha(venta.fecha)}</TableCell>
                                                <TableCell className="font-medium text-gray-900 dark:text-white">{venta.comprador}</TableCell>
                                                <TableCell>
                                                    <Badge className={venta.calidad_vendida === 'Excelente' ? 'bg-[#0f7a50]/10 text-[#0f7a50] dark:bg-[#0f7a50]/20 dark:text-[#34d399]' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}>
                                                        {venta.calidad_vendida}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="capitalize text-gray-700 dark:text-gray-300">{venta.tipo_venta.replace('_', ' ')}</TableCell>
                                                <TableCell className="text-right text-gray-700 dark:text-gray-300">{venta.cantidad_rollos}</TableCell>
                                                <TableCell className="text-right text-gray-700 dark:text-gray-300">
                                                    {venta.cantidad_kg ? `${venta.cantidad_kg} kg` : '—'}
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-gray-900 dark:text-white">
                                                    ${venta.costo_total?.toLocaleString('es-AR')}
                                                </TableCell>
                                                <TableCell>
                                                    {venta.pagado ? (
                                                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30">Pagado</Badge>
                                                    ) : (
                                                        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30">Pendiente</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setVentaAEliminar(venta)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            {/* MODAL DE VENTA */}
            {loteSeleccionadoId && loteActual && stock && (
                <VentaModal
                    isOpen={modalVentaAbierto}
                    onClose={() => setModalVentaAbierto(false)}
                    onSuccess={() => cargarDatosLote(loteSeleccionadoId)}
                    loteId={loteSeleccionadoId}
                    loteNombre={loteActual.nombre}
                    stockExcelente={stock.excelente.stock}
                    stockMedia={stock.media.stock}
                />
            )}

            {/* ALERT DIALOG ELIMINAR */}
            <AlertDialog open={!!ventaAEliminar} onOpenChange={() => setVentaAEliminar(null)}>
                <AlertDialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-gray-900 dark:text-white">¿Eliminar esta venta?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
                            Estás por eliminar la venta a <strong className="text-gray-900 dark:text-white">{ventaAEliminar?.comprador}</strong>.
                            <br /><br />
                            Los rollos volverán al stock. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleEliminarVenta} className="bg-red-600 hover:bg-red-700 text-white">
                            Sí, eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default DashboardPage;