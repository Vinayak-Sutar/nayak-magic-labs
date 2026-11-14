---
order: 6
name: Remote Agent
icon: remote
platform: lab
platformLabel: Linux · open source
status: Experiment

tagline: Your phone as a remote for your PC, with a local model that does what you ask.
oneLiner: Trackpad, keyboard and voice from your phone, and a local Mistral that picks which system tool to run.
seoTitle: Remote Agent — your phone as a remote for your PC, run by a local model
seoDescription: Remote Agent turns your phone into a trackpad, keyboard and voice remote for your PC, with a local Mistral 7B model that carries out plain-language requests. Nothing leaves your network.
category: UtilitiesApplication
operatingSystem: Linux

links:
  - label: Source on GitHub
    href: https://github.com/Vinayak-Sutar/mcp-remote-agent
    kind: source

specs:
  - { k: Platform, v: Ubuntu }
  - { k: Model, v: 'Mistral 7B, local' }
  - { k: Data leaving PC, v: None }
  - { k: Built, v: March 2026 }

quote: The reasoning and the execution both happen on hardware you own.
problem: Remote-control apps move your mouse but don’t understand intent. Assistants that understand intent send your words to somebody else’s server, cost per call, and can’t touch your files or your volume mixer.

features:
  - title: A full phone remote
    body: Trackpad, touch keyboard, voice typing into the focused window, volume, and one-tap shortcuts.
  - title: Ask in plain words
    body: “Set the volume to 80 percent” or “play this song on YouTube” is carried out on the machine.
  - title: Tools discovered at runtime
    body: A new capability is one decorated Python function. The agent reads its docstring and starts using it.
  - title: Stays on your network
    body: The model runs through Ollama on the PC itself.

buildIntro: 'Three layers, split so that the model never hard-codes what it can do. Adding a new capability is one decorated Python function: the agent discovers it, reads the docstring, and starts using it after a restart.'
build:
  - title: The hands
    body: 'A FastMCP daemon holding the real OS tools: mouse and keyboard via pynput, PulseAudio volume, media playback, window shortcuts.'
  - title: The brain
    body: An agent client that fetches tool schemas from the server at runtime, hands them to Mistral through Ollama, and maps the model’s choice back to a function call.
  - title: The interfaces
    body: A PyQt6 desktop chat for testing on the machine itself, and an HTTPS LAN web app for the phone. The certificates are self-signed, because browsers only grant mic access over TLS.
  - title: Media playback
    body: Rather than opening a search page, the agent scrapes the YouTube result headlessly, resolves the video ID and starts playback directly.
stack: [Python, FastMCP, Ollama, Mistral 7B, PyQt6]

ledger:
  runs: Your PC and your phone
  sends: Nothing leaves your network.
  account: None
privacy: No API keys, no subscription, no audio or chat leaving your network.

next: Windows support, a wider tool set around files and windows, and on-device speech recognition so dictation doesn’t depend on the browser.

faqs:
  - q: Does it need an internet connection?
    a: No. Phone and PC talk over the same Wi-Fi, and the model runs locally.

log: Tools discovered at runtime, chosen by a local model
---

A 7B model is small enough to run locally and small enough to be unreliable about tool arguments. Most of the work was in the schema and prompt design: strict type hints, docstrings written for the model rather than for a human, and validation between the model’s answer and the actual call, so a bad guess fails cleanly instead of doing something strange to the desktop.

The mobile side had its own tax. Synthetic input needs system-level permissions on Linux, and WebRTC dictation needs a certificate before a phone browser will hand over the microphone.
