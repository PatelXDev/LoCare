// UI helper: 3-step sidebar (Location -> Symptoms -> Results).
// Only shows/hides panels and mirrors a few values for display. No app logic here.
(function () {
  const sidebar = document.querySelector('.sidebar');
  const panels = Array.from(document.querySelectorAll('.step-panel'));
  const tabs = Array.from(document.querySelectorAll('.step-tab'));
  let current = 1;
  let placeSet = false;

  function go(n) {
    n = Math.max(1, Math.min(panels.length, Number(n) || 1));
    if (n > 1 && !placeSet) return;
    current = n;
    panels.forEach(p => p.classList.toggle('is-active', Number(p.dataset.step) === n));
    tabs.forEach((t, i) => {
      const step = i + 1;
      const dot = t.querySelector('.step-dot');
      t.classList.toggle('is-active', step === n);
      t.classList.toggle('is-done', step < n);
      t.setAttribute('aria-current', step === n ? 'step' : 'false');
      if (dot) dot.textContent = step < n ? '✓' : String(step);
    });
    if (sidebar && sidebar.scrollTo) sidebar.scrollTo({ top: 0 });
  }

  // any element with data-go="N" (tabs, Next / Back buttons) changes step
  document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-go]');
    if (trigger) go(trigger.dataset.go);
  });

  // Results tab shows how many facilities were found (mirrors #resultsCount)
  const resultsCount = document.getElementById('resultsCount');
  const badge = document.getElementById('stepCount');
  function syncCount() {
    if (!resultsCount || !badge) return;
    const m = resultsCount.textContent.match(/^(\d+)\s+Facilities/);
    badge.textContent = m ? m[1] : '';
    badge.hidden = !m;
  }
  if (resultsCount) {
    new MutationObserver(syncCount).observe(resultsCount, { childList: true, characterData: true, subtree: true });
    syncCount();
  }

  // Results step shows which specialists are being prioritised (mirrors the AI result banner)
  const mapper = document.getElementById('mapperBanner');
  const focusLine = document.getElementById('focusLine');
  function syncFocus() {
    if (!mapper || !focusLine) return;
    const strongs = mapper.querySelectorAll('strong');
    const labels = strongs.length > 1 ? strongs[strongs.length - 1].textContent.trim() : '';
    focusLine.hidden = !labels;
    focusLine.textContent = labels ? 'Best matches first for: ' + labels : '';
  }
  if (mapper) {
    new MutationObserver(syncFocus).observe(mapper, { childList: true, subtree: true });
    syncFocus();
  }
  
const scanBtn = document.getElementById('btnScan');
const hint = document.getElementById('placeHint');
const gated = Array.from(document.querySelectorAll('.btn-next, #findBtn'));
function syncGate() {
  if (scanBtn && !scanBtn.disabled) placeSet = true;
  gated.forEach(b => { b.disabled = !placeSet; });
  if (hint) hint.hidden = placeSet;
}
if (scanBtn) new MutationObserver(syncGate).observe(scanBtn, { attributes: true, attributeFilter: ['disabled'] });
syncGate();

  window.LoCareSteps = { go, current: () => current };
  go(1);
})();