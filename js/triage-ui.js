// UI helper for the Smart Symptom Guide.
//  - syncs the tappable pills with the original hidden <select> elements (q1-q5)
//  - accordion behaviour: one question open at a time, collapsed rows show the chosen answer
//  - updates the progress bar / "x of 5" counter
// triage.js keeps reading q1-q5 exactly as before.
(function () {
  const fill = document.getElementById('triageFill');
  const count = document.getElementById('triageCount');
  const blocks = Array.from(document.querySelectorAll('.q-block'));

  const selectOf = block => document.getElementById(block.dataset.for);
  const isAnswered = block => { const s = selectOf(block); return !!s && s.value !== ''; };

  function refreshProgress() {
    let answered = 0;
    blocks.forEach(block => {
      const done = isAnswered(block);
      block.classList.toggle('answered', done);
      if (done) answered++;
    });
    if (fill) fill.style.width = (answered / blocks.length * 100) + '%';
    if (count) count.textContent = answered + ' of ' + blocks.length;
  }

  function setOpen(block, open) {
    block.classList.toggle('collapsed', !open);
    const title = block.querySelector('.q-title');
    if (title) title.setAttribute('aria-expanded', String(open));
  }

  function openNextUnanswered(fromBlock) {
    const after = blocks.slice(blocks.indexOf(fromBlock) + 1).find(b => !isAnswered(b));
    const next = after || blocks.find(b => !isAnswered(b));
    if (next) setOpen(next, true);
  }

  blocks.forEach((block, i) => {
    const sel = selectOf(block);
    const title = block.querySelector('.q-title');

    // header decorations: chosen-answer chip + caret
    const answer = document.createElement('span');
    answer.className = 'q-answer';
    answer.hidden = true;
    const caret = document.createElement('span');
    caret.className = 'q-caret';
    caret.setAttribute('aria-hidden', 'true');
    caret.textContent = '▾';
    title.append(answer, caret);

    title.setAttribute('role', 'button');
    title.tabIndex = 0;
    const toggle = () => setOpen(block, block.classList.contains('collapsed'));
    title.addEventListener('click', toggle);
    title.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });

    setOpen(block, i === 0);

    block.querySelectorAll('.pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const wasActive = pill.classList.contains('active');
        block.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        if (wasActive) {
          sel.value = '';
          answer.hidden = true;
          answer.textContent = '';
        } else {
          pill.classList.add('active');
          sel.value = pill.dataset.value;
          answer.textContent = pill.textContent.trim();
          answer.hidden = false;
          setOpen(block, false);
          openNextUnanswered(block);
        }
        refreshProgress();
      });
    });
  });

  refreshProgress();
})();