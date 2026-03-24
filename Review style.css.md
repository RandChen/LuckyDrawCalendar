>請說明 style.css 的程式架構和運行邏輯

[style.css](cci:7://file:///c:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/style.css:0:0-0:0) 在這個專案中負責將「抽籤資料」轉化為「高級感的視覺體驗」。它的架構邏輯非常嚴謹，採用了現代 CSS 的封裝觀念與 **玻璃擬態 (Glassmorphism)** 設計風格。

以下是 [style.css](cci:7://file:///c:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/style.css:0:0-0:0) 的四大核心架構說明：

### 1. 全域變數與設計系統 (`:root`, Line 1-28)
這是整個網頁的「基因庫」。
*   **變數管理 (CSS Variables)**：所有的顏色（如主色 `#3182ce`、成功綠 `#38a169`）都定義在 `:root`。這樣做的運行邏輯是：未來如果您想從「亮色模式」切換到「深色模式」，只需要改動這幾行變數，全站就會同步更新，這在大型開發中是資深工程師的標準作法。
*   **背景渲染 (Line 21)**：透過 `radial-gradient` (放射狀漸層) 讓背景不是生硬的單色，而是從右上角透出微光的質感。

### 2. 佈局架構與響應式系統 (`main`, Line 60-118)
*   **Grid 網格系統**：`main` 使用了 `grid-template-columns: 2fr 1fr;`。運行邏輯是：日曆佔 2 分、側邊欄佔 1 分，讓螢幕空間得到最合理的分配。
*   **RWD 斷點設定**：在螢幕寬度小於 900px 時，邏輯會從「兩欄」切換為「單欄式垂直排列」，確保手機也能順暢操作。

### 3. 高級感 UI 元件設計 (Line 120-131, 284-355)
*   **玻璃擬態 (Glassmorphism)**：這部分的關鍵在於 `backdrop-filter: blur(20px);`。它讓容器底下的背景呈現半透明且模糊的效果，像一塊噴砂玻璃。
*   **互動邏輯 (Hover Effects) 與動畫**：
    *   `stock-item` (股票清單項) 寫了 `transition` 與 `transform: translateY(-2px);`。當滑鼠滑過時，標籤會輕微向上浮起，增加互動的靈魂感。
    *   **重整按鈕 `.refresh-btn`** 加入了滑鼠懸停放大並稍微傾斜 (`scale` & `rotate`) 的活潑感，且如果抓取資料時，會套用獨立定義的 `@keyframes spin` 無限旋轉動畫！
*   **自定義 Checkbox & Radio Button**：原生瀏覽器的勾選與單選方塊很難看且無法換色，我們透過 `appearance: none` 將其隱藏，並手動寫出帶有重描邊、帶漸層陰影的自定義圓圈與方塊。

### 4. 外部套件深度客製 (FullCalendar Overrides, Line 133-239)
這是本檔案中最具技術含量的部分。
*   **樣式覆蓋 (Styles Override)**：FullCalendar 有自己的預設樣式。我們透過選取內部類別（如 `.fc-button-primary`），強制注入我們自定義的顏色與陰影，讓日曆跟網頁融為一體。
*   **客製化事件 (`.event-stock`, `.event-sum`, `.holiday-cell`)**：
    *   **`.holiday-cell` (國定假日格)**：利用輕柔的淡紅色底 (`rgba(229, 62, 62, 0.08)`) 不干擾視覺的同時有效區分非營業日。
    *   **`.event-stock` (股票標籤)**：設定了漸層背景與左側加粗邊框 (`border-left: 5px solid`)，模仿金融軟體的標記感。
    *   **`.event-sum` (金額加總)**：使用 `text-align: right` 將金額靠右，並用細虛線與上方隔離，讓它看起來更像是一份資產清單的底部結算。

---

**總結運行邏輯：**
1.  **層級疊加**：先渲染背景漸層，再疊上帶模糊效果的玻璃面板。
2.  **細節強調**：對日曆內部的格線、按鈕進行精雕細琢。
3.  **動態配合**：利用 CSS 變數與 [script.js](cci:7://file:///c:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/script.js:0:0-0:0) 配合，當您勾選股票時，呈現出的顏色會完美對齊（例如側邊欄的藍色同步到日曆的左邊框）。

這份 CSS 不只是美化，它還確保了在不同載具上的**一致性**與**直覺性**！