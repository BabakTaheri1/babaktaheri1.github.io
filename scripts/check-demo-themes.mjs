import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const root = resolve(process.env.SITE_DIR || fileURLToPath(new URL("../", import.meta.url)));
const artifacts = process.env.DEMO_THEME_ARTIFACT_DIR;
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".webp": "image/webp" };
const server = createServer(async (req, res) => {
  try {
    const path = resolve(root, "." + decodeURIComponent(new URL(req.url, "http://localhost").pathname));
    if (!path.startsWith(root + sep) || !(await stat(path)).isFile()) {
      res.writeHead(404).end();
      return;
    }
    res.setHeader("Content-Type", types[extname(path)] || "application/octet-stream");
    res.end(await readFile(path));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const base = "http://127.0.0.1:" + server.address().port;
const demos = ["ReactiveTruck", "ReactiveParticle", "BraessParadox", "Euler's_Identity", "Polya", "Sierpinski", "grid-ops-architecture"];
const selectedDemos = process.env.DEMO_THEME_DEMOS ? process.env.DEMO_THEME_DEMOS.split(",") : demos;
assert(
  selectedDemos.every((demo) => demos.includes(demo)),
  "Unknown demo in DEMO_THEME_DEMOS"
);
const reports = [];
let browser;
async function setInput(page, id, value) {
  await page.locator("#" + id).evaluate((input, next) => {
    input.value = String(next);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
}
async function experiment(page, demo) {
  if (demo === "ReactiveTruck") await page.locator("#presetCorrected").click();
  if (demo === "ReactiveParticle") await page.locator("#presetInductive").click();
  if (demo === "BraessParadox") await setInput(page, "loadSlider", 600);
  if (demo === "Euler's_Identity") await setInput(page, "theta-slider", 1.23);
  if (demo === "Polya") {
    await page.locator("#max-balls-input").fill("20");
    await page.locator("#num-simulations").fill("5");
    await page.locator("#run-multi-button").click();
    await page.waitForFunction(() => Chart.getChart(document.getElementById("histogram-chart"))?.data.datasets[0].data.some((n) => n > 0));
  }
  if (demo === "Sierpinski") for (let i = 0; i < 12; i++) await page.locator("#next-btn").click();
  if (demo === "grid-ops-architecture") await page.locator('[data-scenario="congestion"]').click();
}
async function snapshot(page, demo) {
  return page.evaluate((name) => {
    if (name === "ReactiveTruck")
      return { inputs: [...document.querySelectorAll('input[type="range"]')].map((i) => i.value), power: App.state.power };
    if (name === "ReactiveParticle") return [document.getElementById("pfSlider").value, document.getElementById("reactivePowerValue").textContent];
    if (name === "BraessParadox") return { inputs: App.state.inputs, cost: App.state.grid.connected.cost };
    if (name === "Euler's_Identity") return [document.getElementById("theta-slider").value, document.getElementById("theta-value").textContent];
    if (name === "Polya")
      return [...document.querySelectorAll(".chart-container canvas")].map((canvas) => {
        const chart = Chart.getChart(canvas);
        return { labels: chart.data.labels, data: chart.data.datasets.map((d) => d.data) };
      });
    if (name === "Sierpinski") return { count: points.length, point: currentPoint };
    return ["hourSlider", "demandSlider", "metricMetro"].map((id) => document.getElementById(id).value || document.getElementById(id).textContent);
  }, demo);
}
try {
  if (artifacts) await mkdir(artifacts, { recursive: true });
  browser = await chromium.launch(process.env.CHROME_CHANNEL ? { channel: process.env.CHROME_CHANNEL } : {});
  for (const width of [1440, 390, 320])
    for (const theme of ["light", "dark"])
      for (const demo of selectedDemos) {
        const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme, reducedMotion: "reduce" });
        await context.addInitScript((value) => {
          if (!localStorage.getItem("theme")) localStorage.setItem("theme", value);
          localStorage.setItem("gridOpsTheme", value === "light" ? "dark" : "light");
        }, theme);
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.goto(base + "/code/" + encodeURIComponent(demo) + ".html" + (demo === "BraessParadox" ? "#power-grid" : ""), {
          waitUntil: "networkidle",
        });
        await page.waitForFunction(() => Object.values(DemoTheme.colors).every(Boolean));
        assert(
          await page.evaluate(() => Object.values(DemoTheme.colors).every((value) => /^#[a-f\d]{6}$/i.test(value))),
          "Renderer palette must normalize compressed CSS colors"
        );
        await page.evaluate(() => document.fonts.ready);
        if (demo === "ReactiveParticle") await page.waitForFunction(() => document.getElementById("pfValue").textContent.length > 0);
        if (demo === "Euler's_Identity") await page.waitForFunction(() => document.querySelectorAll('canvas[role="img"]').length === 3);
        if (demo === "Polya") await page.waitForFunction(() => Chart.getChart(document.getElementById("proportion-chart")));
        assert.equal(await page.locator("html").getAttribute("data-theme"), theme);
        await experiment(page, demo);
        const before = await snapshot(page, demo);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), demo + ": page overflows at " + width);
        const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
        reports.push({ demo, width, theme, violations: scan.violations });
        assert.equal(scan.violations.length, 0, demo + ": " + JSON.stringify(scan.violations));
        if (artifacts) await page.screenshot({ path: resolve(artifacts, demo + "-" + width + "-" + theme + ".png"), fullPage: true });
        if (artifacts && width === 1440 && theme === "light") {
          const preview = {
            ReactiveTruck: ".sceneCard",
            ReactiveParticle: ".scene-frame",
            BraessParadox: "#gridConnectedCanvas",
            "grid-ops-architecture": "#networkCanvas",
          }[demo];
          if (demo === "BraessParadox") {
            await page.locator("#gridConnectedCanvas").scrollIntoViewIfNeeded();
            const boxes = await Promise.all([page.locator("#gridConnectedCanvas").boundingBox(), page.locator("#gridRemovedCanvas").boundingBox()]);
            const x = Math.min(...boxes.map((box) => box.x)),
              y = Math.min(...boxes.map((box) => box.y));
            await page.screenshot({
              path: resolve(artifacts, "preview-" + demo + ".png"),
              clip: {
                x,
                y,
                width: Math.max(...boxes.map((box) => box.x + box.width)) - x,
                height: Math.max(...boxes.map((box) => box.y + box.height)) - y,
              },
            });
          } else if (preview) await page.locator(preview).screenshot({ path: resolve(artifacts, "preview-" + demo + ".png") });
        }
        await page.locator("[data-demo-theme], #themeButton").click();
        const next = theme === "light" ? "dark" : "light";
        assert.equal(await page.locator("html").getAttribute("data-theme"), next);
        assert.deepEqual(await snapshot(page, demo), before, demo + ": switching theme resets the experiment");
        assert.equal(await page.evaluate(() => localStorage.getItem("theme")), next);
        await page.reload({ waitUntil: "networkidle" });
        assert.equal(await page.locator("html").getAttribute("data-theme"), next);
        assert.deepEqual(errors, [], demo);
        console.log(demo + " " + width + "px " + theme + ": layout, accessibility, preserved experiment and saved preference passed");
        await context.close();
      }
  // System changes and site preference changes propagate without resetting a demo.
  const context = await browser.newContext({ colorScheme: "light" });
  const first = await context.newPage();
  await first.goto(base + "/code/Sierpinski.html");
  await first.locator("#next-btn").click();
  const state = await snapshot(first, "Sierpinski");
  await first.emulateMedia({ colorScheme: "dark" });
  await first.waitForFunction(() => document.documentElement.dataset.theme === "dark");
  assert.deepEqual(await snapshot(first, "Sierpinski"), state);
  const second = await context.newPage();
  await second.goto(base + "/code/ReactiveTruck.html");
  await second.evaluate(() => localStorage.setItem("theme", "light"));
  await first.waitForFunction(() => document.documentElement.dataset.theme === "light");
  assert.deepEqual(await snapshot(first, "Sierpinski"), state);
  await context.close();
  console.log("System theme and shared site preference updates passed.");
} finally {
  if (artifacts) await writeFile(resolve(artifacts, "accessibility.json"), JSON.stringify(reports, null, 2));
  await browser?.close();
  await new Promise((done) => server.close(done));
}
