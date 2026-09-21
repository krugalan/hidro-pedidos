import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base: '/' para Vercel/Netlify; cambialo a '/hidro-pedidos/' para GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: '/',
})
