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
 *    side-by-side. See e.g. `destruction.faz6.mac.panicHeadlineRu` /
 *    `panicHeadlineTr` for the in-world dual-language presentation pattern.
 *
 * Sprint 9.1 — `STRINGS.{ru,tr}.disclaimer.*` subtree REMOVED post-ship.
 * The Sprint 0 intro-disclaimer surface was removed from the in-app UI;
 * its bilingual copy is no longer referenced from any renderer call site.
 * Legal disclaimer text is preserved in LEGAL.md (distribution-side).
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
    hud: {
      counterLabel: 'ШАНС',
      earlyReleaseMessage: 'Не смог решиться.',
      bangMessage: 'ВЫСТРЕЛ',
      revealLiteMessage: 'Не следовало этого делать.',
    },
    /**
     * Post-ship main-menu entry screen. Title + Start + Quit. Carries NO
     * joke/disclaimer copy — the Sprint 9.1 intro disclaimer surface was
     * removed; this is a clean game-menu gate that arms the scene on Start.
     */
    menu: {
      title: 'РУССКАЯ РУЛЕТКА',
      start: 'НАЧАТЬ',
      quit: 'ВЫХОД',
    },
    /**
     * Sprint 4 destruction sequence — OS dialog + toast + terminal copy.
     *
     * Schema authority: `destruction-direction.md` §1185-1200 (Lane E
     * checklist) and SSOT `scene-destruction-constants.ts`
     * `TOAST_MESSAGES_MAC` / `TOAST_MESSAGES_WIN` prefixes.
     *
     * Tone contract: authentic OS-dialog formal voice. NO marketing copy,
     * NO trademark-sensitive product names beyond well-known service refs
     * (iCloud, OneDrive, BitLocker, Defender) which are used as in-context
     * UI surfaces — the game does NOT attribute behaviour to those
     * brands (no "Microsoft Office Activation Failed" etc.).
     *
     * Placeholder: `{n}` in `dialog.restartCountdown` is replaced at
     * render time via `template.replace('{n}', String(remaining))` by
     * Lane A (kraken-faz0-1) and Lane C (swift-expert mac-dialog
     * `setCountdown`). Lane A/C MUST keep the literal `{n}` token.
     *
     * Russian punctuation: Cyrillic « » guillemets where applicable;
     * em-dash (—) NOT hyphen for parenthetical clauses.
     * Turkish punctuation: dotted İ at sentence start (distinct from I);
     * ş/ç with cedilla; sentence-final ellipsis "…" single-glyph.
     */
    destruction: {
      mac: {
        dialog: {
          title: 'Критическая ошибка',
          body: 'macOS обнаружила критическую системную ошибку. В kernel_task произошёл неустранимый сбой.',
          restartCountdown: 'Перезагрузка через {n}…',
          restartNowLabel: 'Перезагрузить сейчас',
          cancelLabel: 'Отмена',
        },
      },
      win: {
        dialog: {
          title: 'Критический процесс остановлен',
          body: 'Критический системный процесс перестал отвечать. Windows соберёт сведения об ошибке и выполнит перезагрузку.',
          okLabel: 'ОК',
          moreInfoLabel: 'Подробнее',
        },
      },
      toast: {
        mac: {
          iCloudSyncPaused: {
            title: 'iCloud',
            body: 'Синхронизация iCloud приостановлена',
          },
          timeMachineBackupLost: {
            title: 'Time Machine',
            body: 'Резервный диск Time Machine не найден',
          },
          finderDiskEjectError: {
            title: 'Finder',
            body: 'Ошибка извлечения диска',
          },
          kernelTaskTermination: {
            title: 'Система',
            body: 'Завершение работы kernel_task',
          },
          spotlightIndexStopped: {
            title: 'Spotlight',
            body: 'Индексирование остановлено',
          },
        },
        win: {
          oneDriveSyncError: {
            title: 'OneDrive',
            body: 'Ошибка синхронизации OneDrive',
          },
          defenderStopped: {
            title: 'Microsoft Defender',
            body: 'Защита остановлена',
          },
          bitLockerProtectionFailed: {
            title: 'BitLocker',
            body: 'Сбой защиты тома',
          },
        },
      },
      terminal: {
        /**
         * The shell command is English ON PURPOSE — it IS English in real
         * Unix/PowerShell environments. Same string for ru and tr (kept
         * here only so consumers can resolve via `t()` symmetrically).
         */
        command: 'sudo rm -rf / --no-preserve-root',
        passwordPrompt: 'Пароль: ',
      },
      /**
       * Sprint 5 Faz 4 — File Wipe progress dialog labels.
       *
       * Mac variant attaches as a Finder sheet at 35% viewport top;
       * Win variant renders as a File Explorer copy dialog with a 4-square
       * SVG icon (Lane D `chrome/win-progress-dialog.ts`).
       *
       * Template tokens:
       *  - `{n}` in `itemsRemaining`: item count (Lane A increments via the
       *    `ITEMS_REMAINING_TIMER_OWNER`-decreed timer)
       *  - `{label}` in `estimatedTime`: ETA growth string (Lane A composes
       *    via the `ETA_GROWTH_TIMER_OWNER` cadence — strings such as
       *    "около 14 часов" / "Yaklaşık 14 saat" supplied by Lane A from
       *    a local string table, NOT through this i18n tree; the ETA is
       *    deliberately not a locale-keyed leaf because its cardinal
       *    absurdity is content, not chrome)
       *
       * Lane A MUST call `t(key, locale)` and then replace `{n}` / `{label}`
       * with `template.replace('{n}', String(remaining))` etc., mirroring
       * the Sprint 4 `restartCountdown` pattern (see comment at top of
       * `destruction.mac.dialog.restartCountdown`).
       */
      faz4: {
        mac: {
          headline: 'Безопасное стирание диска…',
          subhead: 'macOS безопасно стирает загрузочный диск',
          itemsRemaining: 'Осталось элементов: {n}',
          estimatedTime: 'Оставшееся время: {label}',
          cancel: 'Отмена',
        },
        win: {
          headline: 'Удаление файлов…',
          subhead: 'Проводник надёжно удаляет файлы',
          itemsRemaining: 'Осталось элементов: {n}',
          estimatedTime: 'Оставшееся время: {label}',
          cancelTitle: 'Остановить',
        },
      },
      /**
       * Sprint 5 Faz 5 — Disk Format full-screen + S.M.A.R.T. stream.
       *
       * Mac variant: monospace on black; Win variant: monospace on the
       * `#0B0F8B` BIOS-blue with an ASCII border box (Lane A draws the
       * border using box-drawing chars in code, not in the i18n leaves —
       * the strings here are content-only).
       *
       * Template tokens (Lane A interpolation):
       *  - `{current}` / `{total}` in `sectorLabel`: integers from the
       *    `SECTOR_COUNTER_TIMER_OWNER` cadence (40 increments / second)
       *  - `{addr}` in `smartError1`: zero-padded 10-digit sector address
       *  - `{hex}` in `smartError2`: 8-char hex address (e.g., `0xDEADBEEF`)
       *  - `{pct}` in `smartError3`: integer 0-100 SSD wear percentage
       *
       * `smartError4` carries no template — the head-misalignment line is
       * a flat error string. The four S.M.A.R.T. lines cycle in order
       * (Lane A's `SMART_ERROR_STREAM_TIMER_OWNER`); amber emphasis on
       * the entire line per Phase 2A §12.
       *
       * Headline tone: formal scientific (NOT marketing copy). The "do not
       * power off" / "kapatmayın" phrasing mirrors real disk-format dialog
       * boilerplate that authentic OS installers actually render.
       */
      faz5: {
        mac: {
          headline: 'ВНИМАНИЕ: Низкоуровневое форматирование. Не выключайте компьютер.',
          sectorLabel: 'Стирание сектора {current} / {total}',
          smartError1: 'СБОЙ ЧТЕНИЯ SMART: сектор {addr}',
          smartError2: 'ПЕРЕРАСПРЕДЕЛЁН СБОЙНЫЙ СЕКТОР: {hex} → резервный пул',
          smartError3: 'Уровень износа SSD: {pct}% (вне допустимого)',
          smartError4: 'ОШИБКА ЧТЕНИЯ-ЗАПИСИ: обнаружено смещение головки',
        },
        win: {
          headline: 'ПРЕДУПРЕЖДЕНИЕ: Идёт форматирование HDD/SSD. Не прерывайте операцию.',
          sectorLabel: 'Стирание сектора {current} / {total}',
          smartError1: 'ОШИБКА ЧТЕНИЯ SMART: сектор {addr}',
          smartError2: 'СБОЙНЫЙ СЕКТОР ПЕРЕРАСПРЕДЕЛЁН: {hex} → резервный пул',
          smartError3: 'Износ SSD: {pct}% (вне нормы)',
          smartError4: 'ОШИБКА ЧТЕНИЯ-ЗАПИСИ: обнаружено смещение головки',
        },
      },
      /**
       * Sprint 5 Faz 6 — Kernel Panic (Mac) + BSOD (Win).
       *
       * Mac kernel panic renders FOUR languages stacked, in order:
       *   EN → JP → RU → TR
       * The EN literal ("You need to restart your computer.") and the JP
       * literal ("コンピュータを再起動する必要があります。") are
       * presentation constants — they MUST render regardless of runtime
       * locale because the multilingual visual IS the design (designer
       * Phase 2A §13). Those two strings are HARDCODED INSIDE
       * `src/renderer/scene/destruction/chrome/mac-kernel-panic.ts` (Lane C)
       * and deliberately NOT keyed here.
       *
       * Only RU + TR panic headlines are keyed (panicHeadlineRu /
       * panicHeadlineTr) — they confirm to the user that the GAME read
       * their locale choice during onboarding and includes their language
       * in the panic stack.
       *
       * Note on the `*Ru` / `*Tr` key suffixes: the panic headline strings
       * are locale-INVARIANT presentation content (the RU literal renders
       * whether the runtime locale is `ru` or `tr`, and likewise for TR).
       * The suffix encodes the IN-WORLD language of the line, NOT the UI
       * locale fallback. Both RU and TR locale trees therefore carry the
       * SAME string under `panicHeadlineRu` (the Russian literal) and the
       * SAME string under `panicHeadlineTr` (the Turkish literal).
       *
       * Win BSOD copy: RU primary, TR secondary. The English fallback
       * ("Your PC ran into a problem and needs to restart.") is
       * additionally HARDCODED inside `chrome/win-bsod.ts` (Lane D) as a
       * defensive fallback in case the i18n resolution path throws.
       *
       * Template tokens:
       *  - `{pct}` in `win.percentComplete`: integer 0-100
       *  - `{code}` in `win.stopCode`: stop code (hardcoded to
       *    `CRITICAL_PROCESS_DIED` — English convention, NOT translated)
       */
      faz6: {
        mac: {
          panicHeadlineRu: 'Перезагрузите компьютер.',
          panicHeadlineTr: 'Bilgisayarınızı yeniden başlatın.',
        },
        win: {
          headline: 'Ваш компьютер столкнулся с проблемой и нуждается в перезапуске.',
          collectingInfo: 'Мы собираем сведения об ошибке, после чего компьютер будет перезапущен.',
          percentComplete: 'Завершено на {pct}%',
          stopCode: 'Код остановки: {code}',
          qrCaption: 'Чтобы узнать больше об этой ошибке и возможных способах её устранения, перейдите по ссылке ниже',
        },
      },
      /**
       * Sprint 5 Faz 7 — Bootloop captions.
       *
       * Mac caption renders below the eaten-apple SVG on a black canvas.
       * Win caption renders in the BIOS-blue "American Megatrends Inc."
       * frame (Lane D's `chrome/win-bios-bootloop.ts`).
       *
       * `win.action` carries the F1/F2 prompt verbatim — these key names
       * (F1, F2) are NOT translated; they are physical key labels. The
       * surrounding action verbs ARE translated per locale.
       *
       * No template tokens at this layer.
       */
      faz7: {
        mac: {
          noBoot: 'Не найдена загрузочная ОС',
        },
        win: {
          headline: 'Загрузочное устройство не найдено',
          action: 'Нажмите F1 для повтора, F2 для настройки',
          restarting: 'Перезапуск…',
        },
      },
      /**
       * Sprint 6 Faz 8 — Reveal + Son ekran restart hint + a11y.
       *
       * Sprint 9.1 — the `disclaimer.{primary,secondary,aria-label}` leaves
       * are REMOVED post-ship along with the chrome that consumed them.
       * The Sprint 6 bilingual presentation contract is no longer required
       * because no text overlay renders during the closing tableau; the
       * joke framing now lives in the revolver-on-table tableau and the
       * TEKRAR / ÇIK button affordances.
       *
       * Locale-specific keys (follow UI locale):
       *
       *   `restart.hint` — locale-switched single-line muted hint. The user
       *   sees ONE line in their UI locale (not bilingual). Lane B may also
       *   choose to render all three locales (RU · TR · EN) joined with the
       *   `FAZ8_RESTART_HINT_SEPARATOR` middle-dot delimiter — that is a
       *   chrome-layer concern; this i18n leaf returns single-locale values.
       *   The English line is NOT keyed here (it is a presentation constant
       *   the chrome may inline if joining-mode is chosen).
       *
       *   `son-ekran.aria-label` — screen-reader label, locale-specific so
       *   the announced text matches the user's locale. The son-ekran
       *   parent surface uses `role="region" aria-label=…`; the label
       *   follows the runtime locale because it is heard, not seen.
       *   Sprint 9.1 updated this label to drop the "Şaka" reference now
       *   that the disclaimer text no longer participates in the surface.
       *
       * No template tokens at this layer.
       */
      faz8: {
        /**
         * Sprint 7 Phase 2A D-2: Lane 0 (this commit) RETAINS the
         * `restart.hint` leaves because Sprint 6's `faz8-son-ekran.ts`
         * still calls `t('destruction.faz8.restart.hint', locale)` at the
         * `mountFaz8RestartHint()` site (lines ~303-306). Lane B Phase 2B
         * REMOVES that call in the same dispatch wave that lands the
         * Sprint 7 TEKRAR/ÇIK buttons. Once Lane B's son-ekran refactor
         * lands, Phase 4 spark / Sprint 8 deletes this subtree outright
         * (TODO: scheduled for post-Lane-B sweep — see
         * destruction-direction.md §21 D-2 + handoff
         * `phase2b-lane0-i18n.md`).
         */
        restart: {
          hint: 'Нажмите R для перезапуска',
        },
        'son-ekran': {
          // Sprint 9.1 — "Шутка закончена." prefix DROPPED post-ship in
          // lockstep with the in-app disclaimer-text removal. The aria-
          // label is now a single descriptive sentence about the still-
          // life tableau (no joke-frame reference).
          'aria-label': 'Револьвер лежит на столе.',
        },
        /**
         * Sprint 7 Phase 2B Lane 0 — Faz 8 TEKRAR / ÇIK action buttons.
         *
         * Two button kinds; each kind has TWO leaves:
         *   - `label`      — the visible button text (ALL-CAPS Cyrillic
         *                    or Latin; Lane B inserts as textContent —
         *                    NO `text-transform: uppercase` allowed,
         *                    Turkish dotted-i / dotless-i collisions).
         *   - `aria-label` — the screen-reader announcement; Lane B
         *                    sets `aria-label` attribute on the
         *                    `<button>` element.
         *
         * Locale resolution: BOTH leaves follow runtime UI locale (NOT
         * presentation-constant like the disclaimer pair). Buttons are
         * actionable — they speak the user's language. Russian variants
         * use the formal-imperative register ("ЕЩЁ РАЗ" = "once more";
         * "ВЫЙТИ" = "exit/quit"). Aria descriptions follow the calm,
         * declarative SR convention ("Перезапустить шутку с начала." =
         * "Restart the joke from the start." — full stop, single
         * sentence, no exclamation; mirrors Sprint 6 disclaimer
         * `aria-label` register).
         *
         * Cyrillic glyph coverage (Old Standard TT OFL bundle, Sprint 0):
         *   - ЕЩЁ РАЗ → Е, Щ, Ё, Р, А, З (standard Cyrillic 0x0400-0x04FF)
         *   - ВЫЙТИ   → В, Ы, Й, Т, И      (standard Cyrillic; Й = U+0419)
         * Both phrases verified rendered by Sprint 4-6 RU strings under
         * the same OFL bundle (no NEW glyph requirements introduced).
         *
         * Designer authority: `destruction-direction.md` §21 Typography
         * + Colour palette + Layout (Sprint 7 Phase 2A FILL).
         * Chrome consumer: `chrome/faz8-action-buttons.ts` (Lane B
         * Phase 2B FILL). Wire site: Lane A `destruction-director.ts`
         * son-ekran entry path.
         */
        button: {
          tekrar: {
            label: 'ЕЩЁ РАЗ',
            'aria-label': 'ЕЩЁ РАЗ. Перезапустить с начала.',
          },
          cik: {
            label: 'ВЫЙТИ',
            'aria-label': 'ВЫЙТИ. Закрыть приложение.',
          },
        },
      },
    },
  },
  tr: {
    hud: {
      counterLabel: 'ŞANS',
      earlyReleaseMessage: 'Karar veremedin.',
      bangMessage: 'ATEŞ',
      revealLiteMessage: 'Bunu yapmamalıydın.',
    },
    menu: {
      title: 'RUS RULETİ',
      start: 'BAŞLA',
      quit: 'ÇIKIŞ',
    },
    /**
     * Mirror of `STRINGS.ru.destruction`. EVERY leaf path under
     * `STRINGS.ru.destruction.*` MUST appear here with identical key
     * shape — `LocaleKey` derives its union from the RU tree and the
     * runtime `t()` falls back across locales. An asymmetric tree
     * triggers a TypeScript compile error at the consumer call site
     * (the missing key won't be in the `LocaleKey` union).
     */
    destruction: {
      mac: {
        dialog: {
          title: 'Kritik Hata',
          body: 'macOS kritik bir sistem hatasıyla karşılaştı. kernel_task içinde kurtarılamaz bir hata oluştu.',
          restartCountdown: '{n} saniye içinde yeniden başlatılıyor…',
          restartNowLabel: 'Şimdi Yeniden Başlat',
          cancelLabel: 'İptal',
        },
      },
      win: {
        dialog: {
          title: 'Kritik İşlem Başarısız',
          body: 'Kritik bir sistem işlemi yanıt vermiyor. Windows hata bilgilerini toplayacak ve yeniden başlatılacak.',
          okLabel: 'Tamam',
          moreInfoLabel: 'Daha fazla bilgi',
        },
      },
      toast: {
        mac: {
          iCloudSyncPaused: {
            title: 'iCloud',
            body: 'iCloud senkronizasyonu duraklatıldı',
          },
          timeMachineBackupLost: {
            title: 'Time Machine',
            body: 'Time Machine yedek diski bulunamadı',
          },
          finderDiskEjectError: {
            title: 'Finder',
            body: 'Disk çıkarma hatası',
          },
          kernelTaskTermination: {
            title: 'Sistem',
            body: 'kernel_task sonlandırılıyor',
          },
          spotlightIndexStopped: {
            title: 'Spotlight',
            body: 'Dizinleme durduruldu',
          },
        },
        win: {
          oneDriveSyncError: {
            title: 'OneDrive',
            body: 'OneDrive senkronizasyon hatası',
          },
          defenderStopped: {
            title: 'Microsoft Defender',
            body: 'Koruma durduruldu',
          },
          bitLockerProtectionFailed: {
            title: 'BitLocker',
            body: 'Birim koruması başarısız',
          },
        },
      },
      terminal: {
        command: 'sudo rm -rf / --no-preserve-root',
        passwordPrompt: 'Parola: ',
      },
      /**
       * Mirror of `STRINGS.ru.destruction.faz4`. See the RU-tree comment
       * for the full token contract. Turkish progress dialog phrasing
       * follows the formal-imperative register that real macOS/Windows
       * Türkçe dialogs use ("ediliyor…" present-progressive passive,
       * NOT marketing-style sentence case).
       */
      faz4: {
        mac: {
          headline: 'Disk güvenli şekilde siliniyor…',
          subhead: 'macOS başlangıç diskini güvenli şekilde siliyor',
          itemsRemaining: 'Kalan öğe: {n}',
          estimatedTime: 'Kalan süre: {label}',
          cancel: 'İptal',
        },
        win: {
          headline: 'Dosyalar siliniyor…',
          subhead: 'Dosya Gezgini dosyaları güvenli şekilde siliyor',
          itemsRemaining: 'Kalan öğe: {n}',
          estimatedTime: 'Kalan süre: {label}',
          cancelTitle: 'Durdur',
        },
      },
      /**
       * Mirror of `STRINGS.ru.destruction.faz5`. SMART error templates
       * use Turkish technical register: "SMART OKUMA HATASI" (matching
       * the convention real Türkçe disk utilities adopt for the SMART
       * attribute family). Percentage glyph follows Turkish style:
       * `%{pct}` (percent sign prefixes the number, NO space).
       */
      faz5: {
        mac: {
          headline: 'DİKKAT: Düşük seviye biçimlendirme. Bilgisayarı kapatmayın.',
          sectorLabel: 'Sektör siliniyor: {current} / {total}',
          smartError1: 'SMART OKUMA HATASI: sektör {addr}',
          smartError2: 'BOZUK SEKTÖR YENİDEN ATANDI: {hex} → yedek havuz',
          smartError3: 'SSD aşınma seviyesi: %{pct} (sınır dışı)',
          smartError4: 'OKUMA-YAZMA HATASI: kafa hizalama bozukluğu algılandı',
        },
        win: {
          headline: 'UYARI: HDD/SSD biçimlendirme işlemi sürüyor. İşlemi kesmeyin.',
          sectorLabel: 'Sektör siliniyor: {current} / {total}',
          smartError1: 'SMART OKUMA HATASI: sektör {addr}',
          smartError2: 'BOZUK SEKTÖR YENİDEN ATANDI: {hex} → yedek havuz',
          smartError3: 'SSD aşınması: %{pct} (sınır dışı)',
          smartError4: 'OKUMA-YAZMA HATASI: kafa hizalama bozukluğu algılandı',
        },
      },
      /**
       * Mirror of `STRINGS.ru.destruction.faz6`.
       *
       * Mac panic headlines: BOTH locales carry the SAME Russian literal
       * under `panicHeadlineRu` and the SAME Turkish literal under
       * `panicHeadlineTr`. The suffix denotes IN-WORLD language, not UI
       * locale (see RU-tree comment).
       *
       * Win BSOD: Turkish phrasing follows the convention real Türkçe
       * Windows builds adopt ("PC'niz bir sorunla karşılaştı…").
       */
      faz6: {
        mac: {
          panicHeadlineRu: 'Перезагрузите компьютер.',
          panicHeadlineTr: 'Bilgisayarınızı yeniden başlatın.',
        },
        win: {
          headline: "PC'niz bir sorunla karşılaştı ve yeniden başlatılması gerekiyor.",
          collectingInfo: 'Bazı hata bilgilerini topluyoruz, ardından sizin için yeniden başlatacağız.',
          percentComplete: '%{pct} tamamlandı',
          stopCode: 'Durdurma kodu: {code}',
          qrCaption: 'Bu sorun ve olası çözümleri hakkında daha fazla bilgi için aşağıdaki bağlantıyı ziyaret edin',
        },
      },
      /**
       * Mirror of `STRINGS.ru.destruction.faz7`. Boot-failure phrasing
       * uses the formal infinitive-driven register that authentic BIOS
       * captions adopt in Türkçe ("bulunamadı" passive past — clinical).
       */
      faz7: {
        mac: {
          noBoot: 'Önyüklenebilir işletim sistemi bulunamadı',
        },
        win: {
          headline: 'Önyüklenebilir aygıt bulunamadı',
          action: 'F1 ile tekrarla, F2 ile ayarlara gir',
          restarting: 'Yeniden başlatılıyor…',
        },
      },
      /**
       * Mirror of `STRINGS.ru.destruction.faz8`. See the RU-tree comment
       * for the Sprint 9.1 disclaimer-removal context.
       *
       * Only `restart.hint` and `son-ekran.aria-label` are locale-specific
       * (follow UI locale). Turkish phrasing follows the formal-imperative
       * register that matches the destruction-direction `restart` family
       * in the Sprint 5 trees ("R'ye basın" infinitive-imperative). The
       * aria-label follows the calm, descriptive register used by Turkish
       * screen-reader conventions ("duruyor" present-progressive for the
       * still-life tableau). Sprint 9.1 dropped the "Şaka" reference from
       * the son-ekran aria-label alongside the disclaimer text removal.
       */
      faz8: {
        /**
         * Mirror of `STRINGS.ru.destruction.faz8.restart`. See the RU-tree
         * comment for the Phase 2A D-2 retention rationale. Phase 4 spark /
         * Sprint 8 deletes BOTH locale subtrees once Lane B's
         * `faz8-son-ekran.ts` removes the `mountFaz8RestartHint()` call.
         */
        restart: {
          hint: "Yeniden başlatmak için R'ye basın",
        },
        'son-ekran': {
          // Sprint 9.1 — "Şaka bitti." prefix DROPPED post-ship in lockstep
          // with the in-app disclaimer-text removal. The aria-label is now
          // a single descriptive sentence about the still-life tableau
          // (no joke-frame reference).
          'aria-label': 'Tabanca masada duruyor.',
        },
        /**
         * Mirror of `STRINGS.ru.destruction.faz8.button`. Turkish phrasing
         * uses the formal-imperative register that matches the destruction-
         * direction `restart` family across Sprints 5-6 ("R'ye basın",
         * "Şimdi Yeniden Başlat") — single short verb on the button face
         * ("TEKRAR" = "again"; "ÇIK" = "exit"). Aria descriptions follow
         * the calm declarative SR convention: noun-phrase headline +
         * single-sentence action ("Şakayı baştan başlat." = "Restart the
         * joke from the start."; "Uygulamayı kapat." = "Close the
         * application.") — full stops, no exclamations, no emojis,
         * mirroring the Sprint 6 disclaimer `aria-label` register.
         *
         * Turkish glyph coverage (Sprint 0 Latin Extended-A — Old Standard
         * TT OFL bundle):
         *   - TEKRAR → T, E, K, R, A, R           (standard Latin)
         *   - ÇIK    → Ç (U+00C7), I (dotless),  K (standard Latin)
         * Turkish dotless-i (I, U+0049) is the lowercase-paired letter
         * with dotless lowercase ı; the ALL-CAPS form here uses dotless
         * I deliberately — Lane B MUST NOT apply `text-transform:
         * uppercase` which would mangle dotless-i → dotted İ for
         * uppercase ı (Sprint 6 lesson; preserved in strings.ts source
         * case verbatim).
         */
        button: {
          tekrar: {
            label: 'TEKRAR',
            'aria-label': 'TEKRAR. Baştan başlat.',
          },
          cik: {
            label: 'ÇIK',
            'aria-label': 'ÇIK. Uygulamayı kapat.',
          },
        },
      },
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
