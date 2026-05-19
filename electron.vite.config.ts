import { defineConfig } from 'electron-vite';
import { resolve } from 'node:path';

/**
 * Resolve the build-time quality level (S1 risk mitigation, PLAN §3).
 *
 * Process env var `VITE_QUALITY_LEVEL` is read at config time, validated
 * against the three accepted tiers, and injected into the renderer bundle as
 * the global identifier `__VITE_QUALITY_LEVEL__`. The renderer reads this via
 * `getBuildQualityLevel()` in src/renderer/scene/quality.ts.
 *
 * Unset → 'medium' (PLAN §3 default).
 * Invalid → hard fail at config time so we don't ship a broken bundle.
 */
function resolveQualityLevel(): 'low' | 'medium' | 'high' {
  const raw = process.env['VITE_QUALITY_LEVEL'];
  if (raw === undefined || raw === '') {
    return 'medium';
  }
  if (raw === 'low' || raw === 'medium' || raw === 'high') {
    return raw;
  }
  throw new Error(
    `VITE_QUALITY_LEVEL must be one of 'low' | 'medium' | 'high'. Got: ${raw}`,
  );
}

const qualityLevel = resolveQualityLevel();

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
    /**
     * Vite static-replacement injection.
     *
     * `__VITE_QUALITY_LEVEL__` is rewritten to the literal string at build
     * time so the renderer's quality module can switch tiers without runtime
     * env-var parsing. The literal MUST be a JSON-stringified string (Vite
     * `define` does direct text substitution; it would inject the bare word
     * `medium` otherwise, which is a ReferenceError).
     */
    define: {
      __VITE_QUALITY_LEVEL__: JSON.stringify(qualityLevel),
    },
  },
});
