import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Le base doit correspondre EXACTEMENT au nom de votre dépôt GitHub
  base: '/Taxi-Louage-Manager/', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
});
