# AutoMedBench-Lite Gate for Trial Directory Updates

Use this gate before accepting AI-generated changes to preloaded trial data, NCT IDs, local contacts, generated embed HTML, or status notes.

This gate evaluates workflow discipline. It does not approve the directory for clinical recruitment or operational publication.

## S1 Plan

- Identify the trial row, contact field, status note, or embed behavior being changed.
- State whether the change affects source data, UI styling, generated HTML, or documentation.
- Define stop conditions for uncertain trial status, stale contacts, or unverified ownership.

## S2 Setup

- Inspect `app.js`, `index.html`, `style.css`, `COMPLIANCE.md`, and any public source records.
- Confirm examples are public, synthetic, or approved placeholders.
- Identify local preview steps.

## S3 Validate

- Verify NCT ID, trial title, status, and contact fields against ClinicalTrials.gov or approved source material before changing data.
- Confirm local contact fields do not expose confidential personal information or private workflow details.
- Preview generated embed HTML after any UI or data change.
- Confirm no PHI, participant data, credentials, or restricted operational details are introduced.

## S4 Execute

Make the scoped change after validation planning is complete. Keep generated embed output self-contained and clearly demo/reference scoped.

## S5 Submit

Report changed files, source trace, preview checks, residual owner review, and no-PHI confirmation.

## One-Shot Prompt

```text
Apply the telestroke-trials-table AutoMedBench-Lite gate. Write S1 Plan, S2 Setup, and S3 Validate before editing. Then execute the scoped change and submit changed files, ClinicalTrials.gov or approved-source trace, preview checks, residual owner review, and no-PHI confirmation. Stop if trial status or contact-source validation cannot be completed.
```
