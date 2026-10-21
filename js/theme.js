// UI helper: light / dark mode toggle. Remembers the choice and follows the
// device setting on the first visit.
(function () {
  const root = document.documentElement;
  const btn = document.getElementById('themeBtn');
  if (!btn) return;

  let saved = null;
  try { saved = localStorage.getItem('locare-theme'); } catch (e) {}
  const startDark = saved
    ? saved === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches;

  function apply(dark) {
    if (dark) root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    btn.textContent = dark ? '☀️' : '🌙';
  }

  apply(startDark);

  btn.addEventListener('click', () => {
    const dark = !root.hasAttribute('data-theme');
    apply(dark);
    try { localStorage.setItem('locare-theme', dark ? 'dark' : 'light'); } catch (e) {}
  });
})();