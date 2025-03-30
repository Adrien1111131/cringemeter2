import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Génère des fichiers source map pour le débogage
    sourcemap: true,
    // Assure que les fichiers JS sont servis avec le bon type MIME
    assetsInlineLimit: 0,
  },
  server: {
    // Configuration pour le développement local
    port: 3000,
    strictPort: true,
    // Permet les requêtes CORS en développement
    cors: true,
  },
})
