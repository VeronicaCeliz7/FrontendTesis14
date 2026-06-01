// src/services/lotes.service.ts
import api from './api';

export const listarLotes = async (token: string) => {
  const response = await api.get('/internal/lotes', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const crearLote = async (
  nombre: string,
  poligono: any,
  hectareas: number,
  token: string
) => {
  const response = await api.post(
    '/internal/lotes',
    { nombre, poligono_geojson: poligono, hectareas },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};