import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    exclude: ['**/node_modules/**', '**/tests/e2e/**', '**/playwright.config.ts'],
    coverage: {
      exclude: ['**/tests/e2e/**', '**/node_modules/**', '**/*.stories.tsx', '**/playwright.config.ts']
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
