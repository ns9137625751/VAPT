# VAPT Security — terminal-native marketing site

A ten-page marketing site for a Vulnerability Assessment and Penetration
Testing practice, built to the system documented in
[DESIGN-opencode.ai.md](DESIGN-opencode.ai.md). HTML5, CSS3 and vanilla
JavaScript — no build step, no dependencies.

The design is one decision carried all the way through: **every word on the site
is monospaced**. Each page reads like a manpage or a README rendered at modern
resolutions — warm cream canvas, near-black ink, hairline rules, bracketed
`[+]` / `[-]` / `[x]` markers instead of icons, and exactly one dark surface
(the hero TUI mockup) per page.

---

## Project structure

```
vapt/
├── index.html                     # Home
├── services.html                  # Six service lines, in depth
├── methodology.html               # The eight phases + standards + rules of engagement
├── reports.html                   # What a report contains, sample finding, severity model
├── advisories.html                # Advisory archive (expandable entries)
├── about.html                     # Team, principles, track record, careers, brand
├── contact.html                   # Request an assessment
├── disclosure.html                # Responsible disclosure, security.txt, PGP
├── privacy.html                   # Privacy policy
├── terms.html                     # Terms of service + DPA summary
│
├── css/
│   ├── style.css                  # Tokens, reset, base type, buttons, inputs
│   ├── navbar.css                 # 56px nav + news strip
│   ├── sections.css               # Hero TUI, scope, method, figures, FAQ, contact,
│   │                              #   plus the interior-page chrome (page head,
│   │                              #   prose, TOC, callout, deflist, code block)
│   ├── footer.css                 # 5-up link grid + subscribe row
│   ├── animations.css             # Fade-up, caret, reduced-motion
│   └── responsive.css             # 850 / 768 / 640 breakpoints + print
│
├── js/
│   └── main.js                    # Nav drawer, tabs, copy, FAQ, counters, forms
│
├── images/                        # 17 generated SVGs — type and line art only
│
├── tools/
│   └── generate-assets.py         # Regenerates everything in images/
│
├── DESIGN-opencode.ai.md          # The source design system
├── DESIGN_TOKENS.md               # Token reference for this implementation
└── SETUP.md                       # How to run it locally
```

---

## Design system

Full token reference in [DESIGN_TOKENS.md](DESIGN_TOKENS.md). The short version:

| | |
|---|---|
| Canvas | `#fdfcfc` — the only body background. No alternating section bands. |
| Ink | `#201d1d` — headlines, body, CTA fill. The brand's only colour. |
| Type | Berkeley Mono, substituted by JetBrains Mono. One face, weights 400/500/700. |
| Radius | `4px` on interactive elements, `0px` on every container. Nothing else. |
| Rhythm | 96px between sections, separated only by a 1px hairline. |
| Elevation | No shadows anywhere. The dark TUI mockup is the only "raised" surface. |
| Icons | ASCII brackets. `[+]`, `[-]`, `[x]`, `[~]`, `[!]`, `+` / `−`. |

The Apple-derived semantic ramp (blue / amber / red / green) is loaded but used
**only inside the hero terminal mockup**. Putting it on a marketing CTA would
break the identity — see the Do's and Don'ts in the design doc.

---

## Imagery

There is no photography. All 17 assets in [images/](images/) are monochrome type
or line art, generated from one script so they stay consistent with the palette:

```powershell
python tools/generate-assets.py
```

- **Wordmarks** — `VAPT` drawn as literal block-pixel character cells, in ink,
  cream and a large hero variant. Never render the brand as a vector logo.
- **Figures 1–3** — sparse line, dotted scatter and step plots for the track
  record section. Abstract by design; they carry no specific data points.
- **Fig 5** — a severity histogram built from filled and empty character cells.
- **Diagrams** — an ASCII scope sheet and the eight-phase engagement pipeline.
- **Scope glyphs** — six small character-cell marks, one per service block.
- **`og-cover.svg` / `favicon.svg`** — share image and tab icon.

Re-run the generator after editing a colour token; the SVGs hard-code their
fills and will otherwise drift from the CSS.

---

## Pages

Ten static pages, no build step. The nav and footer markup is identical on
every page — copy it from any one of them when you add another.

| Page | What is on it |
|---|---|
| `index.html` | Hero + dark TUI mockup, quick start, scope summary, method summary, track record, severity table, why-us, testimonials, FAQ, contact |
| `services.html` | Six service lines, each with a coverage list and a deliverable callout; engagement shapes; scope-sheet figure |
| `methodology.html` | The eight phases in full, standards mapping (WSTG, ASVS, PTES, NIST, CVSS), rules of engagement |
| `reports.html` | Report contents, a real redacted finding in the dark TUI, the severity model, delivery formats |
| `advisories.html` | Expandable advisory archive, plus how we publish |
| `about.html` | Why we exist, principles, team and certifications, track record, testimonials, careers, brand assets |
| `contact.html` | Two-column request form with what-happens-next and direct contact lines |
| `disclosure.html` | Scope, safe harbour, reporting, `security.txt`, PGP key, acknowledgements |
| `privacy.html` | Collection, engagement data, lawful basis, retention, processors, rights, cookies |
| `terms.html` | Engagement terms, authorisation, limits of testing, deliverables, fees, liability, DPA |

The interior pages share one header pattern — breadcrumb, 38px headline,
standfirst, then a hairline meta row — and end with a CTA band and prev/next
links. They use only the existing token vocabulary; no new colours, radii or
type sizes were introduced.

> The legal pages (`privacy.html`, `terms.html`) carry a visible template
> notice. They are a sensible starting point for a testing practice, not
> reviewed advice — have counsel check them before you rely on them.

---

## Behaviour

`js/main.js` is nine small classes, no framework:

- Scroll reveal (fade-up, once per element, honours `prefers-reduced-motion`)
- Stat counters with an ease-out, skipped entirely under reduced motion
- Mobile nav drawer — the CTA stays in the bar at every width
- Active nav link tracking
- Install tab strip and clipboard copy, with a `document.execCommand` fallback
  so the button still works over `file://`
- FAQ bracket toggles (`+` / `−`), no chevrons, no accordion animation
- Inline form validation using `[!]` markers rather than colour

There is **no theme toggle** — the system specifies a single cream canvas.

---

## Accessibility

- Skip link to `#main`; visible `2px` ink focus rings on every interactive element.
- All interactive elements sit at 36–44px; footer rows reach ~44px via the 2.0
  caption line-height plus vertical padding.
- Decorative SVGs carry `alt=""`; the charts and diagrams carry descriptive text.
- Severity is never signalled by colour alone — each row is labelled and
  bracket-marked.
- `prefers-reduced-motion` disables reveals, the caret and the counters.

---

## Running it

See [SETUP.md](SETUP.md). Short version: `python -m http.server 8000` from the
project root, then open <http://localhost:8000>.
