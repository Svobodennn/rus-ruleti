/**
 * ESC-hold escape hatch (renderer side).
 *
 * Wires the preload-exposed `onEscapeHold` to a visible progress indicator.
 * Preload owns the timer + IPC; this module only paints feedback.
 *
 * NOTE: The actual quit IPC is fired inside preload when progress reaches 1.0
 * (see src/preload/index.ts). The renderer's role is purely cosmetic feedback.
 *
 * Lifetime: the returned disposer is wired to `beforeunload` by main.ts so
 * dev HMR doesn't accumulate keyboard listeners across reloads. Production
 * lifetime equals the renderer process, so missing the call there is
 * harmless — listeners die with the page.
 */

import type { RusRuletiApi } from '../shared/api-types';

const PROGRESS_VAR = '--esc-progress';

export function mountEscapeHatch(api: RusRuletiApi): () => void {
  const indicator = document.querySelector<HTMLElement>('#esc-hold-indicator');
  const bar = document.querySelector<HTMLElement>('#esc-hold-bar');

  if (indicator === null || bar === null) {
    // Indicator markup missing — fail open, ESC still works (preload owns IPC),
    // we just don't show a progress bar.
    return api.onEscapeHold(
      () => undefined,
      () => undefined,
    );
  }

  const onProgress = (progress: number): void => {
    if (progress === 0) {
      indicator.classList.remove('active');
      bar.style.setProperty(PROGRESS_VAR, '0%');
      return;
    }
    indicator.classList.add('active');
    const pct = Math.round(progress * 100);
    bar.style.setProperty(PROGRESS_VAR, `${pct}%`);
  };

  const onComplete = (): void => {
    // Optional: a final flash. For Sprint 0 we just keep the bar full briefly.
    bar.style.setProperty(PROGRESS_VAR, '100%');
    // No further action — preload sends 'app:quit' itself.
  };

  return api.onEscapeHold(onProgress, onComplete);
}
