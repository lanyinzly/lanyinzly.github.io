# lanyinzly.github.io

Personal site of **Lanyin (Elaine) Zhang** — a future lab for the autonomous economy.
Live at <https://lanyinzly.github.io>.

## Stack

- Pure static HTML / CSS / JS — no build step, deploys directly on GitHub Pages.
- [GSAP](https://github.com/greensock/GSAP) (+ ScrollTrigger) via CDN for entrance and scroll animations, plus a canvas "agent network" in the hero.
- Design language: warm paper ground, ink typography, serif display (Newsreader / Noto Serif SC) + mono labels (IBM Plex Mono), single vermilion accent.

## Bilingual content (EN / 中文) — how it stays in sync

Both languages live **side by side in the same markup**, so a page can never be updated in one language and forgotten in the other.

**Short text** (headings, labels, paragraphs) carries both languages as attributes:

```html
<h2 data-en="About" data-zh="关于">About</h2>
```

**Long prose** (blog post bodies) uses one block per language:

```html
<div class="post-body" data-lang="en"> ... </div>
<div class="post-body" data-lang="zh" hidden> ... </div>
```

`assets/js/main.js` swaps them when the **EN / 中文** toggle in the nav is clicked. The choice is remembered in `localStorage`, can be forced with `?lang=zh` / `?lang=en`, and defaults to the browser language.

> Rule of thumb: every time you edit any `data-en`, edit the `data-zh` next to it in the same commit.

## Adding a blog post

1. Copy `posts/why-agents-need-economics.html` to `posts/<your-slug>.html`.
2. Replace the title (`<title>` + `<h1>`), date (`<time>`), category, and the two `post-body` blocks (EN + 中文).
3. Add a `timeline-entry` for it in `writings.html` under the right year (categories: `agent`, `crypto`, `philosophy` — or add a new `cat-btn`).
4. Optionally add it to the “Writings” preview list in `index.html`.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Home: hero, about, research directions, projects, writings preview, media, contact |
| `writings.html` | Essays / blog / journal timeline with category filters |
| `posts/*.html` | Individual posts, bilingual |

The ERC-7527 feature card links to the dedicated showcase at <https://wrap-site-five.vercel.app/>.
