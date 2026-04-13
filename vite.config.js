import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/comps-react-app/',
  optimizeDeps: {
    exclude: ['essentia.js']
  },
  server: {
    fs: {
      allow: ['..']
    }
  }
})
