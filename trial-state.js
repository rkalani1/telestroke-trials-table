(function exposeTrialState(root) {
  "use strict";

  function hydrateTrials(loadedTrials, fallbackFactory) {
    const trials = Array.isArray(loadedTrials) ? loadedTrials : fallbackFactory();
    return trials.map((trial, index) => ({ ...trial, id: trial.id || `trial_${index}` }));
  }

  const api = { hydrateTrials };
  root.TrialState = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
