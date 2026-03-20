document.addEventListener('DOMContentLoaded', function() {
    
    // Set the current year in the footer
    document.getElementById('year').textContent = new Date().getFullYear();

    const calendarEl = document.getElementById('calendar');
    
    // Initialize FullCalendar
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek'
        },
        locale: 'zh-tw',
        firstDay: 1, // Monday as first day of week
        events: [] // We'll populate this dynamically
    });
    calendar.render();

    // The Google Apps Script deployed Web App URL
    // REPLACE WITH ACTUAL DEPLOYED MACRO URL
    const gasAPIUrl = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';
    
    let allStocks = [];
    let selectedStocks = new Set(); // Store seq numbers of checked stocks

    const loadingEl = document.getElementById('loading');
    const stockListEl = document.getElementById('stock-list');

    // For testing and placeholder purposes since we can't fetch without a deployed GAS API
    // Let's use dummy data or try fetching if a URL is provided.
    function loadData() {
        if (gasAPIUrl === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
            // Provide mock data to demonstrate functionality
            allStocks = [
                {seq: 1, lotteryDate: '2026-03-24', name: '倍利科', symbol: '7822', market: '初上市', price: 780000},
                {seq: 2, lotteryDate: '2026-03-20', name: '世紀風電', symbol: '2072', market: '初上市', price: 186000},
                {seq: 3, lotteryDate: '2026-03-24', name: '公勝保經', symbol: '6028', market: '初上櫃', price: 72000},
                {seq: 4, lotteryDate: '2026-03-27', name: '建舜電', symbol: '3322', market: '上櫃增資', price: 11130}
            ];
            renderStockList();
            return;
        }

        fetch(gasAPIUrl)
            .then(response => response.json())
            .then(data => {
                allStocks = data;
                renderStockList();
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                loadingEl.innerText = "無法載入資料，請確認 API 網址是否正確。";
            });
    }

    function renderStockList() {
        loadingEl.style.display = 'none';
        stockListEl.style.display = 'flex';
        stockListEl.innerHTML = '';

        if (allStocks.length === 0) {
            stockListEl.innerHTML = '<div style="color: var(--text-muted)">目前沒有近期的股票抽籤資料。</div>';
            return;
        }

        allStocks.forEach(stock => {
            const item = document.createElement('div');
            item.className = 'stock-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `stock-${stock.seq}`;
            checkbox.value = stock.seq;
            
            // Listen to check toggle
            checkbox.addEventListener('change', (e) => {
                if(e.target.checked) {
                    selectedStocks.add(stock.seq);
                } else {
                    selectedStocks.delete(stock.seq);
                }
                updateCalendar();
            });

            const info = document.createElement('div');
            info.className = 'stock-info';
            
            const nameEl = document.createElement('div');
            nameEl.className = 'stock-name';
            nameEl.innerText = `${stock.name} (${stock.symbol}) - ${stock.market}`;
            
            const metaEl = document.createElement('div');
            metaEl.className = 'stock-meta';
            
            const dateStr = document.createElement('span');
            dateStr.innerText = `抽籤日: ${stock.lotteryDate}`;
            
            const priceStr = document.createElement('span');
            priceStr.className = 'stock-price';
            priceStr.innerText = `$${stock.price.toLocaleString()}`;

            metaEl.appendChild(dateStr);
            metaEl.appendChild(priceStr);
            
            info.appendChild(nameEl);
            info.appendChild(metaEl);

            item.appendChild(checkbox);
            item.appendChild(info);
            
            // Click on the whole item row to toggle checkbox
            item.addEventListener('click', (e) => {
                if(e.target.tagName !== 'INPUT') {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });

            stockListEl.appendChild(item);
        });
    }

    // Date manipulation helper
    function getOffsetDateStr(dateStr, offsetDays) {
        const d = new Date(dateStr);
        d.setDate(d.getDate() + offsetDays);
        return d.toISOString().split('T')[0];
    }

    function updateCalendar() {
        const events = [];
        const dailySum = {};

        // Calculate spans and sums
        allStocks.forEach(stock => {
            if (selectedStocks.has(stock.seq)) {
                // Determine T-1, T, T+1
                const tMinus1 = getOffsetDateStr(stock.lotteryDate, -1);
                const tDate = stock.lotteryDate;
                const tPlus1 = getOffsetDateStr(stock.lotteryDate, 1);
                
                // For FullCalendar event range which is exclusive on the end date
                // Span is from T-1 to T+1 (so end is T+2)
                const tPlus2 = getOffsetDateStr(stock.lotteryDate, 2);

                // 1. Add Stock Span Event
                events.push({
                    id: `event-${stock.seq}`,
                    title: stock.name,
                    start: tMinus1,
                    end: tPlus2,
                    allDay: true,
                    classNames: ['event-stock']
                });

                // 2. Accumulate price for the exact 3 days
                const priceValue = Number(stock.price) || 0;
                [tMinus1, tDate, tPlus1].forEach(d => {
                    dailySum[d] = (dailySum[d] || 0) + priceValue;
                });
            }
        });

        // Add corresponding sum events
        Object.keys(dailySum).forEach(date => {
            if (dailySum[date] > 0) {
                events.push({
                    id: `sum-${date}`,
                    title: `總計: $${dailySum[date].toLocaleString()}`,
                    start: date,
                    allDay: true,
                    classNames: ['event-sum']
                });
            }
        });

        // Re-render calendar events
        calendar.removeAllEvents();
        calendar.addEventSource(events);
    }

    // Try to load data
    loadData();

});
