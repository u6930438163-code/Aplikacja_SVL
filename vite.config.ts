import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';
import { defineConfig, type Plugin } from 'vite';

const currentDir = typeof import.meta.dirname === 'string'
  ? import.meta.dirname
  : path.dirname(fileURLToPath(import.meta.url));

/**
 * Po buildzie tworzy obok plików .br i .gz, które server.ts serwuje bez
 * kompresowania w locie (mniejszy transfer, zero kosztu CPU na żądanie).
 */
function precompressAssets(): Plugin {
  let outDir = 'dist';
  return {
    name: 'svl-precompress-assets',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const compressible = /\.(js|mjs|css|html|svg|json|txt|wasm)$/i;
      const walk = (dir: string): string[] =>
        fs.existsSync(dir)
          ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
              const full = path.join(dir, entry.name);
              return entry.isDirectory() ? walk(full) : [full];
            })
          : [];

      for (const file of walk(outDir)) {
        if (!compressible.test(file)) continue;
        const source = fs.readFileSync(file);
        if (source.length < 1024) continue;
        fs.writeFileSync(
          `${file}.br`,
          zlib.brotliCompressSync(source, {
            params: {
              [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
              [zlib.constants.BROTLI_PARAM_SIZE_HINT]: source.length,
            },
          })
        );
        fs.writeFileSync(`${file}.gz`, zlib.gzipSync(source, { level: 9 }));
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), precompressAssets()],
    resolve: {
      alias: {
        '@': path.resolve(currentDir, '.'),
      },
    },
    build: {
      target: 'es2022',
      cssCodeSplit: true,
      sourcemap: false,
      // three.js jest ładowany tylko w zakładce "Wizualizator", więc duży fragment jest akceptowalny
      chunkSizeWarningLimit: 1200,
      modulePreload: { polyfill: false },
    },
    optimizeDeps: {
      include: ['react', 'react-dom/client', 'lucide-react', 'katex'],
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
