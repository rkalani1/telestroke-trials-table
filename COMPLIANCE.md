# Compliance & Security Guidelines — Telestroke Trials Directory

## 1. Patient Privacy & PHI (HIPAA)
- **NO Patient Identifying Information**: Under no circumstances should Protected Health Information (PHI), patient names, medical record numbers, dates of birth, or clinical case details be inputted into any fields of this table builder.
- This is a static table builder meant to maintain organizational contact information for on-call researchers and coordinators. It is not a clinical case log or patient tracker.

## 2. Clinical Trial Registry Verification
- **NCT Link Validity**: All links generated in this table directory must point directly to the verified ClinicalTrials.gov pages: `https://clinicaltrials.gov/study/NCTXXXX`.
- **Registry Synchronization**: Since clinical trial contacts and recruiting statuses change frequently, the institutional PIs and coordinators must verify their contact details at least once per quarter.
- **Verification Logs**: Keep a record of when each trial's contact information was last updated or verified locally.

## 3. Disclaimers for Patient/Provider Use
- Any webpage or portal displaying this table on the telestroke website must display the following disclaimer prominently:
  > **Notice**: This directory is for clinical provider reference and educational purposes only. Trial eligibility must be formally confirmed by the on-call stroke research team.

## 4. Code Maintenance & XSS Prevention
- All inputs are sanitized using browser-native text injection methods (`textContent` or template-neutral DOM manipulation) to prevent Cross-Site Scripting (XSS) when outputting embed code.
- If the IT department embeds this table dynamically, they must ensure proper content security policies (CSP) are enforced on the telestroke host domain.
