>請說明 script.js 的程式架構和運行邏輯

Viewed script.js:1-293

[script.js](cci:7://file:///C:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/script.js:0:0-0:0) 是這個專案的**大腦與神經系統**。它負責處理數據、運算日期邏輯，並驅動 UI 的即時反應。

這份程式碼的架構可以拆解為以下四個階段：

### 1. 啟動與環境初始化 (Line 1-52)
*   **DOMContentLoaded**: 確保 HTML 骨架載入後才執行，避免抓不到元件。
*   **FullCalendar 初始化**: 設定日曆的預設檢視（手機顯示「週」、桌機顯示「月」）、隱藏週末 (`weekends: false`)、移除「日」字樣等視覺規則。
*   **定義變數**: 存放 API 網址，並建立 `allStocks` (全部股票) 與 `selectedStocks` (已勾選股票) 來管理狀態。

### 2. 資料加載邏輯——雙層快取機制 (Line 56-102)
這是為了極大化使用者體驗而設計的邏輯：
1.  **優先從 `localStorage` 讀取**: 如果使用者之前開過網頁，資料會秒開呈現。
2.  **背景向 API 請求**: 同時發送 [fetch](cci:1://file:///C:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/Code.gs:20:0-112:1) 請求給 Google Apps Script。
3.  **差異更新**: 只有當新抓到的資料跟本地舊資料「不一樣」時，才會更新快取並重新渲染畫面。這讓使用者完全感覺不到「載入中」。

### 3. 動態渲染與互動 (Line 104-222)
*   **[renderStockList](cci:1://file:///c:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/script.js:103:4-199:5)**: 將 JSON 陣列轉換為一個個 HTML `stock-item` 標籤。
*   **日期清洗**: 為了解決時區偏差問題，我們不使用 `new Date(ISOString)`，而是手動用 `.split('-')` 拆解字串，確保看到的日期跟試算表完全一致。
*   **事件監聽**: 為每一個 Checkbox 綁定 `change` 事件。一旦勾選，就會執行 [updateCalendar](cci:1://file:///c:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/script.js:223:4-275:5)。

### 4. 核心邏輯：日期運算與金額加總 (Line 224-287)
這是專案最複雜也最關鍵的「計算機」：
*   **營業日判斷 ([getOffsetDateStr](cci:1://file:///C:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/script.js:201:4-221:5))**: 當我們要算 T-1 或 T+1 日時，如果算出來是週六或週日，程式會**自動往前後推移**，直到找到最近的週一或週五。這模擬了真實銀行的扣款與撥券邏輯。
*   **事件映射 ([updateCalendar](cci:1://file:///c:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/script.js:223:4-275:5))**:
    1.  **股票區間條**: 把選中的股票轉換成一個橫跨 `T-1` 到 `T+1` 的「長條事件」。
    2.  **每日結算條**: 建立一個動態物件 `dailySum = {}`，將每一天重疊的股票金額累加起來，最後在日曆格子底部生成一個金額標籤。
*   **垂直排序 (`sortOrder`)**: 透過 `eventOrder` 參數，強制讓「股票名稱」在上，「加總金額」在下，確保對齊美觀。

---

**總結運行流程：**
1.  **載入前次資料** (快取) -> **繪製日曆框架**。
2.  **背景抓取新資料** -> **更新側邊欄清單**。
3.  **使用者點擊勾選** -> **觸發 [updateCalendar](cci:1://file:///c:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/script.js:223:4-275:5)**。
4.  **大腦運算**：避開週末日期 -> 統計每日總額 -> **清空並重新繪製日曆上的色彩條**。

這份程式碼確保了即使 Google API 反應較慢，使用者也能瞬間看到內容，且所有的金融日期計算都符合現實運作規則。