// src/lib/axios.ts
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.PROD
        ? 'https://backendtesis7.onrender.com/api/internal'
        : 'http://localhost:3000/api/internal',
    withCredentials: true, // 👈 LA CLAVE: Permite enviar y recibir cookies
});

// Interceptor para agregar el token automáticamente (LO DEJAMOS POR AHORA)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;