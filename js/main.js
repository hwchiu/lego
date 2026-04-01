document.addEventListener('DOMContentLoaded', () => {

  // 1. Nav highlight
  const path = window.location.pathname;
  const navLinks = document.querySelectorAll('.sidebar-links a');
  navLinks.forEach(link => link.classList.remove('active'));
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if ((path.includes('news.html')) && href?.includes('news.html')) {
      link.classList.add('active');
    } else if ((path.includes('earnings.html')) && href?.includes('earnings.html')) {
      link.classList.add('active');
    } else if ((path.endsWith('/') || path.includes('index.html')) && href?.includes('index.html')) {
      link.classList.add('active');
    }
  });

  // 2. News tab filtering
  const newsTabs = document.getElementById('news-tabs');
  if (newsTabs) {
    const pills = newsTabs.querySelectorAll('.pill-tab');
    const newsGrid = document.getElementById('news-grid');
    const newsEmpty = document.getElementById('news-empty');

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const filter = pill.dataset.filter;
        const cards = newsGrid.querySelectorAll('.news-card');
        let visibleCount = 0;

        cards.forEach(card => {
          const show = filter === 'all' || card.dataset.category === filter;
          card.style.display = show ? '' : 'none';
          if (show) {
            visibleCount++;
            card.classList.add('fade-in');
            card.addEventListener('animationend', () => card.classList.remove('fade-in'), { once: true });
          }
        });

        if (newsEmpty) {
          newsEmpty.style.display = visibleCount === 0 ? '' : 'none';
        }
      });
    });
  }

  // 3–5. Earnings filtering (time tabs, market dropdown, calendar)
  const timeTabs = document.querySelectorAll('[data-filter-type="time"]');
  const marketFilter = document.getElementById('market-filter');
  const earningsGrid = document.getElementById('earnings-grid');

  if (timeTabs.length || marketFilter || earningsGrid) {

    // Shared filter logic
    function applyEarningsFilter() {
      const timeTab = document.querySelector('[data-filter-type="time"].active');
      const timeFilter = timeTab ? timeTab.dataset.filter : 'month';
      const mktVal = document.getElementById('market-filter')?.value || 'all';
      const selectedDay = document.querySelector('.calendar-day.selected');
      const selectedDate = selectedDay ? selectedDay.dataset.date : null;

      const cards = document.querySelectorAll('.earnings-card');
      const emptyState = document.getElementById('earnings-empty');
      let visibleCount = 0;

      cards.forEach(card => {
        let show = true;

        if (selectedDate) {
          show = card.dataset.date === selectedDate;
        } else {
          if (timeFilter !== 'month') {
            show = card.dataset.week === timeFilter;
          }
        }

        if (show && mktVal !== 'all') {
          show = card.dataset.market === mktVal;
        }

        card.style.display = show ? '' : 'none';
        if (show) {
          visibleCount++;
          card.classList.add('fade-in');
          card.addEventListener('animationend', () => card.classList.remove('fade-in'), { once: true });
        }
      });

      if (emptyState) {
        emptyState.style.display = visibleCount === 0 ? '' : 'none';
      }
    }

    // Feature 3: Earnings time tab clicks
    timeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        timeTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        applyEarningsFilter();
      });
    });

    // Feature 4: Market dropdown change
    if (marketFilter) {
      marketFilter.addEventListener('change', () => applyEarningsFilter());
    }

    // Feature 5: Calendar day click
    const calendarDays = document.querySelectorAll('.calendar-day.has-us, .calendar-day.has-tw, .calendar-day.has-multi');
    calendarDays.forEach(day => {
      day.addEventListener('click', () => {
        if (day.classList.contains('selected')) {
          day.classList.remove('selected');
        } else {
          document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
          day.classList.add('selected');

          // Switch time tab to "本月"
          timeTabs.forEach(t => {
            t.classList.toggle('active', t.dataset.filter === 'month');
          });
        }
        applyEarningsFilter();
      });
    });
  }

});
