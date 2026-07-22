import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `vite build --mode artifact` produces dist-artifact/index.html: a fully
// self-contained single file (JS/CSS/fonts inlined) using hash routing, for
// static preview hosting where no history-fallback server exists.
export default defineConfig(({ mode }) => {
  const artifact = mode === 'artifact'
  return {
    plugins: [react(), tailwindcss(), ...(artifact ? [viteSingleFile()] : [])],
    define: artifact ? { 'import.meta.env.VITE_HASH_ROUTER': JSON.stringify('1') } : {},
    build: artifact
      ? { outDir: 'dist-artifact', assetsInlineLimit: 100_000_000, chunkSizeWarningLimit: 5_000 }
      : {},
  }
})
