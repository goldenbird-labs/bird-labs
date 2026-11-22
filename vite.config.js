import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Pages: the public site, careers, the embedded Birdie chat, the admin dashboard and the client portal.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        chat: 'chat.html',
        admin: 'admin.html',
        portal: 'portal.html',
        careers: 'careers.html',
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
