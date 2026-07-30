// TesisFrontend/src/services/decisiones.service.ts
import api from '../lib/axios';

// =============================================
// CONFIGURACIÓN BASE
// =============================================
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/internal';

// =============================================
// TIPOS / INTERFACES
// =============================================
export interface DecisionCorte {
    id: number;
    lote_id: number;
    fecha_analisis: string;
    ndvi_actual: number;
    ndvi_hace_7_dias: number;
    pendiente_ndvi: number;
    semaforo: '🟢 Corte' | '🟡 Esperar' | '🔴 Riesgo';
    motivo: string;
    recomendacion: string;
    radiacion_mj_m2: number;
    lluvia_prox_48h: number;
    lluvia_prox_72h: number;
    temp_max_prox_3d: number;
    created_at: string;
    updated_at: string;
}

export interface DecisionesResponse {
    success: boolean;
    data: DecisionCorte[];
    total?: number;
}

// =============================================
// FUNCIONES DEL SERVICIO
// =============================================

/**
 * Obtener la última decisión de corte de un lote
 */
export async function obtenerUltimaDecision(loteId: number): Promise<DecisionCorte | null> {
    try {
        const response = await api.get<DecisionCorte>(`/decisiones/ultima/${loteId}`);
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 404) {
            console.log(`ℹ️ No hay decisión para el lote ${loteId}`);
            return null;
        }
        console.error('❌ Error obteniendo última decisión:', error);
        return null;
    }
}

/**
 * Obtener todas las decisiones de un lote
 */
export async function obtenerDecisionesPorLote(loteId: number): Promise<DecisionCorte[]> {
    try {
        const response = await api.get<DecisionesResponse>(`/decisiones/lote/${loteId}`);
        return response.data.data || [];
    } catch (error: any) {
        console.error('❌ Error obteniendo decisiones del lote:', error);
        return [];
    }
}

/**
 * Obtener la decisión más reciente de todos los lotes (para el dashboard)
 */
export async function obtenerDecisionesRecientes(): Promise<DecisionCorte[]> {
    try {
        const response = await api.get<DecisionesResponse>('/decisiones/recientes');
        return response.data.data || [];
    } catch (error: any) {
        console.error('❌ Error obteniendo decisiones recientes:', error);
        return [];
    }
}

/**
 * Obtener el resumen de decisiones para todos los lotes
 */
export async function obtenerResumenDecisiones(): Promise<{
    verde: number;
    amarillo: number;
    rojo: number;
    total: number;
}> {
    try {
        const response = await api.get<{
            verde: number;
            amarillo: number;
            rojo: number;
            total: number;
        }>('/decisiones/resumen');
        return response.data;
    } catch (error: any) {
        console.error('❌ Error obteniendo resumen de decisiones:', error);
        return { verde: 0, amarillo: 0, rojo: 0, total: 0 };
    }
}