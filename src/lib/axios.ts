// src/lib/axios.ts
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.PROD
        ? 'https://backendtesis7.onrender.com/api/internal'
        : 'http://localhost:3000/api/internal',
});

// Interceptor para agregar el token automáticamente
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Si es FormData, dejar que axios setee el Content-Type con boundary
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