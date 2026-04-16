import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    fs: {
      allow: ['..', 'C:/Users/vivek/.gemini/antigravity/brain/576f640a-ee9a-42e9-b577-c76445fa2b27']
    }
  }
})
