---
description: Codified best practices for the Meshtastic blog archive static site.
globs: *
alwaysApply: true
---

name: "Meshtastic Knowledge Hub"
description: "Operational handbook for the static Tailwind site that ingests Medium exports and deploys on GitHub Pages."
category: "Static Frontend"
author: "GPT-5.1 Codex x Claude 4"
authorUrl: "https://github.com/custom"
tags: ["tailwind", "astro", "static-site", "markdown", "github-pages"]
lastUpdated: "2025-11-27"

---

# Meshtastic Blog Archive – Engineering Guide

> Use this agent doc as the single source of truth for GPT-5.1 Codex and Claude 4 when collaborating on the project. Keep the rules lightweight but strict.

## 1. Project Fundamentals

- **Goal**: Transform Markdown posts in `exports/medium_posts` into a responsive, SEO-friendly Tailwind site served via GitHub Pages (static hosting, no server runtime).
- **Inputs**: 
  - Markdown files: `exports/medium_posts/<NN - slug>.md`
  - Images: sibling folder `exports/medium_posts/images/<NN>/img-XX.<ext>`
- **Outputs**: 
  - Static assets in `site/` (or `dist/` after build).
  - One HTML page per post (route-friendly slugs) + landing page showcasing hero + post grid.
- **Preferred stack**: Astro or Vite-based static site (no SSR at runtime). Tailwind via JIT mode. Markdown parsing handled at build (Astro Content Collections or unified pipeline).

## 2. Repository Layout Blueprint

```
/assets/                 # shared svg/png, NOT medium exports
/exports/medium_posts/   # source markdown + images (read-only)
/site/                   # Astro/Vite project root
  ├── src/
  │   ├── content/posts/          # parsed markdown copies or symlinks
  │   ├── components/             # *.astro or *.tsx
  │   ├── layouts/                # base layout shells
  │   ├── data/posts.ts           # generated manifest (title, date, excerpt, hero)
  │   ├── pages/
  │   │   ├── index.astro         # landing page
  │   │   └── posts/[slug].astro  # single post template
  │   └── styles/tailwind.css
  ├── public/            # favicon, OG images, robots.txt
  ├── tailwind.config.mjs
  ├── astro.config.mjs
  └── package.json
```

> Never mutate files in `exports/medium_posts/`. Copy or import them during build to avoid Git churn when re-running the Medium exporter.

## 3. Tailwind & Styling Guardrails

- Enable **JIT** and `content: ["./src/**/*.{astro,tsx,ts,mdx}"]`.
- Define theme tokens in `tailwind.config.mjs` for the lime/charcoal palette used in Meshtastic branding.
- Use `@layer utilities` to register shared patterns like `.glass-card` or `.post-chip`.
- Responsive flow: `mobile-first`, use `md` ≥ 768px and `lg` ≥ 1024px breakpoints.
- Typography: Use Tailwind Typography plugin for Markdown rendering but override colors to respect the dark background (#0f172a / #05ff85 highlight).
- Keep component class strings sorted logically: layout → spacing → color → effects.

## 4. Content Ingestion Strategy

1. During build, parse every `.md` file under `exports/medium_posts`. Derive:
   - `order`: numeric prefix (00 padded)
   - `slug`: kebab-case from filename after prefix
   - `heroImage`: first local image reference
   - `excerpt`: first 30–40 words stripped of markdown
   - `publishedAt`: ISO string from header comment
2. Generate a cached manifest (`site/src/data/posts.ts`) so page components don’t walk the filesystem at runtime.
3. For markdown rendering, prefer Astro Content Collections or `remark/rehype` pipeline with:
   - image handler rewriting `images/<NN>/img-XX` to `/medium-assets/<NN>/img-XX`
   - heading IDs for anchor links
   - code block highlighting via `shiki` or `prism`.
4. Copy image folders to `site/public/medium-assets/<NN>/...` during build (`npm run sync-posts` script).

## 5. Naming Conventions

- Routes: `/posts/<slug>` where `<slug>` excludes numeric prefix.
- Components: PascalCase, file name mirrors export (e.g., `PostCard.astro`).
- Utility modules: camelCase (e.g., `formatDate.ts`).
- Data keys: camelCase; prefer `heroImage`, `readingTime`.
- Git branches: `feat/<short-desc>` or `fix/<short-desc>`.

## 6. Performance & Accessibility

- Preload hero image on landing page, lazy-load other images via Astro `<Image />` or `loading="lazy"`.
- Bundle splitting: Astro handles by default. For additional JS (search, filters) ensure `client:idle` hydration.
- Generate `sitemap.xml`, `robots.txt`, canonical URLs.
- Add `aria-label`s for nav items, ensure color contrast > 4.5:1.
- Use CSS `prefers-reduced-motion` to disable heavy animations.
- Cache busting: hashed filenames via Astro build outputs.
- Provide offline-friendly metadata (progressive enhancement). Optional PWA manifest if time permits.

## 7. Deployment Rules (GitHub Pages)

- Build command: `npm run build` inside `site/`.
- Output directory: `site/dist`.
- GitHub Actions workflow:
  ```
  on: push
    branches: [main]
  jobs:
    deploy:
      uses: withastro/action@v2
      with:
        path: site
        node-version: 20
        package-manager: npm
  ```
- Ensure `astro.config.mjs` sets `site` + `base` when deploying under `<user>.github.io` vs project subpath.

## 8. Automation & Tooling

- Add `npm run sync:posts` script that:
  1. Cleans `site/src/content/posts`.
  2. Copies markdown + images from `exports/medium_posts`.
  3. Regenerates manifest via `node scripts/buildManifest.mjs`.
- Pre-commit hook: `lint-staged` running `eslint`, `prettier --check`, and `astro check`.
- CI: run `npm run check && npm run build`.

## 9. Contribution Workflow

1. Run `npm install` inside `site/`.
2. Execute `npm run sync:posts`.
3. Develop with `npm run dev`.
4. Before PR, run `npm run lint && npm run build`.
5. Include lighthouse snapshot if UI changes impact layout.

## 10. Review Checklist

- [ ] All new posts appear on landing hero grid with correct order and metadata.
- [ ] Images resolve from `public/medium-assets/<NN>`.
- [ ] Lighthouse >= 95 for Performance, Accessibility, Best Practices.
- [ ] No markdown source mutated.
- [ ] AGENTS.md updated if new conventions introduced.

> Keep this file concise but actionable. Any major architectural change must be reflected here so downstream AI agents remain aligned.