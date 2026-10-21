# Google Sheets to Screenshot

A static GitHub Pages app that turns copied spreadsheet cells into a high-resolution PNG. Includes an optional Chrome extension that attempts to capture the clipboard payload when you copy cells in Google Sheets.

## Features

- Paste spreadsheet cells using Ctrl+V.
- Preserves HTML clipboard cell formatting when Google Sheets provides it.
- Plain-text TSV fallback keeps rows and columns aligned.
- Readability controls: image scale, text size, column fitting/wrapping, and background.
- Exports the entire rendered table as one PNG.
- Optional `.xlsx` import (first worksheet).
- The site processes pasted data in the browser; it does not upload spreadsheet contents to a server.

## Publish on GitHub Pages

1. Create a **public** GitHub repository named `google-sheets-screenshot`.
2. Upload `index.html`, `styles.css`, `app.js`, and this `README.md` to the repository root.
3. Open **Settings → Pages**.
4. Under Build and deployment, select **Deploy from a branch**, branch `main`, folder `/ (root)`, then Save.
5. Wait for the Pages deployment. The site URL will be `https://YOUR-GITHUB-USERNAME.github.io/google-sheets-screenshot/`.
6. Replace `YOUR-GITHUB-USERNAME` in `extension/popup.js` with your actual GitHub username.

## Install the optional Chrome extension

1. First publish the site and update the URL in `extension/popup.js`.
2. In Chrome, open `chrome://extensions`.
3. Turn on **Developer mode**.
4. Choose **Load unpacked** and select the project's `extension` folder.
5. Open Google Sheets, select a cell range, press Ctrl+C, then click the extension icon.
6. Choose **Open screenshot tool**, review the table, and download the PNG.

### Important clipboard limitation

Chrome extensions cannot guarantee access to every Google Sheets copy operation. Google Sheets may use an internal copy mechanism that does not expose `text/html` or `text/plain` to the extension's `copy` event. If the extension reports no captured data, copy the range normally and paste it into the website with Ctrl+V. Browser permission and clipboard implementation can affect automatic capture.

## Formatting notes

Clipboard HTML is the best available source for cell-level formatting. Some Sheets features—merged regions, conditional formatting, row heights, column widths, formulas, and theme details—may not survive clipboard copying. For closer workbook fidelity, import an `.xlsx` file. The app currently imports the first worksheet and is not a full Excel renderer.

## Local preview

Open `index.html` in a modern browser. Internet access is needed for the screenshot and Excel parsing libraries loaded from jsDelivr. For clipboard read permissions, use HTTPS or localhost.

## Privacy

Pasted data stays in the page's memory during normal website use. The extension stores its most recent clipboard capture in local Chrome extension storage. Do not use the extension on sensitive sheets on a shared computer; clear extension storage by removing the extension or clearing its data.

## License

MIT
