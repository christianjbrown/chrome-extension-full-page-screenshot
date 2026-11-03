# Chrome Web Store listing

Everything the developer dashboard asks for, ready to paste. The images are in this folder.

Live at https://chromewebstore.google.com/detail/lehpmnfheonpjfhganmhocmdpafolmfg

## Package

Run `npm run package` and upload the `extension.zip` it makes. Bump `version` in `static/manifest.json` before uploading an update.

## Store listing

- **Name:** Christian's Full Page Screenshot (read from the manifest)
- **Summary:** One click saves a screenshot of the whole page, top to bottom, as a PNG in your downloads folder. (read from the manifest)
- **Category:** Productivity > Tools
- **Language:** English (United Kingdom)
- **Store icon:** `icon-128.png`
- **Screenshot:** `screenshot-1280x800.png`
- **Small promo tile:** `promo-440x280.png`
- **Homepage URL:** https://github.com/christianjbrown/chrome-extension-full-page-screenshot
- **Support URL:** https://github.com/christianjbrown/chrome-extension-full-page-screenshot/issues

**Description**

```text
One button in your toolbar. Click it and a PNG of the whole page, top to bottom, lands in your downloads folder. No editor tab, no save dialog.

• The entire page, not just the part on screen. It scrolls down, captures each screenful and stitches them into one tall image.
• Retina sharp, at your screen's real pixel density.
• Sticky and fixed headers show once, at the top, instead of down the page every screenful.
• Pages that scroll inside a panel get the panel's full contents.
• Lazy-loaded images are waited for, so you get the photos instead of grey boxes.
• Very long pages are cut into numbered parts, because Chrome can't make an image past about 16,000 pixels tall.
• Your page is left exactly as you had it: same scroll position, same styles.
• A progress badge on the button while it works, and a red ! with the reason if something goes wrong.

No tracking, no accounts, nothing sent anywhere. It only touches the tab you click it in, and only when you click it.
```

## Privacy practices

**Single purpose**

```text
Save a screenshot of the entire current page as a PNG file.
```

**Permission justifications**

**activeTab**

```text
Gives the extension access to the current tab only after the user clicks its toolbar button, so it can capture what is on screen.
```

**scripting**

```text
Injects the script that scrolls the page one screenful at a time, measures it, and puts the scroll position and styles back afterwards.
```

**offscreen**

```text
Stitches the captured screenfuls into one PNG in an offscreen document, which has the canvas and blob APIs a service worker lacks.
```

**downloads**

```text
Saves the finished PNG to the user's downloads folder.
```

**Remote code:** No, I am not using remote code.

**Data usage:** tick none of the data types, then tick all three certifications.

**Privacy policy URL:** https://github.com/christianjbrown/chrome-extension-full-page-screenshot/blob/main/PRIVACY.md

## Distribution

Free, public, all regions.
