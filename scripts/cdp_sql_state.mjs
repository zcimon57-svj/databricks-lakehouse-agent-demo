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
  const state = await page.evaluate(() => {
    const body = document.body?.innerText || "";
    const editor = document.querySelector(".view-lines")?.textContent || "";
    return {
      bodyHasSouthwest: body.includes("西南"),
      bodyHasSouthChina: body.includes("华南"),
      editorLength: editor.length,
      editorHasDemoSchema: editor.includes("dbx_demo_20260814"),
      editorHasQuestion: editor.includes("P1"),
      hasCaption: Boolean(document.getElementById("dbx-demo-caption")),
      bodyHasCancelRunning: body.includes("Cancel running query"),
      bodyHasJustNow: body.includes("Just now"),
      bodyHasQueueTickets: body.includes("T000697") && body.includes("T000616"),
      bodyHas18Rows: body.includes("18 rows"),
      editorHasNegativeFilter: editor.includes("sentiment = 'negative'"),
      captionTitle: document.querySelector("#dbx-demo-caption strong")?.textContent || "",
    };
  });
  console.log(JSON.stringify(state));
} finally {
  await browser.close();
}
