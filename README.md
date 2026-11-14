# Nayak Magic Labs — website

The production site for nayakmagiclabs.com. A static [Astro](https://astro.build) site:
every page is plain HTML at its own URL, and apps and blog posts are Markdown files.

The `*.dc.html` prototypes one folder up are the original designs and are not used by this site.

## Run it

Astro 7 needs Node 22.23.4 or newer. This machine's default is Node 20, so use the
wrapper, which runs everything on the Node 24 that sits next to it:

```bash
dev.cmd
```

Then open <http://localhost:4321>. Other commands:

```bash
dev.cmd run build
```

```bash
dev.cmd run check
```

```bash
dev.cmd run preview
```

`build` writes the finished site to `dist/`. `check` type-checks. `preview` serves `dist/`.
If you switch to Node 24 yourself (`nvm use 24.22.3`), plain `npm run dev` works too.

## Where things are

```
src/
  site.config.ts        site name, URL, email, GitHub, footer credit, form endpoint
  content/apps/*.md     one file per app      → /apps/<file name>/
  content/blog/*.mdx    one file per post     → /blog/<file name>/
  data/studio.ts        services, house rules, process steps, FAQ, commissions
  pages/                one file per route
  components/           Header, Footer, cards, the live prompt, the enquiry form
  scripts/              prompt.ts (search), paper.ts (hero canvas), theme.ts, ui.ts
  styles/tokens.css     colours, fonts, spacing — light and dark
  styles/base.css       shared element styles
```

## Add an app

Copy a file in `src/content/apps/`, rename it (the file name becomes the URL) and edit the
fields. The app then appears on the home page, the apps index, the footer, the privacy
table, the search prompt and the sitemap, and gets its own page at `/apps/<name>/` plus a
privacy policy at `/apps/<name>/privacy/`.

Only put real, working addresses in `links`. The first link is the main button. For a store
listing that is not live yet, leave it out of `links` and set `comingSoon` instead.

## Write a post

Add a `.mdx` (or `.md`) file to `src/content/blog/`:

```mdx
---
title: The post title
description: One or two sentences. Shown under the title, in search results and in the feed.
date: 2026-11-20
tag: Engineering
app: valocut        # optional: the app this post is about (its file name)
draft: true         # optional: visible in dev, left out of the built site
---

Write in Markdown. `## Headings` become the "In this post" list.
```

Reading time, the tag page, the RSS feed and the sitemap update on their own.

## When the domain and mailboxes go live

Edit `src/site.config.ts`: `url`, `email` and `privacyEmail`. Nothing else holds them.

To make the enquiry form submit in the page instead of opening an email, set
`formEndpoint` to a Formspree (or similar) URL that accepts a JSON POST.

## Brand images

`public/og-default.png`, `logo.png`, `apple-touch-icon.png` and `favicon.ico` are drawn
from the mark's vector paths. Re-create them after changing the mark or colours:

```bash
dev.cmd run images
```

## Deploy

Any static host works. Build command `npm run build`, output folder `dist`, Node 22.23.4+.
