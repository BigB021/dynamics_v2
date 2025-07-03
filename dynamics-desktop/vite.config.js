import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';


export default defineConfig({
  plugins: [
    react(),

  ],
    
  root: '.', // your project root
  build: {
    outDir: 'build', // to keep same output folder as CRA
    emptyOutDir: true,
  },
  server: {
    open: true, // open browser on dev server start
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // your Express backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
