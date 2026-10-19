// src/components/forms/LaborFormModal.tsx
import { useState, useEffect } from 'react';
import LaborForm from './LaborForm';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '../ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';

// =============================================
// TIPO: Labor inicial (para edición)
// =============================================
interface LaborInicial {
    id: number;
    lote_id: number;
    categoria: string;
    tipo: string;
    fecha: string;
    producto?: string;
    dosis?: number;
    plaga?: string;
    semilla?: string;
    observaciones?: string;
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
}

interface LaborFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    lotes: { id: number; nombre: string }[];
    laborInicial?: LaborInicial | null;  // ← NUEVO
}

const LaborFormModal = ({ isOpen, onClose, onSuccess, lotes, laborInicial }: LaborFormModalProps) => {
    const [loteId, setLoteId] = useState<number | null>(null);

    const esEdicion = !!laborInicial;

    // =============================================
    // Cuando cambia laborInicial, actualizar loteId
    // =============================================
    useEffect(() => {
        if (laborInicial) {
            setLoteId(laborInicial.lote_id);
        } else {
            setLoteId(null);
        }
    }, [laborInicial]);

    // =============================================
    // Título según modo
    // =============================================
    const titulo = esEdicion ? 'Editar labor' : 'Nueva labor';
    const descripcion = esEdicion
        ? 'Modificá los datos de la labor'
        : 'Registrá una labor en el cuaderno de campo digital';

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{titulo}</DialogTitle>
                    <DialogDescription>{descripcion}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Selector de lote (solo si NO es edición) */}
                    {!esEdicion && (
                        <div>
                            <Label htmlFor="lote-select">Lote *</Label>
                            <Select
                                value={loteId ? String(loteId) : ''}
                                onValueChange={(v) => setLoteId(Number(v))}
                            >
                                <SelectTrigger id="lote-select" className="mt-1">
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
                    )}

                    {/* En edición: mostrar lote fijo */}
                    {esEdicion && laborInicial && (
                        <div>
                            <Label>Lote</Label>
                            <p className="text-sm mt-1 px-3 py-2 bg-gray-50 rounded-md">
                                {lotes.find(l => l.id === laborInicial.lote_id)?.nombre || `Lote ${laborInicial.lote_id}`}
                            </p>
                        </div>
                    )}

                    {/* Formulario (solo si hay lote) */}
                    {loteId ? (
                        <LaborForm
                            key={laborInicial?.id || 'nuevo'}
                            loteId={loteId}
                            laborInicial={laborInicial}
                            onSuccess={() => {
                                onSuccess();
                                onClose();
                            }}
                            onCancel={onClose}
                        />
                    ) : (
                        <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md">
                            Seleccioná un lote para continuar
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default LaborFormModal;