import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // The backend CORS whitelist only contains port 5173. Without strictPort,
  // Vite silently moves to 5174 when 5173 is busy and every request fails.
  server: {
    port: 5173,
    strictPort: true,
  },
})
