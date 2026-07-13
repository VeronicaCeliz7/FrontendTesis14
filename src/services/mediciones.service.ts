import api from './api';

export interface Medicion {
    id: number;
    lote_id: number;
    fecha: string;
    ndvi: number;
    ndwi: number;
    imagen_url: string;
    fuente: string;
    created_at: string;
}

// Listar todas las mediciones de un lote
export const listarMediciones = async (loteId: number): Promise<Medicion[]> => {
    const response = await api.get(`/internal/mediciones/lote/${loteId}`);
    return response.data;
};

// Obtener la última medición de un lote
export const obtenerUltimaMedicion = async (loteId: number): Promise<Medicion | null> => {
    const response = await api.get(`/internal/mediciones/lote/${loteId}/ultima`);
    return response.data;
};

// Obtener el último NDVI de un lote
export const obtenerUltimoNDVI = async (loteId: number): Promise<{ fecha: string; ndvi: number } | null> => {
    const response = await api.get(`/internal/mediciones/lote/${loteId}/ultimo-ndvi`);
    return response.data;
};

// Crear una medición manual (para pruebas)
export const crearMedicion = async (
    loteId: number,
    fecha: string,
    ndvi: number,
    ndwi: number | null,
    imagenUrl: string | null,
    fuente: string
): Promise<Medicion> => {
    const response = await api.post('/internal/mediciones', {
        lote_id: loteId,
        fecha,
        ndvi,
        ndwi,
        imagen_url: imagenUrl,
        fuente: fuente || 'manual'
    });
    return response.data;
};