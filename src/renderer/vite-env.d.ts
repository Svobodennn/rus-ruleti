/**
 * Vite ambient module declarations for renderer asset imports.
 *
 * The PS1 shader stack (Sprint 1 Phase 2) authors GLSL in `.glsl` files
 * imported as raw strings via Vite's built-in `?raw` query suffix. TypeScript
 * needs ambient module typings to accept those imports under strict mode.
 *
 * Keep this file tightly scoped — only declare modules for asset patterns
 * the renderer actually imports. Adding catch-all `*?raw` declarations would
 * silently mask typos elsewhere.
 */

declare module '*.glsl?raw' {
  /** Raw GLSL source as a string. Vite inlines the file contents at build time. */
  const source: string;
  export default source;
}

/**
 * Vite `?url` import for binary GLB files.
 *
 * Sprint 3 Phase 2B kraken-loader uses `import revolverUrl from './revolver.glb?url'`
 * to obtain a hashed asset URL that Vite copies into the output bundle. The
 * URL string is what `GLTFLoader.loadAsync` consumes. Importing without `?url`
 * would attempt to parse the binary as a module — broken.
 */
declare module '*.glb?url' {
  /** Resolved asset URL produced by Vite's static-asset pipeline. */
  const url: string;
  export default url;
}
