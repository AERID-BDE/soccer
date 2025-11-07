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
    ]
  },
})

