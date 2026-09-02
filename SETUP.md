# Setup

## Run it locally

The site is static — no build step, no package manager, no dependencies.

### Simplest

Open `index.html` in a browser. Everything works, including the copy button
(it falls back to `document.execCommand` when the Clipboard API is unavailable
over `file://`).

### With a local server (recommended)

```powershell
python -m http.server 8000
```

Then visit <http://localhost:8000>.

Use a server rather than `file://` if you want the Clipboard API proper, or if
you plan to add anything that fetches.

---

## What's on the site

Ten static pages. `index.html` is the landing page; the rest go deeper.

| Page | Purpose |
|---|---|
| `index.html` | Hero, dark TUI mockup, quick start, summaries of scope/method/findings, FAQ, contact |
| `services.html` | The six service lines in depth, with coverage lists and engagement shapes |
| `methodology.html` | Eight phases in full, standards mapping, rules of engagement |
| `reports.html` | Report contents, a sample finding, the severity model, delivery formats |
| `advisories.html` | Expandable advisory archive |
| `about.html` | Team, principles, track record, careers, brand assets |
| `contact.html` | The full request form |
| `disclosure.html` | Responsible disclosure policy, `security.txt`, PGP key |
| `privacy.html` | Privacy policy |
| `terms.html` | Terms of service and DPA summary |

### Adding a page

There is no templating layer, so the nav and footer are copied into each file.
To add one:

1. Copy any existing interior page (`about.html` is a good base).
2. Replace everything between `<main id="main">` and `</main>`.
3. Update `<title>`, the `description` and `og:` meta, and the breadcrumb.
4. Move `aria-current="page"` onto the right nav link, or remove it.
5. Add the page to the footer link grid **in every page**, if it belongs there.

Step 5 is the one that bites. A quick way to check nothing is broken:

```powershell
python -c "import glob,os,re; [print(f,h) for f in glob.glob('*.html') for h in re.findall(r'href=\"([^\"#:]+\.html)', open(f,encoding='utf-8').read()) if not os.path.exists(h)]"
```

Silence means every internal link resolves.

---

## Customising

All tokens live in one `:root` block in [css/style.css](css/style.css). See
[DESIGN_TOKENS.md](DESIGN_TOKENS.md) for the full reference.

### Company name

The wordmark is generated, not hand-drawn. Edit the calls at the top of
[tools/generate-assets.py](tools/generate-assets.py):

```python
write("wordmark-vapt.svg", wordmark("VAPT", 5, INK))
```

Add any missing letters to the `GLYPHS` dictionary (5 rows × 5 columns of
`X` and `.`), then regenerate:

```powershell
python tools/generate-assets.py
```

Also update the `.navbar-brand-suffix` text and the `<title>` on every page.

### Contact details

They appear on `index.html`, `contact.html` and `disclosure.html`. Search all
pages for `hello@vapt-security.com`, `security@vapt-security.com`,
`privacy@vapt-security.com` and `+1 (555) 123-4567`.

### Colours

Edit the `:root` block in `css/style.css`, then **re-run the asset generator** —
the SVGs hard-code their fills and will otherwise drift from the CSS. The
constants at the top of `tools/generate-assets.py` mirror the CSS token names.

Keep the discipline the system depends on: one cream canvas with no alternating
section bands, and the semantic ramp (blue/amber/red/green) confined to the TUI
mockup. A coloured CTA breaks the identity.

### Services and copy

The six scope blocks, eight method steps, severity rows, FAQ entries and
advisory entries are all plain markup — edit them in place in the relevant
page. Keep the ASCII bracket markers; they are the system's only iconography.

### Interior page chrome

Sub-pages share a small set of components defined in `css/sections.css`:

| Class | Use |
|---|---|
| `.page-head` | Breadcrumb, headline, standfirst and a hairline meta row |
| `.prose` | Long-form policy text; `li` items get an automatic `[-]` marker |
| `.toc` | Contents box between hairlines |
| `.callout` | A bracketed note — never a coloured banner |
| `.deflist` / `.defrow` | Term on the left, detail on the right |
| `.code-block` | `security.txt`, PGP blocks, anything pre-formatted |
| `.faq-row` | Expandable entry; works in any `[data-faq]` container |
| `.page-nav` | Previous/next links at the foot of a page |

---

## Fonts

Berkeley Mono is a paid commercial face and is not bundled. The page loads
**JetBrains Mono** from Google Fonts as the documented substitute — it matches
Berkeley Mono's metrics within about 3% at body sizes.

If you license Berkeley Mono, self-host it and it will take precedence
automatically; it is already first in the `--font-mono` stack. Offline, the
stack falls through to the OS monospace (Consolas on Windows, SF Mono on macOS)
and the layout holds, since every measurement is in `ch` or `px`.

---

## Testing responsive behaviour

Press `F12`, then the device-toolbar icon. The documented breakpoints are:

| Width | What changes |
|---|---|
| 850px | Two-column splits stack; footer 5-up → 2-up; figures 3-up → 2-up |
| 768px | Nav collapses to a drawer; list rows and steps stack |
| 640px | Single column throughout; hero headline 38px → 28px; footer 2-up → 1-up |

Section rhythm tightens 96px → 64px → 48px across the same steps.

There is also a print stylesheet — the pages already read like a code listing,
so printing drops the chrome and keeps the type.

---

## Wiring up the forms

Every form on the site — the contact form and the newsletter row in the footer
of each page — is validated client-side and then stops.
`FormValidator.handleSubmit` in [js/main.js](js/main.js) is where to POST:

```js
if (!valid) { /* ... */ return; }

await fetch('/api/contact', { method: 'POST', body: new FormData(form) });

form.reset();
this.confirm(form);
```

---

## Browser support

Chrome, Edge, Firefox and Safari (current), plus mobile Safari and Chrome.
`IntersectionObserver` gates the scroll reveals and counters; where it is
missing, content renders visible immediately rather than breaking.

---

## Troubleshooting

**Type looks wrong / proportional.** The Google Fonts stylesheet failed to load.
Check the network, or self-host JetBrains Mono and point the `<link>` at it.

**Copy button says "failed".** The Clipboard API needs a secure context. Serve
over `localhost` or HTTPS rather than opening the file directly.

**Images missing.** Re-run `python tools/generate-assets.py` from the project
root — it writes into `images/` relative to the current directory.
