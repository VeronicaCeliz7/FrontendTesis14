// src/components/forms/VentaModal.tsx
import { useState } from 'react';
import { crearVenta, CrearVentaData } from '../../services/ventas.service';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface VentaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    loteId: number;
    loteNombre: string;
    stockExcelente: number;
    stockMedia: number;
}

const VentaModal = ({ isOpen, onClose, onSuccess, loteId, loteNombre, stockExcelente, stockMedia }: VentaModalProps) => {
    const { token } = useAuth();

    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [comprador, setComprador] = useState('');
    const [tipoVenta, setTipoVenta] = useState<'por_unidad' | 'por_peso'>('por_unidad');
    const [calidadVendida, setCalidadVendida] = useState<'Excelente' | 'Media'>('Media');
    const [cantidadRollos, setCantidadRollos] = useState('');
    const [cantidadKg, setCantidadKg] = useState('');
    const [costoTotal, setCostoTotal] = useState('');
    const [pagado, setPagado] = useState(false);
    const [notas, setNotas] = useState('');
    const [cargando, setCargando] = useState(false);

    const stockDisponible = calidadVendida === 'Excelente' ? stockExcelente : stockMedia;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!comprador) return toast.error('Ingresá el nombre del comprador');
        if (!cantidadRollos || parseInt(cantidadRollos) <= 0) return toast.error('Ingresá una cantidad válida');
        if (parseInt(cantidadRollos) > stockDisponible) return toast.error(`No hay suficiente stock. Máximo: ${stockDisponible}`);

        setCargando(true);
        try {
            const data: CrearVentaData = {
                lote_id: loteId,
                fecha,
                comprador,
                tipo_venta: tipoVenta,
                calidad_vendida: calidadVendida,
                cantidad_rollos: parseInt(cantidadRollos),
                cantidad_kg: tipoVenta === 'por_peso' && cantidadKg ? parseFloat(cantidadKg) : undefined,
                costo_total: costoTotal ? parseFloat(costoTotal) : undefined,
                pagado,
                notas: notas || undefined,
            };

            await crearVenta(data, token!);
            toast.success('Venta registrada');
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Error al registrar la venta');
        } finally {
            setCargando(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Registrar Venta</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="text-sm text-gray-500 mb-2">
                        Lote: <span className="font-semibold text-gray-800">{loteNombre}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Fecha</Label>
                            <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
                        </div>
                        <div>
                            <Label>Comprador</Label>
                            <Input value={comprador} onChange={(e) => setComprador(e.target.value)} placeholder="Ej: Haras Los Álamos" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Calidad</Label>
                            <select
                                value={calidadVendida}
                                onChange={(e) => setCalidadVendida(e.target.value as 'Excelente' | 'Media')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                            >
                                <option value="Excelente">Excelente (Stock: {stockExcelente})</option>
                                <option value="Media">Media (Stock: {stockMedia})</option>
                            </select>
                        </div>
                        <div>
                            <Label>Tipo de Venta</Label>
                            <select
                                value={tipoVenta}
                                onChange={(e) => setTipoVenta(e.target.value as 'por_unidad' | 'por_peso')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                            >
                                <option value="por_unidad">Por Unidad</option>
                                <option value="por_peso">Por Peso (Camión)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Cantidad de Rollos</Label>
                            <Input type="number" min="1" max={stockDisponible} value={cantidadRollos} onChange={(e) => setCantidadRollos(e.target.value)} required />
                        </div>
                        {tipoVenta === 'por_peso' && (
                            <div>
                                <Label>Kilos (Balanza)</Label>
                                <Input type="number" step="0.01" value={cantidadKg} onChange={(e) => setCantidadKg(e.target.value)} placeholder="Ej: 4200" />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Costo Total ($)</Label>
                            <Input type="number" step="0.01" value={costoTotal} onChange={(e) => setCostoTotal(e.target.value)} placeholder="Ej: 500000" />
                        </div>
                        <div className="flex items-end pb-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={pagado} onChange={(e) => setPagado(e.target.checked)} className="w-4 h-4" />
                                <span className="text-sm font-medium">¿Está pagado?</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <Label>Notas (opcional)</Label>
                        <Input value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Ej: Pagó con transferencia" />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={cargando} className="flex-1">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={cargando} className="flex-1 bg-[#0f7a50] hover:bg-[#064e3b] text-white">
                            {cargando ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : 'Registrar Venta'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default VentaModal;