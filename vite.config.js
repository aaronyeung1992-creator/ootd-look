import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/ootd-look/',
  plugins: [react()],
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    sourcemap: false,
    lib: {
      entry: 'src/main.jsx',
      name: 'OOTDApp',
      formats: ['iife'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
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
