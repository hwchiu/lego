document.addEventListener('DOMContentLoaded', () => {

  // ===== BANNER CAROUSEL =====
  const slides = document.querySelectorAll('.banner-slide');
  let current = 0;

  function showSlide(idx) {
    slides.forEach(s => s.classList.remove('active'));
    slides[idx].classList.add('active');
    current = idx;
  }

  // Dot clicks (each slide has its own set of dots)
  document.querySelectorAll('.banner-dot').forEach(dot => {
    dot.addEventListener('click', () => showSlide(+dot.dataset.idx));
  });

  // Auto-rotate every 6 seconds
  setInterval(() => showSlide((current + 1) % slides.length), 6000);


  // ===== MARKET TABS =====
  document.querySelectorAll('.market-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.market-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });


  // ===== DETAIL TABS (EPS / Revenue) =====
  const tabEps     = document.getElementById('tabEps');
  const tabRevenue = document.getElementById('tabRevenue');

  document.querySelectorAll('.detail-tab:not(.locked)').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.detail-tab:not(.locked)').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const which = tab.dataset.tab;
      tabEps.style.display     = which === 'eps'     ? '' : 'none';
      tabRevenue.style.display = which === 'revenue' ? '' : 'none';
    });
  });


  // ===== CURRENCY TOGGLE =====
  const btnUSD = document.getElementById('btnUSD');
  const btnNTD = document.getElementById('btnNTD');
  if (btnUSD && btnNTD) {
    [btnUSD, btnNTD].forEach(btn => {
      btn.addEventListener('click', () => {
        btnUSD.classList.toggle('active', btn === btnUSD);
        btnNTD.classList.toggle('active', btn === btnNTD);
      });
    });
  }


  // ===== CALENDAR MONTH NAV =====
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  let calYear = 2026, calMonth = 3; // April = index 3
  const label = document.getElementById('calMonthLabel');

  document.getElementById('calPrev').addEventListener('click', () => {
    calMonth--;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    label.textContent = `${months[calMonth]} ${calYear}`;
  });
  document.getElementById('calNext').addEventListener('click', () => {
    calMonth++;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    label.textContent = `${months[calMonth]} ${calYear}`;
  });

});
