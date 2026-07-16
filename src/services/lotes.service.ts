import api from './api';

export interface Lote {
  id: number;
  nombre: string;
  hectareas: number;
  poligono_geojson: any;
  campo_id: number;
  created_at: string;
}

export const listarLotes = async (): Promise<Lote[]> => {
  const response = await api.get('/internal/lotes');
  return response.data;
};

export const listarLotesPorCampo = async (campoId: number): Promise<Lote[]> => {
  const response = await api.get(`/internal/lotes?campo_id=${campoId}&_=${Date.now()}`);
  return response.data;
};

export const crearLote = async (
  nombre: string,
  poligono: any,
  hectareas: number,
  campo_id: number
): Promise<Lote> => {
  const response = await api.post('/internal/lotes', {
    nombre,
    poligono_geojson: poligono,
    hectareas,
    campo_id
  });
  return response.data;
};

export const eliminarLote = async (id: number, campo_id: number): Promise<void> => {
  await api.delete(`/internal/lotes/${id}`, {
    data: { campo_id }
  });
};

// =============================================
// 🆕 NUEVO: Actualizar lote
// =============================================
export const actualizarLote = async (
  id: number,
  data: {
    nombre?: string;
    poligono_geojson?: any;
    hectareas?: number;
    campo_id: number;
  }
): Promise<Lote> => {
  const response = await api.put(`/internal/lotes/${id}`, {
    nombre: data.nombre,
    poligono_geojson: data.poligono_geojson,
    hectareas: data.hectareas,
    campo_id: data.campo_id
  });
  return response.data;
};