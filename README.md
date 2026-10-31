# Full Page Screenshot 📸

One button in your Chrome toolbar. Click it and a PNG of the whole page, top to bottom, lands in your downloads folder. No editor tab, no save dialog, no "would you like to crop that?". Click, done.

## What you get 🖼️

- **The entire page**, not just the bit on screen. It scrolls down, snaps each screenful, and stitches them into one tall image.
- **Retina sharp.** It works at your screen's real pixel density, so a 1440px wide page on a Retina Mac comes out 2880px wide.
- **No headers stamped down the page every screenful.** Sticky bars go back to their normal spot and fixed headers show once, at the top, like a human would expect.
- **Web apps too.** Pages that scroll inside a panel, with a fixed shell around the content, get the panel's full contents.
- **Your page left exactly as you had it.** Same scroll position, same styles, as if nothing happened. 🧹
- **Lazy-loaded images actually show up.** After each scroll it waits for the pictures that just came into view to finish loading (up to 2 seconds each screenful), so you don't get grey boxes where the photos should be.
- **Ridiculously long pages** get cut into numbered parts instead of crashing, because Chrome won't make an image past about 16,000 pixels tall.
- **A progress badge** on the button while it works (`20%`, `40%`...), and a red `!` with the reason if something goes wrong.

## Install it 🔧

You need [Node.js](https://nodejs.org) 22 or newer, and Chrome 126 or newer.

1. Grab the code and build it:

   ```bash
   git clone https://github.com/christianjbrown/chrome-extension-full-page-screenshot.git
   cd chrome-extension-full-page-screenshot
   npm ci
   npm run build
   ```

   That makes a `dist` folder, which is the actual extension.

2. Open `chrome://extensions` in Chrome.
3. Flip on **Developer mode** (top right).
4. Click **Load unpacked** and pick the `dist` folder.
5. Click the puzzle piece 🧩 in the toolbar and hit the pin next to **Christian's Full Page Screenshot**.

Done. The little blue page icon in your toolbar is your new best friend.

### Updating 🔄

```bash
git pull
npm ci
npm run build
```

Then hit the reload arrow on the Christian's Full Page Screenshot card in `chrome://extensions`.

## Using it 🎯

1. Go to the page you want.
2. Click the button. The badge counts up as it scrolls down the page. Don't switch tabs until it's finished (it's photographing what's on screen, after all).
3. The badge clears, and your screenshot is waiting in your downloads folder.

It's named after the tab, in kebab-case, with the date and time on the front in your laptop's own time zone, so they sort nicely:

```
2026-10-30-14-05-my-cool-page.png
```

A page too tall for one image comes out as `...-part-1.png`, `...-part-2.png` and so on, top to bottom.

## Good to know 🤓

- **It takes a second or two per screenful.** Chrome only lets an extension grab the screen twice a second, so a long page takes a little while. Worth it.
- **Chrome's own pages** (`chrome://` anything, the Web Store, other extensions) are off limits to every extension. You'll get a red `!` saying so.
- **Local files** (`file://`) need **Allow access to file URLs** turned on in the extension's details in `chrome://extensions`.
- **Endless feeds get what's loaded when you click.** It captures down to where the page ends at that moment, and doesn't chase new posts as they load in. Want more of the feed? Scroll down until you've got what you want, then click. 📜
- **It stops at 60,000 pixels tall** (CSS pixels), so an endless feed doesn't keep you waiting forever.
- **Getting a save dialog every time?** That's Chrome's **Ask where to save each file before downloading** setting. Turn it off in `chrome://settings/downloads` and files go straight to your downloads folder.
- **A red `!` on the button** means something went wrong. Hover over it and the tooltip says what.

## No tracking 🔒

No analytics, no tracking, no ads, no accounts, and nothing phoning home. The screenshot is stitched together right there in Chrome and saved to your downloads folder, and never goes near a server.

## Hacking on it 🛠️

It's TypeScript, bundled with esbuild, tested with Vitest.

```bash
npm test          # the unit tests
npm run ci        # everything CI checks: format, lint, types, unused code, 100% coverage, build
```

`npm run ci` has to pass before a push leaves your machine (the pre-push hook runs it), and coverage has to stay at 100% for lines, branches, functions and statements, or it fails.

How it fits together:

- **`src/background`** is the service worker. It owns the button, works out how many screenfuls the page needs, scrolls through them, captures each one with `captureVisibleTab` (spaced out to stay under Chrome's limit), and saves the finished files. `main.ts` just wires the pieces to Chrome.
- **`src/page`** is injected into the tab on each click. It finds what actually scrolls (the window, or an inner panel), turns off smooth scrolling, tames sticky and fixed elements, scrolls where it's told, and puts everything back afterwards.
- **`src/offscreen`** is a hidden page that stitches the slices onto canvases and turns them into PNGs. It exists because a service worker can't make the blob URL a big download needs.
- **`src/shared`** holds the messages the three send each other. They never import each other's code, and lint enforces that.

Every class gets its collaborators through its constructor, behind an interface, so each one is tested on its own with fakes.
