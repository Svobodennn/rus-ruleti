/**
 * macOS Finder-style "Securely erasing disk…" progress dialog — Sprint 5
 * Phase 1 STUB.
 *
 * WHO CALLS THIS: faz4-file-wipe.ts#mountProgressDialog (Mac branch).
 *
 * SHARED RESOURCES OWNED: none (all timers driving the setters are OWNED
 * by faz4-file-wipe.ts per the owner-decree constants —
 * PROGRESS_BAR_REGRESSION_TIMER_OWNER, ETA_GROWTH_TIMER_OWNER,
 * ITEMS_REMAINING_TIMER_OWNER, FILE_PATH_SCROLL_TIMER_OWNER).
 *
 * CALLEES (Phase 2B Lane C will wire):
 *   - inline DOM construction
 *   - i18n/strings.ts `t(key, locale)` for dialog title / cancel button /
 *     "Items remaining" / "Estimated time remaining" labels
 *
 * SPRINT 5 LANE: C — Lane C builds the Finder-style sheet visual.
 *
 * Visual specs (directive §4.2 + PLAN §7 line 269):
 *   - Finder-style sheet: large designer-fictional eaten-apple SVG
 *     header (parallels Sprint 4 mac-dialog.ts apple SVG — NOT bundled
 *     Apple asset), progress bar, greyed cancel button.
 *   - Title: "Securely erasing disk…" (i18n key
 *     `destruction.faz4.mac.progressDialog.title` — Lane E publishes).
 *   - Body: live counters via setters — progress %, ETA caption, items
 *     remaining, current file path scroll.
 *
 * Reduced-motion gate (designer Phase 2A §10):
 *   - Modal entry opacity: instant (no fade-in).
 *   - Progress bar regression: still ticks (functional joke).
 *
 * TODO Sprint 5 Lane C: replace stub body with: backdrop + sheet + apple
 * SVG header + progress bar + label setters + dispose chain. Target
 * ~200-250L.
 */

/* eslint-disable @typescript-eslint/no-unused-vars -- Sprint 5 Lane C fills this stub. */

import type { MacProgressDialogHandle } from '../types.js';

/** Mount-arg bag. */
export interface MountMacProgressDialogArgs {
  readonly hostElement: HTMLElement;
  readonly initialProgress: number;
  readonly signal: AbortSignal;
}

/**
 * Mount the Mac progress dialog into the destruction container. Returns
 * a handle whose four setters update the live counters and `dispose()`
 * removes the dialog.
 */
export function mountMacProgressDialog(
  args: MountMacProgressDialogArgs,
): MacProgressDialogHandle {
  // TODO Sprint 5 Lane C: build Finder-style sheet per spec.
  const element = document.createElement('div');
  element.className = 'faz4-progress-dialog faz4-mac-progress-dialog';
  args.hostElement.appendChild(element);
  let disposed = false;
  return {
    kind: 'mac-progress-dialog',
    element,
    setProgress: (_percent: number): void => undefined,
    setEta: (_label: string): void => undefined,
    setItemsRemaining: (_count: number): void => undefined,
    setFilePath: (_path: string): void => undefined,
    dispose: (): void => {
      if (disposed) return;
      disposed = true;
      element.remove();
    },
  };
}
