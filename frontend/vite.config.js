import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget =
    env.BACKEND_URI || env.VITE_BACKEND_URI || 'http://localhost:5000'

  return {
    plugins: [react()],
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        react: path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      sourcemap: false,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'vendor-react'
            }
            if (id.includes('node_modules/@reduxjs') || id.includes('node_modules/react-redux')) {
              return 'vendor-redux'
            }
            if (id.includes('node_modules/react-toastify')) {
              return 'vendor-toast'
            }
          },
        },
      },
    },
  }
})
