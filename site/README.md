# Mister Funable Field Notes

Static Astro + Tailwind site that mirrors Mister Funable’s Medium exports so every camera experiment, automation rabbit hole, and collection log lives on GitHub Pages with local images and fast loads.

## Stack

- [Astro 5](https://astro.build/) (static output)
- Tailwind CSS 4 via `@tailwindcss/vite`
- Astro Content Collections for typed markdown
- Custom sync script (`scripts/syncPosts.mjs`) to ingest Medium exports and generate a posts manifest

## Prerequisites

- Node.js 20.10.0 (pinned via `.tool-versions`)
- Medium exports stored outside the site folder at `../exports/medium_posts`, using the structure produced by the exporter script:

```
exports/medium_posts/
├── 01 - running-n8n-locally-with-ngrok.md
├── 02 - ...
└── images/
    ├── 01/img-01.png
    └── 02/img-01.png
```

## Quick Start

```bash
cd site
npm install
npm run sync:posts   # copies markdown/images + builds manifest
npm run dev          # runs sync once and starts Astro dev server on http://localhost:4321
```

## Available Scripts

| Command            | Description                                                                 |
| ------------------ | --------------------------------------------------------------------------- |
| `npm run sync:posts` | Cleans `src/content/posts`, copies markdown + images, writes `src/data/posts.ts`. |
| `npm run dev`        | Runs `sync:posts` once, then `astro dev` with Tailwind HMR.                   |
| `npm run build`      | Runs `sync:posts` and produces a static build in `dist/`.                     |
| `npm run preview`    | Serves the production build locally.                                         |
| `npm run check`      | Runs `astro check` for type/content validation.                              |

`prebuild` is wired to `sync:posts`, so CI builds always ingest the latest markdown automatically.

## Content Workflow

1. Export or update markdown + images under `../exports/medium_posts`.
2. Run `npm run sync:posts`:
   - Parses filenames (`NN - title.md`) to capture the ordering and slug/permalink.
   - Injects frontmatter (title, description/excerpt, order, reading time, hero image, source URL).
   - Copies images into `public/medium-assets/<NN>/...` and rewrites markdown image references.
   - Generates `src/data/posts.ts` (used by the landing page for hero/latest/archive sections).
3. Commit changes inside `site/` only; the exporter folder is treated as read-only input.

## Project Structure

```
site/
├── public/
│   └── medium-assets/        # mirrored images
├── scripts/
│   └── syncPosts.mjs
├── src/
│   ├── components/           # PostCard, SiteHeader, etc.
│   ├── content/
│   │   ├── config.ts         # collection schema
│   │   └── posts/            # generated markdown copies
│   ├── data/posts.ts         # generated posts manifest
│   ├── layouts/Layout.astro
│   ├── pages/
│   │   ├── index.astro       # landing page
│   │   └── posts/[slug].astro
│   └── styles/global.css     # Tailwind theme tokens/utilities
├── astro.config.mjs
└── package.json
```

## Deployment

1. `cd site && npm run build`
2. Deploy the `dist/` folder to GitHub Pages. (Recommended: [`withastro/action@v2`](https://github.com/withastro/action) configured to run inside `site/` with Node 20.)
3. If publishing under a project subpath, set `site` and `base` in `astro.config.mjs`.

## Maintenance Notes

- Never edit files inside `exports/medium_posts`; regenerate exports instead.
- Tailwind tokens/utilities live in `src/styles/global.css`. Keep class strings ordered `layout → spacing → color → effects` for readability.
- When adding new metadata, update both `scripts/syncPosts.mjs` (frontmatter + manifest) and `src/content/config.ts`.

Questions or ideas? Drop them in the repo alongside updates to `AGENTS.md` so future contributors stay aligned. Happy tinkering!

