import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `--mode preview` inlines everything into one HTML file for sharing.
export default defineConfig(({ mode }) => ({
  plugins: [react(), mode === 'preview' && viteSingleFile()].filter(Boolean),
  build: {
    outDir: mode === 'preview' ? 'dist-preview' : 'dist',
    chunkSizeWarningLimit: 2000,
    // The shareable preview is one file, so images are inlined too.
    assetsInlineLimit: mode === 'preview' ? 100_000_000 : 4096,
  },
}))
