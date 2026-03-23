# Lucky Draw Calendar - Implementation Plan

## Proposed Changes

We will build the application using a Google Apps Script backend and a static HTML/CSS/JS frontend, incorporating robust caching and business day calculations for precise UI display.

### Google Apps Script (Backend)
- `Code.gs`:
  - Contains `fetchAndFilterStockInfo()` which is designed to run daily at 8:00 AM.
  - Fetches JSON from `https://www.twse.com.tw/rwd/zh/announcement/publicForm?response=JSON`.
  - Parses dates from ROC (e.g., 115/03/31) to AD.
  - Filters stocks based on: `序號` <= 10, `抽籤日期` falls within the range of today's date minus 1 day to today plus 14 days, AND `發行市場` is not "中央登錄公債".
  - **Data Trimming**: Selectively retains only necessary properties (no shares, allotmentDate, or winRate) to reduce payload size.
  - Re-writes data rows into an integrated Google Sheets.
  - **Caching Mechanism**: Implements `CacheService` in `doGet()`. Caches the processed JSON string for 6 hours; automatically clears cache upon new data writes.
  - **Timezone Safety**: Forces dates outputting from the format into `"Asia/Taipei"` `yyyy-MM-dd` layout, preventing UTC displacement offsets on the frontend.

---

### Web Frontend (Client)
- `index.html`:
  - A responsive layout using modern UI principles.
  - Uses `FullCalendar` library for the main display interface.
  - Includes a container for a list of selectable stocks.
  - **Configuration**: Uses 2fr/1fr desktop grid scaling for spacious calendar display.
- `style.css`:
  - Implementation of a rich, dynamic, premium web design.
  - **Light Mode UI**: Clean, white-and-light-blue gradient aesthetics.
  - Glassmorphism UI elements, smooth hover effects, colorful accents.
  - Hide weekends (`firstDay: 0`, `weekends: false`) and render events cleanly with left-borders and transparent backgrounds for nested content.
- `script.js`:
  - Fetches JSON data exported from the `doGet()` Google Apps Script web app.
  - **Instant Load Cache**: Utilizes browser `localStorage`. Loads immediately from cache if available, while seamlessly checking API in the background.
  - Renders the checkbox list and parses exact strings (e.g., MM-DD mapping) for Subscription Periods.
  - **Business Day Calculation**: Computes `(T-1) to (T+1)` event mapping ensuring dates never fall on weekends.
  - Cumulates the exact underwriting price for each respective calendar date.
  - Explicit ordering rules force total sums (`.event-sum`) to sit rigidly at the bottom of dates (`eventOrder: 'sortOrder'`).

## User Action Required
> [!IMPORTANT]
> The User needs to manually deploy the updated Google Apps Script (`Code.gs`) to the Google Script editor provided, configure the daily trigger (8:00 AM), and publish it as a Web App to get the `API URL` for the frontend to use caching capabilities properly.

## Verification Plan
### Automated Tests
- Since it's a static site, test API fetch via console or mocking.
### Manual Verification
- Deploy to local structure and load `index.html` to confirm functionality. Ensure visual aesthetics accurately render Light Mode gradients and that load times via cache exhibit zero-latency renders.
