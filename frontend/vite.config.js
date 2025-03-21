import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Se precisar de configurações de PostCSS específicas, adicione aqui
  css: {
    postcss: {
      plugins: [],
    },
  },
})