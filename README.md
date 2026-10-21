# Sheets to Screenshot (no extension)

A static GitHub Pages website that converts copied spreadsheet cells into a clean report-style PNG. **No Chrome extension is included or required.**

## Use
1. Open Google Sheets and select the entire range including headers.
2. Press `Ctrl+C`.
3. Open the website, click the paste area, and press `Ctrl+V`.
4. Adjust **Text size**, **Export resolution**, **Table width**, and **Cell padding**.
5. Click **Download PNG**.

The first pasted row is emphasized as a report header. Cells are normalized to a common column count, so empty cells remain in their correct positions and rows stay aligned. The preview uses a white background, clear borders, and subtle alternating row shading.

You can also import `.xlsx` or `.xls` files; the first worksheet is converted to the same clean report style.

## Publish on GitHub Pages
1. Create a public repository on https://github.com/new (for example `google-sheets-screenshot`).
2. Upload `index.html`, `styles.css`, `app.js`, `README.md`, and `LICENSE` to the repository root.
3. Go to **Settings → Pages**.
4. Select **Deploy from a branch**, branch `main`, folder `/(root)`, then Save.
5. Open the published Pages URL shown by GitHub.

## Notes
- This project intentionally excludes all Chrome extension files.
- Plain clipboard paste contains tab-separated text. It preserves values and empty cell positions, but not Google Sheets colors, merged cells, conditional formatting, or exact row heights.
- The export uses html2canvas and XLSX from jsDelivr CDN, so an internet connection is needed for PNG export and Excel import.
