import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.PROD
    ? 'https://backendtesis7.onrender.com/api'
    : 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
// Interceptor: agrega el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;