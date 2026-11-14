/**
 * Site-wide settings. This is the one file to edit when the domain and the
 * branded mailboxes go live. It is read by astro.config.mjs and by every page.
 */
export const SITE = {
  name: 'Nayak Magic Labs',
  /** Canonical origin, no trailing slash. Placeholder until the domain is live. */
  url: 'https://nayakmagiclabs.com',
  title: 'Nayak Magic Labs — indie software publisher',
  description:
    'Nayak Magic Labs is an indie software publisher making browser extensions, Windows apps and web tools, and building software for clients.',

  /** Shown in the footer, legal pages and the enquiry form. Swap for hello@… later. */
  email: 'vinayaksutar.work@gmail.com',
  /** Used on privacy pages. Swap for privacy@… later. */
  privacyEmail: 'vinayaksutar.work@gmail.com',

  github: 'https://github.com/Vinayak-Sutar',

  /** Small credit line in the footer. */
  credit: {
    name: 'Vinayak Sutar',
    url: 'https://www.linkedin.com/in/vinayak-sutar-39a574224/',
  },

  /**
   * Enquiry form target. Leave empty and the form opens a pre-filled email
   * instead. Set a Formspree or Web3Forms URL to submit in the page.
   */
  formEndpoint: '',

  /** Date shown on the legal pages. */
  legalUpdated: '2026-11-12',
};

export const NAV = [
  { label: 'Apps', href: '/apps/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'About', href: '/about/' },
  { label: 'Work with us', href: '/work-with-us/' },
];
