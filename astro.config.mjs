import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { SITE } from './src/site.config.ts';

export default defineConfig({
  site: SITE.url,
  // Every page is a directory with an index.html, so URLs always end in "/".
  trailingSlash: 'always',
  // Classic whitespace handling: spaces between inline elements are kept.
  compressHTML: true,
  devToolbar: { enabled: false },
  integrations: [
    mdx(),
    sitemap({ filter: (page) => !page.includes('/404') }),
  ],
  markdown: {
    // Code colours come from CSS variables in src/styles/base.css.
    shikiConfig: { theme: 'css-variables' },
  },
});
