// TesisFrontend/src/types/DecisionCorte.ts

// Semáforo viejo (legacy, por compatibilidad)
export type SemaforoColor = '🟢 Corte' | '🟡 Esperar' | '🔴 Riesgo';

// ✅ Estados de alfalfa (nuevos)
export type EstadoAlfalfa =
    | 'Ventana de corte'
    | 'Crecimiento'
    | 'Rebrote'
    | 'Rastrojo / post-corte'
    | 'Máximo / saturado'
    | 'Sin clasificar';

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
    radiacion_historica?: number | null;
    radiacion_pronostico?: number | null;
    lluvia_ultimos_3_dias?: number | null;
    temp_max_ultimos_3_dias?: number | null;
    fuente_ndvi?: string;

    // Legacy (semáforo viejo)
    semaforo?: SemaforoColor | string;
    motivo?: string;
    recomendacion?: string;

    // ✅ Nuevos campos (estados de alfalfa)
    estado?: EstadoAlfalfa | string;
    mensaje?: string;
    tendencia?: 'subiendo' | 'estable' | 'bajando' | string;
    corte_detectado?: boolean;
    dias_desde_corte?: number | null;

    corte_id: number | null;
    created_at: string;
    updated_at: string;
}

export interface ResumenDecisiones {
    total: number;
    ventana_corte: number;
    crecimiento: number;
    rebrote: number;
    rastrojo: number;
    maximo: number;
}

export interface DecisionesResponse {
    success: boolean;
    data: DecisionCorte[];
    total?: number;
}