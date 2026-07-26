const test = require("node:test");
const assert = require("node:assert/strict");
require("../trial-state.js");
const { hydrateTrials } = globalThis.TrialState;

test("a deliberately persisted empty directory remains empty", () => {
  let fallbackCalls = 0;
  const hydrated = hydrateTrials([], () => {
    fallbackCalls += 1;
    return [{ acronym: "DEFAULT" }];
  });

  assert.deepEqual(hydrated, []);
  assert.equal(fallbackCalls, 0);
});

test("missing or invalid persisted data uses normalized defaults", () => {
  const hydrated = hydrateTrials(null, () => [{ acronym: "SISTER" }]);
  assert.deepEqual(hydrated, [{ acronym: "SISTER", id: "trial_0" }]);
});
