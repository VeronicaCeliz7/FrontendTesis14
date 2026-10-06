// TesisFrontend/src/services/decisiones.service.ts
import api from '../lib/axios';
import type { DecisionCorte } from '../types/DecisionCorte';
export type { DecisionCorte };

// =============================================
// CONFIGURACIÓN BASE
// =============================================

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
    total: number;
    ventana_corte: number;
    crecimiento: number;
    rebrote: number;
    rastrojo: number;
    maximo: number;
}> {
    try {
        const response = await api.get<{
            total: number;
            ventana_corte: number;
            crecimiento: number;
            rebrote: number;
            rastrojo: number;
            maximo: number;
        }>('/decisiones/resumen');
        return response.data;
    } catch (error: any) {
        console.error('❌ Error obteniendo resumen de decisiones:', error);
        return { total: 0, ventana_corte: 0, crecimiento: 0, rebrote: 0, rastrojo: 0, maximo: 0 };
    }
}