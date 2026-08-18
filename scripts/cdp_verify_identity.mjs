#!/usr/bin/env node

import { chromium } from "playwright";

const browser = await chromium.connectOverCDP(process.env.CDP_ENDPOINT || "http://127.0.0.1:9223");
try {
  const context = browser.contexts()[0];
  const page = context.pages().find((candidate) => {
    try {
      return new URL(candidate.url()).hostname.startsWith("dbc-");
    } catch {
      return false;
    }
  });
  if (!page) throw new Error("No workspace page is open");
  await page.bringToFront();

  const verify = page.getByRole("button", { name: "Verify identity", exact: true });
  if (await verify.count()) {
    await verify.click();
    await page.waitForTimeout(6_000);
  }

  console.log(JSON.stringify({
    clicked: Boolean(await verify.count()),
    hosts: context.pages().map((candidate) => {
      try {
        return new URL(candidate.url()).hostname;
      } catch {
        return "unknown";
      }
    }),
    workspaceHasSessionExpired: (await page.locator("body").innerText()).includes("Session expired"),
  }));
} finally {
  await browser.close();
}
