import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Three pages: the public site, the embedded Birdie chat, and the admin dashboard.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        chat: 'chat.html',
        admin: 'admin.html',
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
