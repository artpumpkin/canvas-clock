# Canvas Clock

An analog clock drawn directly with the **HTML Canvas API**: concentric time
rings, clock hands, a calendar indicator, and light/dark themes.

Originally written in **2019** as `iClock-App`. This **2026 refresh** retains the
original drawing study and adds a small accessible page around it, with fixes
for rendering state, time calculations, and browser compatibility.

## Run locally

There are no third-party dependencies, remote fonts, or build steps.

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Open http://127.0.0.1:8080. Any static file server can serve the page. For deployment,
upload only `index.html`, `style.css`, `icon.svg`, and `js/sketch.js` to an HTTPS static host.

Node.js 24 is needed only for development checks:

```sh
npm run check
```

## Interaction

- The clock displays the device's local time, with fractional hour/minute positions.
- The **Light theme** toggle works with mouse, touch, Tab, Space, and Enter.
- The drawn sun icon also changes the theme with mouse or touch.
- Theme preference is stored locally; blocked or invalid browser storage does not
  prevent the clock from working.
- A text time display remains available without Canvas rendering support.
- Drawing follows whole-second updates and pauses its timer in background tabs.
- The backing canvas scales for high-density displays, capped at 3× resolution.

## Code map

| File | Purpose |
| --- | --- |
| `js/sketch.js` | Original drawing classes, time geometry, theme and lifecycle |
| `index.html` | Accessible controls, time text, restrictive content policy |
| `style.css` | Responsive page and keyboard-focus styling |
| `test/clock.test.js` | Dependency-free behavior checks using a mocked Canvas/DOM |

The tests exercise balanced drawing-state saves/restores, timer lifecycle,
storage failures, theme state, pixel density, time geometry, and text fallback.
They do not replace a real-browser visual check.

## What changed from the 2019 project

Fixed an unmatched Canvas `save()`, added fractional hour/minute hand positions,
and replaced perpetual animation with one-second updates. Added keyboard controls,
text time, resilient preferences, and responsive high-density rendering.

The old unused GUI library, ticking audio, icon files, remote font, and service
worker are omitted. This edition is silent and does not claim installable PWA or
offline-cache support. Every visual is drawn by the source code.

## Contributing and license

[Contributing](CONTRIBUTING.md) · [Security](SECURITY.md) · [MIT license](LICENSE)

Salah-Eddine Lachkar · [Portfolio](https://lachkar.me)
