import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    sourcemap: false,
    cssCodeSplit: false,
    codeSplitting: false,
    rollupOptions: {
      output: {
        entryFileNames: 'app.js',
        chunkFileNames: 'chunk.js',
        assetFileNames: 'asset.[ext]',
        format: 'iife',
        inlineDynamicImports: true,
      },
    },
  },
})
