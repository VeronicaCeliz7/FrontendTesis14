// src/components/forms/LaborFormModal.tsx
import { useState } from 'react';
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

interface LaborFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    lotes: { id: number; nombre: string }[];
}

const LaborFormModal = ({ isOpen, onClose, onSuccess, lotes }: LaborFormModalProps) => {
    const [loteId, setLoteId] = useState<number | null>(null);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Nueva Labor</DialogTitle>
                    <DialogDescription>
                        Registrá una labor en el cuaderno de campo digital
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Selector de lote */}
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

                    {/* Formulario (solo si hay lote) */}
                    {loteId ? (
                        <LaborForm
                            loteId={loteId}
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