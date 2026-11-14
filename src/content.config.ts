import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const titled = z.object({ title: z.string(), body: z.string() });

/**
 * One Markdown file per app in src/content/apps/. The file name is the URL:
 * valocut.md → /apps/valocut/. The Markdown body is the "hard parts" write-up.
 */
const apps = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/apps' }),
  schema: ({ image }) =>
    z.object({
      order: z.number(),
      name: z.string(),
      icon: z.enum(['valocut', 'nuqta', 'leetviz', 'chords', 'nakama', 'remote']),
      platform: z.enum(['windows', 'chrome', 'web', 'lab']),
      platformLabel: z.string(),
      status: z.enum(['Live', 'Beta', 'In development', 'Open source', 'Experiment']),
      featured: z.boolean().default(false),

      tagline: z.string(),
      oneLiner: z.string(),
      seoTitle: z.string(),
      seoDescription: z.string(),
      /** schema.org applicationCategory and operatingSystem, for search engines. */
      category: z.string(),
      operatingSystem: z.string(),
      free: z.boolean().default(true),

      /** Real, working links only. The first one is the main button. */
      links: z.array(
        z.object({
          label: z.string(),
          href: z.url(),
          kind: z.enum(['store', 'site', 'source', 'demo']),
        }),
      ),
      /** Shown as a disabled button when a store listing is not live yet. */
      comingSoon: z.string().optional(),

      poster: image().optional(),
      posterAlt: z.string().optional(),

      specs: z.array(z.object({ k: z.string(), v: z.string() })),
      quote: z.string(),
      problem: z.string(),
      features: z.array(titled),
      buildIntro: z.string().optional(),
      build: z.array(titled),
      stack: z.array(z.string()),
      /** "What leaves your device". */
      ledger: z.object({ runs: z.string(), sends: z.string(), account: z.string() }),
      privacy: z.string(),
      next: z.string(),
      faqs: z.array(z.object({ q: z.string(), a: z.string() })),
      /** One line for the "Recently" list on the home page. */
      log: z.string(),
    }),
});

/**
 * One Markdown or MDX file per post in src/content/blog/. The file name is the
 * URL: my-post.mdx → /blog/my-post/. Set draft: true to keep a post out of the
 * production build while still seeing it in `npm run dev`.
 */
const blog = defineCollection({
  loader: glob({ pattern: '*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tag: z.string(),
    app: reference('apps').optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { apps, blog };
