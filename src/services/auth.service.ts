import api from './api';

export const login = async (email: string, password: string) => {
  const response = await api.post('/internal/auth/login', { email, password });
  return response.data;
};

export const register = async (email: string, password: string, nombre: string) => {
  const response = await api.post('/internal/auth/register', { email, password, nombre });
  return response.data;
};