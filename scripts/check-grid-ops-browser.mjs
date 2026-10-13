import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const project = fileURLToPath(new URL("../", import.meta.url));
const root = resolve(process.env.SITE_DIR || project);
const artifactDir = process.env.GRID_OPS_ARTIFACT_DIR;
const html = await readFile(resolve(root, "code/grid-ops-architecture.html"));
const server = createServer((req, res) => {
  if (req.url !== "/") {
    res.writeHead(404).end();
    return;
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(html);
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const url = "http://127.0.0.1:" + server.address().port + "/";
let browser;
const reports = [];
try {
  if (artifactDir) await mkdir(artifactDir, { recursive: true });
  browser = await chromium.launch(process.env.CHROME_CHANNEL ? { channel: process.env.CHROME_CHANNEL } : {});
  for (const width of [1440, 768, 390, 320]) {
    for (const theme of ["dark", "light"]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
      await context.addInitScript((value) => {
        if (!localStorage.getItem("gridOpsTheme")) localStorage.setItem("gridOpsTheme", value);
      }, theme);
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(url, { waitUntil: "networkidle" });
      assert.deepEqual(errors, []);
      assert.equal(await page.locator("html").getAttribute("data-theme"), theme);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      assert(
        await page.locator('[data-cell="14"]').evaluate((cell) => {
          const table = cell.closest("table"),
            region = table.parentElement.getBoundingClientRect();
          const label = table.querySelector("tbody th").getBoundingClientRect(),
            rect = cell.getBoundingClientRect();
          return rect.left >= label.right && rect.right <= region.right;
        }),
        "Selected hour must be visible beside the sticky resource label"
      );
      const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      reports.push({ width, theme, violations: scan.violations });
      assert.equal(scan.violations.length, 0, JSON.stringify(scan.violations));
      if (artifactDir) await page.screenshot({ path: resolve(artifactDir, "grid-ops-" + width + "-" + theme + ".png"), fullPage: true });
      console.log(width + "px " + theme + ": layout and accessibility passed");

      if (width === 1440 && theme === "dark") {
        await page.locator('[data-scenario="congestion"]').click();
        assert.equal(await page.locator('[data-scenario="congestion"]').getAttribute("aria-pressed"), "true");
        assert.match(await page.locator("#caseNote").innerText(), /preventive plan/);
        assert.match(await page.locator("#statusTitle").innerText(), /limit/);
        assert.match(await page.locator("#statusText").innerText(), /outage/);
        assert.equal(await page.locator("#networkView").inputValue(), "1");
        if (artifactDir)
          await page
            .locator("#networkCanvas")
            .locator("..")
            .screenshot({ path: resolve(artifactDir, "grid-ops-feature.png") });
        assert.notEqual(await page.locator("#metricPrice").innerText(), await page.locator("#metricMetro").innerText());
        await page.locator("#outageToggle").uncheck();
        assert.equal(await page.locator("#networkView").inputValue(), "0");

        await page.locator('[data-scenario="low"]').click();
        assert.equal(await page.locator("#statusTitle").innerText(), "No feasible dispatch");
        assert.equal(await page.locator("#metricPrice").innerText(), "—");
        await page.locator("#curtailmentToggle").check();
        assert.equal(await page.locator("#statusTitle").innerText(), "No feasible dispatch");
        // Process comparisons must preserve a manually selected demand.
        await page.locator('[data-stage="0"]').click();
        assert.equal(await page.locator("#demandSlider").inputValue(), "20");
        assert.match(await page.locator("#statusTitle").innerText(), /Feasible dispatch/);

        await page.locator('[data-scenario="shortage"]').click();
        assert.match(await page.locator("#caseNote").innerText(), /75 GW/);
        assert.equal(await page.locator("#statusTitle").innerText(), "No feasible dispatch");
        await page.locator("#curtailmentToggle").check();
        assert.match(await page.locator("#statusTitle").innerText(), /curtailment/);
        await page.locator("#fastToggle").check();
        assert.equal(await page.locator('[data-cell="206"]').innerText(), "REL");
        assert.equal(await page.locator('[data-cell="230"]').innerText(), "REL");
        assert.equal(await page.locator('[data-cell="254"]').innerText(), "·", "Demand response is not a fast-start generator");
        await page.locator("#fastToggle").uncheck();
        assert.equal(await page.locator('[data-cell="206"]').innerText(), "·");

        const emergencyScan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
        assert.equal(emergencyScan.violations.length, 0, JSON.stringify(emergencyScan.violations));

        await page.locator("#resetButton").click();
        await page.locator("#hourSlider").evaluate((input) => {
          input.value = "3";
          input.dispatchEvent(new Event("input", { bubbles: true }));
        });
        assert.equal(
          await page.locator("#metricVre").innerText(),
          "10.4 GW renewable availability",
          "Wind availability must respect nameplate capacity"
        );

        await page.locator("#resetButton").click();
        await page.locator('[data-stage="3"]').focus();
        await page.keyboard.press("Space");
        assert.match(await page.locator("#stageTitle").innerText(), /Real-time/);
        assert.equal(await page.locator("#playButton").getAttribute("aria-pressed"), "false");
        await page.locator("#stackCanvas").focus();
        for (let i = 0; i < 40; i++) await page.keyboard.press("Shift+ArrowUp");
        assert.equal(await page.locator("#demandSlider").inputValue(), "75");
        assert.equal(await page.locator("#metricPrice").innerText(), "—");
        await page.locator("#curtailmentToggle").check();
        assert.match(await page.locator("#statusTitle").innerText(), /curtailment/);

        await page.locator("#resetButton").click();
        await page.locator('[data-cell="14"]').focus();
        await page.keyboard.press("ArrowRight");
        assert.equal(await page.evaluate(() => document.activeElement.dataset.cell), "15");
        assert.match(await page.locator("#heatInfo").innerText(), /15:00/);
        await page.locator('[data-cell="23"]').focus();
        await page.keyboard.press("ArrowRight");
        assert.equal(await page.evaluate(() => document.activeElement.dataset.cell), "23");
        await page.locator('[data-cell="14"]').focus();

        await page.locator("#themeButton").click();
        assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
        await page.reload();
        assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
        await page.locator("#playButton").click();
        await page.waitForTimeout(1900);
        assert.equal(await page.locator("#hourSlider").inputValue(), "15");
        await page.locator("#playButton").click();
        assert.equal(await page.locator("#playButton").getAttribute("aria-pressed"), "false");
      }
      if (width === 390) {
        for (const stage of [1, 2, 3]) {
          await page.locator('[data-stage="' + stage + '"]').click();
          const stageScan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
          assert.equal(stageScan.violations.length, 0, JSON.stringify(stageScan.violations));
        }
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      }
      if (width === 320) {
        await page.locator('[data-scenario="shortage"]').click();
        await page.locator("#curtailmentToggle").check();
        for (const details of await page.locator("details").all())
          await details.evaluate((element) => {
            element.open = true;
          });
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        const expandedScan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
        assert.equal(expandedScan.violations.length, 0, JSON.stringify(expandedScan.violations));
      }
      assert.deepEqual(errors, []);
      await context.close();
    }
  }
  // Animated playback uses a separate path from reduced-motion playback.
  const motion = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
  const page = await motion.newPage();
  const motionErrors = [];
  page.on("pageerror", (error) => motionErrors.push(error.message));
  await page.goto(url);
  await page.locator('[data-scenario="congestion"]').click();
  await page.locator("#playButton").click();
  await page.waitForTimeout(1900);
  assert.equal(await page.locator("#hourSlider").inputValue(), "19");
  await page.locator("#demandSlider").evaluate((input) => {
    input.value = "50";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  assert.equal(await page.locator("#playButton").getAttribute("aria-pressed"), "false");
  const hour = await page.locator("#hourSlider").inputValue();
  await page.waitForTimeout(1900);
  assert.equal(await page.locator("#hourSlider").inputValue(), hour);
  assert.deepEqual(motionErrors, []);
  await motion.close();
  console.log("Dispatch states, outage selection, keyboard controls, saved themes, and both playback modes passed.");
} finally {
  if (artifactDir) await writeFile(resolve(artifactDir, "accessibility.json"), JSON.stringify(reports, null, 2));
  await browser?.close();
  await new Promise((done) => server.close(done));
}
