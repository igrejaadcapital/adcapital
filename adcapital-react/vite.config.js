import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Web (Render): '/'. App Android (Capacitor): './' via CAPACITOR_BUILD=true
  base: process.env.CAPACITOR_BUILD === 'true' ? './' : '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  }
})
