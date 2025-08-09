import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'unsplash-images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'admin': [
            './src/pages/AdminPage.tsx',
            './src/components/admin/DashboardMetrics.tsx',
            './src/components/admin/CustomerList.tsx',
            './src/components/admin/ProductManager.tsx',
            './src/components/admin/OrderManager.tsx',
            './src/components/admin/InventoryManager.tsx',
            './src/components/admin/ActivityLogs.tsx'
          ],
          'analytics': [
            './src/analytics/cartAnalytics.ts',
            './src/analytics/wishlistAnalytics.ts',
            './src/dashboard/WishlistMetricsDashboard.tsx'
          ],
          'vendor': ['react', 'react-dom', 'framer-motion']
        }
      }
    },
    chunkSizeWarningLimit: 500
  },
  server: {
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
