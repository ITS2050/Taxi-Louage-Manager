
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Utiliser base: './' permet de déployer sur n'importe quel sous-dossier GitHub Pages
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
