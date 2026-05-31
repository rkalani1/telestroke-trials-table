// app.js

// Initial pre-filled trial data from ClinicalTrials.gov and local verification
const initialTrials = [
  {
    acronym: "SISTER",
    nctId: "NCT05948566",
    fullName: "Strategy for Improving Stroke Treatment Response",
    localPI: "David Tirschwell, MD, MSc",
    coordinator: "HMC Stroke Research Coordinator",
    email: "tirsch@uw.edu",
    phone: "206-744-3000",
    status: "Recruiting",
    notes: "TS23 (anti-alpha-2-antiplasmin) for late thrombolysis (4.5-24h). Exclusion: prior lytics/EVT."
  },
  {
    acronym: "STEP-EVT",
    nctId: "NCT06289985",
    fullName: "StrokeNet Thrombectomy Endovascular Platform",
    localPI: "HMC Stroke Neurology Service",
    coordinator: "Stroke Research Coordinator",
    email: "elmj@musc.edu",
    phone: "843-876-1605",
    status: "Recruiting",
    notes: "Adaptive platform optimizing EVT for low NIHSS LVO (0-5 + ICA/M1) or MeVO (NIHSS >=8)."
  },
  {
    acronym: "PICASSO",
    nctId: "NCT05611242",
    fullName: "Tandem Lesion Endovascular Trial",
    localPI: "Michael Levitt, MD",
    coordinator: "Tyler Ip",
    email: "siutai@uw.edu",
    phone: "206-744-9389",
    status: "Recruiting",
    notes: "Emergent carotid stenting + EVT vs EVT alone for tandem extracranial-carotid + intracranial-LVO."
  },
  {
    acronym: "TESTED",
    nctId: "NCT05911568",
    fullName: "Thrombectomy in Stroke Patients with Pre-existing Disability",
    localPI: "David Tirschwell, MD",
    coordinator: "HMC Stroke Research Coordinator",
    email: "mistryea@ucmail.uc.edu",
    phone: "513-558-1291",
    status: "Recruiting",
    notes: "EVT vs medical management in acute LVO with pre-existing disability (mRS 3-4)."
  },
  {
    acronym: "MOST",
    nctId: "NCT03735979",
    fullName: "Multi-arm Optimization of Stroke Thrombolysis",
    localPI: "David Tirschwell, MD",
    coordinator: "On-Call Stroke Fellow",
    email: "tirsch@uw.edu",
    phone: "206-744-3000",
    status: "Completed",
    notes: "Adaptive platform testing higher dose TNK vs standard dose for AIS with LVO."
  },
  {
    acronym: "RHAPSODY-2",
    nctId: "NCT05484154",
    fullName: "3K3A-APC for Neuroprotection in Ischemic Stroke",
    localPI: "HMC Stroke Neurology Service",
    coordinator: "Stroke Research Coordinator",
    email: "tirsch@uw.edu",
    phone: "206-744-3000",
    status: "Active, not recruiting",
    notes: "Adjunctive neuroprotection with 3K3A-APC after IVT and/or EVT in moderate-severe AIS."
  },
  {
    acronym: "MINUTE",
    nctId: "NCT07260916",
    fullName: "Minimally Invasive Neuroendoscopic Targeted ICH Evacuation",
    localPI: "HMC Neurosurgery Service",
    coordinator: "On-Call Neurosurgery Resident",
    email: "ally.qi@mountsinai.org",
    phone: "209-330-3024",
    status: "Not yet recruiting",
    notes: "SCUBA endoscopic evacuation of basal ganglia hemorrhages (>=20mL) within 16 hours of onset."
  },
  {
    acronym: "VERIFY",
    nctId: "NCT05338697",
    fullName: "TMS / MRI Biomarkers for Upper-Extremity Motor Recovery",
    localPI: "David Tirschwell, MD, MSc",
    coordinator: "Nicole Mazwi, MD",
    email: "nmazwi@uw.edu",
    phone: "206-744-3000",
    status: "Recruiting",
    notes: "Observational study predicting upper extremity motor recovery using TMS and MRI biomarkers."
  },
  {
    acronym: "CLARITY",
    nctId: "NCT07174414",
    fullName: "Cilostazol for Prevention of Recurrent Stroke Trial",
    localPI: "UW Stroke Neurology",
    coordinator: "Stroke Research Coordinator",
    email: "tirsch@uw.edu",
    phone: "206-744-3000",
    status: "Not yet recruiting",
    notes: "Prevention of recurrent stroke: adding cilostazol vs placebo to single antiplatelet therapy after stroke/TIA."
  }
];

// App State
const state = {
  trials: JSON.parse(localStorage.getItem("telestroke_trials")) || [...initialTrials],
  expandedId: null,
  options: {
    primaryColor: "#0f52ba",
    accentColor: "#0d9488",
    fontSize: "14",
    borderWidth: "1",
    showNct: true,
    showLocalPI: true,
    showCoordinator: true,
    showStatus: true,
    showNotes: true
  }
};

// Elements
const trialsListContainer = document.getElementById("trials-list");
const btnAddTrial = document.getElementById("btn-add-trial");
const btnReset = document.getElementById("btn-reset");
const previewContainer = document.getElementById("preview-container");
const codeBlock = document.getElementById("code-block");
const btnCopyCode = document.getElementById("btn-copy-code");
const toast = document.getElementById("copied-toast");

// Customizer Inputs
const primaryColorInput = document.getElementById("primaryColor");
const accentColorInput = document.getElementById("accentColor");
const fontSizeInput = document.getElementById("fontSize");
const borderWidthInput = document.getElementById("borderWidth");
const toggleNct = document.getElementById("toggleNct");
const toggleLocalPI = document.getElementById("toggleLocalPI");
const toggleCoordinator = document.getElementById("toggleCoordinator");
const toggleStatus = document.getElementById("toggleStatus");
const toggleNotes = document.getElementById("toggleNotes");

// Save state to local storage
function saveState() {
  localStorage.setItem("telestroke_trials", JSON.stringify(state.trials));
}

// Generate unique ID for new trials
function generateId() {
  return "trial_" + Math.random().toString(36).substr(2, 9);
}

// Render Trial Editor List
function renderEditorList() {
  trialsListContainer.innerHTML = "";
  
  state.trials.forEach((trial, index) => {
    const cardId = trial.id || `trial_${index}`;
    if (!trial.id) trial.id = cardId;

    const isExpanded = state.expandedId === cardId;
    
    const card = document.createElement("div");
    card.className = `trial-card ${isExpanded ? "expanded active" : ""}`;
    card.dataset.id = cardId;
    
    card.innerHTML = `
      <div class="trial-card-header" onclick="toggleExpand('${cardId}')">
        <div class="trial-title-wrapper">
          <span class="trial-acronym">${escapeHTML(trial.acronym || "UNNAMED")}</span>
          <span class="trial-nct">${escapeHTML(trial.nctId || "No NCT")}</span>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span class="badge" style="background-color: ${getStatusBg(trial.status)}; color: ${getStatusTextCol(trial.status)}; border-color: transparent;">
            ${escapeHTML(trial.status || "Unknown")}
          </span>
          <svg class="chevron-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
      <div class="trial-card-body">
        <div class="form-row">
          <div class="form-control">
            <label for="acronym-${cardId}">Trial Acronym</label>
            <input type="text" id="acronym-${cardId}" value="${escapeHTML(trial.acronym)}" oninput="updateField('${cardId}', 'acronym', this.value)">
          </div>
          <div class="form-control">
            <label for="nct-${cardId}">ClinicalTrials.gov NCT ID</label>
            <input type="text" id="nct-${cardId}" value="${escapeHTML(trial.nctId)}" oninput="updateField('${cardId}', 'nctId', this.value)">
          </div>
        </div>
        <div class="form-control">
          <label for="fullName-${cardId}">Full Study Name</label>
          <input type="text" id="fullName-${cardId}" value="${escapeHTML(trial.fullName)}" oninput="updateField('${cardId}', 'fullName', this.value)">
        </div>
        <div class="form-row">
          <div class="form-control">
            <label for="pi-${cardId}">Local Principal Investigator</label>
            <input type="text" id="pi-${cardId}" value="${escapeHTML(trial.localPI)}" oninput="updateField('${cardId}', 'localPI', this.value)">
          </div>
          <div class="form-control">
            <label for="coord-${cardId}">Study Coordinator / Contact</label>
            <input type="text" id="coord-${cardId}" value="${escapeHTML(trial.coordinator)}" oninput="updateField('${cardId}', 'coordinator', this.value)">
          </div>
        </div>
        <div class="form-row">
          <div class="form-control">
            <label for="email-${cardId}">Contact Email</label>
            <input type="email" id="email-${cardId}" value="${escapeHTML(trial.email)}" oninput="updateField('${cardId}', 'email', this.value)">
          </div>
          <div class="form-control">
            <label for="phone-${cardId}">Contact Phone</label>
            <input type="tel" id="phone-${cardId}" value="${escapeHTML(trial.phone)}" oninput="updateField('${cardId}', 'phone', this.value)">
          </div>
        </div>
        <div class="form-row">
          <div class="form-control">
            <label for="status-${cardId}">Local Recruitment Status</label>
            <select id="status-${cardId}" onchange="updateField('${cardId}', 'status', this.value)">
              <option value="Recruiting" ${trial.status === 'Recruiting' ? 'selected' : ''}>Recruiting</option>
              <option value="Not yet recruiting" ${trial.status === 'Not yet recruiting' ? 'selected' : ''}>Not yet recruiting</option>
              <option value="Active, not recruiting" ${trial.status === 'Active, not recruiting' ? 'selected' : ''}>Active, not recruiting</option>
              <option value="Suspended" ${trial.status === 'Suspended' ? 'selected' : ''}>Suspended</option>
              <option value="Completed" ${trial.status === 'Completed' ? 'selected' : ''}>Completed</option>
            </select>
          </div>
        </div>
        <div class="form-control">
          <label for="notes-${cardId}">Bedside / Matcher Notes</label>
          <textarea id="notes-${cardId}" oninput="updateField('${cardId}', 'notes', this.value)">${escapeHTML(trial.notes)}</textarea>
        </div>
        <div style="display:flex; justify-content:flex-end; margin-top:0.5rem;">
          <button class="btn btn-danger btn-sm" onclick="removeTrial('${cardId}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Remove Trial
          </button>
        </div>
      </div>
    `;
    
    trialsListContainer.appendChild(card);
  });
}

// Expand/Collapse Trial Editor Card
window.toggleExpand = function(id) {
  if (state.expandedId === id) {
    state.expandedId = null;
  } else {
    state.expandedId = id;
  }
  renderEditorList();
};

// Update field in state
window.updateField = function(id, field, value) {
  const trial = state.trials.find(t => t.id === id);
  if (trial) {
    trial[field] = value;
    saveState();
    updatePreviewAndCode();
  }
};

// Remove trial
window.removeTrial = function(id) {
  state.trials = state.trials.filter(t => t.id !== id);
  if (state.expandedId === id) {
    state.expandedId = null;
  }
  saveState();
  renderEditorList();
  updatePreviewAndCode();
};

// Add new trial
btnAddTrial.addEventListener("click", () => {
  const newId = generateId();
  state.trials.push({
    id: newId,
    acronym: "NEW-TRIAL",
    nctId: "",
    fullName: "",
    localPI: "",
    coordinator: "",
    email: "",
    phone: "",
    status: "Recruiting",
    notes: ""
  });
  state.expandedId = newId;
  saveState();
  renderEditorList();
  updatePreviewAndCode();
  
  // Scroll to bottom of trials list
  setTimeout(() => {
    trialsListContainer.scrollTop = trialsListContainer.scrollHeight;
  }, 100);
});

// Reset to default trials
btnReset.addEventListener("click", () => {
  if (confirm("Are you sure you want to reset the trials back to the default acute stroke trials database? This will overwrite your custom changes.")) {
    state.trials = [...initialTrials];
    state.expandedId = null;
    saveState();
    renderEditorList();
    updatePreviewAndCode();
  }
});

// Customizer Events
const configInputs = [
  { el: primaryColorInput, key: "primaryColor" },
  { el: accentColorInput, key: "accentColor" },
  { el: fontSizeInput, key: "fontSize" },
  { el: borderWidthInput, key: "borderWidth" },
  { el: toggleNct, key: "showNct", type: "checkbox" },
  { el: toggleLocalPI, key: "showLocalPI", type: "checkbox" },
  { el: toggleCoordinator, key: "showCoordinator", type: "checkbox" },
  { el: toggleStatus, key: "showStatus", type: "checkbox" },
  { el: toggleNotes, key: "showNotes", type: "checkbox" }
];

configInputs.forEach(input => {
  input.el.addEventListener("input", () => {
    state.options[input.key] = input.type === "checkbox" ? input.el.checked : input.el.value;
    updatePreviewAndCode();
  });
});

// Helper for status background color
function getStatusBg(status) {
  if (!status) return "transparent";
  switch (status.toLowerCase()) {
    case "recruiting":
      return "hsl(145, 63%, 96%)";
    case "not yet recruiting":
    case "soon":
      return "hsl(215, 82%, 96%)";
    case "active, not recruiting":
      return "hsl(38, 92%, 96%)";
    case "suspended":
      return "hsl(355, 78%, 97%)";
    default:
      return "hsl(220, 16%, 95%)";
  }
}

function getStatusTextCol(status) {
  if (!status) return "inherit";
  switch (status.toLowerCase()) {
    case "recruiting":
      return "hsl(145, 63%, 38%)";
    case "not yet recruiting":
    case "soon":
      return "hsl(215, 82%, 45%)";
    case "active, not recruiting":
      return "hsl(38, 92%, 46%)";
    case "suspended":
      return "hsl(355, 78%, 56%)";
    default:
      return "hsl(220, 16%, 46%)";
  }
}

// Escaping helper
function escapeHTML(str) {
  if (!str) return "";
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Rebuild generated HTML and update preview
function updatePreviewAndCode() {
  const opt = state.options;
  
  // Build Embed CSS style section
  const customStyles = `
<style>
/* Telestroke trials directory styling */
.telestroke-trials-wrapper {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  margin: 1.5rem 0;
  width: 100%;
  color: #1e293b;
}
.telestroke-table-container {
  overflow-x: auto;
  border: ${opt.borderWidth}px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
  background-color: #ffffff;
}
.telestroke-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: ${opt.fontSize}px;
}
.telestroke-table th {
  background-color: ${opt.primaryColor};
  color: #ffffff;
  font-weight: 600;
  padding: 10px 14px;
  border-bottom: 2px solid #cbd5e1;
}
.telestroke-table td {
  padding: 12px 14px;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: top;
}
.telestroke-table tr:last-child td {
  border-bottom: none;
}
.telestroke-table tr:hover {
  background-color: #f8fafc;
}
.trial-badge-acronym {
  font-weight: 700;
  color: ${opt.primaryColor};
  font-size: 1.1em;
}
.trial-badge-nct {
  font-family: monospace;
  font-size: 0.85em;
  color: #64748b;
  display: block;
  margin-top: 2px;
}
.trial-link {
  color: ${opt.accentColor};
  text-decoration: none;
  font-weight: 500;
}
.trial-link:hover {
  text-decoration: underline;
}
.status-pill {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 9999px;
  font-size: 0.75em;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.status-recruiting { background-color: #f0fdf4; color: #166534; }
.status-not-recruiting { background-color: #eff6ff; color: #1e40af; }
.status-active-not-recruiting { background-color: #fffbeb; color: #92400e; }
.status-suspended { background-color: #fef2f2; color: #991b1b; }
.status-completed { background-color: #f8fafc; color: #475569; }
.contact-item {
  margin-bottom: 4px;
}
.contact-item:last-child {
  margin-bottom: 0;
}
.contact-label {
  font-size: 0.85em;
  color: #64748b;
  font-weight: 500;
}
</style>
`;

  // Build Table Head
  let thColumns = `<th>Trial</th>`;
  if (opt.showLocalPI) thColumns += `<th>Local PI</th>`;
  if (opt.showCoordinator) thColumns += `<th>Research Coordinator</th>`;
  if (opt.showStatus) thColumns += `<th>Status</th>`;
  if (opt.showNotes) thColumns += `<th>Eligibility Notes</th>`;

  // Build Table Rows
  let tableRows = "";
  state.trials.forEach(trial => {
    let row = `  <tr>\n`;
    
    // Trial Column
    row += `    <td>\n      <span class="trial-badge-acronym">${escapeHTML(trial.acronym)}</span>\n`;
    if (opt.showNct && trial.nctId) {
      row += `      <a href="https://clinicaltrials.gov/study/${escapeHTML(trial.nctId)}" target="_blank" class="trial-badge-nct trial-link">${escapeHTML(trial.nctId)}</a>\n`;
    }
    row += `    </td>\n`;
    
    // Local PI Column
    if (opt.showLocalPI) {
      row += `    <td>${escapeHTML(trial.localPI || "—")}</td>\n`;
    }
    
    // Coordinator Column
    if (opt.showCoordinator) {
      row += `    <td>\n`;
      if (trial.coordinator) {
        row += `      <div class="contact-item"><strong>${escapeHTML(trial.coordinator)}</strong></div>\n`;
      }
      if (trial.email) {
        row += `      <div class="contact-item"><a href="mailto:${escapeHTML(trial.email)}" class="trial-link">${escapeHTML(trial.email)}</a></div>\n`;
      }
      if (trial.phone) {
        row += `      <div class="contact-item"><span class="contact-label">Tel:</span> <a href="tel:${escapeHTML(trial.phone)}" class="trial-link">${escapeHTML(trial.phone)}</a></div>\n`;
      }
      if (!trial.coordinator && !trial.email && !trial.phone) {
        row += `      —\n`;
      }
      row += `    </td>\n`;
    }
    
    // Status Column
    if (opt.showStatus) {
      const statusClass = getStatusClass(trial.status);
      row += `    <td><span class="status-pill ${statusClass}">${escapeHTML(trial.status || "Unknown")}</span></td>\n`;
    }
    
    // Notes Column
    if (opt.showNotes) {
      row += `    <td>${escapeHTML(trial.notes || "—")}</td>\n`;
    }
    
    row += `  </tr>\n`;
    tableRows += row;
  });

  // Complete HTML code block
  const generatedHTML = `<div class="telestroke-trials-wrapper">
  <div class="telestroke-table-container">
    <table class="telestroke-table">
      <thead>
        <tr>
          ${thColumns}
        </tr>
      </thead>
      <tbody>
${tableRows}      </tbody>
    </table>
  </div>
</div>`;

  const finalEmbedCode = customStyles + generatedHTML;

  // Update preview container
  previewContainer.innerHTML = `<span class="preview-badge">Live Preview</span>` + finalEmbedCode;

  // Update copy-pasteable code block
  codeBlock.textContent = finalEmbedCode.trim();
}

// Get CSS status class
function getStatusClass(status) {
  if (!status) return "";
  switch (status.toLowerCase()) {
    case "recruiting":
      return "status-recruiting";
    case "not yet recruiting":
    case "soon":
      return "status-not-recruiting";
    case "active, not recruiting":
      return "status-active-not-recruiting";
    case "suspended":
      return "status-suspended";
    case "completed":
      return "status-completed";
    default:
      return "";
  }
}

// Copy embed code to clipboard
btnCopyCode.addEventListener("click", () => {
  navigator.clipboard.writeText(codeBlock.textContent).then(() => {
    // Show copy toast notification
    toast.style.display = "block";
    setTimeout(() => {
      toast.style.display = "none";
    }, 2500);
  }).catch(err => {
    alert("Could not copy code to clipboard: " + err);
  });
});

// App Inits
renderEditorList();
updatePreviewAndCode();
