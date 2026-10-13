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

// An independent 2D vertex-enumeration oracle checks the simplex objective.
// These bounded, feasible LPs include negative costs/RHS and degenerate rows.
let seed = 20261012;
const random = () => {
  seed = (1664525 * seed + 1013904223) >>> 0;
  return seed / 4294967296;
};
function vertexMinimum(c, a, b) {
  const rows = [...a, [-1, 0], [0, -1]],
    rhs = [...b, 0, 0];
  let minimum = Infinity;
  for (let i = 0; i < rows.length; i++)
    for (let j = i + 1; j < rows.length; j++) {
      const determinant = rows[i][0] * rows[j][1] - rows[i][1] * rows[j][0];
      if (Math.abs(determinant) < 1e-10) continue;
      const x = [(rhs[i] * rows[j][1] - rows[i][1] * rhs[j]) / determinant, (rows[i][0] * rhs[j] - rhs[i] * rows[j][0]) / determinant];
      if (rows.every((row, k) => row[0] * x[0] + row[1] * x[1] <= rhs[k] + 1e-7)) minimum = Math.min(minimum, c[0] * x[0] + c[1] * x[1]);
    }
  return minimum;
}
for (let test = 0; test < 128; test++) {
  const anchor = [0.5 + random() * 3, 0.5 + random() * 3];
  const c = [Math.floor(random() * 16) - 6, Math.floor(random() * 16) - 6];
  const a = [
      [1, 0],
      [0, 1],
    ],
    b = [5, 5];
  for (let row = 0; row < 6; row++) {
    const coefficients = [Math.floor(random() * 9) - 4, Math.floor(random() * 9) - 4];
    a.push(coefficients);
    b.push(coefficients[0] * anchor[0] + coefficients[1] * anchor[1] + (row % 3 === 0 ? 0 : random() * 2));
  }
  const result = model.simplexLE(c, a, b);
  assert.equal(result.status, "optimal", "Independent LP " + test);
  const primal = sum(c.map((cost, j) => cost * result.x[j]));
  close(primal, vertexMinimum(c, a, b));
  close(primal, sum(b.map((rhs, i) => rhs * result.dual[i])));
  result.dual.forEach((dual, i) => {
    assert(dual <= 1e-7);
    close(dual * (b[i] - sum(a[i].map((v, j) => v * result.x[j]))), 0);
  });
  c.forEach((cost, j) => assert(cost - sum(a.map((row, i) => row[j] * result.dual[i])) >= -1e-7));
}

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
              // Independent stationarity/complementarity checks at each bus.
              const marginal = result.prices[resource.bus];
              if (resource.hi - resource.lo > 1e-6) {
                if (resource.accepted > resource.lo + 1e-6) assert(marginal >= resource.cost - 1e-6);
                if (resource.accepted < resource.hi - 1e-6) assert(marginal <= resource.cost + 1e-6);
              }
              if (resource.shed) assert(resource.accepted <= result.loads[resource.bus] + 1e-6);
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

// At a kink, a valid LP dual lies between the backward and forward cost slopes.
// Hold commitment, wind, prior dispatch and ramps fixed for each perturbation.
let sensitivityChecks = 0;
for (const mode of ["da", "iruc", "rt"])
  for (const hour of [0, 6, 14, 18, 22]) {
    for (const contingency of [false, true])
      for (const curtailment of [false, true]) {
        const options = { mode, hour, contingency, curtailment, demand: curtailment ? 75 : undefined };
        const base = model.solveDispatch(options);
        if (base.status !== "optimal") continue;
        for (const bus of model.buses) {
          const epsilon = 1e-4;
          const more = model.solveDispatch({ ...options, loads: { ...base.loads, [bus.id]: base.loads[bus.id] + epsilon } });
          const less = model.solveDispatch({ ...options, loads: { ...base.loads, [bus.id]: base.loads[bus.id] - epsilon } });
          assert.equal(more.status, "optimal");
          assert.equal(less.status, "optimal");
          const forward = (more.objective - base.objective) / epsilon;
          const backward = (base.objective - less.objective) / epsilon;
          assert(
            base.prices[bus.id] >= backward - 1e-4 && base.prices[bus.id] <= forward + 1e-4,
            "Invalid sensitivity at " + mode + "/" + hour + "/" + bus.id
          );
          sensitivityChecks++;
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
const released = model.solveDispatch({ mode: "rt", hour: 14, demand: 75, curtailment: true, fastStart: true });
assert(released.resources.some((r) => r.id === "ctEast" && r.entering));
assert(!released.resources.some((r) => r.id === "dr"), "Releasing fast-start generation must not activate unscheduled demand response");

// A failed numerical certificate is not proof that the physical case is infeasible.
const faultyScript = script.replace("const solved = simplexLE(costs, a, b);", 'const solved = { status: "numerical-error" };');
assert.notEqual(faultyScript, script);
const faultyContext = {};
vm.createContext(faultyContext);
vm.runInContext(faultyScript + "\nglobalThis.model = GridOpsModel;", faultyContext);
const solverFailure = faultyContext.model.solveDispatch();
assert.equal(solverFailure.status, "solver-error");
for (const key of ["prices", "lambda", "flows", "objective", "cost", "headroom", "curtailment"]) assert.equal(solverFailure[key], null);
assert(solverFailure.resources.every((r) => r.accepted === null));

// The day-ahead stack uses forecast wind; later processes use revised availability.
const da = model.solveDispatch({ mode: "da", hour: 18 });
const intraday = model.solveDispatch({ mode: "iruc", hour: 18 });
assert(da.resources.find((r) => r.id === "wind").hi > intraday.resources.find((r) => r.id === "wind").hi);
assert.equal(model.scheduled(model.units[0], -1, "da"), true);

console.log(
  cases +
    " dispatch cases, 128 independent LP comparisons, and " +
    sensitivityChecks +
    " nodal sensitivities passed physics, optimality and failure checks."
);
