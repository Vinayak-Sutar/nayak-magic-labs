---
order: 4
name: Chords Extractor
icon: chords
platform: web
platformLabel: Web app
status: Beta

tagline: Chords for any YouTube song, on a grid that scrolls with the video.
oneLiner: Paste a YouTube link and get the chord progression on a beat grid. Click a chord to jump there.
seoTitle: Chords Extractor — chords for any YouTube song, synced to the video
seoDescription: Chords Extractor is a web app that works out the chords of any YouTube song and shows them on a beat grid that scrolls in time with the video. Click a chord to jump there.
category: MultimediaApplication
operatingSystem: Any (web browser)

# When the web app has a public address, add it as the first link:
#   - label: Open the web app
#     href: https://…
#     kind: site
links:
  - label: Source on GitHub
    href: https://github.com/Vinayak-Sutar/chords-extractor
    kind: source

specs:
  - { k: Platform, v: Web }
  - { k: Chord accuracy, v: 90%+ }
  - { k: Repeat songs, v: Under 100 ms }
  - { k: New songs, v: 30–90 s }

quote: If the song exists on YouTube, this gets you something playable in about a minute.
problem: Working a song out by ear is slow, and the chord sites don’t have everything, especially regional music, or they put what they do have behind a subscription.

features:
  - title: A beat-indexed grid
    body: Chords are mapped onto the detected beat, so the highlighted chord stays in sync with the video.
  - title: Click to jump
    body: Click any chord to seek the video to that moment.
  - title: Practice mode
    body: Step through the song beat by beat while you play along.
  - title: Instant repeats
    body: Songs that were already analyzed come back from the cache in under 100 ms.

build:
  - title: Audio
    body: A Flask backend downloads the video and extracts the audio track with moviepy.
  - title: Analysis
    body: librosa handles beat and tempo detection. The autochord model does recognition, returning chords as timestamped spans.
  - title: Cache
    body: Results are keyed by video in PostgreSQL, so an already-analyzed track skips the entire pipeline and returns in under 100 ms.
  - title: Playback
    body: 'React and Tailwind over React Player: chords map to a beat grid, the current beat drives the scroll, and clicking a cell seeks the video.'
stack: [React, Flask, librosa, autochord, PostgreSQL, Tailwind]

ledger:
  runs: Our server
  sends: The YouTube link you paste.
  account: None
privacy: Results are cached by video, not by person. No account required.

next: Chord qualities beyond triads, transpose and capo controls, and a model that runs locally so there is no backend to keep alive.

faqs:
  - q: How long does a song take?
    a: 30 to 90 seconds the first time. After that it is cached and returns in under 100 ms.
  - q: Does it detect sevenths and suspensions?
    a: Not yet. Triads today; richer chord qualities are next.

log: 'Public beta: chords on a beat grid that follows the video'
---

Chord timestamps and video time drift apart easily: the model returns spans in seconds, the grid thinks in beats, and the player reports time on its own schedule. Keeping the highlighted chord genuinely in sync, rather than approximately, meant mapping everything onto the detected beat rather than raw seconds.

The caching layer came from watching real use. The same songs kept being analyzed again, which is a minute of compute to answer a question the database already knew.
