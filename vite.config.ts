import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo-oficial.png', 'og-image.jpg'], // 👈 Nombre nuevo
      manifest: {
        id: '/', // 👈 Fuerza a crear un nuevo registro en Android
        name: 'AlfaTrace',
        short_name: 'AlfaTrace',
        description: 'Trazabilidad digital para tu alfalfa',
        theme_color: '#064e3b',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/', // Para que abra la app web por defecto
        icons: [
          {
            src: '/logo-oficial.png', // 👈 Nombre nuevo
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/logo-oficial.png', // 👈 Nombre nuevo
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  envPrefix: ['VITE_', 'PUBLIC_'],
});