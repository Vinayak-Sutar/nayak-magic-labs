import type { APIRoute } from 'astro';
import { SITE } from '../site.config';

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('sitemap-index.xml', site ?? SITE.url).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
