import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

function spaFallbackFiles() {
  return {
    name: 'spa-fallback-files',
    closeBundle() {
      if (process.env.CAPACITOR_BUILD === 'true') return
      const outDir = join(process.cwd(), 'dist')
      const indexHtml = readFileSync(join(outDir, 'index.html'), 'utf8')
      writeFileSync(join(outDir, '404.html'), indexHtml)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // Web (Render): '/'. App Android (Capacitor): './' via CAPACITOR_BUILD=true
  base: process.env.CAPACITOR_BUILD === 'true' ? './' : '/',
  plugins: [react(), spaFallbackFiles()],
  test: {
    environment: 'jsdom',
    globals: true,
  }
})
