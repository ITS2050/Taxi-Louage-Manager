import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Le base path doit correspondre exactement au nom du repository GitHub ou être relatif
  base: './', 
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'dexie', 'recharts', 'lucide-react']
        }
      }
    }
  },
  server: {
    host: true
  }
});
