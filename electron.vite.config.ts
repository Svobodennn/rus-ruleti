import { defineConfig } from 'electron-vite';
import { resolve } from 'node:path';

export default defineConfig({
  main: {
    build: {
      outDir: 'out/main',
      sourcemap: true,
      rollupOptions: {
        input: { index: resolve(__dirname, 'src/main/index.ts') },
        external: ['electron'],
      },
    },
    resolve: {
      alias: {
        '@main': resolve(__dirname, 'src/main'),
        '@shared': resolve(__dirname, 'src/shared'),
      },
    },
  },
  preload: {
    build: {
      outDir: 'out/preload',
      sourcemap: true,
      rollupOptions: {
        input: { index: resolve(__dirname, 'src/preload/index.ts') },
        external: ['electron'],
      },
    },
    resolve: {
      alias: {
        '@preload': resolve(__dirname, 'src/preload'),
        '@shared': resolve(__dirname, 'src/shared'),
      },
    },
  },
  renderer: {
    root: resolve(__dirname, 'src/renderer'),
    build: {
      outDir: 'out/renderer',
      sourcemap: true,
      rollupOptions: {
        input: { index: resolve(__dirname, 'src/renderer/index.html') },
      },
    },
    resolve: {
      alias: {
        '@renderer': resolve(__dirname, 'src/renderer'),
        '@shared': resolve(__dirname, 'src/shared'),
      },
    },
    server: {
      port: 5173,
    },
  },
});
