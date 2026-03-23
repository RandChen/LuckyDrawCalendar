# 抽籤日曆 (Lucky Draw Calendar) 實作完成 Walkthrough

恭喜！專案的本地開發與 Git 初始化已經完成。為確保一切正常運作並成功上線，請依照以下步驟進行部署與驗證：

## 1. 部署 Google Apps Script
1. 打開您的 [Google Apps Script 專案](https://script.google.com/d/1G5CVicdZfBex7cGdsCKOjziXBRDYTOrDSM6ZIUBO0p2RaBnsNHb3uko8/edit?usp=sharing)
2. 將我為您撰寫的 [Code.gs](file:///C:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/Code.gs) (在您資料夾內的檔案) 內容複製並貼上到 GAS 編輯器中。
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
   - 點擊右上角「部署」->「新增部署作業」
   - 類型選擇「網頁應用程式 (Web App)」
   - 執行身份：「我」
   - 誰可以存取：「所有人 (Anyone)」
   - 點擊部署，並**複製「網頁應用程式網址 (Web App URL)」**。

## 2. 更新前端 API 網址
1. 開啟您資料夾內的 [script.js](file:///c:/Users/07454.rand.chen/Desktop/Antigraty_luckydrawcalendar/script.js)。
2. 找到第 18 行：
   ```js
   const gasAPIUrl = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';
   ```
3. 將剛剛複製的 Web App URL 替換進去並存檔。

## 3. 推送至 GitHub 並開啟 GitHub Pages
我已經在您的 `Antigraty_luckydrawcalendar` 資料夾內初始化了 Git 並且加入 origin (https://github.com/RandChen/LuckyDrawCalendar.git)。請打開終端機 (或 PowerShell) 執行：
```bash
git add .
git commit -m "Update API URL"
git push -u origin main
```
> 若跳出 GitHub 登入驗證視窗，請完成登入。

1. 打開您的瀏覽器，前往 GitHub 上的 `LuckyDrawCalendar` 儲存庫頁面。
2. 在上方標籤列中點擊最右邊的「**Settings**」(設定)。
3. 在左側邊欄中，找到「Code and automation」區塊，點擊其中的「**Pages**」。
4. 在「Build and deployment」區塊下的設定：
   - **Source**: 確保選取的是 `Deploy from a branch`。
   - **Branch**: 點擊下拉選單（目前可能是 `None`），選擇 `main` 分支。
   - 分支旁的資料夾選單請保持為 `/(root)`。
   - 點擊右側的 「**Save**」 按鈕。
5. 設定完成後，請重新整理頁面或稍等 1-2 分鐘，畫面上方會出現一個黃色或綠色的橫條，顯示「Your site is live at...」，點擊該連結即可開啟您的抽籤日曆網頁！

## 驗證
- **UI 確認**：網頁具有深色玻璃擬物 (Glassmorphism) 風格及互動動畫。
- **日曆邏輯**：勾選股票後，日曆上會橫跨顯示 3 天 (抽籤日 T-1 到 T+1)，且在對應日期會自動將「承銷價」加總顯示於日曆上！
