import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@mui/material') || id.includes('@mui/icons-material') || id.includes('@mui/system')) {
            return 'mui'
          }
          if (id.includes('react-dom') || id.includes('react-router') || (id.includes('/react/') && !id.includes('react-'))) {
            return 'react-vendor'
          }
          if (id.includes('@tanstack/react-query')) {
            return 'query'
          }
        },
      },
    },
  },
})
