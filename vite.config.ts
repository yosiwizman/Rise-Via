import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      'process.env': {},
      '__APP_ENV__': JSON.stringify(env)
    },
    server: {
      allowedHosts: true
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            neon: ['@neondatabase/serverless'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-select']
          }
        }
      },
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false,
        },
        mangle: {
          properties: false,
        }
      }
    }
  };
});

