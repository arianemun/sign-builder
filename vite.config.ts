import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3227,
    strictPort: true,
    allowedHosts: ['sign.sepfa.ir'],
  },
  preview: {
    host: '0.0.0.0',
    port: 3227,
    strictPort: true,
    allowedHosts: ['sign.sepfa.ir'],
  },
})
