import axios from 'axios';

const API_URL = 'http://localhost:3000/api/internal'; // ✅ Correcto

export interface Campo {
  id: number;
  nombre: string;
  ubicacion: string;
  latitud_centro: number;
  longitud_centro: number;
  created_at: string;
}

export const listarCampos = async (token: string): Promise<Campo[]> => {
  const response = await axios.get(`${API_URL}/campos`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const crearCampo = async (token: string, data: {
  nombre: string;
  ubicacion: string;
  latitud_centro: number;
  longitud_centro: number;
}): Promise<Campo> => {
  const response = await axios.post(`${API_URL}/campos`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const eliminarCampo = async (token: string, id: number): Promise<void> => {
  await axios.delete(`${API_URL}/campos/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};