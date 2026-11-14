---
order: 3
name: LeetViz
icon: leetviz
platform: chrome
platformLabel: Chrome extension
status: Open source

tagline: An interactive visualizer for the LeetCode problem you’re on.
oneLiner: Knows which LeetCode problem you’re on and opens a matching interactive visualizer in the side panel.
seoTitle: LeetViz — interactive visualizers for LeetCode problems
seoDescription: LeetViz is an open-source Chrome extension that opens an interactive, step-by-step visualizer for the LeetCode problem you are on, in the side panel.
category: BrowserApplication
operatingSystem: Chrome

links:
  - label: Source on GitHub
    href: https://github.com/Vinayak-Sutar/leetViz
    kind: source
comingSoon: Chrome Web Store · coming soon

specs:
  - { k: Platform, v: Chrome side panel }
  - { k: License, v: MIT }
  - { k: Registry, v: GitHub Pages }
  - { k: Contribute, v: One folder + one line }

quote: Some algorithms are easier to follow when you can watch the state change.
problem: 'Editorials explain solutions in prose, which works for some problems and not at all for others. Bit manipulation, DP simulations, anything where the trick is a state you have to hold in your head: those are easier to follow when you can watch them run.'

features:
  - title: Detects the problem
    body: A content script picks up the problem number as you navigate LeetCode.
  - title: Step through the state
    body: Each visualizer is a small app where you step through the algorithm and watch the state change.
  - title: New visualizers, no update
    body: The extension checks a registry hosted on GitHub Pages, so new visualizers appear without shipping a new version.
  - title: Sandboxed contributions
    body: Visualizers load in a sandboxed frame, so a contributed app can’t reach the page around it.

build:
  - title: Detection
    body: A content script scrapes the problem number from the page as you navigate.
  - title: Lookup
    body: The service worker checks it against a registry.json served from GitHub Pages, so new visualizers appear without shipping an extension update.
  - title: Render
    body: The side panel loads the matching visualizer in an iframe. It is sandboxed, so a contributed app can’t reach the page around it.
  - title: Contribution path
    body: A PROMPT.md in the repo generates a spec-compliant visualizer with any LLM, and a shared theme.css keeps every contribution looking like one product.
stack: [Manifest V3, JavaScript, GitHub Pages, MIT]

ledger:
  runs: Your browser
  sends: A request for the visualizer list, from GitHub Pages.
  account: None
privacy: Reads only the problem number from the LeetCode page. Visualizers run sandboxed.

next: 'Coverage, mostly: three problems in is a proof, not a library. Then an in-panel contribute flow and the Chrome Web Store listing.'

faqs:
  - q: How do I contribute a visualizer?
    a: Add one folder and one line to the registry. A PROMPT.md in the repo generates a spec-compliant visualizer with any LLM, and a shared theme keeps every contribution consistent.
  - q: What if my problem has no visualizer yet?
    a: The panel says so, and points you at how to add one.

log: Source published under MIT, with a community registry of visualizers
---

The engineering is small. The design problem is contribution friction.

The contract has to be loose enough that anyone can write a visualizer in an evening, and tight enough that fifty of them still feel like one tool: a fixed file layout, a meta.json, a shared theme with one overridable accent, and a prompt that produces all of it correctly on the first try.
