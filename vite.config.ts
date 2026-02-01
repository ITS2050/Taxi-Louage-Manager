import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Crucial pour GitHub Pages : assure que les assets sont cherchés au bon endroit
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    cssCodeSplit: false, // Regroupe le CSS pour éviter les erreurs de chargement réseau
    minify: 'terser',
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
  server: {
    port: 3000,
    host: true,
    strictPort: true,
  }
});
