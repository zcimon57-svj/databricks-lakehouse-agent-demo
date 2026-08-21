#!/usr/bin/env node

import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium } from "playwright";

const [baseArg = "http://127.0.0.1:8765", screenshotArg] = process.argv.slice(2);
const baseUrl = new URL(baseArg.endsWith("/") ? baseArg : `${baseArg}/`);
const screenshotDir = resolve(screenshotArg ?? join(tmpdir(), "data-intelligence-site-validation"));

const routes = [
  "/site/index.html",
  "/site/huawei-rds-agent.html",
  "/site/genie.html",
  "/site/database-agent.html",
  "/site/details/data-intelligence-decision-brief.html",
  "/site/details/independent-research-index.html",
  "/site/details/independent-reader-guide.html",
  "/site/details/reader-first-editorial-contract.html",
  "/site/details/independent-findings.html",
  "/site/details/agent-entry-governance-deep-dive.html",
  "/site/details/unknowns-and-validation.html",
  "/site/details/huawei-catch-up-product-plan.html",
  "/independent_exploration_2026-08-19/agent-entry-governance-visual-report.html",
  "/independent_exploration_2026-08-19/vendor-entry-atlas.html",
  "/independent_exploration_2026-08-19/huawei-catch-up-plan.html",
  "/independent_exploration_2026-08-19/huawei-product-ui-prototypes.html",
];

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const screenshotStems = new Map([
  ["/site/index.html", "decision-home"],
  ["/site/huawei-rds-agent.html", "huawei-product-decision"],
  ["/site/details/independent-reader-guide.html", "independent-reader-guide"],
  ["/site/details/huawei-catch-up-product-plan.html", "huawei-catch-up-product-plan"],
  ["/independent_exploration_2026-08-19/agent-entry-governance-visual-report.html", "agent-entry-governance-report"],
  ["/independent_exploration_2026-08-19/huawei-product-ui-prototypes.html", "huawei-product-ui-prototypes"],
]);

await mkdir(screenshotDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      colorScheme: "light",
    });

    for (const route of routes) {
      const page = await context.newPage();
      const consoleErrors = [];
      const pageErrors = [];
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });
      page.on("pageerror", (error) => pageErrors.push(error.message));
      const response = await page.goto(new URL(route, baseUrl).href, {
        waitUntil: "domcontentloaded",
        timeout: 30_000,
      });
      await page.waitForFunction(
        () => [...document.images].every((image) => image.complete),
        null,
        { timeout: 5_000 },
      ).catch(() => {});
      await page.waitForTimeout(100);

      const inspection = await page.evaluate(() => {
        const localAnchors = [...document.querySelectorAll('a[href^="#"]')]
          .map((anchor) => anchor.getAttribute("href"))
          .filter((href) => href && href.length > 1)
          .filter((href) => !document.getElementById(decodeURIComponent(href.slice(1))));
        return {
          title: document.title,
          charset: document.characterSet,
          hasReplacementCharacter: document.body.innerText.includes("�"),
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          missingAnchors: [...new Set(localAnchors)],
          images: [...document.images].map((image) => ({
            src: new URL(image.src).pathname,
            complete: image.complete,
            naturalWidth: image.naturalWidth,
          })),
        };
      });

      const failedLocalLinks = [];
      if (viewport.name === "desktop") {
        const hrefs = await page.locator("a[href]").evaluateAll((anchors) => anchors.map((anchor) => anchor.href));
        const localTargets = [...new Set(hrefs)]
          .filter((href) => href.startsWith(baseUrl.origin))
          .filter((href) => !/\.(?:mp4|webm|mp3|wav)(?:$|[?#])/i.test(href));
        for (const target of localTargets) {
          const linkResponse = await context.request.get(target);
          if (linkResponse.status() >= 400) {
            failedLocalLinks.push({ path: new URL(target).pathname, status: linkResponse.status() });
          }
        }
      }

      let screenshot = null;
      if (screenshotStems.has(route)) {
        const stem = screenshotStems.get(route);
        screenshot = join(screenshotDir, `${stem}-${viewport.name}.png`);
        await page.screenshot({ path: screenshot, fullPage: false });
      }

      results.push({
        route,
        viewport: viewport.name,
        status: response?.status() ?? null,
        screenshot,
        ...inspection,
        consoleErrors,
        pageErrors,
        failedLocalLinks,
      });
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
}

const failed = results.some((result) => (
  result.status !== 200
  || result.charset !== "UTF-8"
  || result.hasReplacementCharacter
  || result.scrollWidth > result.clientWidth
  || result.missingAnchors.length > 0
  || result.images.some((image) => !image.complete || image.naturalWidth === 0)
  || result.consoleErrors.length > 0
  || result.pageErrors.length > 0
  || result.failedLocalLinks.length > 0
));

console.log(JSON.stringify({ screenshotDir, failed, results }, null, 2));
if (failed) process.exitCode = 1;
