import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { config } from 'dotenv'

// Load environment variables from .env files
config();

// Create a plugin to replace environment variables in index.html
function htmlEnvPlugin() {
  return {
    name: 'html-env-plugin',
    transformIndexHtml(html: string) {
      return html
        .replace(/%VITE_SUPABASE_URL%/g, process.env.VITE_SUPABASE_URL || '')
        .replace(/%VITE_SUPABASE_ANON_KEY%/g, process.env.VITE_SUPABASE_ANON_KEY || '');
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    htmlEnvPlugin()
  ],
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