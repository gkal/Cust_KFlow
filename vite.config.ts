import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

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
    },
    proxy: {
      '/api/email': {
        target: 'https://api.resend.com/emails',
        changeOrigin: true,
        rewrite: () => '',
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req, res, options) => {
            // Add authentication header
            proxyReq.setHeader('Authorization', `Bearer ${process.env.RESEND_API_KEY || 're_hf3QE3rC_PysybGnnKohDEd4c9z2uq5Ag'}`);
          });
        }
      }
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