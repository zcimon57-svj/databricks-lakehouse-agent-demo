#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const endpoint = process.env.CDP_ENDPOINT || "http://127.0.0.1:9223";
const output = resolve(process.argv[2] || "/tmp/databricks-workspace-scrubbed.png");

function installPrivacyScrubber() {
  const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
  const uuidPattern = /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi;
  const redactValue = (value) => String(value || "")
    .replace(emailPattern, "[账号已隐藏]")
    .replace(uuidPattern, "[对象ID已隐藏]");
  const sensitiveSelector = [
    '[data-testid*="profile" i]',
    '[data-testid*="user-menu" i]',
    '[data-testid*="account-menu" i]',
    'button[aria-label*="profile" i]',
    'button[aria-label*="account" i]',
    'button[aria-label*="user menu" i]',
  ].join(",");

  const scrub = (root) => {
    if (!root) return;
    const nodeFilter = globalThis.NodeFilter;
    if (nodeFilter) {
      const walker = document.createTreeWalker(root, nodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const redacted = redactValue(node.nodeValue || "");
        if (redacted !== (node.nodeValue || "")) {
          node.nodeValue = redacted;
        }
      }
    }

    for (const element of root.querySelectorAll?.("[aria-label],[title],[alt]") || []) {
      for (const attribute of ["aria-label", "title", "alt"]) {
        const value = element.getAttribute(attribute);
        if (value) {
          element.setAttribute(attribute, redactValue(value));
        }
      }
    }

    for (const element of root.querySelectorAll?.(sensitiveSelector) || []) {
      element.setAttribute("data-demo-private", "true");
    }
  };

  if (!document.getElementById("dbx-demo-privacy-style")) {
    const style = document.createElement("style");
    style.id = "dbx-demo-privacy-style";
    style.textContent = `
      [data-demo-private="true"] {
        filter: blur(12px) !important;
      }
    `;
    document.documentElement.appendChild(style);
  }

  scrub(document.documentElement);
  globalThis.__dbxDemoPrivacyObserver?.disconnect();
  globalThis.__dbxDemoPrivacyObserver = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === "characterData") scrub(record.target.parentElement);
        for (const node of record.addedNodes || []) {
          if (node.nodeType === Node.ELEMENT_NODE) scrub(node);
        }
      }
  });
  globalThis.__dbxDemoPrivacyObserver.observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
  });
}

const browser = await chromium.connectOverCDP(endpoint);
try {
  const context = browser.contexts()[0];
  if (!context) throw new Error("No browser context is available");
  await context.addInitScript(installPrivacyScrubber);

  const pages = context.pages();
  const page = pages.find((candidate) => {
    try {
      const hostname = new URL(candidate.url()).hostname;
      return hostname.endsWith("databricks.com");
    } catch {
      return false;
    }
  });
  if (!page) throw new Error("No workspace page is open");

  await page.bringToFront();
  await page.waitForLoadState("domcontentloaded", { timeout: 30_000 }).catch(() => {});
  await page.evaluate(() => {
    for (const id of ["dbx-demo-caption", "dbx-demo-pointer", "dbx-demo-recording-style"]) {
      document.getElementById(id)?.remove();
    }
  });
  await page.evaluate(installPrivacyScrubber);
  const notNow = page.getByRole("button", { name: "Not now", exact: true });
  if (await notNow.count()) {
    await notNow.first().click().catch(() => {});
  }
  const closeAlert = page.getByRole("button", { name: "Close", exact: true });
  if (await closeAlert.count()) {
    await closeAlert.first().click().catch(() => {});
  }
  await page.waitForTimeout(1_500);

  const signals = await page.evaluate(() => {
    const text = (document.body?.innerText || "").toLowerCase();
    return {
      hasCatalog: text.includes("catalog") || text.includes("目录"),
      hasSql: text.includes("sql"),
      hasWorkspace: text.includes("workspace") || text.includes("工作区"),
      hasSignIn: text.includes("sign in") || text.includes("登录"),
    };
  });
  await page.screenshot({ path: output, fullPage: false });

  console.log(JSON.stringify({
    hostname: new URL(page.url()).hostname,
    screenshot: output,
    signals,
  }));
} finally {
  await browser.close();
}
