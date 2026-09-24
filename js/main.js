// JazzPoint — Area Manager. Vanilla JS for UI states only; data wiring is marked with API comments.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Theme (persisted). The header toggle swaps its own icon: moon in light mode (tap for dark),
  // sun in dark mode (tap for light).
  const root = document.documentElement;
  const themeIcon = $('[data-theme-icon]');
  function applyTheme(theme) {
    root.dataset.theme = theme;
    if (themeIcon) themeIcon.setAttribute('href', theme === 'dark' ? '#icon-sun' : '#icon-moon');
  }
  applyTheme(localStorage.getItem('jp-theme') || 'light');

  // Float runway status: >3 days good, 1.5–3 warn, <1.5 bad. 7 segments = 7 days.
  function setRunway(floatAvailable, avgDailyUse) {
    const el = $('.runway');
    if (!el) return;
    const days = avgDailyUse > 0 ? floatAvailable / avgDailyUse : 99;
    el.dataset.status = days > 3 ? 'good' : days >= 1.5 ? 'warn' : 'bad';
    $('[data-bind="runwayDays"]').textContent = days >= 99 ? '7+' : days.toFixed(1);
    $$('.runway__bar li').forEach((li, i) => li.classList.toggle('is-filled', i < Math.min(7, Math.ceil(days))));
  }
  // API: replace with GET /float → { available, avgDailyUse7d }
  setRunway(2450000, 980000);

  // Refresh balance: idle → loading (spin) → done (check) → idle. The icon itself only ever
  // shows rotate-cw or check; CSS spins the rotate-cw icon while data-state="loading".
  const refreshBtn = $('.refresh-btn');
  if (refreshBtn) {
    const refreshIcon = $('[data-refresh-icon]', refreshBtn);
    refreshBtn.addEventListener('click', async () => {
      if (refreshBtn.dataset.state === 'loading') return;
      refreshBtn.dataset.state = 'loading';
      await new Promise(r => setTimeout(r, 900)); // API: await fetch('/float')
      refreshBtn.dataset.state = 'done';
      refreshIcon.setAttribute('href', '#icon-check');
      $('[data-bind="balanceUpdated"]').textContent = 'just now';
      setTimeout(() => {
        refreshBtn.dataset.state = 'idle';
        refreshIcon.setAttribute('href', '#icon-rotate-cw');
      }, 1200);
    });
  }

  // Overlays
  const overlay = $('.overlay'), panel = $('#notif-panel'), drawer = $('#menu-drawer');
  const open = (el, btnSel) => { overlay.hidden = false; el.hidden = false; $$(btnSel).forEach(b => b.setAttribute('aria-expanded', 'true')); };
  const closeAll = () => { overlay.hidden = panel.hidden = drawer.hidden = true; $$('[aria-expanded]').forEach(b => b.setAttribute('aria-expanded', 'false')); };

  document.addEventListener('click', e => {
    const a = e.target.closest('[data-action]'); if (!a) return;
    switch (a.dataset.action) {
      case 'toggle-theme': applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'); localStorage.setItem('jp-theme', root.dataset.theme); break;
      case 'open-notifs': open(panel, '[data-action="open-notifs"]'); break;
      case 'open-menu': open(drawer, '[data-action="open-menu"]'); break;
      case 'close-overlays': closeAll(); break;
      case 'mark-read': $$('.notif.is-unread').forEach(n => n.classList.remove('is-unread')); $$('[data-bind="unreadCount"]').forEach(b => b.hidden = true); break;
      case 'to-top': window.scrollTo({ top: 0, behavior: 'smooth' }); break;
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

  // Back-to-top ring: visible after 300px, ring fills with scroll progress
  const toTop = $('.to-top');
  if (toTop) {
    addEventListener('scroll', () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      toTop.classList.toggle('is-visible', scrollY > 300);
      toTop.style.setProperty('--progress', max > 0 ? Math.round(scrollY / max * 100) : 0);
    }, { passive: true });
  }

  // Bottom nav: slide indicator to tapped tab, then navigate
  const nav = $('.bottom-nav'), ind = $('.bottom-nav__indicator'), links = nav ? $$('a', nav) : [];
  if (nav) {
    const place = i => ind.style.transform = `translateX(${i * 100}%)`;
    place(Math.max(0, links.findIndex(l => l.getAttribute('aria-current') === 'page')));
    links.forEach((l, i) => l.addEventListener('click', e => {
      if (l.getAttribute('aria-current') === 'page') return;
      e.preventDefault(); place(i);
      links.forEach(x => x.removeAttribute('aria-current')); l.setAttribute('aria-current', 'page');
      setTimeout(() => location.href = l.href, 300);
    }));
  }

  // Pull-to-refresh: only armed while the page is scrolled to the very top. The ring's fill
  // (--pull-pct) and the container's height (--pull) are the two CSS custom properties this
  // drives; both are read by css/styles.css's .ptr rules.
  const ptr = $('#ptr');
  if (ptr && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const THRESHOLD = 48, MAX_PULL = 68;
    let startY = null, pulling = false;
    document.addEventListener('touchstart', e => {
      if (scrollY <= 0 && !refreshBtn?.closest('[data-state="loading"]')) {
        startY = e.touches[0].clientY;
        pulling = true;
      }
    }, { passive: true });
    document.addEventListener('touchmove', e => {
      if (!pulling || startY == null || ptr.dataset.state === 'refreshing') return;
      const dy = e.touches[0].clientY - startY;
      if (dy <= 0) { ptr.style.setProperty('--pull', 0); ptr.removeAttribute('data-state'); return; }
      const dist = Math.min(dy * 0.4, MAX_PULL);
      ptr.style.setProperty('--pull', dist);
      ptr.style.setProperty('--pull-pct', Math.min((dist / THRESHOLD) * 100, 100));
      ptr.dataset.state = dist > THRESHOLD ? 'threshold' : 'pulling';
    }, { passive: true });
    document.addEventListener('touchend', () => {
      if (!pulling) return;
      pulling = false;
      const dist = parseFloat(getComputedStyle(ptr).getPropertyValue('--pull')) || 0;
      if (dist > THRESHOLD) {
        ptr.style.setProperty('--pull', 56);
        ptr.dataset.state = 'refreshing';
        // API: await fetch('/dashboard/today') + fetch('/float') to refresh the page's data
        setTimeout(() => {
          ptr.dataset.state = 'done';
          setTimeout(() => { ptr.removeAttribute('data-state'); ptr.style.setProperty('--pull', 0); }, 650);
        }, 700);
      } else {
        ptr.style.setProperty('--pull', 0);
        ptr.removeAttribute('data-state');
      }
      startY = null;
    });
  }
})();
