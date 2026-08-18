#!/usr/bin/env node

import { mkdtemp, copyFile, rm, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { tmpdir } from "node:os";
import { chromium } from "playwright";

const [url, outputArg] = process.argv.slice(2);
if (!url || !outputArg) {
  console.error("Usage: node scripts/record_page.mjs <url> <output.webm>");
  process.exit(2);
}

const output = resolve(outputArg);
await mkdir(dirname(output), { recursive: true });
const temporary = await mkdtemp(`${tmpdir()}/dbx-page-recording-`);
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined;

const browser = await chromium.launch({
  headless: true,
  executablePath,
});

const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  colorScheme: "light",
  recordVideo: {
    dir: temporary,
    size: { width: 1440, height: 900 },
  },
});

const page = await context.newPage();
const video = page.video();

try {
  await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
  await page.waitForTimeout(1_500);
  const sectionIds = ["proof", "agent-evolution", "architecture", "access", "cases", "videos", "scope"];
  for (const sectionId of sectionIds) {
    await page.locator(`#${sectionId}`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(1_800);
  }
  await page.locator("#top").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1_200);
} finally {
  await context.close();
  await browser.close();
}

const recordedPath = await video.path();
await copyFile(recordedPath, output);
await rm(temporary, { recursive: true, force: true });
console.log(`RECORDED_VIDEO=${output}`);
