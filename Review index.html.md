>請說明 index.html 的程式架構和運行邏輯

[index.html](cci:7://file:///C:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/index.html:0:0-0:0) 在這個專案中扮演的是**「骨架」**與**「容器」**的角色。它不負責複雜的邏輯，而是定義了網頁的結構，並預留空間讓 JavaScript (也就是您大腦的部分 [script.js](cci:7://file:///c:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/script.js:0:0-0:0)) 能夠把資料填進去。

以下我將 [index.html](cci:7://file:///C:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/index.html:0:0-0:0) 拆解為三個主要層次來為您說明：

### 1. 外部資源引入層 (`<head>`)
*   **語言設定與視窗設定 (Line 2-6)**: 確保在手機上也能正常縮放，並設定繁體中文環境。
*   **精選字型 (Line 9)**: 引入了 Google Fonts 的 `Outfit` 字型，這是讓網頁看起來有「高級感」的關鍵之一。
*   **日曆圖庫 (Line 11)**: 透過 CDN 引入了強大的 **FullCalendar** 核心套件。沒有這一行，網頁就無法渲染出漂亮的日曆格子。
*   **樣式表 (Line 12)**: 引入您的 [style.css](cci:7://file:///c:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/style.css:0:0-0:0)，所有毛玻璃效果、漸層與排版都在那裡定義。

### 2. 頁面佈局層 (`<body>`)
所有的內容都包在一個具有響應式設計的 `app-container` (Line 16) 裡面：

*   **Header (Line 17-20)**: 定義網頁的大標題與副標題。
*   **Main (Line 22)**: 這是頁面的心臟地帶，採用了兩欄式佈局：
    *   **左側：`#calendar` (Line 24)**：這是一個**空的容器**。當 [script.js](cci:7://file:///c:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/script.js:0:0-0:0) 執行時，它會去找這個 ID，並在裡面「繪製」出完整的 FullCalendar 日曆。
    *   **右側：`.data-panel` (Line 27)**：這是側邊欄。我們在它的頂部定義了一個包著**主標題與手動更新按鈕 (`#refresh-btn`)** 的 `.panel-header`；下方放了一個用來控制**退款/扣款邏輯的 Radio 按鈕區塊** (`.logic-selector-container`)。最底部顯示一個 `loading` (Line 44) 載入中字樣，並有一個隱藏的 `stock-list` 準備接收動態生成的清單。
*   **Footer (Line 36-38)**: 顯示版權宣告與年份。

### 3. 運行邏輯（骨架如何動起來？）
[index.html](cci:7://file:///C:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/index.html:0:0-0:0) 本身是靜態的，它的「生命」來自於最後一行的 **[script.js](cci:7://file:///c:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/script.js:0:0-0:0) (Line 41)**：

1.  **瀏覽器載入 [index.html](cci:7://file:///C:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/index.html:0:0-0:0)**: 先顯示標題、空的日曆容器與「載入中」字樣。
2.  **腳本啟動**: 當讀到最後一行時，[script.js](cci:7://file:///c:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/script.js:0:0-0:0) 開始運作。
3.  **掛載日曆**: JavaScript 會對 `#calendar` 進行「掛載」，將網格畫出來。
4.  **注入資料**: JavaScript 會去向 Google Apps Script 抓資料，抓到後會把 `.data-panel` 裡的 `loading` 隱藏，並把生成的股票項目 HTML 程式碼（如 Checkbox、股票名稱等）**動態地插入**到 `id="stock-list"` 的標籤之間。

---

**總結來說：**
您看到的網頁就像一間房子，[index.html](cci:7://file:///C:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/index.html:0:0-0:0) 是**樑柱跟牆壁**，[style.css](cci:7://file:///c:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/style.css:0:0-0:0) 是**裝潢與油漆**，而 [script.js](cci:7://file:///c:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/script.js:0:0-0:0) 則是裡面的**家具搬運工與電路系統**，負責把外面的物資（股票資料）搬進房間裡擺放！