#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const [url = "http://127.0.0.1:8765/site/", screenshotArg = "evidence/workspace/site-v2.png"] = process.argv.slice(2);
const screenshot = resolve(screenshotArg);
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light" });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
  await page.waitForTimeout(2_000);
  await page.screenshot({ path: screenshot, fullPage: false });

  const origin = new URL(url).origin;
  const hrefs = await page.locator("a[href]").evaluateAll((elements) => elements.map((element) => element.href));
  const localTargets = [...new Set(hrefs.filter((href) => href.startsWith(origin) && !href.includes("#")))];
  const localLinks = [];
  for (const target of localTargets) {
    const response = await context.request.get(target);
    localLinks.push({ path: new URL(target).pathname, status: response.status() });
  }

  const images = await page.locator("img").evaluateAll((elements) => elements.map((element) => ({
    src: new URL(element.src).pathname,
    complete: element.complete,
    naturalWidth: element.naturalWidth,
  })));
  const videos = await page.locator("video").evaluateAll((elements) => elements.map((element) => ({
    src: new URL(element.currentSrc || element.src).pathname,
    readyState: element.readyState,
    duration: Number.isFinite(element.duration) ? Number(element.duration.toFixed(2)) : null,
    error: element.error?.message || null,
  })));
  const bodyText = await page.locator("body").innerText();

  const result = {
    title: await page.title(),
    screenshot,
    localLinks,
    images,
    videos,
    privacy: {
      hasEmail: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(bodyText),
      hasPrivateWorkspaceHost: /dbc-[a-z0-9-]+\.cloud\.databricks\.com/i.test(bodyText),
    },
  };
  const failed = localLinks.some((item) => item.status >= 400)
    || images.some((item) => !item.complete || item.naturalWidth === 0)
    || videos.some((item) => item.readyState < 1 || item.error)
    || result.privacy.hasEmail
    || result.privacy.hasPrivateWorkspaceHost;
  console.log(JSON.stringify(result, null, 2));
  if (failed) process.exitCode = 1;
} finally {
  await browser.close();
}
