import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Base relative impérative pour GitHub Pages et AI Studio Preview
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    cssCodeSplit: false, // Force un seul fichier CSS pour éviter les erreurs de chargement
    sourcemap: false,
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
