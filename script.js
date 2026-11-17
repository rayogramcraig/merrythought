(() => {
  'use strict';
  const body = document.body;
  const modal = document.querySelector('#vision-modal');
  const viewer = document.querySelector('#pdf-viewer');
  const pageStatus = document.querySelector('#page-status');
  const prevButton = document.querySelector('#prev-page');
  const nextButton = document.querySelector('#next-page');
  const closeButton = document.querySelector('#close-vision');
  const PAGE_FOLDER = 'assets/pages/';
  const TOTAL_PAGES = 12;
  let currentPage = 1;
  let previousFocus = null;
  let currentSection = 'home';
  let closeTimeout;

  function renderPdfPage() {
    pageStatus.textContent = `${String(currentPage).padStart(2, '0')} / ${String(TOTAL_PAGES).padStart(2, '0')}`;
    prevButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= TOTAL_PAGES;
    viewer.src = `${PAGE_FOLDER}vision-${String(currentPage).padStart(2, '0')}.webp`;
    viewer.alt = `Merrythought vision presentation, page ${currentPage} of ${TOTAL_PAGES}`;
  }
  function openVision(pushHistory = true) {
    previousFocus = document.activeElement;
    currentPage = 1;
    renderPdfPage();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    body.style.overflow = 'hidden';
    if (pushHistory) history.pushState({ section: 'vision' }, '', '#vision');
    closeButton.focus({ preventScroll: true });
  }
  function closeVision({ updateHistory = true } = {}) {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    body.style.overflow = '';
    clearTimeout(closeTimeout);
    // Keep the current rendered page in place to avoid a blank flash on reopening.
    if (updateHistory) history.pushState({ section: currentSection }, '', `#${currentSection}`);
    previousFocus?.focus?.({ preventScroll: true });
  }
  function navigate(section, pushHistory = true) {
    if (section === 'vision') { openVision(pushHistory); return; }
    if (!['home','involved','events'].includes(section)) section = 'home';
    if (modal.classList.contains('is-open')) closeVision({ updateHistory: false });
    body.dataset.page = section;
    currentSection = section;
    document.querySelectorAll('.nav-label').forEach(el => {
      if (section === 'home') el.removeAttribute('aria-current');
      else if (el.dataset.target === section) el.setAttribute('aria-current', 'page');
      else el.removeAttribute('aria-current');
    });
    if (pushHistory) history.pushState({ section }, '', `#${section}`);
  }
  document.querySelectorAll('[data-target]').forEach(el => el.addEventListener('click', () => navigate(el.dataset.target)));
  document.querySelector('#home-link').addEventListener('click', e => { e.preventDefault(); navigate('home'); });
  document.querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', () => closeVision()));
  closeButton.addEventListener('click', () => closeVision());
  prevButton.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderPdfPage(); } });
  nextButton.addEventListener('click', () => { if (currentPage < TOTAL_PAGES) { currentPage++; renderPdfPage(); } });
  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') { e.preventDefault(); closeVision(); }
    else if (e.key === 'ArrowRight' && currentPage < TOTAL_PAGES) { currentPage++; renderPdfPage(); }
    else if (e.key === 'ArrowLeft' && currentPage > 1) { currentPage--; renderPdfPage(); }
    else if (e.key === 'Tab') {
      const controls = [...modal.querySelectorAll('a, button')].filter(el => !el.disabled);
      const first = controls[0], last = controls[controls.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  window.addEventListener('popstate', () => {
    const section = location.hash.replace('#','') || 'home';
    if (section === 'vision') {
      if (!modal.classList.contains('is-open')) openVision(false);
    } else navigate(section, false);
  });
  // Preload adjacent pages for instant arrow navigation.
  for (let page = 1; page <= TOTAL_PAGES; page++) { const preload = new Image(); preload.src = `${PAGE_FOLDER}vision-${String(page).padStart(2, '0')}.webp`; }
  navigate(location.hash.replace('#','') || 'home', false);
})();
