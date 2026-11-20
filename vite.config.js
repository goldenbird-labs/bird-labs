import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Four pages: the public site, the embedded Birdie chat, the admin dashboard and the client portal.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        chat: 'chat.html',
        admin: 'admin.html',
        portal: 'portal.html',
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
