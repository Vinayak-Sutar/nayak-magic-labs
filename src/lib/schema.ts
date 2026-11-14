/** JSON-LD structured data, one builder per page type (see Site Plan, section 3). */
import { SITE } from '../site.config';
import { appUrl, postUrl, type App, type Post } from './content';

type Json = Record<string, unknown>;

const CONTEXT = 'https://schema.org';
const abs = (path: string) => new URL(path, SITE.url).href;
const ORG = abs('/#organization');

export function organization(): Json {
  return {
    '@context': CONTEXT,
    '@type': 'Organization',
    '@id': ORG,
    name: SITE.name,
    url: abs('/'),
    logo: abs('/logo.png'),
    description: SITE.description,
    email: SITE.email,
    sameAs: [SITE.github],
  };
}

export function website(): Json {
  return {
    '@context': CONTEXT,
    '@type': 'WebSite',
    '@id': abs('/#website'),
    name: SITE.name,
    url: abs('/'),
    description: SITE.description,
    inLanguage: 'en',
    publisher: { '@id': ORG },
  };
}

export function breadcrumbs(trail: { name: string; path: string }[]): Json {
  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((step, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: step.name,
      item: abs(step.path),
    })),
  };
}

export function softwareApplication(app: App): Json {
  const { data } = app;
  const store = data.links.find((link) => link.kind === 'store');
  return {
    '@context': CONTEXT,
    '@type': 'SoftwareApplication',
    name: data.name,
    description: data.seoDescription,
    url: abs(appUrl(app.id)),
    applicationCategory: data.category,
    operatingSystem: data.operatingSystem,
    ...(data.free ? { offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } } : {}),
    ...(store ? { installUrl: store.href } : {}),
    publisher: { '@id': ORG },
    author: { '@id': ORG },
  };
}

export function faqPage(faqs: { q: string; a: string }[]): Json {
  return {
    '@context': CONTEXT,
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };
}

/** The apps index: a collection page listing every app. */
export function appCollection(apps: App[]): Json {
  return {
    '@context': CONTEXT,
    '@type': 'CollectionPage',
    name: `Apps by ${SITE.name}`,
    url: abs('/apps/'),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: apps.map((app, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: app.data.name,
        url: abs(appUrl(app.id)),
      })),
    },
  };
}

export function blogPosting(post: Post, words: number): Json {
  const { data } = post;
  return {
    '@context': CONTEXT,
    '@type': 'BlogPosting',
    headline: data.title,
    description: data.description,
    datePublished: data.date.toISOString(),
    dateModified: (data.updated ?? data.date).toISOString(),
    url: abs(postUrl(post.id)),
    mainEntityOfPage: abs(postUrl(post.id)),
    image: abs('/og-default.png'),
    wordCount: words,
    keywords: data.tag,
    inLanguage: 'en',
    author: { '@id': ORG, '@type': 'Organization', name: SITE.name, url: abs('/') },
    publisher: { '@id': ORG, '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: abs('/logo.png') } },
  };
}
