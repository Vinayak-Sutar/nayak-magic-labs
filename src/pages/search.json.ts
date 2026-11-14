/** The index the live prompt searches: every page, app and post. */
import type { APIRoute } from 'astro';
import { appUrl, getApps, getPosts, postUrl } from '../lib/content';
import { SITE } from '../site.config';

export const GET: APIRoute = async () => {
  const [apps, posts] = await Promise.all([getApps(), getPosts()]);

  const items = [
    { label: 'Home', kind: 'Page', href: '/', keys: 'start nml index' },
    { label: 'Apps', kind: 'Page', href: '/apps/', keys: 'software products extensions catalogue all' },
    { label: 'Blog', kind: 'Page', href: '/blog/', keys: 'posts writing articles journal notes' },
    { label: 'About', kind: 'Page', href: '/about/', keys: 'studio who mark rules toolbox' },
    { label: 'Work with us', kind: 'Page', href: '/work-with-us/', keys: 'hire contact project quote freelance job contract' },
    { label: 'Privacy', kind: 'Page', href: '/legal/privacy/', keys: 'legal policy data' },
    { label: 'Terms', kind: 'Page', href: '/legal/terms/', keys: 'legal license' },
    ...apps.map((app) => ({
      label: app.data.name,
      kind: 'App',
      href: appUrl(app.id),
      keys: [app.id, app.data.tagline, app.data.platformLabel, app.data.status, ...app.data.stack].join(' '),
    })),
    ...posts.map((post) => ({
      label: post.data.title,
      kind: 'Post',
      href: postUrl(post.id),
      keys: [post.data.tag, post.data.description].join(' '),
    })),
  ];

  return new Response(JSON.stringify({ items, email: SITE.email, github: SITE.github }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
