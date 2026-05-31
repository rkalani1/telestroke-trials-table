# Telestroke Trial Directory Builder

An interactive web-based database customizer and code generator for acute stroke trials. This standalone tool enables clinical research leads to customize, update, and export a clean contact table for integration into the institution's primary telestroke website.

It comes preloaded with active clinical trial data fetched from ClinicalTrials.gov and verified local contacts for the University of Washington / Harborview Medical Center.

---

## Features

- **Pre-filled Acute Trials**: Preloaded with correct NCT IDs and contacts for active acute interventional trials (SISTER, STEP-EVT, and MINUTE).
- **Responsive Customizer UI**: Interactively select colors, font size, border thickness, and toggle visible columns (NCT ID, PI, Coordinator, Status, Notes).
- **Live Preview Panel**: Shows exactly how the embedded table will look on the telestroke portal in real-time.
- **Copy-and-Paste Embed Generator**: Creates a standalone, self-contained HTML/CSS block containing all layout structure and styles.
- **Local Persistence**: Automatically saves custom edits locally in the browser's `localStorage` so changes are preserved between sessions.

---

## Local Development & Preview

Since the application is built entirely using vanilla web technologies (HTML, CSS, JavaScript), it requires no compile step or npm installation. You can run it locally with any simple static web server.

### Option 1: Python SimpleHTTPServer (Pre-installed on macOS/Linux)
Open a terminal in this directory and run:
```bash
python3 -m http.server 8080
```
Then navigate to `http://localhost:8080` in your browser.

### Option 2: Node.js `live-server`
If you have Node.js installed, you can run:
```bash
npx live-server
```
This will automatically launch the browser and reload the page as you edit files.

---

## Deploying to GitHub Pages (For IT Department)

To deploy this tool as a public-facing configuration hub for the clinical research coordinators:

1. Create a new repository on your GitHub account (e.g., `telestroke-trials-table`).
2. Push this local directory to the repository:
   ```bash
   git remote add origin https://github.com/your-organization/telestroke-trials-table.git
   git branch -M main
   git push -u origin main
   ```
3. Go to the repository settings on GitHub: **Settings** -> **Pages**.
4. Under **Build and deployment**, set the source to **Deploy from a branch**.
5. Select the **main** branch and `/root` folder, then click **Save**.
6. The site will be built and published at `https://your-organization.github.io/telestroke-trials-table/`.

---

## Embedding the Table on your Telestroke Site

Once configured inside the builder:

1. Configure the table options (e.g., set primary clinical color, font size, show/hide columns).
2. Edit trial contacts as needed.
3. Click the **Copy Embed Code** button.
4. Paste the copied snippet directly into the custom HTML widget or raw text block of your primary website's CMS (such as WordPress, Drupal, Webflow, or custom landing page).
5. The embedded table is fully self-contained, responsive, and mobile-friendly.
