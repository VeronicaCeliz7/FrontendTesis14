// src/services/ventas.service.ts
import api from './api';

export interface CrearVentaData {
    lote_id: number;
    fecha: string;
    comprador: string;
    tipo_venta: 'por_unidad' | 'por_peso';
    calidad_vendida: 'Excelente' | 'Media';
    cantidad_rollos: number;
    cantidad_kg?: number;
    costo_total?: number;
    pagado?: boolean;
    notas?: string;
}

// Obtener stock de un lote
export const obtenerStock = async (lote_id: number, token: string) => {
    const response = await api.get(`/internal/ventas/stock/${lote_id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// Listar ventas de un lote
export const listarVentas = async (lote_id: number, token: string) => {
    const response = await api.get(`/internal/ventas/${lote_id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// Crear venta
export const crearVenta = async (data: CrearVentaData, token: string) => {
    const response = await api.post('/internal/ventas', data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// Eliminar venta
export const eliminarVenta = async (id: number, lote_id: number, token: string) => {
    const response = await api.delete(`/internal/ventas/${id}`, {
        data: { lote_id },
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};