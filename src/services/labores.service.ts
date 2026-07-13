import api from './api';

export const listarLaboresPorLote = async (lote_id: number, token: string) => {
  const response = await api.get(`/internal/labores/lote/${lote_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const listarLaboresPorCampo = async (campo_id: number, token: string) => {
  const response = await api.get(`/internal/labores/campo/${campo_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const crearLabor = async (
  lote_id: number,
  tipo: string,
  fecha: string,
  producto: string,
  dosis: number,
  plaga: string,
  semilla: string,
  observaciones: string,
  token: string,
  metadata?: any  // ✅ Agregar metadata (opcional)
) => {
  const response = await api.post(
    '/internal/labores',
    { 
      lote_id, 
      tipo, 
      fecha, 
      producto, 
      dosis, 
      plaga, 
      semilla, 
      observaciones,
      metadata: metadata || {}  // ✅ Enviar metadata
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const eliminarLabor = async (id: number, lote_id: number, token: string) => {
  const response = await api.delete(`/internal/labores/${id}`, {
    data: { lote_id },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};