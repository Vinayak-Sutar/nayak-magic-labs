---
order: 1
name: Valocut
icon: valocut
platform: windows
platformLabel: Windows · Microsoft Store
status: Live
featured: true

tagline: Automatic Valorant clips, cut offline on your own PC.
oneLiner: Drop in a recording. Every kill is marked on the timeline and exported as clips in minutes.
seoTitle: Valocut — automatic Valorant clips, cut offline on your PC
seoDescription: Valocut is a free Windows app that finds every kill in a Valorant recording and exports the clips in minutes. It runs fully offline, with no uploads and no account.
category: MultimediaApplication
operatingSystem: Windows

links:
  - label: Get it from Microsoft Store
    href: https://apps.microsoft.com/detail/9PH2GX17XXSV
    kind: store
  - label: valocut.com
    href: https://valocut.com
    kind: site

poster: ../../assets/valocut/demo-poster.jpg
posterAlt: A frame from a Valorant match recording, the kind of footage Valocut scans for kills.

specs:
  - { k: Platform, v: Windows }
  - { k: Price, v: Free }
  - { k: Languages, v: '17' }
  - { k: Runs, v: Fully offline }
  - { k: Account, v: Not needed }

quote: Clipping tools that record while you play cost you frames during the match.
problem: Capture-based clippers run in the background while you play. They cost you frames in the match, then ask you to upload gigabytes of footage to their servers before you can cut anything, with monthly limits on how much you can do it. Valocut works on footage you already have, on your own PC.

features:
  - title: Finds every kill
    body: A YOLOX model reads the kill feed, however long the video is. It uses the GPU where there is one and a plain CPU where there isn’t.
  - title: A real editor
    body: Jump between kills, split, trim, blade and drop markers. Scrubbing stays smooth on multi-hour, multi-gigabyte files.
  - title: One-click auto-clip
    body: Turn every detected kill into a finished clip, with configurable pre-roll, post-roll and a gap that decides when two kills share a clip.
  - title: Fast, lossless export
    body: A keyframe-aware smart-cut pipeline copies instead of re-encoding. Horizontal for YouTube, vertical for Shorts, Reels and TikTok.

buildIntro: A Tauri shell wraps a Next.js interface, and a local FastAPI sidecar does the heavy work. Nothing leaves the machine, so the whole architecture is designed around making a desktop CPU feel fast rather than around scaling a server.
build:
  - title: Detection
    body: A YOLOX model reads the kill feed, exported to ONNX so it runs GPU-accelerated where there is a GPU and on a plain CPU where there isn’t.
  - title: Timeline
    body: Detections become markers on a non-linear timeline. Scrubbing, zooming and blading stay smooth on multi-hour, multi-gigabyte files.
  - title: Export
    body: A keyframe-aware FFmpeg smart-cut pipeline stream-copies instead of re-encoding, so export time tracks the number of cuts rather than the length of the video.
  - title: Shipping
    body: Packaged and published to the Microsoft Store, localized into 17 languages, with Sentry for crash reports and PostHog for what people actually use.
stack: [Tauri, Next.js, FastAPI, ONNX, YOLOX, FFmpeg]

ledger:
  runs: Your PC
  sends: Crash reports and anonymous usage events. Never your footage.
  account: None
privacy: Your footage stays on your PC. No uploads, no account, unlimited scans.

next: A Pro tier, and more games. The detection engine is game-agnostic, so the roadmap is mostly new detectors. Mac and Linux come once Windows feels solid.

faqs:
  - q: Does Valocut lower my FPS while I play?
    a: No. It never runs during the match. It works on recordings you already have, after the fact.
  - q: Which recordings does it accept?
    a: OBS captures, ShadowPlay files and downloaded streams.
  - q: Does it upload my footage anywhere?
    a: No. Scans are unlimited and local, there is no account, and it keeps working with the network cable unplugged.
  - q: Is there a Mac or Linux version?
    a: Planned, once the Windows version is solid.

log: Released on the Microsoft Store, in 17 languages
---

Cutting video without re-encoding sounds simple until you hit keyframes: you can only stream-copy from one keyframe to another, so an honest smart cut has to re-encode just the fragments at the edges of a clip and copy everything in between. Getting that seamless, with no dropped frames and no audio drift, was most of the export work.

The other half was making one model behave on wildly different hardware. Running through ONNX with a CPU fallback meant tuning batch sizes and frame sampling so a laptop finishes a scan in reasonable time while a GPU machine gets the speed it deserves.
