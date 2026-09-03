# Image specification

What to generate, at what size, and where each file goes. Filenames are fixed —
drop a file in at the stated path and the slot picks it up.

Claude cannot generate these; take the prompts to an image generator or a
designer. Everything below is the receiving end.

---

## Core set — 12 images

Ordered by how much each one earns its download.

| # | File | Slot | Deliver at | Prompt |
|---|---|---|---|---|
| 1 | `images/hero-vapt` | Home hero, background layer | 2400 × 1350 | 2 — hero |
| 2 | `images/process-vapt` | Home, "Our VAPT process" | 2224 × 1251 | 3 — process |
| 3 | `images/svc-web-app` | `service-web.html` | 2224 × 1251 | 4 — web app |
| 4 | `images/svc-network` | `service-network.html` | 2224 × 1251 | 5 — network |
| 5 | `images/svc-api` | `service-api.html` | 2224 × 1251 | 10 — API |
| 6 | `images/svc-cloud` | `service-cloud.html` | 2224 × 1251 | 11 — cloud |
| 7 | `images/svc-mobile` | `service-mobile.html` | 2224 × 1251 | 12 — mobile |
| 8 | `images/scanning` | Vulnerability assessment | 2224 × 1251 | 7 — scanning |
| 9 | `images/risk-assessment` | Reports / risk model | 2224 × 1251 | 8 — risk |
| 10 | `images/remediation` | "Fix" step, deliverables | 2224 × 1251 | 13 — remediation |
| 11 | `images/team` | `about.html` — **slot is live**, `#team` | 2224 × 1251 | 15 or 19 — team |
| 12 | `images/cta-shield` | Final CTA band | 2224 × 1251 | 16 — trust shield |

**Do not** generate 20 different looks. One visual family, per the base
direction: dark navy → blue/cyan → a small amount of amber/red for
vulnerabilities only → realistic infrastructure → generous negative space.

---

## Formats

Export each image three times, same basename:

```
images/hero-vapt.avif     ~95 KB   primary
images/hero-vapt.webp    ~150 KB   fallback
images/hero-vapt.jpg     ~290 KB   last resort
```

AVIF first, JPEG last. A 16:9 hero above ~350 KB in its best format is too
heavy — re-export rather than ship it.

## Markup

The `.media` component reserves the box with `aspect-ratio`, so nothing on the
page moves while the image loads. Replace a placeholder slot with:

```html
<figure class="media">
  <picture>
    <source srcset="images/process-vapt.avif" type="image/avif">
    <source srcset="images/process-vapt.webp" type="image/webp">
    <img src="images/process-vapt.jpg" alt=""
         width="2224" height="1251" loading="lazy" decoding="async">
  </picture>
</figure>
```

- `width` and `height` must be the real pixel dimensions — they set the
  aspect ratio the browser reserves.
- `loading="lazy"` on everything **except** the hero, which is above the fold
  and should be `loading="eager"` with `fetchpriority="high"`.

## The hero is a background, not an `<img>`

It sits behind the existing grid and glow, masked so the left 45% stays clean
for the headline. Switch it on by adding one attribute:

```html
<section class="hero section-dark" style="--hero-art:url(images/hero-vapt.avif)">
```

Remove the attribute and the hero returns to today's pure-CSS look. Nothing
breaks either way.

---

## Alt text

These renders are **decorative**. An abstract 3D visualisation of "vulnerability
scanning" tells a screen-reader user nothing they cannot get from the heading
beside it, so:

```html
alt=""
```

That is the correct value, not an oversight. Writing
`alt="cybersecurity vulnerability assessment penetration testing"` is keyword
stuffing — it makes the page worse for the people alt text exists for, and
search engines discount it anyway.

The **only** image here that takes real alt text is the team photo, because it
depicts something specific: `alt="Our security team reviewing assessment
findings"`.

---

## Two things worth deciding first

**1. The hero right column currently shows a live example summary** — issue
counts by severity, with the "SAMPLE DATA" flag. That is a demonstration of the
product. Replacing it with a decorative render would trade a concrete proof
point for atmosphere. The background-layer approach above keeps both; only swap
it out deliberately.

**2. AI-generated 3D security art is its own cliché.** Glowing shields, holographic
padlocks and blue particle grids are as recognisable as the hooded hacker you
are rightly avoiding. Two things keep it from reading as stock: consistency, which
the base direction handles, and restraint — a site with 4 strong images looks more
expensive than one with 12 mediocre ones. Consider generating the full set, then
shipping only the best four.

---

## Priority

Of the twelve, **only the team photo cannot be drawn**. Icons, diagrams and
process visuals are all vector on this site already — cheaper, sharper, and they
follow the theme. Spend the budget on a real photograph of the people who do the
testing; it is the one image a competitor cannot copy, and the one a buyer
actually reads as proof that you exist.

The slot is live at `about.html#team`. Drop `images/team.jpg` (plus `.avif` and
`.webp`) in and it appears.

---

## Never in the image

Text of any kind. AI-rendered lettering looks broken and cannot be translated,
searched, or read by a screen reader. Every word on this site is real HTML, and
it stays that way.
