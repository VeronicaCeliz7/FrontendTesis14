// src/components/forms/LaborFormModal.tsx
import { useState } from 'react';
import LaborForm from './LaborForm';

interface LaborFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lotes: { id: number; nombre: string }[];
}

const LaborFormModal = ({ isOpen, onClose, onSuccess, lotes }: LaborFormModalProps) => {
  const [loteId, setLoteId] = useState<number | ''>('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Nueva Labor</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Lote *</label>
          <select
            value={loteId}
            onChange={(e) => setLoteId(Number(e.target.value))}
            className="w-full border rounded-md p-2"
            required
          >
            <option value="">-- Seleccionar lote --</option>
            {lotes.map((lote) => (
              <option key={lote.id} value={lote.id}>{lote.nombre}</option>
            ))}
          </select>
        </div>

        {loteId ? (
          <LaborForm
            loteId={loteId as number}
            onSuccess={() => {
              onSuccess();
              onClose();
            }}
            onCancel={onClose}
          />
        ) : (
          <p className="text-yellow-600 text-sm mt-2">Seleccioná un lote para continuar</p>
        )}
      </div>
    </div>
  );
};

export default LaborFormModal;