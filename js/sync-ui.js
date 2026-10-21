// UI helper: keeps the facility list and the map markers in sync.
//   hover a card   -> its marker pulses on the map
//   hover a marker -> its card is highlighted (and scrolled into view)
//   click either   -> that facility stays "selected" until another one is picked
// facilities.js calls LoCareSync.register(...) once per facility (guarded, optional).
(function () {
  const registry = new Map();   // id -> { card, marker, base }
  let hoverId = null;
  let selectedId = null;
  let scrollTimer = null;

  const ACTIVE_STYLE = { radius: 12, color: '#f59e0b', weight: 4, fillOpacity: 1 };

  function prune() {
    registry.forEach((rec, id) => { if (!rec.card.isConnected) registry.delete(id); });
    hoverId = null;   // a removed card never fires mouseleave
    // selectedId is kept on purpose: register() re-applies it if the same facility is rendered again
  }

  function apply(id) {
    const rec = registry.get(id);
    if (!rec) return;
    const isHover = id === hoverId;
    const isSelected = id === selectedId;
    rec.card.classList.toggle('is-hover', isHover);
    rec.card.classList.toggle('is-selected', isSelected);

    const m = rec.marker;
    const el = m.getElement ? m.getElement() : null;
    if (isHover || isSelected) {
      m.setStyle(ACTIVE_STYLE);
      if (m.bringToFront) m.bringToFront();
      if (el) el.classList.add('marker-active');
    } else {
      m.setStyle(rec.base);
      if (el) el.classList.remove('marker-active');
    }
  }

  function setHover(id) {
    const prev = hoverId;
    hoverId = id;
    if (prev && prev !== id) apply(prev);
    if (id) apply(id);
  }

  function select(id) {
    const prev = selectedId;
    selectedId = id;
    if (prev && prev !== id) apply(prev);
    if (id) apply(id);
  }

  function scrollCardIntoView(id) {
    const rec = registry.get(id);
    if (!rec || !rec.card.offsetParent) return;   // card is hidden (another step is open)
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => rec.card.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 120);
  }

  function register(f, card, marker) {
    prune();
    const id = String(f.id);
    registry.set(id, {
      card, marker,
      base: {
        radius: marker.options.radius,
        color: marker.options.color,
        weight: marker.options.weight,
        fillOpacity: marker.options.fillOpacity
      }
    });
    card.dataset.fid = id;

    card.addEventListener('mouseenter', () => setHover(id));
    card.addEventListener('mouseleave', () => setHover(null));
    card.addEventListener('click', () => select(id));

    marker.on('mouseover', () => { setHover(id); scrollCardIntoView(id); });
    marker.on('mouseout', () => setHover(null));
    marker.on('click', () => {
      if (window.LoCareSteps) window.LoCareSteps.go(3);   // make sure the list is visible
      select(id);
      scrollCardIntoView(id);
    });

    apply(id);   // restore state if the list was re-rendered (e.g. after re-analysing)
  }

  window.LoCareSync = { register, select, hover: setHover };
})();