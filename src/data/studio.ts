/** Studio copy that is not tied to a single app or post. */

export const SERVICES = [
  {
    label: 'Chrome extensions',
    type: 'Chrome extension',
    desc: 'Manifest V3 extensions, from content scripts to side panels, taken through Chrome Web Store review.',
  },
  {
    label: 'Windows apps',
    type: 'Windows app',
    desc: 'Desktop apps built with Tauri and packaged for the Microsoft Store.',
  },
  {
    label: 'Web apps',
    type: 'Web app',
    desc: 'React and Next.js front ends, with Python backends where they are needed.',
  },
  {
    label: 'AI features',
    type: 'AI feature',
    desc: 'Features built on local or hosted models: on-device vision, Ollama, LLM APIs and tool-calling agents.',
  },
  {
    label: 'Websites',
    type: 'Website',
    desc: 'Fast, search-friendly sites for products and launches.',
  },
  {
    label: 'Engineering roles',
    type: 'Engineering role',
    desc: 'Open to contract and full-time roles with the right team.',
  },
];

export const TIMELINES = ['Under a month', '1–3 months', '3+ months', 'Not sure'];
export const BUDGETS = ['Under $2k', '$2k–10k', '$10k+', 'Not sure'];

export const RULES = [
  {
    title: 'Your data stays on your machine',
    body: 'Valocut scans footage on your PC. Nuqta and Remote Agent run their language model locally. When an app does need to send something, its page lists exactly what, and where it goes.',
  },
  {
    title: 'One job per app',
    body: 'Every app starts from one specific annoyance. Valocut finds kills. Nuqta explains lyrics. LeetViz shows the state you were trying to hold in your head.',
  },
  {
    title: 'Released, then looked after',
    body: 'A release includes the store listing, translations and crash reporting. Valocut launched in 17 languages, and crash reports show what breaks on machines we will never see.',
  },
];

/** "What you can check first" on Work with us. `app` is the app file name. */
export const PROOF = [
  {
    app: 'valocut',
    title: 'Published, not just built',
    body: 'Valocut is on the Microsoft Store in 17 languages, with crash reporting and analytics in place from launch.',
  },
  {
    app: 'nuqta',
    title: 'AI that runs on ordinary hardware',
    body: 'On-device detection that falls back from GPU to CPU, and a 7B language model running locally.',
  },
  {
    app: 'leetviz',
    title: 'Code other people can work on',
    body: 'LeetViz is open source and built so outside contributors can add to it without touching the core.',
  },
];

export const STEPS = [
  {
    title: 'A short call',
    body: 'We talk through the problem. You get a written scope and a fixed quote for the first milestone.',
  },
  {
    title: 'A prototype early',
    body: 'Something you can click, so decisions are made on a working build rather than a document.',
  },
  {
    title: 'Milestones',
    body: 'Each milestone ends with a build you can install and a short written update.',
  },
  {
    title: 'Release and handover',
    body: 'Store listing, documentation and source code are yours. Support continues if you want it.',
  },
];

export const HIRE_FAQ = [
  {
    q: 'Can you take over an existing codebase?',
    a: 'Yes. The first step is a short paid review, so the quote is based on the code rather than a guess.',
  },
  { q: 'Do you sign NDAs?', a: 'Yes.' },
  { q: 'Who owns the code?', a: 'You do, once the final milestone is paid.' },
  {
    q: 'Are you open to full-time roles?',
    a: 'Yes, with the right team. Pick “Engineering role” in the form.',
  },
];

/** Client work, listed without client names. */
export const COMMISSIONS = [
  {
    what: 'A retrieval-grounded mental health assistant over 5,000+ vetted medical documents',
    where: 'Health · 2026',
  },
  {
    what: 'Full-stack client applications with OAuth sign-in and PostgreSQL back ends',
    where: 'Consulting · 2025',
  },
];

export const MARK_PARTS = [
  { glyph: '›', hot: true, body: 'A prompt. We make software you run, so the mark starts where a command does.' },
  { glyph: 'nml', hot: false, body: 'Nayak Magic Labs, in lowercase.' },
  { glyph: '_', hot: true, body: 'A cursor, waiting for the next thing to build.' },
];
