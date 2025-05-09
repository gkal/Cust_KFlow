import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { config } from 'dotenv'

// Load environment variables from .env files
config();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: true
    },
    watch: {
      usePolling: true
    }
  },
  css: {
    devSourcemap: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})