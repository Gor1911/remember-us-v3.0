# Self-hosted fonts

Loaded with `next/font/local` in `app/layout.tsx` — no request to Google at build time or in the browser.

| File | Family | Axes used | Subset | Source | License |
|---|---|---|---|---|---|
| `DMSans-latin-var.woff2` | DM Sans (variable) | wght 400–700 | latin | Google Fonts (fonts.gstatic.com, v17) | SIL OFL 1.1 — `OFL-DMSans.txt` |
| `Inter-latin-var.woff2` | Inter (variable) | wght 400–600 | latin | Google Fonts (fonts.gstatic.com, v20) | SIL OFL 1.1 — `OFL-Inter.txt` |

Downloaded 2026-11-24. The latin subset covers U+0000–00FF and common punctuation (the same coverage the
site had with `next/font/google` and `subsets: ["latin"]`). Characters outside it (e.g. Cyrillic, Central
European letters) fall back to Arial. To widen coverage, add the matching `latin-ext` / `cyrillic` subset
files and declare them with `unicode-range`.
