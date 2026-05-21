/**
 * Win11 File Explorer "copy dialog" progress mimic — Sprint 5 Phase 1
 * STUB.
 *
 * WHO CALLS THIS: faz4-file-wipe.ts#mountProgressDialog (Win branch).
 *
 * SHARED RESOURCES OWNED: none (all timers driving the setters are OWNED
 * by faz4-file-wipe.ts per the owner-decree constants — same as the Mac
 * variant).
 *
 * CALLEES (Phase 2B Lane D will wire):
 *   - inline DOM construction
 *   - i18n/strings.ts `t(key, locale)` for "File Explorer is wiping
 *     files…" title + "Items remaining" + "Estimated time remaining"
 *     labels
 *
 * SPRINT 5 LANE: D — Lane D builds the File Explorer copy-dialog visual,
 * mirroring Sprint 4 win-dialog.ts craftsmanship.
 *
 * Visual specs (directive §4.2 + PLAN §7 line 269):
 *   - File Explorer-style copy dialog: designer-fictional four-square
 *     SVG header (parallels Sprint 4 win-dialog.ts four-square SVG —
 *     NOT real Win11 logo per S6 closure).
 *   - File-by-file readout that scrolls at FAZ4_FILE_PATH_SCROLL_HZ.
 *   - Greyed X (close) button — clicks are no-ops.
 *   - Progress bar + ETA + items-remaining counter driven by setters.
 *
 * Reduced-motion gate (designer Phase 2A §10):
 *   - Modal entry opacity: instant.
 *   - Progress bar regression: still ticks (functional joke).
 *
 * TODO Sprint 5 Lane D: replace stub body with: dialog frame + four-square
 * SVG + label setters + greyed X button + dispose chain. Target
 * ~200-250L.
 */

/* eslint-disable @typescript-eslint/no-unused-vars -- Sprint 5 Lane D fills this stub. */

import type { WinProgressDialogHandle } from '../types.js';

/** Mount-arg bag. */
export interface MountWinProgressDialogArgs {
  readonly hostElement: HTMLElement;
  readonly initialProgress: number;
  readonly signal: AbortSignal;
}

/**
 * Mount the Win11 progress dialog into the destruction container.
 * Returns a handle whose four setters update the live counters and
 * `dispose()` removes the dialog.
 */
export function mountWinProgressDialog(
  args: MountWinProgressDialogArgs,
): WinProgressDialogHandle {
  // TODO Sprint 5 Lane D: build File Explorer copy-dialog per spec.
  const element = document.createElement('div');
  element.className = 'faz4-progress-dialog faz4-win-progress-dialog';
  args.hostElement.appendChild(element);
  let disposed = false;
  return {
    kind: 'win-progress-dialog',
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
