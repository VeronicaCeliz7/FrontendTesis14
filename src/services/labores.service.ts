// src/services/labores.service.ts
import api from './api';

// =============================================
// TIPOS
// =============================================
export interface CrearLaborData {
    lote_id: number;
    categoria: string;
    tipo: string;
    fecha: string;
    producto?: string;
    dosis?: number;
    plaga?: string;
    semilla?: string;
    observaciones?: string;
    operador?: string;
    maquinaria?: string;
    hectareas?: number;
    horas?: number;
    unidad?: string;
    costo?: number;
    // URLs de Cloudinary
    receta_url?: string | null;
    fotos?: string[];
    // Metadata extra
    metadata_extra?: Record<string, any>;
}

export interface FiltrosLabor {
    categoria?: string;
    desde?: string;
    hasta?: string;
}

// =============================================
// LISTAR POR LOTE
// =============================================
export const listarLaboresPorLote = async (
    lote_id: number,
    token: string,
    filtros?: FiltrosLabor
) => {
    const params = new URLSearchParams();
    if (filtros?.categoria) params.append('categoria', filtros.categoria);
    if (filtros?.desde) params.append('desde', filtros.desde);
    if (filtros?.hasta) params.append('hasta', filtros.hasta);

    const query = params.toString();
    const url = `/internal/labores/lote/${lote_id}${query ? `?${query}` : ''}`;

    const response = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// =============================================
// LISTAR POR CAMPO
// =============================================
export const listarLaboresPorCampo = async (campo_id: number, token: string) => {
    const response = await api.get(`/internal/labores/campo/${campo_id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// =============================================
// OBTENER UNA
// =============================================
export const obtenerLabor = async (id: number, token: string) => {
    const response = await api.get(`/internal/labores/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// =============================================
// CREAR (solo JSON, con URLs de Cloudinary)
// =============================================
export const crearLabor = async (data: CrearLaborData, token: string) => {
    const response = await api.post('/internal/labores', data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// =============================================
// ACTUALIZAR
// =============================================
export const actualizarLabor = async (
    id: number,
    data: Partial<CrearLaborData> & { lote_id: number },
    token: string
) => {
    const response = await api.put(
        `/internal/labores/${id}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

// =============================================
// ELIMINAR
// =============================================
export const eliminarLabor = async (id: number, lote_id: number, token: string) => {
    const response = await api.delete(`/internal/labores/${id}`, {
        data: { lote_id },
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};