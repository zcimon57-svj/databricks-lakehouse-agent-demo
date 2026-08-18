#!/usr/bin/env node

import { chromium } from "playwright";

const endpoint = process.env.CDP_ENDPOINT || "http://127.0.0.1:9223";
const browser = await chromium.connectOverCDP(endpoint);

try {
  const context = browser.contexts()[0];
  const pages = context?.pages() ?? [];
  const page = pages.find((candidate) => {
    try {
      return new URL(candidate.url()).hostname.endsWith("databricks.com");
    } catch {
      return false;
    }
  }) ?? pages[0];

  if (!page) {
    console.log(JSON.stringify({ authenticated: false, reason: "no_page" }));
    process.exit(0);
  }

  let hostname = "unknown";
  try {
    hostname = new URL(page.url()).hostname;
  } catch {
    // Keep the non-sensitive fallback value.
  }

  let status = null;
  if (hostname.endsWith("databricks.com")) {
    status = await page.evaluate(async () => {
      try {
        const response = await fetch("/api/2.0/preview/scim/v2/Me", {
          credentials: "include",
          redirect: "manual",
        });
        return response.status;
      } catch {
        return 0;
      }
    });
  }

  console.log(JSON.stringify({
    authenticated: status === 200,
    hostname,
    status,
  }));
} finally {
  await browser.close();
}
