// Telestroke Trial Directory Builder
// One normalized directory model drives cards, the actual-table preview,
// embed code, image exports, and rich-email output.

const initialTrials = [
  {
    acronym: "SISTER",
    nctId: "NCT05948566",
    fullName: "Strategy for Improving Stroke Treatment Response",
    localPI: "",
    coordinator: "",
    email: "",
    phone: "",
    status: "Recruiting",
    hypothesis: "A Phase-2, prospective, randomized, placebo-controlled, blinded, dose-finding trial determining the safety and preliminary efficacy of TS23 (a monoclonal antibody against alpha-2-antiplasmin) in acute ischemic stroke.",
    eligibility: "Anterior circulation acute ischemic stroke\nWithin 4.5–24 hours of onset\nNIHSS ≥ 4\nASPECTS ≥ 6 on CT or ≥ 7 on MRI, with favorable perfusion mismatch/row profile",
    exclusions: "Received thrombolysis or EVT with clot engagement\nKnown stroke in past 90 days\nPre-stroke mRS > 2"
  },
  {
    acronym: "STEP-EVT",
    nctId: "NCT06289985",
    fullName: "StrokeNet Thrombectomy Endovascular Platform",
    localPI: "",
    coordinator: "",
    email: "",
    phone: "",
    status: "Recruiting",
    hypothesis: "Randomized, multifactorial, adaptive, platform trial optimizing care for AIS due to large- or medium-vessel occlusions (LVOs and MVOs).",
    eligibility: "Age ≥ 18, pre-stroke mRS 0–2, presentation ≤ 24 h, and qualifying imaging to puncture ≤ 2 h\nLVO population: complete occlusion of intracranial ICA or M1 MCA, with mild deficits (NIHSS 0–5)\nMVO population: non-dominant or co-dominant M2 and M3 MCA occlusions, with NIHSS ≥ 8",
    exclusions: "CT ASPECTS < 6 or MRI ASPECTS < 7\nAcute occlusions in multiple vascular territories or tandem occlusions"
  },
  {
    acronym: "MINUTE",
    nctId: "NCT07260916",
    fullName: "Minimally Invasive Neuroendoscopic Targeted ICH Evacuation",
    localPI: "",
    coordinator: "",
    email: "",
    phone: "",
    status: "Not yet recruiting",
    hypothesis: "Prospective, randomized trial evaluating the clinical utility of ultra-early SCUBA neuroendoscopic evacuation of basal-ganglia hemorrhages.",
    eligibility: "Age 18–80 with pre-ICH mRS 0–2\nNon-traumatic spontaneous basal-ganglia hemorrhage ≥ 20 mL\nRandomization ≤ 16 hours from LKW; anticipated surgery start < 120 minutes from randomization\nNIHSS ≥ 6; CTA/MRA without underlying vascular lesion",
    exclusions: "Suspected secondary cause, infratentorial/thalamic hemorrhage, or midbrain extension\nINR > 1.4, aPTT > 40 s, DOAC/LMWH use at onset, or platelet count < 100 × 10³/mm³\nGCS < 7, active infection, pregnancy, pre-existing DNR/DNI, or severe dementia"
  }
];

const STORAGE = {
  trials: "telestroke_trials_v10",
  options: "telestroke_builder_options_v11",
  layout: "telestroke_layout_preference",
  preview: "telestroke_mobile_preview_v11",
  editor: "telestroke_editor_section_v11"
};

const DEFAULT_COLUMN_MODES = {
  nct: "auto",
  hypothesis: "auto",
  eligibility: "auto",
  exclusions: "auto",
  localPI: "auto",
  coordinator: "auto",
  status: "auto"
};

const COLUMN_DEFS = [
  { key: "hypothesis", label: "Hypothesis / Summary", value: (trial) => trial.hypothesis },
  { key: "eligibility", label: "Eligibility", value: (trial) => trial.eligibility, list: true },
  { key: "exclusions", label: "Key Exclusions", value: (trial) => trial.exclusions, list: true },
  { key: "localPI", label: "Local PI", value: (trial) => trial.localPI },
  {
    key: "coordinator",
    label: "Research Coordinator",
    value: (trial) => [trial.coordinator, trial.email, trial.phone].filter(Boolean).join(" ")
  },
  { key: "status", label: "Status", value: (trial) => trial.status, status: true }
];

function readJSON(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch (_) {
    return fallback;
  }
}

function cloneInitialTrials() {
  return initialTrials.map((trial, index) => ({ ...trial, id: `trial_${index}` }));
}

const savedOptions = readJSON(STORAGE.options, {});
const loadedTrials = readJSON(STORAGE.trials, cloneInitialTrials());
const mobileMedia = window.matchMedia("(max-width: 1024px)");

const state = {
  trials: window.TrialState.hydrateTrials(loadedTrials, cloneInitialTrials),
  expandedId: null,
  previewMode: sessionStorage.getItem(STORAGE.preview) || "cards",
  options: {
    primaryColor: savedOptions.primaryColor || "#0f52ba",
    accentColor: savedOptions.accentColor || "#0d9488",
    fontSize: savedOptions.fontSize || "14",
    borderWidth: savedOptions.borderWidth || "1",
    columnModes: { ...DEFAULT_COLUMN_MODES, ...(savedOptions.columnModes || {}) }
  }
};

const trialsListContainer = document.getElementById("trials-list");
const btnAddTrial = document.getElementById("btn-add-trial");
const btnReset = document.getElementById("btn-reset");
const previewContainer = document.getElementById("preview-container");
const previewModeHelp = document.getElementById("preview-mode-help");
const codeBlock = document.getElementById("code-block");
const btnCopyCode = document.getElementById("btn-copy-code");
const btnToggleCode = document.getElementById("btn-toggle-code");
const embedStatus = document.getElementById("embed-status");
const trialCount = document.getElementById("trial-count");
const toast = document.getElementById("copied-toast");
const primaryColorInput = document.getElementById("primaryColor");
const accentColorInput = document.getElementById("accentColor");
const fontSizeInput = document.getElementById("fontSize");
const borderWidthInput = document.getElementById("borderWidth");
const columnControls = Array.from(document.querySelectorAll("[data-column]"));
const btnToggleLayout = document.getElementById("btn-toggle-layout");
const workspace = document.querySelector(".workspace");
const contentDisclosure = document.getElementById("editor-content");
const appearanceDisclosure = document.getElementById("editor-appearance");

let finalEmbedCode = "";
let currentModel = null;

function saveState() {
  localStorage.setItem(STORAGE.trials, JSON.stringify(state.trials));
  localStorage.setItem(STORAGE.options, JSON.stringify(state.options));
}

function generateId() {
  return `trial_${Math.random().toString(36).slice(2, 11)}`;
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[character]));
}

function splitLines(value) {
  return String(value || "").split("\n").map((item) => item.trim()).filter(Boolean);
}

function getStatusClass(status) {
  switch (String(status || "").toLowerCase()) {
    case "recruiting": return "status-recruiting";
    case "not yet recruiting":
    case "soon": return "status-not-recruiting";
    case "active, not recruiting": return "status-active-not-recruiting";
    case "suspended": return "status-suspended";
    case "completed": return "status-completed";
    default: return "";
  }
}

function getStatusBg(status) {
  const colors = {
    "recruiting": "hsl(145, 63%, 96%)",
    "not yet recruiting": "hsl(215, 82%, 96%)",
    "active, not recruiting": "hsl(38, 92%, 96%)",
    "suspended": "hsl(355, 78%, 97%)"
  };
  return colors[String(status || "").toLowerCase()] || "hsl(220, 16%, 95%)";
}

function getStatusTextCol(status) {
  const colors = {
    "recruiting": "hsl(145, 63%, 32%)",
    "not yet recruiting": "hsl(215, 82%, 38%)",
    "active, not recruiting": "hsl(38, 92%, 34%)",
    "suspended": "hsl(355, 78%, 42%)"
  };
  return colors[String(status || "").toLowerCase()] || "hsl(220, 16%, 36%)";
}

function hasColumnData(key) {
  if (key === "nct") return state.trials.some((trial) => String(trial.nctId || "").trim());
  const definition = COLUMN_DEFS.find((item) => item.key === key);
  return Boolean(definition && state.trials.some((trial) => String(definition.value(trial) || "").trim()));
}

function isColumnVisible(key) {
  const mode = state.options.columnModes[key] || "auto";
  if (mode === "shown") return true;
  if (mode === "hidden") return false;
  return hasColumnData(key);
}

function getDirectoryModel() {
  const visible = Object.fromEntries(
    Object.keys(DEFAULT_COLUMN_MODES).map((key) => [key, isColumnVisible(key)])
  );
  return {
    trials: state.trials.map((trial) => ({ ...trial })),
    visible,
    columns: COLUMN_DEFS.filter((definition) => visible[definition.key])
  };
}

function renderEditorList() {
  trialsListContainer.innerHTML = "";
  trialCount.textContent = `${state.trials.length} ${state.trials.length === 1 ? "trial" : "trials"}`;

  state.trials.forEach((trial) => {
    const cardId = trial.id;
    const isExpanded = state.expandedId === cardId;
    const card = document.createElement("article");
    card.className = `trial-card ${isExpanded ? "expanded active" : ""}`;
    card.dataset.id = cardId;
    card.innerHTML = `
      <button type="button" class="trial-card-header" aria-expanded="${isExpanded}" aria-controls="trial-panel-${cardId}" onclick="toggleExpand('${cardId}')">
        <span class="trial-title-wrapper">
          <span class="trial-acronym">${escapeHTML(trial.acronym || "UNNAMED")}</span>
          <span class="trial-nct">${escapeHTML(trial.nctId || "No NCT")}</span>
        </span>
        <span class="trial-card-controls">
          <span class="badge" style="background-color:${getStatusBg(trial.status)};color:${getStatusTextCol(trial.status)};border-color:transparent">${escapeHTML(trial.status || "Unknown")}</span>
          <svg class="chevron-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </span>
      </button>
      <div id="trial-panel-${cardId}" class="trial-card-body"${isExpanded ? "" : " hidden"}>
        <div class="form-row">
          <div class="form-control"><label for="acronym-${cardId}">Trial Acronym</label><input type="text" id="acronym-${cardId}" value="${escapeHTML(trial.acronym)}" oninput="updateField('${cardId}','acronym',this.value)"></div>
          <div class="form-control"><label for="nct-${cardId}">ClinicalTrials.gov NCT ID</label><input type="text" id="nct-${cardId}" value="${escapeHTML(trial.nctId)}" oninput="updateField('${cardId}','nctId',this.value)"></div>
        </div>
        <div class="form-control"><label for="fullName-${cardId}">Full Study Name</label><input type="text" id="fullName-${cardId}" value="${escapeHTML(trial.fullName)}" oninput="updateField('${cardId}','fullName',this.value)"></div>
        <div class="form-row">
          <div class="form-control"><label for="pi-${cardId}">Local Principal Investigator</label><input type="text" id="pi-${cardId}" value="${escapeHTML(trial.localPI)}" oninput="updateField('${cardId}','localPI',this.value)"></div>
          <div class="form-control"><label for="coord-${cardId}">Study Coordinator / Contact</label><input type="text" id="coord-${cardId}" value="${escapeHTML(trial.coordinator)}" oninput="updateField('${cardId}','coordinator',this.value)"></div>
        </div>
        <div class="form-row">
          <div class="form-control"><label for="email-${cardId}">Contact Email</label><input type="email" id="email-${cardId}" value="${escapeHTML(trial.email)}" oninput="updateField('${cardId}','email',this.value)"></div>
          <div class="form-control"><label for="phone-${cardId}">Contact Phone</label><input type="tel" id="phone-${cardId}" value="${escapeHTML(trial.phone)}" oninput="updateField('${cardId}','phone',this.value)"></div>
        </div>
        <div class="form-control">
          <label for="status-${cardId}">Local Recruitment Status</label>
          <select id="status-${cardId}" onchange="updateField('${cardId}','status',this.value)">
            ${["Recruiting", "Not yet recruiting", "Active, not recruiting", "Suspended", "Completed"].map((status) => `<option value="${status}"${trial.status === status ? " selected" : ""}>${status}</option>`).join("")}
          </select>
        </div>
        <div class="form-control"><label for="hypothesis-${cardId}">Hypothesis / Summary</label><textarea id="hypothesis-${cardId}" oninput="updateField('${cardId}','hypothesis',this.value)" rows="3">${escapeHTML(trial.hypothesis)}</textarea></div>
        <div class="form-control"><label for="eligibility-${cardId}">Eligibility Criteria (one per line)</label><textarea id="eligibility-${cardId}" oninput="updateField('${cardId}','eligibility',this.value)" rows="4">${escapeHTML(trial.eligibility)}</textarea></div>
        <div class="form-control"><label for="exclusions-${cardId}">Key Exclusions (one per line)</label><textarea id="exclusions-${cardId}" oninput="updateField('${cardId}','exclusions',this.value)" rows="4">${escapeHTML(trial.exclusions)}</textarea></div>
        <div class="trial-remove-row"><button type="button" class="btn btn-danger btn-sm" onclick="removeTrial('${cardId}')">Remove Trial</button></div>
      </div>`;
    trialsListContainer.appendChild(card);
  });
}

window.toggleExpand = function toggleExpand(id) {
  state.expandedId = state.expandedId === id ? null : id;
  renderEditorList();
  requestAnimationFrame(() => {
    trialsListContainer.querySelector(`[data-id="${CSS.escape(id)}"] .trial-card-header`)?.focus();
  });
};

window.updateField = function updateField(id, field, value) {
  const trial = state.trials.find((item) => item.id === id);
  if (!trial) return;
  trial[field] = value;
  saveState();
  renderOutputs();
};

window.removeTrial = function removeTrial(id) {
  state.trials = state.trials.filter((item) => item.id !== id);
  if (state.expandedId === id) state.expandedId = null;
  saveState();
  renderEditorList();
  renderOutputs();
};

function renderLines(value) {
  const items = splitLines(value);
  if (!items.length) return "—";
  if (items.length === 1) return escapeHTML(items[0]);
  return `<ul>${items.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>`;
}

function renderCoordinator(trial) {
  const parts = [];
  if (trial.coordinator) parts.push(`<strong>${escapeHTML(trial.coordinator)}</strong>`);
  if (trial.email) parts.push(`<a href="mailto:${escapeHTML(trial.email)}" class="trial-link">${escapeHTML(trial.email)}</a>`);
  if (trial.phone) parts.push(`<a href="tel:${escapeHTML(trial.phone)}" class="trial-link">${escapeHTML(trial.phone)}</a>`);
  return parts.length ? parts.map((item) => `<div class="contact-item">${item}</div>`).join("") : "—";
}

function renderCell(trial, definition) {
  if (definition.key === "coordinator") return renderCoordinator(trial);
  if (definition.status) return `<span class="status-pill ${getStatusClass(trial.status)}">${escapeHTML(trial.status || "Unknown")}</span>`;
  if (definition.list) return renderLines(definition.value(trial));
  return escapeHTML(definition.value(trial) || "—");
}

function buildTableMarkup(model) {
  const headers = [`<th scope="col">Study</th>`, ...model.columns.map((column) => `<th scope="col">${column.label}</th>`)].join("");
  const rows = model.trials.map((trial) => {
    const study = `
      <td>
        <span class="trial-badge-acronym">${escapeHTML(trial.acronym || "Unnamed")}</span>
        ${trial.fullName ? `<span class="trial-full-name">${escapeHTML(trial.fullName)}</span>` : ""}
        ${model.visible.nct && trial.nctId ? `<a href="https://clinicaltrials.gov/study/${escapeHTML(trial.nctId)}" target="_blank" rel="noopener noreferrer" class="trial-badge-nct trial-link">${escapeHTML(trial.nctId)}</a>` : ""}
      </td>`;
    return `<tr>${study}${model.columns.map((column) => `<td>${renderCell(trial, column)}</td>`).join("")}</tr>`;
  }).join("");
  return `<div class="telestroke-trials-wrapper"><div class="telestroke-table-container" tabindex="0" role="region" aria-label="Scrollable acute stroke trials table"><table class="telestroke-table" aria-label="Acute stroke trials directory"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div></div>`;
}

function buildCardMarkup(model) {
  return `<div class="directory-card-list" aria-label="Acute stroke trials card preview">${model.trials.map((trial) => `
    <article class="directory-preview-card">
      <header>
        <div><strong>${escapeHTML(trial.acronym || "Unnamed")}</strong>${trial.fullName ? `<span>${escapeHTML(trial.fullName)}</span>` : ""}</div>
        ${model.visible.status ? `<span class="status-pill ${getStatusClass(trial.status)}">${escapeHTML(trial.status || "Unknown")}</span>` : ""}
      </header>
      ${model.visible.nct && trial.nctId ? `<a class="trial-link card-nct" href="https://clinicaltrials.gov/study/${escapeHTML(trial.nctId)}" target="_blank" rel="noopener noreferrer">${escapeHTML(trial.nctId)}</a>` : ""}
      <dl>
        ${model.columns.filter((column) => column.key !== "status").map((column) => `<div><dt>${column.label}</dt><dd>${renderCell(trial, column)}</dd></div>`).join("")}
      </dl>
    </article>`).join("")}</div>`;
}

function buildEmbedStyles() {
  const opt = state.options;
  return `<style>
.telestroke-trials-wrapper{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;margin:1.5rem 0;width:100%;color:#1e293b}
.telestroke-table-container{overflow-x:auto;border:${opt.borderWidth}px solid #e2e8f0;border-radius:10px;background:#fff;box-shadow:0 1px 3px rgba(15,23,42,.08);scrollbar-gutter:stable}
.telestroke-table{width:100%;min-width:760px;border-collapse:separate;border-spacing:0;text-align:left;font-size:${opt.fontSize}px}
.telestroke-table th{position:sticky;top:0;background:${opt.primaryColor};color:#fff;font-weight:650;padding:11px 14px;border-bottom:2px solid #cbd5e1;z-index:2}
.telestroke-table td{padding:13px 14px;border-bottom:1px solid #e2e8f0;vertical-align:top;background:#fff}
.telestroke-table th:first-child,.telestroke-table td:first-child{position:sticky;left:0;min-width:180px;z-index:3}
.telestroke-table th:first-child{background:${opt.primaryColor};z-index:4}.telestroke-table tr:last-child td{border-bottom:0}
.telestroke-table tr:hover td{background:#f8fafc}.telestroke-table tr:hover td:first-child{background:#f8fafc}
.trial-badge-acronym{display:block;font-weight:750;color:${opt.primaryColor};font-size:1.08em}.trial-full-name{display:block;margin-top:3px;color:#334155;font-size:.9em;line-height:1.3}
.trial-badge-nct{display:inline-block;margin-top:6px;font:600 .82em ui-monospace,SFMono-Regular,Menlo,monospace}.trial-link{color:${opt.accentColor};text-decoration:underline;text-underline-offset:2px}
.status-pill{display:inline-block;padding:4px 8px;border-radius:9999px;font-size:.75em;font-weight:700;text-transform:uppercase;letter-spacing:.03em}
.status-recruiting{background:#dcfce7;color:#166534}.status-not-recruiting{background:#dbeafe;color:#1e40af}.status-active-not-recruiting{background:#fef3c7;color:#92400e}.status-suspended{background:#fee2e2;color:#991b1b}.status-completed{background:#f1f5f9;color:#475569}
.contact-item{margin-bottom:5px}.contact-item:last-child{margin-bottom:0}.telestroke-table ul{margin:0;padding-left:18px}.telestroke-table li+li{margin-top:4px}
</style>`;
}

function renderOutputs() {
  currentModel = getDirectoryModel();
  const tableMarkup = buildTableMarkup(currentModel);
  finalEmbedCode = `${buildEmbedStyles()}${tableMarkup}`;
  codeBlock.textContent = finalEmbedCode.trim();
  const columnCount = 1 + currentModel.columns.length;
  embedStatus.textContent = `Generated from ${currentModel.trials.length} ${currentModel.trials.length === 1 ? "trial" : "trials"} · ${columnCount} visible ${columnCount === 1 ? "column" : "columns"}`;
  trialCount.textContent = `${currentModel.trials.length} ${currentModel.trials.length === 1 ? "trial" : "trials"}`;

  const mode = mobileMedia.matches ? state.previewMode : "table";
  previewContainer.dataset.previewMode = mode;
  if (mode === "cards") {
    previewContainer.innerHTML = `<span class="preview-badge">Card Preview</span>${buildCardMarkup(currentModel)}`;
    previewModeHelp.textContent = `Card preview · ${columnCount} visible columns represented · switch to Actual table for the WYSIWYG embed.`;
  } else {
    previewContainer.innerHTML = `<span class="preview-badge">Actual Table</span><p class="scroll-cue">Swipe or scroll horizontally to inspect every visible column.</p>${finalEmbedCode}`;
    previewModeHelp.textContent = `Actual-table preview · ${columnCount} visible columns · sticky Study column.`;
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.style.display = "block";
  window.setTimeout(() => { toast.style.display = "none"; }, 2600);
}

btnAddTrial.addEventListener("click", () => {
  const id = generateId();
  state.trials.push({
    id,
    acronym: "NEW-TRIAL",
    nctId: "",
    fullName: "",
    localPI: "",
    coordinator: "",
    email: "",
    phone: "",
    status: "Recruiting",
    hypothesis: "",
    eligibility: "",
    exclusions: ""
  });
  state.expandedId = id;
  saveState();
  renderEditorList();
  renderOutputs();
  requestAnimationFrame(() => {
    trialsListContainer.querySelector(`[data-id="${CSS.escape(id)}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
});

btnReset.addEventListener("click", () => {
  if (!window.confirm("Reset the directory to the default acute stroke trials? Your current edits will be replaced.")) return;
  state.trials = cloneInitialTrials();
  state.expandedId = null;
  saveState();
  renderEditorList();
  renderOutputs();
  showToast("Defaults restored.");
});

[
  [primaryColorInput, "primaryColor"],
  [accentColorInput, "accentColor"],
  [fontSizeInput, "fontSize"],
  [borderWidthInput, "borderWidth"]
].forEach(([element, key]) => {
  element.value = state.options[key];
  element.addEventListener("input", () => {
    state.options[key] = element.value;
    saveState();
    renderOutputs();
  });
});

columnControls.forEach((select) => {
  const key = select.dataset.column;
  select.value = state.options.columnModes[key] || "auto";
  select.addEventListener("change", () => {
    state.options.columnModes[key] = select.value;
    saveState();
    renderOutputs();
  });
});

btnToggleCode.addEventListener("click", () => {
  const expanded = btnToggleCode.getAttribute("aria-expanded") === "true";
  btnToggleCode.setAttribute("aria-expanded", String(!expanded));
  btnToggleCode.textContent = expanded ? "Expand" : "Collapse";
  codeBlock.hidden = expanded;
  document.querySelector(".code-container")?.classList.toggle("is-collapsed", expanded);
  if (!expanded) codeBlock.focus();
});

btnCopyCode.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(finalEmbedCode);
    showToast("Current embed code copied.");
  } catch (error) {
    window.alert(`Could not copy code: ${error}`);
  }
});

function updateDisclosureState() {
  [contentDisclosure, appearanceDisclosure].forEach((details) => {
    const label = details.querySelector(".disclosure-state");
    if (label) label.textContent = details.open ? "Open" : "Closed";
  });
}

const savedEditorSection = sessionStorage.getItem(STORAGE.editor);
if (savedEditorSection === "appearance") {
  contentDisclosure.open = false;
  appearanceDisclosure.open = true;
}

[contentDisclosure, appearanceDisclosure].forEach((details) => {
  details.addEventListener("toggle", () => {
    if (!details.open) {
      updateDisclosureState();
      return;
    }
    const other = details === contentDisclosure ? appearanceDisclosure : contentDisclosure;
    other.open = false;
    sessionStorage.setItem(STORAGE.editor, details === contentDisclosure ? "content" : "appearance");
    updateDisclosureState();
  });
});
updateDisclosureState();

function updateLayoutButton() {
  const label = btnToggleLayout.querySelector("span");
  const icon = btnToggleLayout.querySelector(".layout-icon");
  if (mobileMedia.matches) {
    const cardsActive = state.previewMode === "cards";
    label.textContent = cardsActive ? "Actual Table" : "Card Preview";
    btnToggleLayout.title = cardsActive ? "Show the WYSIWYG table preview" : "Show the mobile card preview";
    btnToggleLayout.setAttribute("aria-label", btnToggleLayout.title);
    icon.innerHTML = cardsActive
      ? `<rect x="3" y="4" width="18" height="16" rx="2"></rect><line x1="3" y1="10" x2="21" y2="10"></line><line x1="9" y1="4" x2="9" y2="20"></line>`
      : `<rect x="4" y="3" width="16" height="7" rx="2"></rect><rect x="4" y="14" width="16" height="7" rx="2"></rect>`;
  } else {
    const stacked = workspace.classList.contains("stacked-layout");
    label.textContent = stacked ? "Split View" : "Stacked View";
    btnToggleLayout.title = stacked ? "Show editor and preview side by side" : "Stack editor and preview vertically";
    btnToggleLayout.setAttribute("aria-label", btnToggleLayout.title);
    icon.innerHTML = stacked
      ? `<rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="12" y1="3" x2="12" y2="21"></line>`
      : `<rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="12" x2="21" y2="12"></line>`;
  }
}

btnToggleLayout.addEventListener("click", () => {
  if (mobileMedia.matches) {
    state.previewMode = state.previewMode === "cards" ? "table" : "cards";
    sessionStorage.setItem(STORAGE.preview, state.previewMode);
    renderOutputs();
  } else {
    workspace.classList.toggle("stacked-layout");
    localStorage.setItem(STORAGE.layout, workspace.classList.contains("stacked-layout") ? "stacked" : "split");
  }
  updateLayoutButton();
});

mobileMedia.addEventListener("change", () => {
  renderOutputs();
  updateLayoutButton();
});

if (localStorage.getItem(STORAGE.layout) === "stacked") workspace.classList.add("stacked-layout");

function createCaptureSource() {
  const host = document.createElement("div");
  host.className = "export-capture-source";
  host.innerHTML = finalEmbedCode;
  document.body.appendChild(host);
  const wrapper = host.querySelector(".telestroke-trials-wrapper");
  wrapper.style.width = "1200px";
  wrapper.style.margin = "0";
  wrapper.style.padding = "20px";
  wrapper.style.background = "#ffffff";
  wrapper.querySelector(".telestroke-table-container").style.overflow = "visible";
  return { host, wrapper };
}

async function captureTable() {
  if (typeof window.html2canvas !== "function") throw new Error("Image export is still loading. Try again in a moment.");
  const { host, wrapper } = createCaptureSource();
  try {
    return await window.html2canvas(wrapper, { useCORS: true, scale: 2, backgroundColor: "#ffffff" });
  } finally {
    host.remove();
  }
}

document.getElementById("btn-download-image").addEventListener("click", async () => {
  try {
    const canvas = await captureTable();
    const link = document.createElement("a");
    link.download = "telestroke-acute-trials-table.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (error) {
    window.alert(`Error generating image: ${error}`);
  }
});

document.getElementById("btn-copy-image").addEventListener("click", async () => {
  try {
    const canvas = await captureTable();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("The image could not be generated.");
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    showToast("Current table image copied.");
  } catch (error) {
    window.alert(`Failed to copy image: ${error}`);
  }
});

function inlineCell(trial, definition, colors) {
  if (definition.key === "coordinator") {
    const parts = [];
    if (trial.coordinator) parts.push(`<strong>${escapeHTML(trial.coordinator)}</strong>`);
    if (trial.email) parts.push(`<a href="mailto:${escapeHTML(trial.email)}" style="color:${colors.accent}">${escapeHTML(trial.email)}</a>`);
    if (trial.phone) parts.push(`<a href="tel:${escapeHTML(trial.phone)}" style="color:${colors.accent}">${escapeHTML(trial.phone)}</a>`);
    return parts.length ? parts.join("<br>") : "—";
  }
  if (definition.list) {
    const items = splitLines(definition.value(trial));
    return items.length > 1 ? `<ul style="margin:0;padding-left:18px">${items.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>` : escapeHTML(items[0] || "—");
  }
  if (definition.status) return escapeHTML(trial.status || "Unknown");
  return escapeHTML(definition.value(trial) || "—");
}

function buildEmailOutput(model) {
  const opt = state.options;
  const th = `background:${opt.primaryColor};color:#fff;font-weight:700;padding:10px 12px;border:1px solid #cbd5e1;text-align:left;`;
  const td = `padding:11px 12px;border:1px solid #e2e8f0;vertical-align:top;`;
  const head = [`<th scope="col" style="${th}">Study</th>`, ...model.columns.map((column) => `<th scope="col" style="${th}">${column.label}</th>`)].join("");
  const rows = model.trials.map((trial) => {
    const study = `<strong style="color:${opt.primaryColor}">${escapeHTML(trial.acronym || "Unnamed")}</strong>${trial.fullName ? `<br><span>${escapeHTML(trial.fullName)}</span>` : ""}${model.visible.nct && trial.nctId ? `<br><a href="https://clinicaltrials.gov/study/${escapeHTML(trial.nctId)}" style="color:${opt.accentColor}">${escapeHTML(trial.nctId)}</a>` : ""}`;
    return `<tr><td style="${td}">${study}</td>${model.columns.map((column) => `<td style="${td}">${inlineCell(trial, column, { accent: opt.accentColor })}</td>`).join("")}</tr>`;
  }).join("");
  const html = `<table style="width:100%;border-collapse:collapse;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:${opt.fontSize}px;color:#1e293b"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
  const text = model.trials.map((trial) => {
    const lines = [`${trial.acronym || "Unnamed"}${model.visible.nct && trial.nctId ? ` (${trial.nctId})` : ""}`];
    model.columns.forEach((column) => lines.push(`${column.label}: ${column.value(trial) || "—"}`));
    return lines.join("\n");
  }).join("\n\n");
  return { html, text };
}

document.getElementById("btn-copy-email").addEventListener("click", async () => {
  try {
    const output = buildEmailOutput(getDirectoryModel());
    if (typeof ClipboardItem === "function" && navigator.clipboard.write) {
      await navigator.clipboard.write([new ClipboardItem({
        "text/html": new Blob([output.html], { type: "text/html" }),
        "text/plain": new Blob([output.text], { type: "text/plain" })
      })]);
    } else {
      await navigator.clipboard.writeText(output.text);
    }
    showToast("Current directory copied for email.");
  } catch (error) {
    window.alert(`Failed to copy table for email: ${error}`);
  }
});

renderEditorList();
renderOutputs();
updateLayoutButton();
