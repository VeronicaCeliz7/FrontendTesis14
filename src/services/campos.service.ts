import api from './api';

export interface Campo {
  id: number;
  nombre: string;
  ubicacion: string;
  latitud_centro: number;
  longitud_centro: number;
  created_at: string;
}

export const listarCampos = async (): Promise<Campo[]> => {
  const response = await api.get('/internal/campos');
  return response.data;
};

export const crearCampo = async (data: {
  nombre: string;
  ubicacion: string;
  latitud_centro: number;
  longitud_centro: number;
}): Promise<Campo> => {
  const response = await api.post('/internal/campos', data);
  return response.data;
};

export const eliminarCampo = async (id: number): Promise<void> => {
  await api.delete(`/internal/campos/${id}`);
};