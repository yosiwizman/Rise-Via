import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react': 'react/index.js',
      'react-dom': 'react-dom/index.js',
    },
  },
  define: {
    'process.env.NODE_ENV': '"development"',
  },
  build: {
    minify: false,
    sourcemap: 'inline',
    cssCodeSplit: false,
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        format: 'es',
        manualChunks: undefined,
        inlineDynamicImports: true,
      }
    }
  },
  esbuild: {
    keepNames: true,
    drop: [],
  }
});

