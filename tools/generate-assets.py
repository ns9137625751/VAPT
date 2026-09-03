# -*- coding: utf-8 -*-
"""Generate the terminal-native SVG asset set for the VAPT site.
Every asset is type-or-lineart only: no photography, no gradients, no shadows."""
import os, random

OUT = os.path.join(os.getcwd(), "images")
os.makedirs(OUT, exist_ok=True)

# Light: dark marks on the off-white page. BG is the dark share-card ground.
INK   = "#1e293b"
BODY  = "#334155"
MUTE  = "#64748b"
ASH   = "#7c8899"
CREAM = "#f8f9fa"
CARD  = "#e9ecef"
BG    = "#0f172a"


def write(name, body):
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        f.write(body)
    print("wrote", name, len(body))


# ---------------------------------------------------------------- pixel font
# 5-row block-pixel glyphs, 5 columns wide. The brand wordmark is ASCII art,
# never a vector logo -- these rects are literal character cells. Five columns
# rather than four so the V closes to a point instead of reading as a U.
GLYPHS = {
    "V": ["X...X", "X...X", "X...X", ".X.X.", "..X.."],
    "A": [".XXX.", "X...X", "XXXXX", "X...X", "X...X"],
    "P": ["XXXX.", "X...X", "XXXX.", "X....", "X...."],
    "T": ["XXXXX", "..X..", "..X..", "..X..", "..X.."],
    "S": [".XXXX", "X....", ".XXX.", "....X", "XXXX."],
    "E": ["XXXXX", "X....", "XXXX.", "X....", "XXXXX"],
    "C": [".XXXX", "X....", "X....", "X....", ".XXXX"],
    "U": ["X...X", "X...X", "X...X", "X...X", ".XXX."],
    "R": ["XXXX.", "X...X", "XXXX.", "X..X.", "X...X"],
}


def wordmark(text, cell, color, pad=0):
    cols_per, gap = 5, 1
    n = len(text)
    w = (cols_per * n + gap * (n - 1)) * cell + pad * 2
    h = 5 * cell + pad * 2
    rects, x0 = [], pad
    for ch in text.upper():
        for r, row in enumerate(GLYPHS[ch]):
            for c, v in enumerate(row):
                if v == "X":
                    rects.append('<rect x="%d" y="%d" width="%d" height="%d"/>'
                                 % (x0 + c * cell, pad + r * cell, cell, cell))
        x0 += (cols_per + gap) * cell
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" '
            'viewBox="0 0 %d %d" role="img" aria-label="%s">\n'
            '<g fill="%s" shape-rendering="crispEdges">\n%s\n</g>\n</svg>\n'
            % (w, h, w, h, text, color, "\n".join(rects)))


write("wordmark-vapt.svg", wordmark("VAPT", 5, INK))
write("wordmark-vapt-cream.svg", wordmark("VAPT", 5, CREAM))
write("wordmark-vapt-hero.svg", wordmark("VAPT", 12, CREAM, pad=4))


# ---------------------------------------------------------------- chart tiles
def frame(w, h, inner):
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" '
            'viewBox="0 0 %d %d" role="img" fill="none">\n%s\n</svg>\n'
            % (w, h, w, h, inner))


W, H = 280, 120
BASE = H - 16


def axes():
    return ('<path d="M0 %d H%d" stroke="%s" stroke-width="1"/>' % (BASE, W, ASH)
            + "".join('<path d="M%d %d v4" stroke="%s" stroke-width="1"/>'
                      % (x, BASE, ASH) for x in range(0, W + 1, 40)))


# Fig 1 -- sparse ascending polyline
random.seed(11)
pts, v = [], 78.0
for i in range(15):
    v = max(18.0, min(88.0, v - random.randint(-6, 14)))
    pts.append((i * (W / 14.0), v))
inner = (axes()
         + '<polyline points="%s" stroke="%s" stroke-width="1.5" fill="none" '
           'stroke-linejoin="round"/>'
           % (" ".join("%.1f,%.1f" % p for p in pts), INK)
         + "".join('<rect x="%.1f" y="%.1f" width="3" height="3" fill="%s"/>'
                   % (x - 1.5, y - 1.5, BODY) for x, y in pts[::3]))
write("fig-1-apps-tested.svg", frame(W, H, inner))

# Fig 2 -- dotted scatter thinning to the right (findings closed out)
random.seed(29)
dots = []
for i in range(120):
    x = random.random() ** 0.75 * W
    spread = 42 * (1.0 - x / W) + 5
    y = BASE - 12 - abs(random.gauss(0, spread))
    if 6 < y < BASE - 2:
        dots.append('<circle cx="%.1f" cy="%.1f" r="1.4" fill="%s"/>' % (x, y, BODY))
inner = (axes() + "".join(dots)
         + '<path d="M0 28 Q%d 56 %d 76" stroke="%s" stroke-width="1" '
           'stroke-dasharray="3 4" fill="none"/>' % (W // 2, W, MUTE))
write("fig-2-vulns-found.svg", frame(W, H, inner))

# Fig 3 -- step plot climbing to a plateau (remediation verified)
y = float(BASE - 6)
d = "M0 %.1f" % y
for i, drop in enumerate([14, 10, 12, 8, 9, 5, 4, 2]):
    y -= drop
    d += " H%.1f V%.1f" % ((i + 1) * (W / 8.0), y)
inner = (axes()
         + '<path d="%s" stroke="%s" stroke-width="1.5" fill="none"/>' % (d, INK)
         + '<path d="M0 %.1f H%d" stroke="%s" stroke-width="1" '
           'stroke-dasharray="2 5"/>' % (y, W, ASH))
write("fig-3-retest-pass.svg", frame(W, H, inner))


def mono(x, y, s, fill=BODY, size=13, weight=400):
    s = s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return ('<text x="%d" y="%d" font-family="ui-monospace,SFMono-Regular,Menlo,'
            'Consolas,monospace" font-size="%d" font-weight="%d" fill="%s" '
            'xml:space="preserve">%s</text>' % (x, y, size, weight, fill, s))


# ------------------------------------------------- severity histogram (ASCII)
bars, y = [], 22
for label, n, pct in [("CRITICAL", 2, 34), ("HIGH", 8, 62),
                      ("MEDIUM", 15, 100), ("LOW", 10, 74)]:
    filled = int(round(pct / 100.0 * 28))
    cells = "".join('<rect x="%d" y="%d" width="7" height="12" fill="%s"/>'
                    % (120 + i * 9, y - 10, INK if i < filled else CARD)
                    for i in range(28))
    bars.append(mono(0, y, label.ljust(9), BODY) + cells
                + mono(384, y, "%02d" % n, MUTE))
    y += 30
write("severity-histogram.svg", frame(420, 132, "\n".join(bars)))


# ---------------------------------------------------- ASCII scope box diagram
SURFACE = [
    "+--------------------------------------------------+",
    "|  ATTACK SURFACE                    [ IN SCOPE ]   |",
    "+--------------------------------------------------+",
    "|  [+] web        app.example.com   ..... 42 routes |",
    "|  [+] api        api.example.com   ..... 118 paths |",
    "|  [+] mobile     android / ios     ..... 2 bundles |",
    "|  [+] network    10.0.0.0/16       ..... 254 hosts |",
    "|  [+] cloud      aws / azure       ..... 31 roles  |",
    "|  [-] thirdparty vendor.saas.io    ..... excluded  |",
    "+--------------------------------------------------+",
]
write("diagram-attack-surface.svg",
      frame(430, 200, "".join(mono(0, 18 + i * 19, ln, INK if i < 3 else BODY)
                              for i, ln in enumerate(SURFACE))))

FLOW = [
    "  scope  ->  recon  ->  scan  ->  exploit  ->  report",
    "    |         |         |          |            |",
    "   [x]       [x]       [x]        [x]          [ ]",
    "  day 1     day 2     day 3      day 4-7      day 8",
]
write("diagram-engagement-flow.svg",
      frame(430, 100, "".join(mono(0, 18 + i * 20, ln, INK if i == 0 else MUTE)
                              for i, ln in enumerate(FLOW))))


# -------------------------------------------------------- service glyph tiles
TILES = {
    "svc-web":        ["+------+", "| GET  |", "| /  * |", "+------+"],
    "svc-api":        ["{ }--->", " 200 OK", " 401 ..", " 500 !!"],
    "svc-mobile":     ["+----+", "|::::|", "|::::|", "+-oo-+"],
    "svc-network":    ["o--o--o", "|  |  |", "o--o--o", ":22 :443"],
    "svc-cloud":      [".--.--.", "( cloud )", "'--'--'", "iam  s3"],
    "svc-compliance": ["[x] owasp", "[x] pci", "[x] gdpr", "[ ] hipaa"],
}
for name, lines in TILES.items():
    write(name + ".svg",
          frame(120, 84, "".join(mono(0, 16 + i * 18, ln, INK if i == 0 else MUTE)
                                 for i, ln in enumerate(lines))))


# ------------------------------------------------------------- og + favicon
og_rects = wordmark("VAPT", 22, CREAM).split(">\n", 1)[1].rsplit("</svg>", 1)[0]
write("og-cover.svg",
      '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" '
      'viewBox="0 0 1200 630">\n<rect width="1200" height="630" fill="%s"/>\n'
      '<g transform="translate(370 236)">%s</g>\n%s\n%s\n%s\n</svg>\n'
      % (BG, og_rects,
         mono(370, 400, "the security assessment that reads like a manpage", ASH, 22),
         mono(370, 452, "[+] web  [+] api  [+] mobile  [+] network  [+] cloud", CREAM, 22),
         mono(370, 540, "tab switch scope   ctrl-p commands", MUTE, 18)))

write("favicon.svg",
      '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" '
      'viewBox="0 0 64 64">\n<rect width="64" height="64" fill="%s"/>\n%s\n</svg>\n'
      % (BG, mono(9, 44, "[+]", CREAM, 26, 700)))
