# 抽籤日曆 (Lucky Draw Calendar) 實作完成 Walkthrough

恭喜！專案的本地開發與 Git 初始化已經完成。在此應用程式中，我們透過 Google Apps Script 作為後端，並透過 GitHub Pages 優雅地展示視覺化的抽籤日程。

## 最近優化與修復 (Recent Updates)
1. **日期精準度**: 修復了 JSON 時區轉換落差問題。在 GAS 端強制指定 `Asia/Taipei` 並對外輸出 `yyyy-MM-dd` 格式字串，確保 T-1 至 T+1 日期的計算從不偏移。
2. **營業日邏輯**: 前端現已實作專屬演算法自動避開星期六、星期日（非營業日），讓申購日程更貼近真實金融世界。也移除了日曆顯示「日」的中文字眼與週末版面。
3. **介面升級**: 轉移至優雅的 **Light Mode (亮色模式)**！結合玻璃擬真效果 (Glassmorphism)，配合 2fr:1fr 寬闊版面佈局，事件條 (.event-stock) 的透明內嵌、漸層背景與大方的字體展現，使得資產標示更加吸睛。
4. **極速載入體驗 (Caching)**:
   - **前端 localStorage**: 第二次開啟網頁達到 0 毫秒延遲 (瞬間秒開畫面)，並在背景無感發配 API 請求更新差異資料。
   - **後端 CacheService**: 將撈取 Google Sheet 的轉型 JSON 保存至伺服器記憶體長達 6 小時，避免頻繁的陣列操作，極大地優化回覆速度。

## 1. 部署 Google Apps Script
1. 打開您的 [Google Apps Script 專案](https://script.google.com/d/1G5CVicdZfBex7cGdsCKOjziXBRDYTOrDSM6ZIUBO0p2RaBnsNHb3uko8/edit?usp=sharing)
2. 將 [Code.gs](file:///C:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/Code.gs) 內容複製並貼上到 GAS 編輯器中。這包含了過濾邏輯（例如屏蔽「中央登錄公債」並移除多餘的欄位分享）。
3. 點選左側「觸發條件 (Triggers)」時鐘圖示，新增觸發條件：
   - 選擇要執行的功能：[fetchAndFilterStockInfo](file:///C:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/Code.gs#21-116)
   - 選取事件來源：`時間驅動`
   - 選取時間型觸發條件類型：`日計時器`
   - 選取時間：`上午 8 點到 9 點`
   - 按下「儲存」。
4. **如何授權權限 (重要)：**
   - 回到「編輯器」畫面。
   - 上方選單選取 [fetchAndFilterStockInfo](file:///C:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/Code.gs#21-116)。
   - 點擊「執行 (Run)」(三角形播放圖案)。
   - 此時會跳出「需要授權」視窗，點擊「審閱權限」。
   - 選擇您的帳戶 -> 點擊「顯示進階設定 (Advanced)」 -> 「前往（您的專案名稱）(不安全)」 -> 點擊「允許」。
   - 完成手動執行一次後，定時觸發器就會正式生效。
5. **部署網頁應用程式：**
   - 點擊右上角「部署」->「管理部署」或「新增部署作業」
   - 類型選擇「網頁應用程式 (Web App)」
   - 執行身份：「我」
   - 誰可以存取：「所有人 (Anyone)」
   - 點擊部署，並**複製「網頁應用程式網址 (Web App URL)」**。

## 2. 更新前端 API 網址
1. 開啟您資料夾內的 [script.js](file:///c:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/script.js)。
2. 將剛才取得的 Web App URL 替換掉開頭的 `gasAPIUrl` 變數並存檔。

## 3. 推送至 GitHub 並開啟 GitHub Pages
請打開終端機 (或 PowerShell) 執行：
```bash
git add .
git commit -m "chore: 更新最新前後端快取邏輯與樣式"
git push origin main
```

1. 打開您的瀏覽器，前往 GitHub 上的 `LuckyDrawCalendar` 儲存庫頁面。
2. 在上方標籤列中點擊最右邊的「**Settings**」(設定)。
3. 在左側邊欄中，找到「Code and automation」區塊，點擊其中的「**Pages**」。
4. 在「Build and deployment」區塊下的設定：
   - **Source**: 確保選取的是 `Deploy from a branch`。
   - **Branch**: 選擇 `main` 分支。
   - 點擊右側的 「**Save**」 按鈕。
5. 網頁準備好後，即可存取您華麗又極速的抽籤日曆網頁！

## 驗證
- **UI 確認**：網頁具有明亮的高質感、無「日」字的精簡日曆、去除了六日的顯示。
- **日曆邏輯**：勾選股票後，日曆上會橫跨顯示 3 天營業日 (抽籤日 T-1 到 T+1)，且在對應日期會自動將「承銷價」加總顯示於事件底部！
