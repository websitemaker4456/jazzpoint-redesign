// JazzPoint — Area Manager. Vanilla JS for UI states only; data wiring is marked with API comments.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  if (window.lucide) lucide.createIcons();

  // Theme (persisted)
  const root = document.documentElement;
  root.dataset.theme = localStorage.getItem('jp-theme') || 'light';

  // Float runway status: >3 days good, 1.5–3 warn, <1.5 bad. 7 segments = 7 days.
  function setRunway(floatAvailable, avgDailyUse) {
    const days = avgDailyUse > 0 ? floatAvailable / avgDailyUse : 99;
    const el = $('.runway');
    el.dataset.status = days > 3 ? 'good' : days >= 1.5 ? 'warn' : 'bad';
    $('[data-bind="runwayDays"]').textContent = days >= 99 ? '7+' : days.toFixed(1);
    $$('.runway__bar li').forEach((li, i) => li.classList.toggle('is-filled', i < Math.min(7, Math.ceil(days))));
  }
  // API: replace with GET /float → { available, avgDailyUse7d }
  setRunway(2450000, 980000);

  // Refresh balance: idle → loading (spin) → done (check) → idle
  const refreshBtn = $('.refresh-btn');
  refreshBtn.addEventListener('click', async () => {
    if (refreshBtn.dataset.state === 'loading') return;
    refreshBtn.dataset.state = 'loading';
    await new Promise(r => setTimeout(r, 900)); // API: await fetch('/float')
    refreshBtn.dataset.state = 'done';
    refreshBtn.innerHTML = '<i data-lucide="check" class="icon"></i>'; lucide.createIcons();
    $('[data-bind="balanceUpdated"]').textContent = 'just now';
    setTimeout(() => { refreshBtn.dataset.state = 'idle'; refreshBtn.innerHTML = '<i data-lucide="rotate-cw" class="icon"></i>'; lucide.createIcons(); }, 1200);
  });

  // Overlays
  const overlay = $('.overlay'), panel = $('#notif-panel'), drawer = $('#menu-drawer');
  const open = (el, btnSel) => { overlay.hidden = false; el.hidden = false; $$(btnSel).forEach(b => b.setAttribute('aria-expanded', 'true')); };
  const closeAll = () => { overlay.hidden = panel.hidden = drawer.hidden = true; $$('[aria-expanded]').forEach(b => b.setAttribute('aria-expanded', 'false')); };

  document.addEventListener('click', e => {
    const a = e.target.closest('[data-action]'); if (!a) return;
    switch (a.dataset.action) {
      case 'toggle-theme': root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'; localStorage.setItem('jp-theme', root.dataset.theme); break;
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
  addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    toTop.classList.toggle('is-visible', scrollY > 300);
    toTop.style.setProperty('--progress', max > 0 ? Math.round(scrollY / max * 100) : 0);
  }, { passive: true });

  // Bottom nav: slide indicator to tapped tab, then navigate
  const nav = $('.bottom-nav'), ind = $('.bottom-nav__indicator'), links = $$('a', nav);
  const place = i => ind.style.transform = `translateX(${i * 100}%)`;
  place(Math.max(0, links.findIndex(l => l.getAttribute('aria-current') === 'page')));
  links.forEach((l, i) => l.addEventListener('click', e => {
    if (l.getAttribute('aria-current') === 'page') return;
    e.preventDefault(); place(i);
    links.forEach(x => x.removeAttribute('aria-current')); l.setAttribute('aria-current', 'page');
    setTimeout(() => location.href = l.href, 300);
  }));
})();
