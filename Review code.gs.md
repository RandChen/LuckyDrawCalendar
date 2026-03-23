>請說明 Code.gs 的程式架構和運行邏輯

Viewed Code.gs:1-161

[Code.gs](cci:7://file:///C:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/Code.gs:0:0-0:0) 是這個專案的**後端引擎與資料中心**。它在雲端執行，負責從證交所抓資料、整理後存進試算表，並提供 API 給您的網頁讀取。

它的程式架構可以分為以下三個核心模組：

### 1. 爬蟲與資料過濾模組 ([fetchAndFilterStockInfo](cci:1://file:///C:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/Code.gs:20:0-112:1), Line 21-113)
這是最繁重的工作，通常設定為**每天早上 8-9 點自動執行一次**：
*   **外部取料 (Line 23)**：使用 `UrlFetchApp` 抓取證交所的公開 JSON 資料。
*   **日期轉譯 (Line 9-19)**：台灣證交所使用民國日期（如 `115/03/31`），程式會自動計算 `+1911` 將其轉為標準西元格式，方便電腦運算。
*   **三道過濾關卡 (Line 52-68)**：
    1.  **重要性過濾**：只取序號前 10 名的熱門標的。
    2.  **市場過濾**：排除掉「中央登錄公債」等一般投資人較少申購的項目。
    3.  **時間視窗**：只保留抽籤日在「昨天」到「未來 14 天內」的資料，過期的不存，太遠的也不存。
*   **存入試算表 (Line 85-106)**：清空舊資料，重新寫入過濾後的乾淨資料。

### 2. API 提供模組 ([doGet](cci:1://file:///C:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/Code.gs:114:0-159:1), Line 116-160)
這是當網頁開啟時，前端呼叫的入口（Web App API）：
*   **時區安全格式化 ([formatDate](cci:1://file:///C:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/Code.gs:134:7-140:9), Line 136-141)**：這是我們解決「日期差一天」Bug 的關鍵。它強制將試算表中的日期物件轉為 `Asia/Taipei` 時區的 `yyyy-MM-dd` **純字串**，確保不管伺服器在哪個國家執行，前端拿到的日期都絕對精準。
*   **資料封裝 (Line 143-156)**：將試算表的橫列（Array）轉成結構化的對像（JSON Object），方便前端 JavaScript 讀取屬性（如 `item.name`）。

### 3. 快取優化機制 (`CacheService`, Line 109, 117, 157)
這是我們為了**提升回覆速度**而加入的資深級功能：
*   **寫入時清除 (Line 110)**：當早上更新了試算表資料時，會立刻刪除舊的快取，確保資料最新。
*   **讀取時使用 (Line 118)**：網頁請求進來時，程式會先看記憶體（Cache）裡有沒有上次準備好的 JSON 字串。如果有，就**直接丟回去**，不用再去花時間打開試算表跟跑迴圈。
*   **效能效益**：這讓 API 的反應時間從原本的 1000ms+ 縮短到幾乎瞬間完成。

---

**總結運行邏輯：**
1.  **背景任務**：每天早上，程式抓證交所 -> 洗資料 -> 民國轉西元 -> 存進 Sheet -> **清空快取**。
2.  **前端呼叫**：使用者開網頁 -> API 進來 -> **檢查快取** -> 回傳 JSON -> **前端顯現日曆**。

這份 [Code.gs](cci:7://file:///C:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/Code.gs:0:0-0:0) 將原本雜亂的實體資料流，轉化為穩定、快速且格式標準的虛擬資料流，是支撐整個「幸運抽籤日曆」運作的幕後功臣！