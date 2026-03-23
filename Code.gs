// Code.gs

// The user provided Google Sheets URL:
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1x4V2nNJjTAJqNLfdIWNuwAULhOE_dsLaePNkXJdvKfY/edit?usp=sharing';

/**
 * 將民國日期字串 (如 115/03/31) 轉換為西元 yyyy-mm-dd 格式
 */
function convertToADDate(rocDateStr) {
  if (!rocDateStr || typeof rocDateStr !== 'string') return rocDateStr;
  const parts = rocDateStr.split('/');
  if (parts.length === 3) {
    const adYear = parseInt(parts[0], 10) + 1911;
    const mm = parts[1].padStart(2, '0');
    const dd = parts[2].padStart(2, '0');
    return `${adYear}-${mm}-${dd}`;
  }
  return rocDateStr;
}

function fetchAndFilterStockInfo() {
  const twseUrl = 'https://www.twse.com.tw/rwd/zh/announcement/publicForm?response=JSON';
  const response = UrlFetchApp.fetch(twseUrl);
  const json = JSON.parse(response.getContentText());
  
  if (json.stat !== "OK" || !json.data) {
    Logger.log("Failed to fetch or parse TWSE data.");
    return;
  }
  
  // Today's date calculations (GMT+8)
  const today = new Date();
  today.setHours(today.getHours() + 8); // Adjust to roughly GMT+8 if running on server 
  // Actually, GAS usually sets script timezone. Better to use strict dates based on yyyy/MM/dd.
  const todayStr = Utilities.formatDate(new Date(), "Asia/Taipei", "yyyy-MM-dd");
  const todayDate = new Date(todayStr + "T00:00:00+08:00");
  
  const minus14 = new Date(todayDate.getTime() - 3 * 24 * 60 * 60 * 1000);
  const plus14 = new Date(todayDate.getTime() + 14 * 24 * 60 * 60 * 1000);
  
  const filteredData = [];
  
  json.data.forEach(row => {
    // Row indices:
    // 0: 序號
    // 1: 抽籤日期 (ROC format: 115/03/31)
    // 2: 證券名稱
    // 3: 證券代號
    // 4: 發行市場
    // 9: 承銷價(元)
    
    // Condition 1: 序號 <= 10
    const seq = parseInt(row[0], 10);
    if (isNaN(seq) || seq > 10) return;
    
    // Condition 2: 發行市場 != "中央登錄公債"
    const market = row[4];
    if (market === "中央登錄公債") return;
    
    // Condition 3: Date in [-1, +14]
    const rocDateStr = row[1]; // e.g., "115/03/31"
    const parts = rocDateStr.split('/');
    if (parts.length === 3) {
      const adYear = parseInt(parts[0], 10) + 1911;
      const adDateStr = `${adYear}-${parts[1]}-${parts[2]}`;
      const lotteryDate = new Date(adDateStr + "T00:00:00+08:00");
      
      if (lotteryDate >= minus14 && lotteryDate <= plus14) {
        filteredData.push({
          seq: seq,
          lotteryDate: adDateStr,
          name: row[2],
          symbol: row[3],
          market: row[4],
          price: parseFloat(row[9].replace(/,/g, '')) || 0,
          startDate: convertToADDate(row[5]),
          endDate: convertToADDate(row[6]),
          rawRow: row // can keep full row if needed
        });
      }
    }
  });
  
  // Write to Google Sheet
  const sheet = SpreadsheetApp.openByUrl(SHEET_URL).getSheets()[0];
  
  // Clear previous data
  sheet.clearContents();
  
  // Headers
  const headers = ["序號", "抽籤日期", "證券名稱", "證券代號", "發行市場", "承銷價(元)", "申購開始日", "申購結束日"];
  sheet.appendRow(headers);
  
  // Data rows
  filteredData.forEach(item => {
    sheet.appendRow([
      item.seq,
      item.lotteryDate, // We write the converted AD date
      item.name,
      item.symbol,
      item.market,
      item.price,
      item.startDate,
      item.endDate
    ]);
  });
  
  // Clear the cache whenever new data is fetched and written
  const cache = CacheService.getScriptCache();
  cache.remove("luckyDrawData");
  
  Logger.log("Finished writing " + filteredData.length + " rows to Sheet and cleared cache.");
}

// Web App API to serve data to frontend
function doGet(e) {
  const cache = CacheService.getScriptCache();
  const cachedData = cache.get("luckyDrawData");
  
  if (cachedData) {
    return ContentService.createTextOutput(cachedData).setMimeType(ContentService.MimeType.JSON);
  }

  const sheet = SpreadsheetApp.openByUrl(SHEET_URL).getSheets()[0];
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  const result = [];
  
  // Assuming row 0 is headers
  if (values.length > 1) {
    for (let i = 1; i < values.length; i++) {
       const row = values[i];
       
       // Formatter function to prevent UTC shift
       const formatDate = (val) => {
           if (val instanceof Date) {
               return Utilities.formatDate(val, "Asia/Taipei", "yyyy-MM-dd");
           }
           return val;
       };
       
       result.push({
         seq: row[0],
         lotteryDate: formatDate(row[1]),
         name: row[2],
         symbol: row[3],
         market: row[4],
         price: row[5],
         startDate: formatDate(row[6]),
         endDate: formatDate(row[7])
       });
    }
  }
  
  const jsonString = JSON.stringify(result);
  cache.put("luckyDrawData", jsonString, 21600); // Cache for 6 hours
  
  return ContentService.createTextOutput(jsonString).setMimeType(ContentService.MimeType.JSON);
}
