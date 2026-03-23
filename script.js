document.addEventListener('DOMContentLoaded', function () {

    // Set the current year in the footer
    document.getElementById('year').textContent = new Date().getFullYear();

    const calendarEl = document.getElementById('calendar');

    // Initialize FullCalendar
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: window.innerWidth < 600 ? 'dayGridWeek' : 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: window.innerWidth < 600 ? 'dayGridMonth,dayGridWeek' : 'dayGridMonth,dayGridWeek'
        },
        views: {
            dayGridMonth: {
                dayHeaderContent: (args) => {
                    return args.date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                }
            },
            dayGridWeek: {
                dayHeaderContent: (args) => {
                    const date = args.date;
                    const month = date.getMonth() + 1;
                    const day = date.getDate();
                    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                    return { html: `${month}/${day}<br>${weekday}` };
                }
            }
        },
        locale: 'zh-tw',
        dayCellContent: function(arg) {
            // Remove '日' from the day number text (e.g. '1日' -> '1')
            return arg.dayNumberText.replace('日', '');
        },
        firstDay: 7, // Monday as first day of week
        eventOrder: 'sortOrder', // Force sum at the bottom
        events: [] // We'll populate this dynamically
    });
    calendar.render();

    // The Google Apps Script deployed Web App URL
    // REPLACE WITH ACTUAL DEPLOYED MACRO URL
    const gasAPIUrl = 'https://script.google.com/macros/s/AKfycbxLu9ptwdUUy05aGPv7mFP4Rst_PyNy1H1D5BsZKsQFaz-YZZWhBiF6sYgvfdnSJh8mUQ/exec';

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
                { seq: 1, lotteryDate: '2026-03-24', name: '倍利科', symbol: '7822', market: '初上市', price: 780000 },
                { seq: 2, lotteryDate: '2026-03-20', name: '世紀風電', symbol: '2072', market: '初上市', price: 186000 },
                { seq: 3, lotteryDate: '2026-03-24', name: '公勝保經', symbol: '6028', market: '初上櫃', price: 72000 },
                { seq: 4, lotteryDate: '2026-03-27', name: '建舜電', symbol: '3322', market: '上櫃增資', price: 11130 }
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
            // Fix: Parse date string correctly considering timezones
            // Manual parsing to avoid UTC shift
            const rawDate = stock.lotteryDate.toString().split('T')[0];
            const parts = rawDate.split(/[-/]/).map(Number);
            const cleanLotteryDate = `${parts[0]}-${String(parts[1]).padStart(2, '0')}-${String(parts[2]).padStart(2, '0')}`;

            stock.lotteryDate = cleanLotteryDate;

            const item = document.createElement('div');
            item.className = 'stock-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `stock-${stock.seq}`;
            checkbox.value = stock.seq;

            // Listen to check toggle
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
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
            nameEl.innerText = `${stock.name} (${stock.symbol})`; // Simplified for mobile

            const marketTag = document.createElement('span');
            marketTag.style.fontSize = '0.7em';
            marketTag.style.marginLeft = '8px';
            marketTag.style.color = 'var(--text-muted)';
            marketTag.innerText = stock.market;
            nameEl.appendChild(marketTag);

            const metaContainer = document.createElement('div');
            metaContainer.style.display = 'flex';
            metaContainer.style.flexDirection = 'column';
            metaContainer.style.gap = '4px';

            const metaEl = document.createElement('div');
            metaEl.className = 'stock-meta';

            const dateStr = document.createElement('span');
            dateStr.innerText = `抽籤日: ${cleanLotteryDate}`;

            const priceStr = document.createElement('span');
            priceStr.className = 'stock-price';
            priceStr.innerText = `$${stock.price.toLocaleString()}`;

            metaEl.appendChild(dateStr);
            metaEl.appendChild(priceStr);

            const periodEl = document.createElement('div');
            // Remove time portion if present in string ISO format from API, and extract MM-DD
            const cleanStartDate = stock.startDate.toString().split('T')[0].substring(5);
            const cleanEndDate = stock.endDate.toString().split('T')[0].substring(5);
            periodEl.innerText = `申購期間: ${cleanStartDate} ~ ${cleanEndDate}`;
            periodEl.style.fontSize = '0.75rem';
            periodEl.style.color = 'var(--text-muted)';

            metaContainer.appendChild(metaEl);
            metaContainer.appendChild(periodEl);

            info.appendChild(nameEl);
            info.appendChild(metaContainer);

            item.appendChild(checkbox);
            item.appendChild(info);

            // Click on the whole item row to toggle checkbox
            item.addEventListener('click', (e) => {
                if (e.target.tagName !== 'INPUT') {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });

            stockListEl.appendChild(item);
        });
    }

    // Date manipulation helper (Safe from UTC shifts)
    function getOffsetDateStr(dateStr, offsetDays) {
        const parts = dateStr.split('-');
        const d = new Date(parts[0], parts[1] - 1, parts[2]); // Create as local date

        // If offset is -1 or 1, ensure the result is a Business Day (skip Sat/Sun)
        if (Math.abs(offsetDays) === 1) {
            let step = offsetDays;
            d.setDate(d.getDate() + step);
            while (d.getDay() === 0 || d.getDay() === 6) { // 0=Sun, 6=Sat
                d.setDate(d.getDate() + step);
            }
        } else {
            d.setDate(d.getDate() + offsetDays);
        }

        const resY = d.getFullYear();
        const resM = String(d.getMonth() + 1).padStart(2, '0');
        const resD = String(d.getDate()).padStart(2, '0');
        return `${resY}-${resM}-${resD}`;
    }

    function updateCalendar() {
        const events = [];
        const dailySum = {};

        // Calculate spans and sums
        allStocks.forEach(stock => {
            if (selectedStocks.has(stock.seq)) {
                // Determine Business T-1, T, Business T+1
                const tMinus1 = getOffsetDateStr(stock.lotteryDate, -1);
                const tDate = stock.lotteryDate;
                const tPlus1 = getOffsetDateStr(stock.lotteryDate, 1);

                // For FullCalendar event range (end date is exclusive)
                // We want to show until tPlus1 (so end is tPlus1 + 1 day)
                const rangeEnd = getOffsetDateBase(tPlus1, 1);

                // 1. Add Stock Span Event
                events.push({
                    id: `event-${stock.seq}`,
                    title: stock.name,
                    start: tMinus1,
                    end: rangeEnd,
                    allDay: true,
                    classNames: ['event-stock'],
                    sortOrder: 1 // Top
                });

                // 2. Accumulate price for the exact 3 days (Price * 1000 per lot)
                const priceValue = (Number(stock.price) || 0) * 1000;
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
                    title: `$${dailySum[date].toLocaleString()}`,
                    start: date,
                    allDay: true,
                    classNames: ['event-sum'],
                    sortOrder: 2 // Bottom
                });
            }
        });

        // Re-render calendar events
        calendar.removeAllEvents();
        calendar.addEventSource(events);
    }

    // Simple offset without business day logic for range calculations
    function getOffsetDateBase(dateStr, offsetDays) {
        const parts = dateStr.split('-');
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        d.setDate(d.getDate() + offsetDays);
        const resY = d.getFullYear();
        const resM = String(d.getMonth() + 1).padStart(2, '0');
        const resD = String(d.getDate()).padStart(2, '0');
        return `${resY}-${resM}-${resD}`;
    }

    // Try to load data
    loadData();

});
