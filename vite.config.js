import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import saveDataPlugin from './vite-plugin-save-data.js'

export default defineConfig({
  plugins: [react(), saveDataPlugin()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5174, // Port for Docker
    strictPort: false, // If port is in use, try next available port
    allowedHosts: [
      'soccer.aerid.fr',
      'localhost',
      '.aerid.fr' // Allow all subdomains of aerid.fr
    ],
    fs: {
      // Allow serving files from the mounted volume
      allow: ['.']
    }
  },
  // Disable caching for public assets to ensure data.json changes are reflected immediately
  optimizeDeps: {
    exclude: []
  },
  build: {
    // Ensure public assets are not cached in production either
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})

