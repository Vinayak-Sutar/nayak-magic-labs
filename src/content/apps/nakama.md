---
order: 5
name: Nakama
icon: nakama
platform: lab
platformLabel: Subtitle tool
status: Experiment

tagline: Color-coded dual subtitles for learning Japanese from anime.
oneLiner: Romaji over English, with subjects, objects and verbs tinted so sentence structure is visible while you watch.
seoTitle: Nakama — color-coded dual subtitles for learning Japanese from anime
seoDescription: Nakama turns a Japanese and an English subtitle track into one subtitle file with romaji over English, and colours subjects, objects and verbs so sentence structure is visible while you watch.
category: EducationalApplication
operatingSystem: Windows, macOS, Linux

links:
  - label: Watch the demo
    href: https://youtu.be/9yiR4DDwoeY
    kind: demo
  - label: Source on GitHub
    href: https://github.com/Vinayak-Sutar/Nakama-The-Language-Sensei
    kind: source

specs:
  - { k: Output, v: ASS subtitles }
  - { k: Plays in, v: VLC and most players }
  - { k: Throughput, v: 50–100 lines/min }
  - { k: Cost per episode, v: ~27K tokens }

quote: Marking the particles turns passive watching into something closer to reading.
problem: Watching subtitled anime builds vocabulary and almost no grammar. You hear the sentence and read the meaning, but you never see which part is doing what, so the structure never transfers.

features:
  - title: Romaji and English together
    body: One styled subtitle file with both lines on screen at once.
  - title: Grammar, color-coded
    body: Topic and subject particles, object particles and verbs each get a color, the same in both languages.
  - title: Batch-safe
    body: Lines are processed twenty at a time at low temperature, so the model tags correctly without inventing lines.
  - title: Timing shift
    body: A small utility re-times tracks that don’t line up with the video.

build:
  - title: Romaji
    body: A LangChain pipeline over Gemini converts Japanese lines to romaji in batches of twenty.
  - title: Grammar tags
    body: The model identifies subject markers (は, が), object markers (を, に, へ) and verb predicates, then applies the same tags to the aligned English.
  - title: Batching
    body: 'Twenty lines at a time, low temperature: enough context to tag correctly, tight enough constraints to keep the model from inventing lines.'
  - title: Render
    body: Output is written as ASS with per-span color overrides, plus a timing-shift utility for tracks that don’t line up with the video.
stack: [Python, LangChain, Gemini, ASS, Janome]

ledger:
  runs: Your PC, with the Gemini API
  sends: Subtitle text, to the Gemini API, using your key.
  account: Your own API key
privacy: Works on subtitle files you already have.

next: Browser playback instead of a file pipeline, an offline tokenizer path for tagging that doesn’t need a model, and languages beyond Japanese.

faqs:
  - q: Which players does it work with?
    a: Any player that renders ASS subtitles, VLC included.

log: Grammar-coloured dual subtitles for Japanese
---

Alignment. The Japanese and English tracks are written by different people with different line breaks, so mapping a tagged Japanese phrase onto the right English words is a genuine matching problem, not a lookup.

And every batch is a chance for the model to quietly return nineteen lines instead of twenty. The pipeline has to notice and repair that, or the whole file drifts out of sync from that point on.
