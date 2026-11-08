import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; // 👈 Agregamos el plugin
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
        display: 'standalone', // 👈 Para que se abra como app nativa
        icons: [
          {
            src: '/logo.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png',
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
  // 🆕 Permite leer variables con prefijo PUBLIC_ (Vercel no las traduce)
  envPrefix: ['VITE_', 'PUBLIC_'],
});