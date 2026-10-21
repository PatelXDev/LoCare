// UI helper: the single primary action "Find Nearby Specialists".
// It only CALLS your existing functions, in order, and never changes them:
//   (locateAddressOnly if the place was typed but not pinned) -> runAITriage -> findFacilitiesOnly
(function () {
  const btn = document.getElementById('findBtn');
  if (!btn) return;
  const status = document.getElementById('ctaStatus');
  const city = document.getElementById('cityInput');
  const landmark = document.getElementById('landmarkInput');
  const locateBtn = document.getElementById('btnLocate');
  const label = btn.innerHTML;
  const AI_WAIT_MS = window.LOCARE_AI_WAIT_MS || 12000;   // don't let a slow -AI service block the search
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let busy = false;
  let placeChanged = false;   // true when the user typed a new place and hasn't pinned it yet

  [city, landmark].forEach(el => el && el.addEventListener('input', () => { placeChanged = true; }));
  if (locateBtn) {
    new MutationObserver(() => { if (!locateBtn.disabled) placeChanged = false; })
      .observe(locateBtn, { attributes: true, attributeFilter: ['disabled'] });
  }

  function say(text) {
    if (!status) return;
    status.textContent = text;
    status.hidden = !text;
  }

  async function run() {
    if (busy) return;
    busy = true;
    btn.disabled = true;
    btn.textContent = '⏳ Finding care…';
    if (window.LoCareSteps) window.LoCareSteps.go(3);
    try {
      if (placeChanged && typeof locateAddressOnly === 'function') {
        say('Pinning your location…');
        await locateAddressOnly();
      }
      if (typeof runAITriage === 'function') {
        say('Analyzing your symptoms…');
        await Promise.race([runAITriage(), sleep(AI_WAIT_MS)]);
      }
      say('Scanning nearby facilities…');
      if (typeof findFacilitiesOnly === 'function') await findFacilitiesOnly();
    } finally {
      say('');
      btn.innerHTML = label;
      btn.disabled = false;
      busy = false;
    }
  }

  btn.addEventListener('click', run);
})();