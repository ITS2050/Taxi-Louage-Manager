import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/Taxi-Louage-Manager/', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
  // Fix: Removed the server block containing 'historyApiFallback' as it is not a valid Vite option.
  // Vite's development server handles SPA routing (falling back to index.html) automatically.
});
