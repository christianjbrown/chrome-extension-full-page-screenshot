// Bundles the service worker, the page script and the offscreen document, and copies the static
// files into dist/, which is the folder Chrome loads with "Load unpacked".
import { build } from "esbuild";
import { cp, mkdir, readFile, rm } from "node:fs/promises";

const outdir = "dist";
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));

// The code that references a bundle by name has a test pinning it to these.
const entryPoints = await readJson("scripts/entries.json");
// The bundle is written for the oldest Chrome the manifest lets install it.
const manifest = await readJson("static/manifest.json");

await rm(outdir, { recursive: true, force: true });
await mkdir(outdir, { recursive: true });
await build({
  entryPoints,
  outdir,
  bundle: true,
  format: "iife",
  target: `chrome${manifest.minimum_chrome_version}`,
  minify: false,
  sourcemap: false,
  legalComments: "none",
  logLevel: "info",
});
await cp("static", outdir, { recursive: true });
