import { createServer } from "node:http";
import { readFile, stat, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const root = resolve(process.env.SITE_DIR || "_site");
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};
const server = createServer(async (req, res) => {
  try {
    let path = resolve(root, "." + decodeURIComponent(new URL(req.url, "http://localhost").pathname));
    if (!path.startsWith(root + sep) && path !== root) {
      res.writeHead(403).end();
      return;
    }
    if ((await stat(path)).isDirectory()) path = resolve(path, "index.html");
    res.setHeader("Content-Type", types[extname(path)] || "application/octet-stream");
    res.end(await readFile(path));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
let browser;
const reports = [];
try {
  browser = await chromium.launch(process.env.CHROME_CHANNEL ? { channel: process.env.CHROME_CHANNEL } : {});
  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 768, height: 900 },
    { width: 390, height: 844 },
    { width: 320, height: 844 },
  ]) {
    for (const theme of ["light", "dark"]) {
      const context = await browser.newContext({ viewport, colorScheme: theme });
      // Select a theme before the site's theme initialization executes.
      await context.addInitScript((t) => localStorage.setItem("theme", t), theme);
      for (const path of ["/", "/publications/", "/projects/", "/cv/", "/news/"]) {
        const page = await context.newPage();
        const response = await page.goto(`http://127.0.0.1:${server.address().port}${path}`, { waitUntil: "networkidle" });
        if (!response.ok()) throw new Error(`${path}: HTTP ${response.status()}`);
        await page.evaluate(() => document.fonts.ready);
        // Geometry checks catch visual failures (such as a CV sidebar covering the title)
        // that semantic accessibility checks cannot detect.
        const layoutIssues = await page.evaluate(() => {
          const issues = [];
          if (document.documentElement.scrollWidth > innerWidth + 1) issues.push("Horizontal page overflow");
          const footer = document.querySelector("footer");
          if (["fixed", "absolute"].includes(getComputedStyle(footer).position)) issues.push("Footer must stay in page flow");
          const cv = document.querySelector(".cv-page");
          if (cv) {
            const sidebar = document.querySelector("#toc-sidebar");
            if (innerWidth < 768 && sidebar.getClientRects().length) issues.push("CV sidebar is visible on a phone");
            const headings = [...cv.querySelectorAll(".cv-section > h2")].map((h) => h.textContent.trim());
            const links = [...sidebar.querySelectorAll(".nav-link")].map((a) => a.textContent.trim());
            if (JSON.stringify(headings) !== JSON.stringify(links)) issues.push("CV section navigation does not match the content");
          }
          const lead = document.querySelector(".about-lead");
          const portrait = document.querySelector(".about-intro .profile");
          if (innerWidth < 768 && lead && portrait && lead.getBoundingClientRect().bottom > portrait.getBoundingClientRect().top + 1) {
            issues.push("Research introduction must precede the mobile portrait");
          }
          return issues;
        });
        const { violations, incomplete } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
        reports.push({ path, viewport, theme, violations, incomplete, layoutIssues });
        console.log(`${viewport.width}px ${theme} ${path}: ${violations.length} accessibility violations, ${layoutIssues.length} layout issues`);
        await page.close();
      }
      await context.close();
    }
  }
  if (reports.some((r) => r.violations.length || r.layoutIssues.length)) process.exitCode = 1;
} finally {
  await mkdir("reports", { recursive: true });
  await writeFile("reports/accessibility.json", JSON.stringify(reports, null, 2));
  await browser?.close();
  await new Promise((r) => server.close(r));
}
