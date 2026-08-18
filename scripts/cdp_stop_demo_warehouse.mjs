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

  const warehouses = page.getByRole("link", { name: "SQL Warehouses", exact: true });
  await warehouses.waitFor({ state: "visible", timeout: 30_000 });
  await warehouses.click();
  await page.getByRole("link", { name: "Serverless Starter Warehouse", exact: true })
    .waitFor({ state: "visible", timeout: 90_000 });

  const stop = page.getByRole("button", { name: "Stop this SQL warehouse", exact: true });
  if (await stop.count()) {
    await stop.click();
    await page.getByRole("button", { name: "Start this SQL warehouse", exact: true })
      .waitFor({ state: "visible", timeout: 180_000 });
    console.log(JSON.stringify({ state: "STOPPED", action: "stopped_by_demo_cleanup" }));
  } else {
    const start = page.getByRole("button", { name: "Start this SQL warehouse", exact: true });
    await start.waitFor({ state: "visible", timeout: 30_000 });
    console.log(JSON.stringify({ state: "STOPPED", action: "already_stopped" }));
  }
} finally {
  await browser.close();
}
