#!/usr/bin/env node
/**
 * Copies the product screenshots into the website and writes the gallery index.
 *
 *   node scripts/sync-screenshots.mjs [sourceDir]
 *
 * Source (default ../releases/screenshots): desktop/*.png and android/*.png.
 * Output: public/screenshots/{desktop,android}/*.png and src/content/screenshots.json
 *         ({ desktop: [{ src, alt }], android: [...] }, alt from the file name: "profile-tab.png" → "Profile tab").
 *
 * Files listed in scripts/screenshots-skip.txt (one "platform/file.png" per line, # for comments) are
 * never copied — use it for screenshots that show personal data. Missing or empty folders are fine:
 * that platform's list is simply empty. Old copies that are no longer in the source are removed.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(process.argv[2] ?? join(root, "..", "releases", "screenshots"));
const PLATFORMS = ["desktop", "android"];

const skipFile = join(root, "scripts", "screenshots-skip.txt");
const skip = new Set(
  existsSync(skipFile)
    ? readFileSync(skipFile, "utf8")
        .split(/\r?\n/)
        .map((l) => l.replace(/#.*/, "").trim())
        .filter(Boolean)
    : [],
);

/** "02-profile-tab.png" → "Profile tab" */
export function altFromFile(file) {
  const words = file
    .replace(/\.png$/i, "")
    .replace(/^\d+[-_ .]+/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\bbambookit\b/gi, "BambooKit")
    .trim();
  return words ? words[0].toUpperCase() + words.slice(1) : "Screenshot";
}

const index = {};
for (const platform of PLATFORMS) {
  const from = join(source, platform);
  const to = join(root, "public", "screenshots", platform);
  const files = existsSync(from)
    ? readdirSync(from)
        .filter((f) => /\.png$/i.test(f) && !skip.has(`${platform}/${f}`))
        .sort((a, b) => a.localeCompare(b, "en", { numeric: true }))
    : [];
  mkdirSync(to, { recursive: true });
  for (const old of readdirSync(to)) if (/\.png$/i.test(old) && !files.includes(old)) rmSync(join(to, old));
  for (const f of files) copyFileSync(join(from, f), join(to, f));
  index[platform] = files.map((f) => ({ src: `/screenshots/${platform}/${f}`, alt: altFromFile(f) }));
  const skipped = [...skip].filter((s) => s.startsWith(`${platform}/`)).length;
  console.log(`${platform}: ${files.length} copied${skipped ? `, ${skipped} skipped` : ""}${existsSync(from) ? "" : ` (no folder at ${from})`}`);
}

writeFileSync(join(root, "src", "content", "screenshots.json"), JSON.stringify(index, null, 2) + "\n");
console.log("Wrote src/content/screenshots.json");
