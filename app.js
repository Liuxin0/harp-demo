const tabs = [...document.querySelectorAll('[role="tab"]')];
function activateTab(tab) {
  for (const item of tabs) {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
  }
}
for (const tab of tabs) {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = tabs.indexOf(tab);
    const next = event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs.at(-1) : tabs[(index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    activateTab(next); next.focus();
  });
}

const corpusButtons = [...document.querySelectorAll('[data-corpus]')];
const head = document.getElementById('audio-head');
const body = document.getElementById('audio-body');
function cell(tag, text) { const el = document.createElement(tag); el.textContent = text; return el; }
let manifest;
function renderAudio(corpusId) {
  const group = manifest.groups.find(group => group.id === corpusId);
  if (!group) return;
  head.replaceChildren(); body.replaceChildren();
  document.getElementById('audio-caption').textContent = group.title;
  document.getElementById('audio-notice').textContent = group.note;
  for (const button of corpusButtons) {
    const selected = button.dataset.corpus === corpusId;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  }
  const header = document.createElement('tr');
  for (const label of ['Example', ...group.columns.map(column => column.label)]) {
    const th = cell('th', label); th.scope = 'col'; header.append(th);
  }
  head.append(header);
  for (const sample of group.samples) {
    const row = document.createElement('tr');
    const label = cell('th', sample.label); label.scope = 'row';
    label.append(cell('small', sample.description)); row.append(label);
    for (const column of group.columns) {
      const td = document.createElement('td');
      const src = sample.audio[column.id];
      if (typeof src === 'string' && src.trim()) {
        const audio = document.createElement('audio');
        audio.controls = true; audio.preload = 'none'; audio.src = src;
        audio.setAttribute('aria-label', `${sample.label}: ${column.label}`);
        audio.addEventListener('play', () => document.querySelectorAll('audio').forEach(other => { if (other !== audio) other.pause(); }));
        td.append(audio);
      } else {
        const pending = cell('span', 'To be added'); pending.className = 'pending-audio'; td.append(pending);
      }
      row.append(td);
    }
    body.append(row);
  }
}
fetch('audio-manifest.json').then(response => {
  if (!response.ok) throw new Error(`Audio manifest HTTP ${response.status}`);
  return response.json();
}).then(data => {
  manifest = data; renderAudio('vctk');
  corpusButtons.forEach(button => button.addEventListener('click', () => renderAudio(button.dataset.corpus)));
}).catch(() => {
  document.getElementById('audio-notice').textContent = 'The audio manifest could not be loaded. Audio files are not yet available.';
});
