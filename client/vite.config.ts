import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Listen on every interface so the app is reachable from phones/other
    // devices on the same wifi.
    host: true,
    // Mirrors the /api rewrite in vercel.json, so the API is same-origin in
    // dev too: no CORS, and the auth cookie stays first-party.
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
