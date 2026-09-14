// TesisFrontend/src/lib/axios.ts
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.PUBLIC_API_URL || 'http://localhost:3000/api/internal',
});

// ✅ Interceptor para agregar el token automáticamente
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