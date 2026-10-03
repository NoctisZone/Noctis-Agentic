// Noctis Agentic: routing, state and events. No framework, no build step.
// Pages are template functions (desktop.js, mobile.js); this module decides
// which one to draw, keeps the state between them and wires the controls.
import { AGENTS, P0, STRATS, SLIDERS, ME, prefs, savePrefs, city, feedEvent, findAgent, findCoin, agentPath, coinPath } from './shared.js?v=7acf7cae97';
import * as D from './desktop.js?v=7acf7cae97';
import * as M from './mobile.js?v=7acf7cae97';

const root = document.getElementById('root');
const html = document.documentElement;
// The desktop starts at 1000px: the rail takes 238px, and from there the content column beside it is
// as wide as the narrowest desktop page was before the rail. Below that, the phone layout.
const mq = window.matchMedia('(max-width: 999px)');

const S = {
  page: 'home',
  route: { page: 'home', id: null },
  q: '',
  agent: 'KURO-9',
  coin: 'NOIR',
  coinF: 'all',
  tf: 1,
  tokTab: 'trades',
  profTab: 'launches',
  lb: 'launch',
  lbR: '7D',
  signed: false,
  myTab: 'overview',
  policy: { ...P0 },
  saved: { ...P0 },
  reveal: false,
  assigned: { 'Shadow DCA': 40, 'Graduation Sniper': 25 },
  feed: Array.from({ length: 14 }, () => feedEvent(false)),
  feedTop: 0,
  feedPaused: false,
  keyN: 1,
  showKey: false,
  paused: false,
  pins: [],
};

// ---------------------------------------------------------------- routing
const ROUTES = { agents: 'agents', coins: 'coins', leaderboards: 'leaders', strategies: 'strats', 'my-agent': 'my', 'how-it-works': 'docs' };
const TITLES = { home: '', agents: 'Agents', coins: 'Coins', leaders: 'Leaderboards', strats: 'Strategies', my: 'My Agent', docs: 'How it works', notfound: 'Not found' };

function applyRoute() {
  const seg = window.location.pathname.split('/').filter(Boolean).map((s) => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  });
  const page = seg.length === 0 ? 'home' : ROUTES[seg[0]] || 'notfound';
  const id = seg[1] || null;
  S.route = { page, id };
  S.page = seg.length > 2 || (id && page !== 'agents' && page !== 'coins') ? 'notfound' : page;
  if (S.page === 'agents' && id) {
    const a = findAgent(id);
    if (a) {
      S.agent = a.name;
      if (window.location.pathname !== agentPath(a.name)) history.replaceState(null, '', agentPath(a.name));
    } else S.page = 'notfound';
  }
  if (S.page === 'coins' && id) {
    const c = findCoin(id);
    if (c) {
      S.coin = c.t;
      if (window.location.pathname !== coinPath(c.t)) history.replaceState(null, '', coinPath(c.t));
    } else S.page = 'notfound';
  }
}
function title() {
  let t = TITLES[S.page];
  if (S.page === 'agents' && S.route.id) t = S.agent;
  if (S.page === 'coins' && S.route.id) t = '$' + S.coin;
  return (t ? t + ' · ' : '') + 'Noctis Agentic';
}
// On a desktop the content column is the only scroller, as on noctis.zone and noctisswap.zone: the
// ticker and the rail stay put. A phone scrolls the window.
function scroller() {
  return mq.matches ? null : document.getElementById('scroll');
}
function scrollToTop() {
  const s = scroller();
  if (s) s.scrollTop = 0;
  else window.scrollTo(0, 0);
}
function navigate(href) {
  const url = new URL(href, window.location.href);
  if (url.origin !== window.location.origin) {
    window.location.href = url.href;
    return;
  }
  if (url.pathname !== window.location.pathname) history.pushState(null, '', url.pathname);
  applyRoute();
  render();
  scrollToTop();
}

// ---------------------------------------------------------------- drawing
function onPins(p) {
  S.pins = p;
  const box = document.getElementById('pins');
  if (!box) return;
  box.innerHTML = mq.matches ? M.mPins(p) : D.pinsHtml(p);
  // The city is drawn at its real size now: the billboard's legs are set down to its pavement, and
  // the pins fitted round the words, and both again once the webfonts have settled the words.
  const hero = box.parentElement;
  const fit = () => {
    D.fitBoard(hero);
    D.fitPins(hero);
  };
  fit();
  if (document.fonts) document.fonts.ready.then(fit);
}
function render() {
  city.unmount();
  const mobile = mq.matches;
  html.classList.toggle('na-still', !prefs.motion);
  html.classList.toggle('na-retro', !mobile && prefs.retro);
  html.classList.toggle('na-mobile', mobile);
  html.classList.toggle('na-desk', !mobile);
  if (mobile) {
    root.innerHTML = `<div class="m-app">${M.mTicker()}<main class="m-page" id="main">${M.mPage(S)}</main>${M.mTabs(S.page)}</div>`;
  } else {
    root.innerHTML = `<div class="na-frame" data-retro="${prefs.retro ? 1 : 0}">
  <div class="na-screen">
    <div class="scanlines" aria-hidden="true"${prefs.scan ? '' : ' hidden'}></div>
    <div class="crt-glass" aria-hidden="true"></div>
    <div class="na-scroll">
      <div id="tk">${D.ticker()}</div>
      <div class="na-shell">
        ${D.rail(S)}
        <div class="na-col" id="scroll">
          <main class="mn mn--bleed" id="main">${D.PAGES[S.page](S)}</main>
          ${D.footer()}
        </div>
      </div>
    </div>
  </div>
  ${D.bezel()}
</div>`;
  }
  document.title = title();
  afterRender();
}
// The resolution the city is built at, in canvas pixels of height. Home's header area takes the
// renderer's own on a desktop. A band is short, so it builds a short city -- the same street, sky
// to pavement, at a smaller scale -- rather than showing a slice of a tall one.
const cityRes = () => (S.page === 'home' ? (mq.matches ? 880 : undefined) : mq.matches ? 230 : 280);
function afterRender() {
  const canvas = document.getElementById('city');
  // Mount after layout, so the first frame is built at the canvas's real size.
  if (canvas) requestAnimationFrame(() => city.mount(canvas, cityRes(), S.page === 'home' ? onPins : null));
  if (S.page === 'home') {
    const feed = document.getElementById('feed');
    if (feed) {
      feed.addEventListener('pointerenter', () => (S.feedHover = true));
      feed.addEventListener('pointerleave', () => (S.feedHover = false));
    }
  }
}
// Redraw the page body only, keeping keyboard focus on the control that asked.
function renderMain() {
  const main = document.getElementById('main');
  if (!main || S.page === 'home') return render();
  const fk = document.activeElement?.dataset?.fk ?? null;
  const keep = document.getElementById('results');
  const listTop = keep ? keep.scrollTop : 0;
  // The band's city carries on drawing: its canvas is moved into the new page rather than redrawn.
  const drawn = document.getElementById('city');
  main.innerHTML = mq.matches ? M.mPage(S) : D.PAGES[S.page](S);
  const fresh = document.getElementById('city');
  if (drawn && fresh) fresh.replaceWith(drawn);
  else if (fresh) city.mount(fresh, cityRes(), null);
  else city.unmount();
  if (!mq.matches) document.getElementById('rail').outerHTML = D.rail(S);
  document.title = title();
  const again = document.getElementById('results');
  if (again) again.scrollTop = listTop;
  refocus(fk);
}
function refocus(fk) {
  if (!fk) return;
  const el = root.querySelector(`[data-fk="${window.CSS && CSS.escape ? CSS.escape(fk) : fk}"]`);
  if (el) el.focus({ preventScroll: true });
}

let toastTimer = 0;
function flash(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    t.setAttribute('role', 'status');
    t.setAttribute('aria-live', 'polite');
    document.body.appendChild(t);
  }
  t.textContent = '> ' + msg;
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on'), 2600);
}

// ---------------------------------------------------------------- view prefs
function setPref(k, v) {
  const fk = document.activeElement?.dataset?.fk ?? null;
  const mobile = mq.matches;
  let y = 0;
  if (k === 'retro' && !mobile) {
    const s = scroller();
    y = s ? s.scrollTop : 0;
  }
  prefs[k] = v;
  savePrefs();
  html.classList.toggle('na-still', !prefs.motion);
  if (mobile) {
    const box = document.getElementById('mview');
    if (box) box.innerHTML = M.mView();
  } else {
    document.getElementById('tk').innerHTML = D.ticker();
    document.getElementById('rail').outerHTML = D.rail(S);
    root.querySelector('.na-frame').dataset.retro = prefs.retro ? '1' : '0';
    root.querySelector('.scanlines').hidden = !prefs.scan;
    html.classList.toggle('na-retro', prefs.retro);
    if (k === 'retro') {
      // Keep the reader's place when the page moves into or out of the screen.
      const s = scroller();
      if (s) s.scrollTop = y;
    }
  }
  if (k === 'tod' || k === 'motion') {
    city.refresh();
    tickClock();
  }
  refocus(fk);
}
function tickClock() {
  const c = document.getElementById('clock');
  if (c) c.innerHTML = mq.matches ? M.mClock() : D.clockHtml();
}

// ---------------------------------------------------------------- live updates
function drawResults() {
  if (S.page !== 'agents') return;
  const box = document.getElementById('results');
  const label = document.getElementById('res-label');
  if (!box) return;
  const r = mq.matches ? M.mAgentResults(S) : D.agentResults(S);
  box.innerHTML = r.html;
  if (label) label.textContent = r.label;
}
function drawSync() {
  const box = document.getElementById('sync');
  if (!box) return;
  const dirty = JSON.stringify(S.policy) !== JSON.stringify(S.saved);
  box.classList.toggle('dirty', dirty);
  const t = box.querySelector('[data-sync-t]');
  if (t) t.textContent = dirty ? (box.dataset.short ? 'UNSAVED CHANGES' : 'UNSAVED POLICY CHANGES') : 'POLICY IN SYNC';
  const save = box.querySelector('.save');
  if (save) {
    if (dirty) save.removeAttribute('aria-disabled');
    else save.setAttribute('aria-disabled', 'true');
  }
}
function feedTick() {
  if (S.page !== 'home' || S.feedPaused || S.feedHover || document.hidden) return;
  const box = document.getElementById('feed');
  if (!box || box.contains(document.activeElement)) return;
  const e = feedEvent(true);
  S.feed = [e, ...S.feed].slice(0, 14);
  S.feedTop = e.id;
  box.innerHTML = mq.matches ? M.mFeedRows(S) : D.feedRows(S);
}

// ---------------------------------------------------------------- actions
function act(name, v) {
  switch (name) {
    case 'tod':
      return setPref('tod', v);
    case 'motion':
      return setPref('motion', !prefs.motion);
    case 'scan':
      return setPref('scan', !prefs.scan);
    case 'retro':
      return setPref('retro', !prefs.retro);
    case 'signin':
      S.signed = true;
      S.myTab = 'overview';
      flash('Signed in as KURO-9 via Midnight City (mock)');
      if (window.location.pathname === '/my-agent') {
        render();
        return scrollToTop();
      }
      return navigate('/my-agent');
    case 'signout':
      S.signed = false;
      return navigate('/');
    case 'pause':
      S.paused = !S.paused;
      flash(S.paused ? 'KURO-9 paused: all orders halted' : 'KURO-9 resumed');
      return renderMain();
    case 'reveal':
      S.reveal = !S.reveal;
      return renderMain();
    case 'key':
      S.showKey = !S.showKey;
      return renderMain();
    case 'regen':
      S.keyN++;
      flash('New key issued. The old key is revoked.');
      return renderMain();
    case 'noop':
      return flash("Mockup: this isn't live yet");
    case 'set': {
      return null; // handled in the click listener, which knows the key
    }
    case 'toggle':
      S.policy = { ...S.policy, [v]: !S.policy[v] };
      return renderMain();
    case 'save': {
      if (JSON.stringify(S.policy) === JSON.stringify(S.saved)) return null;
      S.saved = { ...S.policy };
      flash('Policy signed & synced to KURO-9 (mock)');
      return renderMain();
    }
    case 'reset':
      S.policy = { ...S.saved };
      return renderMain();
    case 'strat': {
      if (!S.signed) return navigate('/my-agent');
      const on = S.assigned[v] != null;
      const a = { ...S.assigned };
      if (on) delete a[v];
      else a[v] = 20;
      S.assigned = a;
      flash(on ? `${v} removed from ${ME.name}` : `${v} assigned to ${ME.name} · 20%`);
      return renderMain();
    }
    case 'unassign': {
      const a = { ...S.assigned };
      delete a[v];
      S.assigned = a;
      return renderMain();
    }
    case 'feed': {
      S.feedPaused = !S.feedPaused;
      const b = root.querySelector('.stream');
      if (b) {
        b.classList.toggle('paused', S.feedPaused);
        b.setAttribute('aria-pressed', String(S.feedPaused));
        b.lastChild.textContent = S.feedPaused ? 'PAUSED' : mq.matches ? 'LIVE' : 'STREAMING';
      }
      return null;
    }
    case 'q': {
      S.q = v;
      for (const i of root.querySelectorAll('[data-in="q"]')) i.value = v;
      return drawResults();
    }
    default:
      return null;
  }
}

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-link]');
  if (a) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(a.getAttribute('href'));
    return;
  }
  const b = e.target.closest('[data-act]');
  if (!b || !root.contains(b)) return;
  if (b.getAttribute('aria-disabled') === 'true') return;
  const { act: name, k, v } = b.dataset;
  if (name === 'set') {
    S[k] = k === 'tf' ? Number(v) : v;
    renderMain();
    return;
  }
  act(name, v);
});

document.addEventListener('input', (e) => {
  const t = e.target;
  if (!t.dataset) return;
  if (t.dataset.in === 'q') {
    S.q = t.value;
    root.querySelectorAll('[data-in="q"]').forEach((i) => {
      if (i !== t) i.value = t.value;
    });
    drawResults();
  } else if (t.dataset.in === 'policy') {
    const k = t.dataset.k;
    S.policy = { ...S.policy, [k]: Number(t.value) };
    const def = SLIDERS.find((x) => x[0] === k);
    for (const d of root.querySelectorAll(`[data-disp="${k}"]`)) d.textContent = def[5](S.policy[k]);
    drawSync();
  } else if (t.dataset.in === 'alloc') {
    const name = t.dataset.k;
    S.assigned = { ...S.assigned, [name]: Number(t.value) };
    root.querySelectorAll('[data-alloc]').forEach((d) => {
      if (d.dataset.alloc === name) d.textContent = t.value + '%';
    });
  }
});
document.addEventListener('change', (e) => {
  const t = e.target;
  if (t.dataset && (t.dataset.in === 'policy' || t.dataset.in === 'alloc')) renderMain();
});
document.addEventListener('keydown', (e) => {
  const t = e.target;
  if (e.key !== 'Enter' || !t.dataset || t.dataset.enter !== 'agent') return;
  e.preventDefault();
  const ql = S.q.trim().toLowerCase();
  const m = AGENTS.find((a) => a.name.toLowerCase().includes(ql));
  navigate(m ? agentPath(m.name) : '/agents');
});

mq.addEventListener('change', () => render());
window.addEventListener('popstate', () => {
  applyRoute();
  render();
});
setInterval(feedTick, 2400);
setInterval(() => {
  tickClock();
  city.tick();
}, 30000);

// Every strategy the state refers to exists in the vault.
for (const name of Object.keys(S.assigned)) if (!STRATS.some((s) => s.name === name)) delete S.assigned[name];

applyRoute();
render();
