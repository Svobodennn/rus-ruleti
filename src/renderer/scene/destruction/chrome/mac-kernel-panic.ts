/**
 * macOS Kernel Panic full-screen chrome — Sprint 5 Phase 1 STUB.
 *
 * WHO CALLS THIS: faz6-bsod.ts#mountMacKernelPanic — single caller, Mac
 * branch only.
 *
 * SHARED RESOURCES OWNED: none directly — the hex panic-log scroll RAF
 * is OWNED by faz6-bsod.ts (HEX_PANIC_DUMP_OWNER decree) but the rAF
 * driver lives here; faz6 invokes `animateHexDump()` once after mount and
 * the impl owns the rAF id until `dispose()`.
 *
 * CALLEES (Phase 2B Lane C will wire):
 *   - inline DOM construction (no other module imports)
 *   - destruction-direction.md §11 4-language text block (TR/EN/RU/JP)
 *     i18n keys (Phase 2B Lane E publishes the keys; this module reads
 *     them via i18n/strings.ts `t(key, locale)`)
 *
 * SPRINT 5 LANE: C — Lane C (swift-expert, paralleling Sprint 4 mac-dialog
 * craftsmanship) builds the 4-language text block + hex panic-log scroll +
 * dispose chain.
 *
 * Visual specs (PLAN §7 line 281):
 *   - DOM: full-screen div `#1d1d1f`, Helvetica Neue Light via
 *     `-apple-system, BlinkMacSystemFont, sans-serif` reference (NO SF
 *     Pro bundle per C1 closure).
 *   - 4-language text block centred: "You need to restart your computer"
 *     in TR / EN / RU / JP (each language gets a localised translation
 *     via i18n keys; PLAN §7 line 281).
 *   - Hex dump bottom scroll: auto-scrolls at FAZ6_HEX_DUMP_LINE_HZ.
 *     Content is generated procedurally (kraken-faz6 helper) — random
 *     hex bytes + "kernel:" / "panic:" prefixes. NOT a copy of a real
 *     macOS panic log.
 *
 * Reduced-motion gate (designer Phase 2A §10):
 *   - Hex-dump auto-scroll: paused (text remains visible, no motion).
 *
 * TODO Sprint 5 Lane C: replace stub body with: backdrop element + 4-lang
 * text block + hex dump scroller + matchMedia gate + dispose chain.
 * Target ~250-300L.
 */

/* eslint-disable @typescript-eslint/no-unused-vars -- Sprint 5 Lane C fills this stub. */

import type { MacKernelPanicHandle } from '../types.js';

/** Mount-arg bag. `panicLogProvider` returns lines of hex/text on demand. */
export interface MountMacKernelPanicArgs {
  readonly hostElement: HTMLElement;
  readonly panicLogProvider: () => string;
  readonly signal: AbortSignal;
}

/**
 * Mount the Mac kernel-panic full-screen overlay into the destruction
 * container. Returns a handle whose `animateHexDump()` kicks the hex log
 * scroll and `dispose()` removes the overlay + cancels the RAF.
 */
export function mountMacKernelPanic(
  args: MountMacKernelPanicArgs,
): MacKernelPanicHandle {
  // TODO Sprint 5 Lane C: build 4-lang text block + hex scroller per spec.
  const element = document.createElement('div');
  element.className = 'faz6-mac-kernel-panic';
  args.hostElement.appendChild(element);
  let disposed = false;
  return {
    kind: 'mac-kernel-panic',
    element,
    animateHexDump: (): void => undefined,
    dispose: (): void => {
      if (disposed) return;
      disposed = true;
      element.remove();
    },
  };
}
