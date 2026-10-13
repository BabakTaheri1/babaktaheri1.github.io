const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const vm = require("node:vm");

const html = readFileSync(resolve(__dirname, "../code/grid-ops-architecture.html"), "utf8");
const script = html.match(/<script id="grid-model">\s*([\s\S]*?)<\/script>/)[1];
const context = {};
vm.createContext(context);
vm.runInContext(script + "\nglobalThis.model = GridOpsModel;", context);
const model = context.model;
const close = (actual, expected, tolerance = 1e-6) => assert(Math.abs(actual - expected) <= tolerance, actual + " does not match " + expected);
const sum = (values) => values.reduce((a, b) => a + b, 0);

// Independent small LPs cover both phases, negative RHS, and bounds.
close(model.simplexLE([1], [[-1], [1]], [-2, 3]).x[0], 2);
assert.equal(model.simplexLE([1], [[-1], [1]], [-2, 1]).status, "infeasible");
assert.equal(model.simplexLE([-1], [[-1]], [0]).status, "unbounded");
const simple = model.simplexLE(
  [3, 1],
  [
    [-1, -1],
    [1, 0],
    [0, 1],
  ],
  [-4, 3, 2]
);
close(simple.x[0], 2);
close(simple.x[1], 2);

let cases = 0;
for (const mode of ["da", "iruc", "se", "rt"]) {
  for (let hour = 0; hour < 24; hour++) {
    for (const demand of [undefined, 20, 45, 58, 75]) {
      for (const contingency of [false, true]) {
        for (const curtailment of [false, true]) {
          for (const fastStart of mode === "rt" ? [false, true] : [false]) {
            const result = model.solveDispatch({ mode, hour, demand, contingency, curtailment, fastStart });
            cases++;
            if (result.status !== "optimal") {
              assert.equal(result.status, "infeasible");
              for (const key of ["prices", "lambda", "flows", "objective", "cost", "headroom", "curtailment"]) {
                assert.equal(result[key], null, "Infeasible " + mode + "/" + hour + " exposes " + key);
              }
              assert(result.resources.every((r) => r.accepted === null));
              assert(result.reason.length > 0);
              continue;
            }
            assert(result.prices && Object.values(result.prices).every(Number.isFinite));
            close(sum(result.resources.map((r) => r.accepted)), result.demand);
            close(sum(result.injection), 0);
            close(result.cost, result.objective * 1000);
            for (const resource of result.resources) {
              assert(resource.accepted >= resource.lo - 1e-6);
              assert(resource.accepted <= resource.hi + 1e-6);
            }
            assert(result.curtailment >= -1e-6);
            if (!curtailment) close(result.curtailment, 0);
            result.flows.forEach((flows, network) => {
              const outage = model.networkCases[network].outage;
              model.branches.forEach((line, i) => {
                if (i === outage) close(flows[i], 0);
                else assert(Math.abs(flows[i]) <= line.limit + 1e-6);
              });
              // Kirchhoff's current law at each bus, independent of PTDF construction.
              model.buses.forEach((bus, index) => {
                const outward = sum(model.branches.map((line, i) => (line.a === bus.id ? flows[i] : line.b === bus.id ? -flows[i] : 0)));
                close(outward, result.injection[index]);
              });
              // Voltage-drop sum on an intact cycle (DC Kirchhoff voltage law).
              const cycle =
                network === 0
                  ? [
                      [1, 1],
                      [3, 1],
                      [6, -1],
                      [2, -1],
                    ]
                  : [
                      [1, 1],
                      [3, 1],
                      [5, 1],
                      [4, -1],
                      [2, -1],
                    ];
              close(sum(cycle.map(([line, direction]) => direction * model.branches[line].x * flows[line])), 0);
            });
          }
        }
      }
    }
  }
}

// Prices must match a numerical change in cost for additional demand at each bus.
for (const contingency of [false, true]) {
  const options = { mode: "rt", hour: 18, contingency };
  const base = model.solveDispatch(options);
  assert.equal(base.status, "optimal");
  assert(base.binding.length > 0);
  for (const bus of model.buses) {
    const epsilon = 1e-4;
    const loads = Object.fromEntries(model.buses.map((b) => [b.id, model.shares[b.id] * base.demand]));
    loads[bus.id] += epsilon;
    const extra = model.solveDispatch({ ...options, loads });
    assert.equal(extra.status, "optimal");
    close(base.prices[bus.id], (extra.objective - base.objective) / epsilon, 1e-4);
  }
}

// Adding a contingency cannot make the same dispatch problem cheaper.
// The prior base point is held fixed when switching the security check.
for (const mode of ["da", "iruc", "rt"]) {
  for (let hour = 0; hour < 24; hour++) {
    const base = model.solveDispatch({ mode, hour, contingency: false });
    const secure = model.solveDispatch({ mode, hour, contingency: true });
    if (secure.status === "optimal") {
      assert.equal(base.status, "optimal");
      assert(secure.objective >= base.objective - 1e-6);
    }
  }
}

const low = model.solveDispatch({ mode: "rt", hour: 14, demand: 20 });
assert.equal(low.status, "infeasible");
assert.match(low.reason, /Minimum output/);
const short = model.solveDispatch({ mode: "rt", hour: 14, demand: 75 });
assert.equal(short.status, "infeasible");
const emergency = model.solveDispatch({ mode: "rt", hour: 14, demand: 75, curtailment: true });
assert.equal(emergency.status, "optimal");
assert(emergency.curtailment > 0);
assert(emergency.prices.M > 500);

// The day-ahead stack uses forecast wind; later processes use revised availability.
const da = model.solveDispatch({ mode: "da", hour: 18 });
const intraday = model.solveDispatch({ mode: "iruc", hour: 18 });
assert(da.resources.find((r) => r.id === "wind").hi > intraday.resources.find((r) => r.id === "wind").hi);
assert.equal(model.scheduled(model.units[0], -1, "da"), true);

console.log(
  cases + " grid-operations cases passed balance, bounds, base/outage flow, and infeasibility checks; nodal prices match cost sensitivities."
);
