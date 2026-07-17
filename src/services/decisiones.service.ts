// TesisFrontend/src/services/decisiones.service.ts
import axios from 'axios';

// =============================================
// CONFIGURACIÓN BASE (VITE)
// =============================================
// ✅ Vite usa import.meta.env en lugar de process.env
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
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('⚠️ No hay token de autenticación');
            return null;
        }

        const response = await axios.get<DecisionCorte>(
            `${API_URL}/decisiones/ultima/${loteId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        
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
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('⚠️ No hay token de autenticación');
            return [];
        }

        const response = await axios.get<DecisionesResponse>(
            `${API_URL}/decisiones/lote/${loteId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        
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
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('⚠️ No hay token de autenticación');
            return [];
        }

        const response = await axios.get<DecisionesResponse>(
            `${API_URL}/decisiones/recientes`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        
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
        const token = localStorage.getItem('token');
        if (!token) {
            return { verde: 0, amarillo: 0, rojo: 0, total: 0 };
        }

        const response = await axios.get<{
            verde: number;
            amarillo: number;
            rojo: number;
            total: number;
        }>(
            `${API_URL}/decisiones/resumen`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        
        return response.data;
    } catch (error: any) {
        console.error('❌ Error obteniendo resumen de decisiones:', error);
        return { verde: 0, amarillo: 0, rojo: 0, total: 0 };
    }
}