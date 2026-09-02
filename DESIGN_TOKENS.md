# Design Tokens

Every token below is declared as a CSS custom property in the `:root` block of
[css/style.css](css/style.css) and traces back to `DESIGN-opencode.ai.md`.
The system is deliberately small: one typeface, two radii, one canvas colour.

---

## Colors

### Brand & ink

| Token | Value | Use |
|---|---|---|
| `--primary` / `--ink` | `#201d1d` | Headlines, body, primary CTA fill. The brand's only "colour". |
| `--on-primary` | `#fdfcfc` | Text on the primary fill. |
| `--ink-deep` | `#0f0000` | Pressed state on the primary CTA. |
| `--charcoal` | `#302c2c` | Softer body where pure ink reads too heavy; CTA hover. |
| `--body` | `#424245` | Default paragraph text, FAQ answers. |
| `--mute` | `#646262` | Tab labels, metadata, footer links, captions. |
| `--stone` | `#6e6e73` | Least-emphasis utility text. |
| `--ash` | `#9a9898` | Disabled text, TUI secondary, active tab underline. |

### Surface

| Token | Value | Use |
|---|---|---|
| `--canvas` | `#fdfcfc` | The only body background. No section bands. |
| `--surface-soft` | `#f8f7f7` | Input default fill, testimonial rows. |
| `--surface-card` | `#f1eeee` | Install snippet, disabled button, empty histogram cells. |
| `--surface-dark` | `#201d1d` | Hero TUI mockup and the single dark CTA band. |
| `--surface-dark-elevated` | `#302c2c` | The prompt row inside the TUI mockup. |
| `--hairline` | `rgba(15,0,0,0.12)` | 1px rule between content blocks. |
| `--hairline-strong` | `#646262` | Tab-strip bottom rule, secondary button border. |
| `--on-dark` | `#fdfcfc` | Text on dark surfaces. |
| `--on-dark-mute` | `#9a9898` | Secondary text on dark surfaces. |

### Semantic ramp — TUI only

These ship with the system but appear **only inside the hero TUI mockup** as
syntax-highlight stand-ins. Marketing chrome stays monochrome; a coloured CTA
would break the identity.

| Token | Value | Token | Value |
|---|---|---|---|
| `--accent` | `#007aff` | `--danger` | `#ff3b30` |
| `--accent-hover` | `#0056b3` | `--danger-hover` | `#d70015` |
| `--accent-active` | `#004085` | `--danger-active` | `#a50011` |
| `--warning` | `#ff9f0a` | `--success` | `#30d158` |
| `--warning-hover` | `#cc7f08` | | |
| `--warning-active` | `#995f06` | | |

---

## Typography

`--font-mono` is the entire type system:

```
"Berkeley Mono", "JetBrains Mono", "IBM Plex Mono", ui-monospace,
SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace
```

Berkeley Mono is a paid commercial face. JetBrains Mono is loaded from Google
Fonts as the documented substitute — it matches Berkeley Mono's metrics within
about 3% at body sizes. There is no sans-serif, no display face and no italic
anywhere in the system, down to the 14px copyright row.

| Role | Token | Size | Weight | Line height |
|---|---|---|---|---|
| display-xl | `--fs-display-xl` | 38px (28px mobile) | 700 | 1.5 |
| heading-md | `--fs-heading-md` | 16px | 700 | 1.5 |
| body-md | `--fs-body-md` | 16px | 400 | 1.5 |
| body-strong | `--fs-body-md` | 16px | 500 | 1.5 |
| button-md | `--fs-body-md` | 16px | 500 | 2.0 |
| caption-md | `--fs-caption-md` | 14px | 400 | 2.0 |

Hierarchy comes from size and weight alone. Buttons carry a 2.0 line-height so
labels sit calmly inside the 4px rectangle; captions inherit it so footer rows
stay ~44px tappable.

---

## Radius

| Token | Value | Use |
|---|---|---|
| `--rounded-none` | `0px` | Every container: sections, nav, footer, TUI mockup, list rows. |
| `--rounded-sm` | `4px` | Every interactive element: buttons, inputs, snippet, badges, prompt row. |
| `--rounded-full` | `9999px` | Testimonial avatars only. |

---

## Spacing

Base unit 8px, with 1/4/12px steps for tight inline gaps.

| Token | Value | Token | Value |
|---|---|---|---|
| `--space-xxs` | 1px | `--space-lg` | 16px |
| `--space-xs` | 4px | `--space-xl` | 24px |
| `--space-sm` | 8px | `--space-xxl` | 32px |
| `--space-md` | 12px | `--space-section` | 96px |

`--space-section` is the dominant layout cue: 96px between every major block,
dropping to 64px at tablet and 48px at mobile via `responsive.css`.

---

## Layout

| Token | Value | Use |
|---|---|---|
| `--container` | `960px` | Reading column for body sections. |
| `--container-wide` | `1100px` | Nav, footer, TUI mockup, contact split. |

Breakpoints: 1280+ default · 1024 desktop · 850 tablet · 768 tablet-narrow ·
640 mobile.

---

## Elevation

There are no drop shadows in the system. Four levels only:

| Level | Treatment |
|---|---|
| 0 — Flat | No border, no shadow. Default for everything. |
| 1 — Hairline | `1px solid var(--hairline)` between content blocks. |
| 2 — Hairline strong | `1px solid var(--hairline-strong)` on the tab strip. |
| 3 — Inverted | `var(--surface-dark)` fill. The only "raised" surface, and it uses colour, not shadow. |

---

## Iconography

The brackets *are* the icons — `[+]`, `[-]`, `[x]`, `[~]`, `[!]`, `+` / `−`.
They are text content inside `.marker`, `.faq-toggle` and `.scope-checks`, never
SVG glyphs. Do not swap them for an icon font.

---

## Imagery

No photography. Every visual in [images/](images/) is type or line art in the
same monochrome palette, generated by
[tools/generate-assets.py](tools/generate-assets.py) — re-run it after changing
a colour token so the assets stay in sync:

```powershell
python tools/generate-assets.py
```

| Asset | Role |
|---|---|
| `wordmark-vapt.svg` / `-cream.svg` / `-hero.svg` | Block-pixel ASCII wordmark. Never render it as a vector logo. |
| `fig-1-apps-tested.svg` | Sparse line plot — abstract, no real data points. |
| `fig-2-vulns-found.svg` | Dotted scatter thinning to the right. |
| `fig-3-retest-pass.svg` | Step plot climbing to a plateau. |
| `severity-histogram.svg` | Filled/empty character cells as bars. |
| `diagram-attack-surface.svg` | ASCII box diagram of an agreed scope. |
| `diagram-engagement-flow.svg` | ASCII pipeline of the eight phases. |
| `svc-*.svg` (6) | Small character-cell marks beside each scope block. |
| `og-cover.svg`, `favicon.svg` | Share image and tab icon. |
