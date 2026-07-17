// TesisFrontend/src/types/Alerta.ts

export type TipoAlerta = 'info' | 'warning' | 'error' | 'success';

export interface Alerta {
    id: number;
    lote_id: number;
    mensaje: string;
    tipo: TipoAlerta;
    leida: boolean;
    created_at: string;
}

export interface AlertasResponse {
    success: boolean;
    data: Alerta[];
}

export interface CreateAlertaPayload {
    lote_id: number;
    mensaje: string;
    tipo: TipoAlerta;
}