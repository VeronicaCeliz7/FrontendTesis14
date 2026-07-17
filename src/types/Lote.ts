// TesisFrontend/src/types/Lote.ts

export interface Lote {
    id: number;
    nombre: string;
    campo_id: number;
    usuario_id: number;
    hectareas: number;
    latitud: number | null;
    longitud: number | null;
    poligono_geojson: any;
    created_at: string;
    updated_at: string;
}

export interface LoteConCampo extends Lote {
    campo_nombre: string;
}

export interface LoteConDecision extends Lote {
    semaforo: '🟢 Corte' | '🟡 Esperar' | '🔴 Riesgo';
    ndvi_actual: number | null;
}

export interface LotesResponse {
    success: boolean;
    data: Lote[];
    total?: number;
}

export interface CreateLotePayload {
    nombre: string;
    campo_id: number;
    hectareas: number;
    poligono_geojson: any;
    latitud?: number;
    longitud?: number;
}

export interface UpdateLotePayload extends Partial<CreateLotePayload> {
    id: number;
}