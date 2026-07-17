// TesisFrontend/src/types/DecisionCorte.ts

export type SemaforoColor = '🟢 Corte' | '🟡 Esperar' | '🔴 Riesgo';

export interface DecisionCorte {
    id: number;
    lote_id: number;
    fecha_analisis: string;
    ndvi_actual: number;
    ndvi_hace_7_dias: number | null;
    pendiente_ndvi: number | null;
    pendiente_prom_7d: number | null;
    altura_estimada_cm: number | null;
    altura_real_cm: number | null;
    lluvia_mm: number | null;
    temp_max: number | null;
    temp_min: number | null;
    humedad_prom: number | null;
    lluvia_prox_48h: number | null;
    lluvia_prox_72h: number | null;
    temp_max_prox_3d: number | null;
    riesgo_helada: boolean;
    radiacion_mj_m2: number | null;
    semaforo: SemaforoColor;
    motivo: string;
    recomendacion: string;
    corte_id: number | null;
    created_at: string;
    updated_at: string;
}

export interface ResumenDecisiones {
    verde: number;
    amarillo: number;
    rojo: number;
    total: number;
}

export interface DecisionesResponse {
    success: boolean;
    data: DecisionCorte[];
    total?: number;
}