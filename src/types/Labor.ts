// TesisFrontend/src/types/Labor.ts

export type TipoLabor = 'siembra' | 'riego' | 'fertilizacion' | 'fumigacion' | 'cosecha' | 'otro';

export interface Labor {
    id: number;
    lote_id: number;
    tipo: TipoLabor;
    fecha: string;
    descripcion: string;
    hectareas: number;
    insumos: string | null;
    costo: number | null;
    observaciones: string | null;
    created_at: string;
    updated_at: string;
}

export interface LaborConLote extends Labor {
    lote_nombre: string;
    campo_nombre: string;
}

export interface LaboresResponse {
    success: boolean;
    data: Labor[];
    total?: number;
}

export interface CreateLaborPayload {
    lote_id: number;
    tipo: TipoLabor;
    fecha: string;
    descripcion: string;
    hectareas: number;
    insumos?: string;
    costo?: number;
    observaciones?: string;
}

export interface UpdateLaborPayload extends Partial<CreateLaborPayload> {
    id: number;
}