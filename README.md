# AAROGYA.BYTES 2026 — Digital Inauguration Webpage

Pure HTML + CSS + JS. No backend, no server, no database.

## Files
- `index.html` — the main screen (projector/laptop). Shows the poster-style header, closed curtain, and the QR button.
- `confirm.html` — the page a guest's phone lands on after scanning the QR code.
- `style.css` — shared styling (the theme from your poster: cream paper, brown/blue text, gold trim).
- `script.js` — QR generation, curtain animation, crackers/confetti effect, video playback.
- `assets/` — put your video and logo images here (see below).

## How the "scan to inaugurate" moment actually works
A pure frontend page (no backend) **cannot** make a phone's QR scan directly trigger an animation on a *different* screen — that always needs a server to relay the signal between the two devices.

So the flow is split, and it still looks and feels like one ceremonial moment:

1. **Guest scans the QR code** with their phone camera → their phone opens `confirm.html`, showing "Session Inaugurated Successfully" in the same theme.
2. **At the same moment, whoever is on the laptop/projector clicks the QR button** on `index.html` → *that* click is what actually plays the curtain-opening animation, crackers, and video on the big screen.

In practice you'd have the guest of honour scan with their own phone while the presenter's finger is already on the trigger — the audience only ever sees the curtain open and the video start.

## Before the event

1. **Add your video**
   Place your inauguration video at:
   ```
   assets/inauguration-video.mp4
   ```
   (Must be named exactly that, or update the `<source src="...">` path in `index.html`.) The video autoplays muted the instant the curtains finish opening (browsers block unmuted autoplay) — a "Tap for sound" button appears so the presenter can unmute with one tap.

2. **Add your official logos** (optional but recommended)
   Right now the two roundels in the header are text placeholders (`AFMS` / `USI`). Replace them with your actual emblem images:
   - In `index.html`, swap `<div class="crest">AFMS</div>` for `<div class="crest"><img src="assets/emblem-left.png" alt=""></div>` (and similarly for the right one), then add `.crest img { width:100%; height:100%; border-radius:50%; object-fit:cover; }` to `style.css`.

3. **Host it somewhere reachable by phones in the room**
   For a phone to scan the QR and actually load `confirm.html`, the site needs a real URL — opening `index.html` straight from a laptop's file system won't be reachable by other devices. Easiest options:
   - Any static host (GitHub Pages, Netlify, Vercel, a simple `python -m http.server` on the venue Wi-Fi with the laptop's LAN IP, your organisation's own web server, etc.)
   - Once hosted, the QR code will automatically encode the correct live URL to `confirm.html` (it's generated from `window.location.href` at load time — no manual editing needed).

## Running a test
1. Open `index.html` in a browser.
2. Click the glowing QR button in the center of the curtain.
3. Curtains slide open with a crackers/confetti burst, then the video (once you've added it) plays automatically, muted, with a tap-to-unmute button.
4. Separately, scan the QR with a phone (only works once hosted per step 3 above) to see the `confirm.html` success page.

## Customising
- Colours, fonts and the paper texture are all defined as CSS variables at the top of `style.css`.
- Confetti colours, burst timing, and duration are configurable in the `startEffects()` function in `script.js`.
- Event details (dates, venue, organiser) are plain text in `index.html` — edit directly.
