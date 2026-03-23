# Lucky Draw Calendar - Implementation Plan

## Proposed Changes

We will build the application using a Google Apps Script backend and a static HTML/CSS/JS frontend.

### Google Apps Script (Backend)
- `gas_script.js`:
  - Contains `fetchAndFilterStockInfo()` which is designed to run daily at 8:00 AM (setup via GAS triggers).
  - Fetches JSON from `https://www.twse.com.tw/rwd/zh/announcement/publicForm?response=JSON`.
  - Parses dates from ROC (e.g., 115/03/31) to AD.
  - Filters stocks based on: `序號` <= 10, `抽籤日期` falls within the range of today's date minus 14 days to today plus 14 days, AND `發行市場` is not "中央登錄公債".
  - Interacts with Google Sheets URL provided to write data rows.
  - Implements `doGet()` function to export JSON for the web app frontend.

---

### Web Frontend (Client)
- `index.html`:
  - A responsive layout using modern UI principles.
  - Uses `FullCalendar` library for the main display interface.
  - Includes a container for a list of selectable stocks.
- `style.css`:
  - Implementation of a rich, dynamic, premium web design.
  - Glassmorphism UI elements, dark mode aesthetics, smooth hover effects, colorful accents.
- `script.js`:
  - Fetches the JSON data exported from the `doGet()` Google Apps Script web app.
  - Renders the checkbox list for multi-selection.
  - Computes `(T-1) to (T+1)` event mapping for selected stocks.
  - Cumulates the total underwriting price (`承銷價` only) for each respective calendar date and updates calendar annotations/headers.

## User Action Required
> [!IMPORTANT]
> The User will need to manually deploy the Google Apps Script code to the Google Script editor provided, configure the daily trigger (8:00 AM), and publish it as a Web App to get the `API URL` for the frontend.

## Verification Plan
### Automated Tests
- Since it's a static site, test API fetch via console or mocking.
### Manual Verification
- Deploy to local structure and open `index.html` to confirm functionality. Ensure the visual aesthetic is very premium.
