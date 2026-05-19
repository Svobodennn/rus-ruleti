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
