import { getCollection, type CollectionEntry } from 'astro:content';

export type App = CollectionEntry<'apps'>;
export type Post = CollectionEntry<'blog'>;
export type Platform = App['data']['platform'];

export const PLATFORMS: Record<Platform, string> = {
  windows: 'Windows',
  chrome: 'Chrome',
  web: 'Web',
  lab: 'Experiments',
};

export async function getApps(): Promise<App[]> {
  const apps = await getCollection('apps');
  return apps.sort((a, b) => a.data.order - b.data.order);
}

/** Newest first. Drafts are visible in dev and left out of production builds. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => (import.meta.env.PROD ? !data.draft : true));
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const appUrl = (id: string) => `/apps/${id}/`;
export const appPrivacyUrl = (id: string) => `/apps/${id}/privacy/`;
export const postUrl = (id: string) => `/blog/${id}/`;
export const tagUrl = (tag: string) => `/blog/tag/${slugify(tag)}/`;

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 14 Oct 2026 */
export function formatDate(date: Date): string {
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** Minutes to read, from the raw Markdown. Code blocks are skimmed, so they are left out. */
export function readingTime(body = ''): number {
  const words = body
    .replace(/```[\s\S]*?```/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/** Adds UTM tags to store links so the store dashboards show which page sent an install. */
export function tracked(href: string, campaign: string): string {
  try {
    const url = new URL(href);
    if (/(^|\.)apps\.microsoft\.com$|chromewebstore\.google\.com$/.test(url.hostname)) {
      url.searchParams.set('utm_source', 'nayakmagiclabs.com');
      url.searchParams.set('utm_medium', 'referral');
      url.searchParams.set('utm_campaign', campaign);
    }
    return url.toString();
  } catch {
    return href;
  }
}

export const isExternal = (href: string) => /^https?:\/\//.test(href);
