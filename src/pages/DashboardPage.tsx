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
interface Lote {
    id: number;
    nombre: string;
}

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

    // =============================================
    // ELIMINAR VENTA
    // =============================================
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

    // =============================================
    // EFFECTS
    // =============================================
    useEffect(() => {
        cargarLotes();
    }, []);

    useEffect(() => {
        if (loteSeleccionadoId) cargarDatosLote(loteSeleccionadoId);
    }, [loteSeleccionadoId]);

    const loteActual = lotes.find(l => l.id === loteSeleccionadoId);

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">📦 Stock y Ventas</h1>
                    <p className="text-sm text-gray-500">Control de inventario de rollos por lote</p>
                </div>

                <div className="flex items-center gap-3">
                    <Select
                        value={loteSeleccionadoId ? String(loteSeleccionadoId) : ''}
                        onValueChange={(v) => setLoteSeleccionadoId(Number(v))}
                    >
                        <SelectTrigger className="w-[200px]">
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
                        className="bg-[#0f7a50] hover:bg-[#064e3b] text-white"
                        disabled={!stock || stock.total.stock === 0}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Registrar Venta
                    </Button>
                </div>
            </div>

            {cargando ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0f7a50] mx-auto"></div>
                    <p className="mt-4 text-gray-500">Cargando datos...</p>
                </div>
            ) : !stock ? (
                <div className="text-center py-20 text-gray-500">
                    No hay datos disponibles para este lote.
                </div>
            ) : (
                <>
                    {/* TARJETAS DE STOCK */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-l-4 border-l-gray-400">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Stock Total</p>
                                        <p className="text-3xl font-bold text-gray-900">{stock.total.stock}</p>
                                        <p className="text-xs text-gray-500 mt-1">Rollos en galpón</p>
                                    </div>
                                    <Package className="h-10 w-10 text-gray-300" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-[#0f7a50]">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-[#0f7a50]">Excelente</p>
                                        <p className="text-3xl font-bold text-[#064e3b]">{stock.excelente.stock}</p>
                                        <p className="text-xs text-gray-500 mt-1">Producidos: {stock.excelente.producido} | Vendidos: {stock.excelente.vendido}</p>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-[#0f7a50]/10 flex items-center justify-center">
                                        <span className="text-[#0f7a50] font-bold">E</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-amber-500">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-amber-600">Media</p>
                                        <p className="text-3xl font-bold text-amber-700">{stock.media.stock}</p>
                                        <p className="text-xs text-gray-500 mt-1">Producidos: {stock.media.producido} | Vendidos: {stock.media.vendido}</p>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                                        <span className="text-amber-600 font-bold">M</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* HISTORIAL DE VENTAS */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Scale className="h-5 w-5 text-gray-500" /> Historial de Ventas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {ventas.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    No hay ventas registradas para este lote.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead>Comprador</TableHead>
                                            <TableHead>Calidad</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead className="text-right">Rollos</TableHead>
                                            <TableHead className="text-right">Kilos</TableHead>
                                            <TableHead className="text-right">Total ($)</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {ventas.map((venta) => (
                                            <TableRow key={venta.id}>
                                                <TableCell>{fmtFecha(venta.fecha)}</TableCell>
                                                <TableCell className="font-medium">{venta.comprador}</TableCell>
                                                <TableCell>
                                                    <Badge className={venta.calidad_vendida === 'Excelente' ? 'bg-[#0f7a50]/10 text-[#0f7a50]' : 'bg-amber-100 text-amber-700'}>
                                                        {venta.calidad_vendida}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="capitalize">{venta.tipo_venta.replace('_', ' ')}</TableCell>
                                                <TableCell className="text-right">{venta.cantidad_rollos}</TableCell>
                                                <TableCell className="text-right">
                                                    {venta.cantidad_kg ? `${venta.cantidad_kg} kg` : '—'}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    ${venta.costo_total?.toLocaleString('es-AR')}
                                                </TableCell>
                                                <TableCell>
                                                    {venta.pagado ? (
                                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Pagado</Badge>
                                                    ) : (
                                                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Pendiente</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setVentaAEliminar(venta)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar esta venta?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Estás por eliminar la venta a <strong>{ventaAEliminar?.comprador}</strong>.
                            <br /><br />
                            Los rollos volverán al stock. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleEliminarVenta} className="bg-red-600 hover:bg-red-700">
                            Sí, eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default DashboardPage;