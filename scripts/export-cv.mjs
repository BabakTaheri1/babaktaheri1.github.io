import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { chromium } from "playwright";

// Run after building the site. The PDF uses the same content and print styles as /cv/.
const root = resolve(process.env.SITE_DIR || "_site");
const output = resolve("assets/pdf/babak-taheri-cv.pdf");
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".woff2": "font/woff2",
};
const server = createServer(async (req, res) => {
  try {
    let path = resolve(root, "." + decodeURIComponent(new URL(req.url, "http://localhost").pathname));
    if (path !== root && !path.startsWith(root + sep)) {
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
await new Promise((done) => server.listen(0, "127.0.0.1", done));
let browser;
try {
  browser = await chromium.launch(process.env.CHROME_CHANNEL ? { channel: process.env.CHROME_CHANNEL } : {});
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 }, colorScheme: "light" });
  await page.addInitScript(() => localStorage.setItem("theme", "light"));
  const response = await page.goto(`http://127.0.0.1:${server.address().port}/cv/`, { waitUntil: "networkidle" });
  if (!response.ok()) throw new Error(`CV: HTTP ${response.status()}`);
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: output,
    format: "A4",
    printBackground: true,
    tagged: true,
    displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    footerTemplate:
      '<div style="font:9px Arial;width:100%;text-align:center;color:#4a607a"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
    margin: { top: "16mm", right: "16mm", bottom: "18mm", left: "16mm" },
  });
  console.log(`Exported ${output}`);
} finally {
  await browser?.close();
  await new Promise((done) => server.close(done));
}
