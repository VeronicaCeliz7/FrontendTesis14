// src/services/lotes.service.ts
import api from './api';

// Listar todos los lotes del usuario
export const listarLotes = async (token: string) => {
  const response = await api.get('/internal/lotes', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Listar lotes por campo
export const listarLotesPorCampo = async (campoId: number, token: string) => {
  const response = await api.get(`/internal/lotes?campo_id=${campoId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Crear un nuevo lote
export const crearLote = async (
  nombre: string,
  poligono: any,
  hectareas: number,
  campo_id: number,
  token: string
) => {
  const response = await api.post(
    '/internal/lotes',
    { nombre, poligono_geojson: poligono, hectareas, campo_id },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// Eliminar un lote
export const eliminarLote = async (id: number, campo_id: number, token: string) => {
  const response = await api.delete(`/internal/lotes/${id}`, {
    data: { campo_id },
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};