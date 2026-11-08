import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo.png', 'og-image.jpg'],
      manifest: {
        name: 'AlfaTrace',
        short_name: 'AlfaTrace',
        description: 'Trazabilidad digital para tu alfalfa',
        theme_color: '#064e3b',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/campo',
        icons: [
          {
            src: '/logo.png', 
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/logo.png', 
            sizes: '512x512', // 👈 Aseguramos el tamaño grande
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