#!/usr/bin/env node

import { chromium } from "playwright";

const browser = await chromium.connectOverCDP(process.env.CDP_ENDPOINT || "http://127.0.0.1:9223");
try {
  const context = browser.contexts()[0];
  let page = context.pages().find((candidate) => {
    try {
      return new URL(candidate.url()).hostname === "accounts.google.com";
    } catch {
      return false;
    }
  }) || context.pages().find((candidate) => {
    try {
      return new URL(candidate.url()).hostname === "accounts.cloud.databricks.com";
    } catch {
      return false;
    }
  });
  if (!page) throw new Error("Databricks or Google login page is not open");

  if (new URL(page.url()).hostname === "accounts.cloud.databricks.com") {
    const google = page.getByRole("link", { name: "Continue with Google", exact: true });
    await google.waitFor({ state: "visible", timeout: 30_000 });
    const popupPromise = page.waitForEvent("popup", { timeout: 8_000 }).catch(() => null);
    await google.click();
    const popup = await popupPromise;
    page = popup || page;
    await page.waitForLoadState("domcontentloaded", { timeout: 30_000 }).catch(() => {});
    await page.waitForTimeout(4_000);
  }

  if (page.isClosed()) page = context.pages().at(-1) || page;
  let host = new URL(page.url()).hostname;
  if (host.endsWith("google.com")) {
    const savedAccounts = page.locator("[data-identifier],[data-email]");
    if (await savedAccounts.count()) {
      await savedAccounts.first().click();
      await page.waitForTimeout(8_000);
      if (page.isClosed()) page = context.pages().at(-1) || page;
      host = new URL(page.url()).hostname;
    }
  }

  const body = await page.locator("body").innerText().catch(() => "");
  const requiresNewGrant = /Allow|Continue to Databricks|Review permissions/i.test(body)
    && !host.endsWith("databricks.com");
  console.log(JSON.stringify({
    reusedSavedGoogleSession: context.pages().some((candidate) => {
      try {
        return new URL(candidate.url()).hostname.startsWith("dbc-");
      } catch {
        return false;
      }
    }),
    host,
    requiresNewGrant,
    requiresPassword: /Enter your password|Forgot password/i.test(body),
  }));
} finally {
  await browser.close();
}
