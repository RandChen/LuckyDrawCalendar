// Code.gs

// The user provided Google Sheets URL:
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1x4V2nNJjTAJqNLfdIWNuwAULhOE_dsLaePNkXJdvKfY/edit?usp=sharing';

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
  
  const minus14 = new Date(todayDate.getTime() - 14 * 24 * 60 * 60 * 1000);
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
    
    // Condition 3: Date in [-14, +14]
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
          startDate: row[5],
          endDate: row[6],
          shares: row[7],
          allotmentDate: row[11],
          winRate: row[16],
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
  const headers = ["序號", "抽籤日期", "證券名稱", "證券代號", "發行市場", "承銷價(元)", "申購開始日", "申購結束日", "承銷股數", "撥券日期", "中籤率(%)"];
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
      item.endDate,
      item.shares,
      item.allotmentDate,
      item.winRate
    ]);
  });
  
  Logger.log("Finished writing " + filteredData.length + " rows to Sheet.");
}

// Web App API to serve data to frontend
function doGet(e) {
  const sheet = SpreadsheetApp.openByUrl(SHEET_URL).getSheets()[0];
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  const result = [];
  
  // Assuming row 0 is headers
  if (values.length > 1) {
    for (let i = 1; i < values.length; i++) {
       result.push({
         seq: values[i][0],
         lotteryDate: values[i][1], // the string or Date object
         name: values[i][2],
         symbol: values[i][3],
         market: values[i][4],
         price: values[i][5],
         startDate: values[i][6],
         endDate: values[i][7],
         shares: values[i][8],
         allotmentDate: values[i][9],
         winRate: values[i][10]
       });
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
