const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const vm = require("node:vm");

function loadApp(name) {
  const html = readFileSync(resolve(__dirname, `../code/${name}.html`), "utf8");
  const script = html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
  const context = { window: { matchMedia: () => ({ matches: false }) } };
  vm.createContext(context);
  vm.runInContext(script.replace("App.init();", "globalThis.app = App;"), context);
  return context.app;
}

const grid = loadApp("BraessParadox");
let cases = 0;
for (let load = 100; load <= 900; load += 10) {
  for (let g1Max = 100; g1Max <= 900; g1Max += 100) {
    for (let tieLimit = 20; tieLimit <= 260; tieLimit += 10) {
      const result = grid.calcGrid({ load, g1Max, tieLimit, g1Cost: 10, g2Cost: 75 });
      // Independently eliminating the junction angle gives
      // F(G2→J) = (Load − 2P1) / 2.2 for this four-bus network.
      const lower = Math.max(0, (load - 2.2 * tieLimit) / 2);
      const upper = Math.min(load, g1Max, (load + 2.2 * tieLimit) / 2);
      const feasible = lower <= upper;
      assert.equal(result.connected.feasible, feasible);
      assert.equal(result.removed.feasible, true);
      if (feasible) {
        assert(Math.abs(result.connected.p1 - upper) < 1e-6);
        assert(result.connected.violation < 1e-6);
        assert(Math.abs(result.connected.p1 + result.connected.p2 - load) < 1e-6);
      } else {
        assert.equal(result.connected.cost, null);
        assert.equal(result.savings, null);
      }
      cases++;
    }
  }
}

const classic = grid.calcGrid({ load: 500, g1Max: 500, tieLimit: 100, g1Cost: 10, g2Cost: 75 });
assert(Math.abs(classic.savings - 9100) < 1e-6);

const truck = loadApp("ReactiveTruck");
truck.dom = { powerSlider: { value: 80 }, loadSlider: { value: 38 }, correctionSlider: { value: 0 } };
const uncompensated = truck.calc();
truck.dom.correctionSlider.value = -uncompensated.Ql;
const corrected = truck.calc();
assert.equal(corrected.P, uncompensated.P);
assert(Math.abs(corrected.PF - 1) < 1e-12);
assert(Math.abs(corrected.A - 96.22504486493763) < 1e-8);
assert(corrected.A < uncompensated.A);
truck.dom.correctionSlider.value = -2 * uncompensated.Ql;
const overcorrected = truck.calc();
assert.equal(overcorrected.kind, "leading");
assert(Math.abs(overcorrected.A - uncompensated.A) < 1e-8);

console.log(`${cases} grid dispatch cases and fixed-load power factor correction checks passed.`);
