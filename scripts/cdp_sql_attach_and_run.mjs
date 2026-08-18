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

  const button = page.getByRole("button", { name: "Attach and run", exact: true });
  await button.waitFor({ state: "visible", timeout: 30_000 });
  await button.click();
  console.log(JSON.stringify({ action: "attach_and_run", clicked: true }));
} finally {
  await browser.close();
}
