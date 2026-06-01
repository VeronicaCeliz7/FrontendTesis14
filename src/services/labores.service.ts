import api from './api';

export const crearLabor = async (
  lote_id: number,
  tipo: string,
  fecha: string,
  producto: string,
  dosis: number,
  plaga: string,
  semilla: string,
  observaciones: string,
  token: string
) => {
  const response = await api.post(
    '/internal/labores',
    { lote_id, tipo, fecha, producto, dosis, plaga, semilla, observaciones },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const listarLaboresPorLote = async (lote_id: number, token: string) => {
  const response = await api.get(`/internal/labores/lote/${lote_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};