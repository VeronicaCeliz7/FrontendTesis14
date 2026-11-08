import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo-oficial.png', 'og-image.jpg'],
      // 👇 EL MANIFEST AUTOMÁTICO ESTÁ COMENTADO PARA QUE USE EL MANUAL
      // manifest: { ... }
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  envPrefix: ['VITE_', 'PUBLIC_'],
});