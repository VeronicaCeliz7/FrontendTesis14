import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    // 🆕 Permite leer variables con prefijo PUBLIC_ (Vercel no las traduce)
    envPrefix: ['VITE_', 'PUBLIC_'],
});
