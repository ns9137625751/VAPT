# Design Tokens

Every token below is declared as a CSS custom property in the `:root` block of
[css/style.css](css/style.css) and traces back to `DESIGN-opencode.ai.md`.
The system is deliberately small: one typeface, two radii, one off-white ground, one blue accent.

---

## Colors

Light. An off-white ground, charcoal-slate text, and one deep blue accent. The
terminal mockup is the single dark surface in the system and the only place the
syntax ramp is allowed to appear.

| Colour | Job |
|---|---|
| `#f8f9fa` off-white | **Ground.** The only body background. No alternating section bands. |
| `#1e293b` charcoal | **Text.** Body copy, and the fill of every primary button. |
| `#0369a1` deep blue | **Interaction.** Links, focus ring, active nav, `[x]` confirmations. |
| `#b45309` amber | **Attention.** `[!]` alert callouts. |
| `#0f172a` slate-black | **Depth.** Headings, and the one dark surface. |

`color-scheme: light` is declared on `html` so native form controls, scrollbars
and the browser's own chrome follow the page.


### Brand & ink

| Token | Value | Use | On canvas |
|---|---|---|---|
| `--primary` | `#1e293b` | Primary button fill. | 13.88:1 |
| `--primary-hover` | `#0f172a` | Button hover. | — |
| `--primary-active` | `#020617` | Button pressed. | — |
| `--on-primary` | `#f8f9fa` | Label on the fill. | 13.88:1 on fill |
| `--ink` | `#0f172a` | Headlines and emphasis. | 16.94:1 |
| `--ink-deep` | `#020617` | Maximum emphasis. | — |
| `--charcoal` | `#1e293b` | Softer than full ink. | — |
| `--body` | `#1e293b` | Default paragraph text. | 13.88:1 |
| `--mute` | `#64748b` | Metadata, footer links, captions. | 4.51:1 |
| `--stone` | `#475569` | Least-emphasis utility text. | 7.19:1 |
| `--ash` | `#7c8899` | Disabled text, active tab underline. | 3.41:1 — UI only, never body copy. |

### Interaction & attention

| Token | Value | Use | On canvas |
|---|---|---|---|
| `--accent` | `#0369a1` | Inline links, focus ring, active nav, `.callout-marker`. | 5.63:1 |
| `--accent-hover` | `#025280` | Link hover. | 7.90:1 |
| `--accent-active` | `#013e63` | Link pressed. | — |
| `--signal` | `#b45309` | `[!]` alert callouts. | 4.76:1 |
| `--signal-hover` | `#92400e` | Signal hover. | — |

### Nav pills

Every primary nav link is a filled capsule. The bar is monochrome by intent: it
recedes into the page, and the dark CTA is the only thing in it that asks to be
clicked. The fills are quiet enough that the **label**, not the capsule edge, is
what carries meaning.

| Token | Value | Use | Contrast |
|---|---|---|---|
| `--nav-bar` | `#f8f9fa` | The bar and news strip, level with the page. | — |
| `--nav-pill` | `#e9ecef` | Default capsule fill, plus a hairline edge. | 1.12 vs canvas |
| `--nav-pill-hover` | `#dee2e6` | Hover. | 1.24 vs canvas |
| `--nav-pill-active` | `#1e293b` | Current page — inverts to a dark fill. | 13.88 vs canvas |
| `--nav-pill-ink` | `#000000` | Label at rest — bold, uppercase. | 17.71:1 on fill |
| `--nav-pill-ink-active` | `#f8f9fa` | Label on the current pill, at weight 700. | 13.88:1 |
| `--nav-pill-ink-mute` | `#576373` | The `[6]` count. | 5.15:1 on fill |
| `--nav-cta` | `#1e293b` | The one dark element in the bar. | 13.88 vs canvas |
| `--nav-cta-ink` | `#f8f9fa` | Label on the CTA. | 13.88:1 on fill |
| `--nav-divider` | `rgba(15,23,42,0.20)` | Group boundary after Services. Composites to `#c9ccd0`. | 1.53 vs canvas |

Labels are set in **bold uppercase at pure black** — 17.71:1 on the resting
pill, close to the 21:1 ceiling. Because the type is monospaced, uppercasing
changes no advance widths and the bar does not reflow.

Weight is therefore no longer available to mark the current page, since every
label is already 700. The active pill inverts instead: dark fill, off-white
label. At 1.12 against the canvas the resting fill is too quiet to define an
edge on its own, so each pill carries a `1px` hairline at `--nav-pill-edge`.

### Surface

| Token | Value | Use | vs canvas |
|---|---|---|---|
| `--canvas` | `#f8f9fa` | The only body background. | — |
| `--surface-soft` | `#f1f3f5` | Input fill, testimonial rows. | 1.06 |
| `--surface-card` | `#e9ecef` | Snippet, badge, CTA band, empty histogram cells. | 1.12 |
| `--surface-dark` | `#0f172a` | The terminal mockup — the one dark surface. | inverted |
| `--surface-dark-elevated` | `#1e293b` | The prompt row inside the mockup. | — |
| `--hairline` | `rgba(15,23,42,0.12)` | 1px rule between content blocks. | — |
| `--hairline-strong` | `#64748b` | Tab-strip rule, secondary button border. | 4.51:1 |
| `--on-dark` | `#f8f9fa` | Text on the mockup. | 16.94:1 on mockup |
| `--on-dark-mute` | `#94a3b8` | Secondary text on the mockup. | 6.96:1 on mockup |

### Severity ramp

Applied via `.severity-row.is-critical` and siblings, always alongside the
bracket marker and the written label — severity is never signalled by colour
alone.

**Low is blue, not green.** No two adjacent tiers then rely on red–green
discrimination, which roughly 1 in 12 men cannot make. Every tier clears AA on
the canvas and stays legible in a printed report.

| Token | Value | Tier | On canvas |
|---|---|---|---|
| `--sev-critical` | `#a32b1e` | Critical, 9.0+ | 6.82:1 |
| `--sev-high` | `#b04a16` | High, 7.0+ | 5.19:1 |
| `--sev-medium` | `#8a5a0b` | Medium, 4.0+ | 5.62:1 |
| `--sev-low` | `#2a5c8a` | Low, 0.1+ | 6.65:1 |
| `--sev-info` | `#5c6167` | Info, 0.0 | 5.93:1 |

### Syntax ramp — TUI only

Inside the hero mockup only, against the `#0f172a` dark surface. Marketing
chrome never uses them; `--danger`, `--warning` and `--success` remain aliases.

| Token | Value | Use | On mockup |
|---|---|---|---|
| `--tui-keyword` | `#56c7f5` | Keywords. | 9.25:1 |
| `--tui-success` | `#5fd39b` | Pass and closed states. | 9.59:1 |
| `--tui-warning` | `#f0c14c` | Warnings. | 10.57:1 |
| `--tui-danger` | `#ff8073` | Criticals. | 7.30:1 |

### Print

The `@media print` block in [css/responsive.css](css/responsive.css) forces
`body` to white and every token back to `#000`, and gives the mockup, CTA band,
callouts, badges and snippets a white fill with a black rule.

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
| `--rounded-full` | `9999px` | Nav pills and testimonial avatars. |

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

`--nav-gap` (4px) is separate, and drives **three** things at once: the
pill-to-pill gap, the gap between the last pill and the CTA, and the space on
either side of the `--nav-divider` — one token,
so the two can never drift out of step as the bar tightens.

The nav bar is the only full-bleed element in the system. Its right group sits
16px from the viewport edge, while its left padding reproduces the centred
`--container-wide` offset exactly, so the wordmark stays aligned with the news
strip and page content below it.

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
| 3 — Inverted | `var(--surface-dark)` fill plus a hairline. The mockup is the only "raised" surface, and it uses colour, not shadow. |

---

## Iconography

The brackets *are* the icons — `[+]`, `[-]`, `[x]`, `[~]`, `[!]`, `+` / `−`.
They are text content inside `.marker`, `.faq-toggle` and `.scope-checks`, never
SVG glyphs. Do not swap them for an icon font.

---

## Imagery

No photography. Every visual in [images/](images/) is type or line art drawn
in dark marks on the off-white page, generated by
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
