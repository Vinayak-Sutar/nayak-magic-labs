import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, postUrl } from '../lib/content';
import { SITE } from '../site.config';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: `${SITE.name} blog`,
    description: 'Notes on building and shipping software: desktop apps, Chrome extensions and local AI.',
    site: context.site ?? SITE.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: postUrl(post.id),
      categories: [post.data.tag],
    })),
    customData: '<language>en</language>',
  });
}
