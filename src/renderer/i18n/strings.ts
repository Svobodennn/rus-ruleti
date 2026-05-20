/**
 * i18n: Cyrillic (RU) + Turkish (TR) bilingual strings.
 *
 * Sprint 0 scope: no library, no async loading, no plural rules.
 * Just a typed object lookup with locale fallback.
 *
 * Design contract:
 *  - RU is the rendered "primary" visually (large Cyrillic headlines)
 *  - TR is rendered as bilingual caption / subtitle / secondary line
 *  - `t(key, locale)` returns a string; missing keys throw at compile time
 *    thanks to the `LocaleKey` discriminated union derived from `as const`.
 *
 * Locale resolution:
 *  - TR is treated as the primary user-language fallback (the operator's locale)
 *  - RU is the in-universe diegetic language (always shown alongside TR)
 *  - Callers usually want both — they call `t(key, 'ru')` and `t(key, 'tr')`
 *    side-by-side. See `disclaimer.headline.ru` / `disclaimer.headline.tr`.
 */

export type Locale = 'ru' | 'tr';

/**
 * Whole-tree string catalogue. Frozen `as const` so each leaf is a literal
 * type and `LocaleKey` below can flatten it into a discriminated union.
 *
 * Adding a new string?
 *   1. Add it under both `ru` AND `tr` (same path).
 *   2. The lookup uses dot-notation paths typed by `LocaleKey`, so missing
 *      RU/TR pairs become compile errors.
 */
export const STRINGS = {
  ru: {
    disclaimer: {
      headline: 'ЭТО ШУТКА',
      bodyLine1: 'Это игра.',
      bodyLine2: 'Никаких реальных действий с системой не производится.',
      bodyLine3: 'Все сцены — театр.',
      continueButton: 'ПРОДОЛЖИТЬ',
    },
    hud: {
      counterLabel: 'ШАНС',
      counterFormat: '{n}/6',
      earlyReleaseMessage: 'Не смог решиться.',
      bangMessage: 'ВЫСТРЕЛ',
      revealLiteMessage: 'Не следовало этого делать.',
    },
  },
  tr: {
    disclaimer: {
      headline: 'Bu bir şakadır',
      bodyLine1: 'Bu bir oyundur.',
      bodyLine2: 'Sisteminizde gerçek hiçbir işlem yapılmaz.',
      bodyLine3: 'Tüm sahneler tiyatrodur.',
      continueButton: 'DEVAM ET',
    },
    hud: {
      counterLabel: 'ŞANS',
      counterFormat: '{n}/6',
      earlyReleaseMessage: 'Karar veremedin.',
      bangMessage: 'ATEŞ',
      revealLiteMessage: 'Bunu yapmamalıydın.',
    },
  },
} as const;

/**
 * Recursive helper that flattens nested string-object trees into dot-paths.
 * `Paths<{a: {b: 'x'}}>` -> `'a.b'`. We only descend into objects whose leaves
 * are string literals; this keeps the union small and the IDE responsive.
 */
type Paths<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : T[K] extends Record<string, unknown>
      ? Paths<T[K], `${Prefix}${K}.`>
      : never;
}[keyof T & string];

/**
 * The set of legal i18n keys. Derived from the RU tree because RU and TR are
 * structurally identical by contract (see `STRINGS` doc above).
 */
export type LocaleKey = Paths<typeof STRINGS.ru>;

/**
 * Resolve a dot-path into the locale tree. Returns `undefined` if any segment
 * is missing — but `LocaleKey` should prevent that at compile time. The
 * runtime guard is defence-in-depth for dynamic key consumers (none today).
 */
function resolve(locale: Locale, key: string): string | undefined {
  const segments = key.split('.');
  let cursor: unknown = STRINGS[locale];
  for (const segment of segments) {
    if (cursor === null || typeof cursor !== 'object') {
      return undefined;
    }
    const next: unknown = (cursor as Record<string, unknown>)[segment];
    if (next === undefined) {
      return undefined;
    }
    cursor = next;
  }
  return typeof cursor === 'string' ? cursor : undefined;
}

/**
 * Lookup a localised string.
 *
 * If the requested locale is missing the key, fall back to the OTHER locale
 * (we have exactly two, so the fallback chain is trivial).
 * If both locales are missing the key (impossible per `LocaleKey`, but the
 * runtime guard is here for completeness), return the key itself so missing
 * strings are visible in the UI instead of empty.
 */
export function t(key: LocaleKey, locale: Locale): string {
  const direct = resolve(locale, key);
  if (direct !== undefined) {
    return direct;
  }
  const fallbackLocale: Locale = locale === 'ru' ? 'tr' : 'ru';
  const fallback = resolve(fallbackLocale, key);
  if (fallback !== undefined) {
    return fallback;
  }
  return key;
}

/**
 * Resolve the user-preferred locale. For Sprint 0 we hardcode TR-primary
 * (operator language) and always render RU alongside as the diegetic layer.
 *
 * Future: read from `navigator.language`, `localStorage`, or main process.
 */
export function resolveUserLocale(): Locale {
  return 'tr';
}
