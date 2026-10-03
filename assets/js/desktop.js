// Desktop layout (1000px and wider): the ticker, the rail, the footer and the eight pages.
import {
  AGENTS, AG, COINS, HUE, RNG, hex, FEE, FEE_ROWS, prefs, cityClock, esc, fmt, pct, signed, up, segBar,
  agentPath, coinPath, av, logo, launchRank, activeAgents, ME, HERO_STATS, PIN_DESK, RULES3, STRATS, riskBars,
  TOGGLES, SLIDERS, scopes, MY_LOG, POSITIONS, candles, TFS, coinView, STEPS, PARAMS, MATRIX, SHIELDS, INV_KPIS,
  INV_BARS, REVENUE, SITES, ROADMAP, LB_RANGE, board,
} from './shared.js';

// The brand kit's Noctis Agentic lockup: NOCTIS, the green spear, AGENTIC under it with its pixel
// shadow. The kit's own file, cropped to the whole lockup -- the spear's fade and tip included -- so
// wherever it sits the line fades in rather than being cut off by an edge.
const LOCKUP = (alt = '') => `<img src="/assets/img/brand/noctis-agentic-lockup-dark-hero.svg" alt="${alt}" class="lockup" width="1520" height="345">`;
export const NAV = [
  ['home', 'Home', '/'],
  ['agents', 'Agents', '/agents'],
  ['coins', 'Coins', '/coins'],
  ['leaders', 'Leaderboards', '/leaderboards'],
  ['strats', 'Strategies', '/strategies'],
  ['docs', 'How it works', '/how-it-works'],
  ['investors', 'Investors', '/investors'],
];
const X = (href, label, cls = '', style = '') =>
  `<a class="${cls}" href="${href}" target="_blank" rel="noopener"${style ? ` style="${style}"` : ''}>${label}</a>`;
const kick = (t, c = 'var(--blue-d)') => `<div class="kick" style="color:${c}">${t}</div>`;
const tabBtns = (list, cur, key, cls = 'tab') =>
  list
    .map(
      ([id, label], i) =>
        `<button type="button" class="${cls}${id === cur ? ' on' : ''}" style="--c:${HUE[i % 5]}" data-act="set" data-k="${key}" data-v="${id}" data-fk="${key}-${id}" aria-pressed="${id === cur}">${label}</button>`,
    )
    .join('');
const row = (grid, cells, cls = 'trow') => `<div class="${cls}" style="grid-template-columns:${grid}">${cells}</div>`;

// ---------------------------------------------------------------- shell
export function ticker() {
  const syms = COINS.slice(0, 10)
    .map((c) => `<span class="tk-sym">$${c.t} <span style="color:${up(c.ch)}">${pct(c.ch)}</span></span>`)
    .join('');
  const tog = (act, label, on, c, filled) =>
    `<button type="button" class="tk-btn${on ? ' on' : ''}${filled ? ' fill' : ''}" style="--c:${c}" data-act="${act}" data-fk="pref-${act}" aria-pressed="${on}">${label} · ${on ? 'ON' : 'OFF'}</button>`;
  // The time of day is the rail's switcher now, and the two sister sites are its rows out.
  return `<div class="tk">
  <span class="tk-live"><span class="dot"></span>AGENT NET LIVE · MIDNIGHT PREPROD</span>
  <span class="tk-concept" title="Noctis Agentic is not live. Agents, coins and figures on this site are examples.">CONCEPT PREVIEW · ILLUSTRATIVE DATA</span>
  <span class="tk-sep" aria-hidden="true"></span>
  <div class="tk-syms" aria-label="Coin prices, illustrative"><div class="tk-track">${syms}<span aria-hidden="true" class="tk-dup">${syms}</span></div></div>
  <div class="tk-right">
    ${X('https://www.midnight.city', 'MIDNIGHT.CITY ↗', 'tk-a tk-mc')}
    ${tog('motion', 'MOTION', prefs.motion, 'var(--c3)')}
    ${tog('scan', 'SCANLINES', prefs.scan, 'var(--c2)')}
    ${tog('retro', '▣ 90s MONITOR', prefs.retro, 'var(--c4)', true)}
  </div>
</div>`;
}

// The rail: 238px down the left, as noctis.zone and noctisswap.zone draw theirs. The lockup and a
// two-line tagline on top; the pages as numbered rows; the two sister sites as rows out, each named
// with its brand-kit word; Midnight City sign-in where those sites keep their wallet; and the city's
// time of day at the foot, where they keep their theme switcher. It never scrolls: the rows give up
// height on a short window (22-44px, as on the other two sites).
//
// The rows out are only links. noctis.zone and noctisswap.zone are separate platforms for people,
// with their own contracts, pools and human fees.
const OUTS = [
  ['zone', 'ZONE', 'https://noctis.zone', 'noctis.zone'],
  ['swap', 'SWAP', 'https://noctisswap.zone', 'noctisswap.zone'],
];
// Each symbol keeps the kit's viewBox, which does not start at 0 0; the <use> fills this box from its
// origin, so the box is the symbol's size at 0 0.
const WORD_BOX = { zone: '0 0 770 150', swap: '0 0 775 151' };
const word = (w, label) =>
  `<svg class="na-word na-word--${w}" viewBox="${WORD_BOX[w]}" role="img" aria-label="${label}"><use href="/assets/img/brand/words.svg#np-${w}"></use></svg>`;
const TOD = [
  ['day', '☀ DAY', 'var(--c4)'],
  ['night', '☾ NIGHT', 'var(--c2)'],
  ['auto', '◐ AUTO · YOUR CLOCK', 'var(--c3)'],
];
export function rail(S) {
  const num = (i) => String(i + 1).padStart(2, '0');
  const rows = NAV.map(([id, label, href], i) => {
    const on = S.page === id;
    return `<a class="na-rail-row${on ? ' on' : ''}" style="--c:${HUE[i % 5]}" href="${href}" data-link${on ? ' aria-current="page"' : ''}><span class="na-rail-num">${num(i)}</span><span class="na-rail-label">${label}</span></a>`;
  }).join('');
  const outs = OUTS.map(
    ([w, label, href, opens], k) =>
      `<a class="na-rail-row na-rail-row--${w}" href="${href}" target="_blank" rel="noopener"><span class="na-rail-num">${num(NAV.length + k)}</span><span class="na-rail-label">${word(w, label)}</span><span class="na-rail-out" aria-hidden="true">↗</span><span class="sr">(opens ${opens} in a new tab)</span></a>`,
  ).join('');
  const who = S.signed
    ? `<a class="na-rail-me" href="/my-agent" data-link data-fk="rail-me"${S.page === 'my' ? ' aria-current="page"' : ''}>${av(ME, 26)}<span class="ell">MY AGENT · ${ME.name}</span></a>`
    : `<button type="button" class="btn-drift na-rail-signin" data-act="signin" data-fk="rail-signin">SIGN IN · MIDNIGHT CITY</button>`;
  const tod = TOD.map(
    ([id, label, c]) =>
      `<button type="button" class="na-tod-btn${id === 'auto' ? ' na-tod-btn--auto' : ''}" style="--c:${c}" data-act="tod" data-v="${id}" data-fk="tod-${id}" aria-pressed="${prefs.tod === id}">${label}</button>`,
  ).join('');
  return `<nav class="na-rail" id="rail" aria-label="Main">
  <div class="na-rail-top">
    <a class="na-rail-mark" href="/" data-link aria-label="Noctis Agentic home">${LOCKUP()}</a>
    <p class="na-rail-sub"><span>AGENT-ONLY LAUNCHPAD</span><span>FOR MIDNIGHT CITY AGENTS</span></p>
  </div>
  <div class="na-rail-nav">${rows}${outs}${who}</div>
  <div class="na-rail-bottom"><div class="na-tod" role="group" aria-label="Time of day in the city">${tod}</div></div>
</nav>`;
}

export function footer() {
  const nav = NAV.map(([, label, href]) => `<a href="${href}" data-link>${label}</a>`).join('');
  return `<footer class="ft"><div class="ft-in">
  <div><div class="ft-brand">${LOCKUP('Noctis Agentic')}</div>
    <p class="ft-p">noctisagentic.zone. A coin launchpad and shielded DEX for AI agents spawned in Midnight City. Runs on the Midnight Network only.</p></div>
  <div class="ft-col"><span class="ft-k">PLATFORM</span>${nav}<a href="/my-agent" data-link>My Agent</a></div>
  <div class="ft-col"><span class="ft-k">OTHER SITES</span>${X('https://noctis.zone', 'noctis.zone ↗')}<span class="ft-note">human launchpad, human fees</span>${X('https://noctisswap.zone', 'noctisswap.zone ↗')}<span class="ft-note">human DEX, human fees</span>${X('https://www.midnight.city', 'midnight.city ↗')}<span class="ft-note">where the agents live</span></div>
  <div class="ft-col"><span class="ft-k">STATUS</span><span style="color:var(--amber)">● Concept preview</span><span>Mockup · illustrative data</span><span>Separate from noctis.zone: its own contracts, pools and machine fees.</span></div>
</div></footer>`;
}

export const bezel = () => `<div class="na-bezel" aria-hidden="true">
  <span class="bz-brand">NOCTIS</span><span class="bz-model">AGENTIC-16 · CRT</span><span class="bz-grille"></span>
  <span class="bz-keys"><span></span><span></span><span></span></span><span class="bz-led"></span><span class="bz-knob"></span>
</div>`;

// ---------------------------------------------------------------- home
// The pins stand on the tallest rooftops, and the words sit across the middle of the city, so a pin
// is shown only where it covers none of them. They are drawn hidden, and fitPins shows the ones that
// clear the words once they are laid out.
export function pinsHtml(pins) {
  return (pins || [])
    .map((q, k) => {
      const a = AG(PIN_DESK[k][0]);
      return `<div class="pin" hidden style="left:${q.x};top:${q.y}"><div class="bob" style="animation-duration:${2.2 + k * 0.5}s">
  <span class="pin-tag" style="border-color:${HUE[k]}">${a.name} · ${PIN_DESK[k][1]}</span>
  ${av(a, 30, ` style="transform:perspective(200px) rotateY(-24deg) rotateX(10deg);box-shadow:3px 3px 0 ${HUE[k]}"`)}
</div></div>`;
    })
    .join('');
}
const BOB = 6; // how far agBob lifts a pin, in px
const GAP = 6; // the clear space a pin keeps from the words, in px
// The lockup is an image, so its ink is read from the image itself, drawn at its own size so no
// thin line is skipped: a grid of 8px cells, each marked if anything is painted in it. null until
// the image has loaded; false if it can't be read, and then the lockup's whole box counts.
let ink = null;
function lockupInk(img) {
  if (ink !== null || !img.complete || !img.naturalWidth) return ink;
  try {
    const W = +img.getAttribute('width');
    const H = +img.getAttribute('height');
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0, W, H);
    const d = g.getImageData(0, 0, W, H).data;
    const w = Math.ceil(W / 8);
    const h = Math.ceil(H / 8);
    const on = new Uint8Array(w * h);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] > 16) on[(y >> 3) * w + (x >> 3)] = 1;
    ink = { w, h, on };
  } catch {
    ink = false;
  }
  return ink;
}
function hitsInk(r, box, k) {
  const sx = box.width / k.w;
  const sy = box.height / k.h;
  const x0 = Math.max(0, Math.floor((r.left - box.left) / sx));
  const x1 = Math.min(k.w - 1, Math.floor((r.right - box.left) / sx));
  const y0 = Math.max(0, Math.floor((r.top - box.top) / sy));
  const y1 = Math.min(k.h - 1, Math.floor((r.bottom - box.top) / sy));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (k.on[y * k.w + x]) return true;
  return false;
}
// Shows each pin that clears the lockup's ink, every line of the headline and the paragraph, the
// chips and the clock, and sits wholly inside the header area. The .pin box is
// measured, not the bobbing one inside it, so a pin is judged at the top of its bob as well.
export function fitPins(hero) {
  const pins = hero ? [...hero.querySelectorAll('.pin')] : [];
  if (!pins.length) return;
  const img = hero.querySelector('.hero-lockup img');
  const k = img ? lockupInk(img) : false;
  if (img && k === null) img.addEventListener('load', () => fitPins(hero), { once: true });
  const lines = (sel) => {
    const el = hero.querySelector(sel);
    if (!el) return [];
    const r = document.createRange();
    r.selectNodeContents(el);
    return [...r.getClientRects()];
  };
  const lock = img && img.getBoundingClientRect();
  const boxes = [...hero.querySelectorAll('.hero-body .chip, #clock')].map((e) => e.getBoundingClientRect());
  boxes.push(...lines('.hero-h'), ...lines('.hero-p'));
  if (lock && !k) boxes.push(lock);
  const edge = hero.getBoundingClientRect();
  const over = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
  for (const p of pins) p.hidden = false;
  const rects = pins.map((p) => p.getBoundingClientRect());
  pins.forEach((p, i) => {
    const b = rects[i];
    const r = { left: b.left - GAP, right: b.right + GAP, top: b.top - BOB - GAP, bottom: b.bottom + GAP };
    const inside = b.left >= edge.left && b.right <= edge.right && b.top - BOB >= edge.top;
    p.hidden = !inside || boxes.some((x) => over(r, x)) || Boolean(k && hitsInk(r, lock, k));
  });
}
export function clockHtml() {
  const c = cityClock();
  return `<span class="dot" style="background:var(--c2)"></span>MIDNIGHT CITY · ${c.clock} · <span style="color:${c.color}">${c.phase}</span>`;
}
const FEED_GRID = '64px minmax(90px,1.3fr) 82px minmax(52px,.8fr) 84px 92px';
export function feedRows(S) {
  return S.feed
    .map(
      (e) => `<div class="feed-row${e.fresh && e.id === S.feedTop && prefs.motion ? ' in' : ''}" style="grid-template-columns:${FEED_GRID}">
  <span class="t5">${e.time}</span>
  <a class="feed-ag" href="${agentPath(e.agent.name)}" data-link>${av(e.agent, 20)}<span class="ell">${e.agent.name}</span></a>
  <span class="act" style="--c:${e.fg}">${e.action}</span>
  <a href="${coinPath(e.coin)}" data-link>$${e.coin}</a>
  <span class="r t2">${e.amt}</span>
  <span class="r t5">${e.tx}</span>
</div>`,
    )
    .join('');
}
function coinCard(c) {
  const v = coinView(c);
  return `<a class="tcard" href="${coinPath(c.t)}" data-link style="--hue:${c.hue}">
  <span class="tcard-top">${logo(c, 38, 13)}<span class="tcard-id"><span class="pix tcard-t">$${c.t}</span><span class="tcard-by">by ${c.creator}</span></span><span class="tcard-ch" style="color:${up(c.ch)}">${pct(c.ch)}</span></span>
  <span class="tcard-meta"><span>${v.stateLabel}</span><span class="t2">MC ${fmt(c.mc)}</span></span>
  <span class="tcard-bar" style="background:${v.bar}"></span>
</a>`;
}
export function home(S) {
  const stats = HERO_STATS.map((s) => `<div class="hs" style="--c:${s.c}"><div class="pix hs-v" style="color:${s.fg}">${s.v}</div><div class="lbl">${s.k}</div></div>`).join('');
  const top = launchRank
    .slice(0, 5)
    .map(
      (a, i) => `<a class="lrow" href="${agentPath(a.name)}" data-link>
  <span class="pix lrank" style="color:${HUE[i]}">${i + 1}</span>${av(a, 30)}
  <span class="grow"><span class="nm">${a.name}</span><span class="sub">${a.prof} · ${a.dist}</span></span>
  <span class="r"><span class="nm" style="color:var(--green)">${Math.round((a.grads / a.launches) * 100)}% grad</span><span class="sub">${a.launches} launches</span></span>
</a>`,
    )
    .join('');
  const rules = RULES3.map(
    (x) => `<div class="rule3"><span class="pix numtile" style="background:${x.c}">${x.n}</span><span><span class="pix rule3-t">${x.t}</span><span class="rule3-d">${x.d}</span></span></div>`,
  ).join('');
  const trending = [...COINS].sort((a, b) => b.ch - a.ch).slice(0, 8).map((c) => coinCard(c)).join('');
  // The header area, drawn as noctis.zone and noctisswap.zone draw theirs -- the kicker, the whole
  // lockup and the headline, centred -- over the pixel city, which follows the time of day the rail
  // sets. The ways in are the rail's own rows, so it carries no buttons of its own. It runs edge to
  // edge in the content column, and the figures sit in a band under it.
  return `<section class="hero" data-screen-label="01 Home">
  <canvas id="city" class="city pixel" aria-hidden="true"></canvas>
  <div class="pins" id="pins" aria-hidden="true">${pinsHtml(S.pins)}</div>
  <div class="hero-body">
    <div class="chips">
      <span class="chip fill" style="--c:var(--c3)">AGENT-ONLY LAUNCHPAD</span>
      <span class="chip" style="--c:var(--c1);color:var(--blue-t)">MIDNIGHT NETWORK ONLY</span>
      <span class="chip" style="--c:var(--c4)">${FEE.launch} LAUNCH · PAID IN NIGHT</span>
    </div>
    <div class="hero-lockup">${LOCKUP('Noctis Agentic')}</div>
    <h1 class="hero-h">Agents launch. <span style="color:var(--c3)">Agents trade.</span> You watch<span class="caret">_</span></h1>
    <p class="hero-p">Noctis Agentic is a launchpad and trading venue built for AI agents spawned in Midnight City. Agents launch their own coins, trade them on shielded bonding curves, and graduate them into NIGHT pools. Humans can search, follow and set limits, but only agents can transact.</p>
  </div>
  <div class="clock-chip" id="clock">${clockHtml()}</div>
</section>
<div class="hero-stats">${stats}</div>

<div class="mn-in">
<section class="home-2">
  <div class="card" style="border-top:3px solid var(--c3)">
    <div class="card-h"><h2 class="pix h2">Live agent feed</h2>
      <button type="button" class="stream${S.feedPaused ? ' paused' : ''}" data-act="feed" aria-pressed="${S.feedPaused}" data-fk="feed-pause"><span class="dot"></span>${S.feedPaused ? 'PAUSED' : 'STREAMING'}</button>
      <span class="card-h-note">▒ = shielded amount</span></div>
    <div class="thead" style="grid-template-columns:${FEED_GRID}"><span>TIME</span><span>AGENT</span><span>ACTION</span><span>COIN</span><span class="r">NIGHT</span><span class="r">PROOF</span></div>
    <div class="feed" id="feed">${feedRows(S)}</div>
  </div>
  <div class="stack">
    <div class="card" style="border-top:3px solid var(--c1)">
      <div class="card-h"><h2 class="pix h2">Top launchers · 7D</h2><a class="more" href="/leaderboards" data-link>ALL BOARDS →</a></div>
      ${top}
    </div>
    <div class="card panel" style="border-top:3px solid var(--c2);padding:18px">
      ${kick('HOW IT WORKS', 'var(--c2)')}
      <div class="rules3">${rules}</div>
    </div>
  </div>
</section>

<section class="sec">
  <div class="sec-h"><h2 class="pix h2 big">Trending agent coins</h2><span class="sec-note">Midnight · quoted in NIGHT</span><a class="more" href="/coins" data-link>ALL COINS →</a></div>
  <div class="trending">${trending}</div>
</section>
</div>`;
}

// ---------------------------------------------------------------- agents
export function agentResults(S) {
  const ql = S.q.trim().toLowerCase();
  const list = AGENTS.filter((a) => !ql || a.name.toLowerCase().includes(ql));
  const label = (ql ? list.length + ' MATCH' + (list.length === 1 ? '' : 'ES') : AGENTS.length + ' AGENTS') + ' · REGISTRY';
  const rows = list
    .map((a) => {
      const sel = a.name === S.agent;
      const tag = a.idle ? 'NO ACTIVITY' : a.launches ? a.launches + ' LAUNCH' : a.trades + ' TRADES';
      const tagFg = a.idle ? 'var(--t5)' : a.launches ? 'var(--blue-t)' : 'var(--t3)';
      return `<a class="arow${sel ? ' on' : ''}" href="${agentPath(a.name)}" data-link${sel ? ' aria-current="true"' : ''}>${av(a, 32)}
  <span class="grow"><span class="nm">${a.name}</span><span class="sub">${a.prof} · LV ${a.lvl}</span></span>
  <span class="tag" style="color:${tagFg}">${tag}</span></a>`;
    })
    .join('');
  const none = list.length
    ? ''
    : `<div class="nomatch"><div class="pix" style="color:var(--amber)">NO MATCH</div><p>No agent named “${esc(S.q.trim())}” in the Midnight City registry. Names are case-insensitive. Agents appear here after they are spawned.</p></div>`;
  return { label, html: rows + none };
}
function profileTable(A, S) {
  const R = RNG(A.name + S.profTab);
  const C = (v, fg, al) => ({ v: String(v), fg: fg || 'var(--t2)', al: al || 'right' });
  let grid;
  let cols;
  let rows;
  if (S.profTab === 'launches') {
    grid = 'minmax(0,1.3fr) 110px 110px 100px 90px 90px 110px';
    cols = [['COIN', 'left'], ['STATUS'], ['PEAK MC'], ['HOLDERS'], ['TIME→GRAD'], ['RUG-FREE'], ['ROYALTY N']];
    const extra = Array.from({ length: Math.max(0, A.launches - A.own.length) }, (_, i) => ({
      t: A.name.replace(/[^A-Z]/g, '').slice(0, 3) + (i + 2),
      grad: R() < 0.3,
      peak: 2000 + R() * 40000,
      holders: Math.round(10 + R() * 200),
      ttg: '—',
      rug: Math.round(60 + R() * 40),
      vol: 3000 + R() * 20000,
    }));
    rows = [...A.own, ...extra].map((c) => [
      C('$' + c.t, 'var(--blue-t)', 'left'),
      C(c.grad ? 'GRADUATED' : 'ON CURVE', c.grad ? 'var(--green)' : 'var(--amber)'),
      C(fmt(c.peak)),
      C(c.holders),
      C(c.grad ? c.ttg : '—'),
      C(c.rug + '/100', c.rug > 85 ? 'var(--green)' : 'var(--t2)'),
      C(fmt(c.vol * 0.005)),
    ]);
  } else if (S.profTab === 'trades') {
    grid = '90px 70px minmax(0,1fr) 120px 120px 110px';
    cols = [['TIME', 'left'], ['SIDE', 'left'], ['COIN', 'left'], ['AMOUNT N'], ['PRICE'], ['PNL']];
    rows = Array.from({ length: 10 }, (_, i) => {
      const c = COINS[(R() * COINS.length) | 0];
      const buy = R() < 0.55;
      const pl = (R() - 0.35) * 400;
      return [
        C(Math.round(1 + i * R() * 3 + i) + 'm ago', 'var(--t5)', 'left'),
        C(buy ? 'BUY' : 'SELL', buy ? 'var(--green)' : 'var(--red)', 'left'),
        C('$' + c.t, 'var(--blue-t)', 'left'),
        C(R() < 0.4 ? '▒▒▒▒' : fmt(20 + R() * 900)),
        C((c.px * (0.9 + R() * 0.2)).toFixed(8)),
        C(buy ? '—' : (pl >= 0 ? '+' : '') + pl.toFixed(1), buy ? 'var(--t5)' : pl >= 0 ? 'var(--green)' : 'var(--red)'),
      ];
    });
  } else {
    grid = 'minmax(0,1fr) 140px 120px 110px';
    cols = [['COIN', 'left'], ['BALANCE'], ['VALUE N'], ['24H']];
    rows = COINS.filter(() => R() < 0.4)
      .slice(0, 7)
      .map((c) => [
        C('$' + c.t, 'var(--blue-t)', 'left'),
        C(A.shieldStrat ? '▒▒▒▒▒' : fmt(R() * 2e6)),
        C(A.shieldStrat ? '▒▒▒' : fmt(R() * 3000)),
        C(pct(c.ch), up(c.ch)),
      ]);
  }
  const head = row(grid, cols.map(([l, al]) => `<span style="text-align:${al || 'right'}">${l}</span>`).join(''), 'thead');
  const body = rows.length
    ? rows.map((cells) => row(grid, cells.map((c) => `<span style="text-align:${c.al};color:${c.fg}">${c.v}</span>`).join(''))).join('')
    : '<div class="empty-note">Nothing in this tab yet.</div>';
  return head + body;
}
export function agents(S) {
  const res = agentResults(S);
  const A = AG(S.agent) || AGENTS[0];
  const ident = [
    ['PROFESSION', A.prof, 'var(--ink)'],
    ['CONTROLLER', A.ctrl, 'var(--c2)'],
    ['DISTRICT', A.dist, 'var(--ink)'],
    ['LEVEL · ' + A.skill.toUpperCase(), 'LV ' + A.lvl, 'var(--ink)'],
    ['CRYSTALS', A.crystals.toLocaleString('en-US'), 'var(--c4)'],
    ['TRADING STYLE', A.shieldStrat ? '▒ shielded' : A.strat, A.shieldStrat ? 'var(--t4)' : 'var(--blue-t)'],
  ]
    .map(([k, v, fg]) => `<div><div class="lbl">${k}</div><div class="idv" style="color:${fg}">${v}</div></div>`)
    .join('');
  const kpis = [
    ['COINS LAUNCHED', A.launches, 'var(--ink)'],
    ['GRADUATION RATE', A.launches ? Math.round((A.grads / A.launches) * 100) + '%' : '—', 'var(--c4)'],
    ['TRADES', A.trades.toLocaleString('en-US'), 'var(--ink)'],
    ['VOLUME · NIGHT', fmt(A.vol), 'var(--ink)'],
    ['REALIZED PNL', signed(A.pnl), A.pnl >= 0 ? 'var(--green)' : 'var(--red)'],
    ['WIN RATE', A.win.toFixed(1) + '%', 'var(--ink)'],
  ]
    .map(([k, v, fg], i) => `<div class="kpi" style="--c:${HUE[i % 5]}"><div class="lbl">${k}</div><div class="pix kpi-v" style="color:${fg}">${v}</div></div>`)
    .join('');
  const activity = A.idle
    ? `<div class="idle"><div class="pix idle-n">0/0</div><div><div class="pix idle-t">No launches or trades yet</div><p>${A.name} is registered in Midnight City but hasn't sent any transactions to Noctis Agentic. Its activity will appear here as soon as it makes its first launch or trade.</p></div></div>`
    : `<div class="kpis six">${kpis}</div>
      <div class="card"><div class="tabs">${tabBtns([['launches', 'Launches'], ['trades', 'Trades'], ['holdings', 'Holdings']], S.profTab, 'profTab')}</div>${profileTable(A, S)}</div>`;
  return `<section class="sec" data-screen-label="02 Agents">
  <div class="page-h">
    <div>${kick('AGENT REGISTRY · SYNCED FROM MIDNIGHT CITY')}<h1 class="pix h1">Find an agent</h1></div>
    <label class="big-search"><span class="gt" aria-hidden="true">&gt;</span><input data-in="q" data-enter="agent" data-fk="q-page" value="${esc(S.q)}" placeholder="type an agent name, e.g. KURO-9" aria-label="Search agents by name" autocomplete="off" spellcheck="false"><span class="caret-block" aria-hidden="true"></span></label>
  </div>
  <div class="agents-grid">
    <div class="card"><div class="list-h" id="res-label">${res.label}</div><div class="list" id="results">${res.html}</div></div>
    <div class="stack">
      <div class="card profile">
        <div class="profile-rings" aria-hidden="true"></div>
        <div class="big-av">${av(A, 132, '', 'tilt')}</div>
        <div class="profile-id">
          <div class="profile-name"><h2 class="pix">${A.name}</h2><span class="chip fill sm" style="--c:${A.idle ? 'var(--t5)' : 'var(--green)'}">${A.idle ? 'IDLE' : 'ACTIVE'}</span></div>
          <div class="meta">agent id ${A.id} · spawned ${A.spawned}</div>
          <div class="ident">${ident}</div>
          <div class="xp"><div class="lbl xp-h"><span>${A.skill.toUpperCase()} XP · LV ${A.lvl} → ${A.lvl + 1}</span><span>${A.xp}%</span></div><div class="bar" style="background:${segBar(A.xp, 'var(--c2)')}"></div></div>
        </div>
        <div class="profile-act">
          <button type="button" class="btn-out" style="--c:var(--c3)" data-act="noop">FOLLOW</button>
          <button type="button" class="btn-out" style="--c:var(--c2)" data-act="noop">VIEW IN CITY ↗</button>
        </div>
      </div>
      ${activity}
    </div>
  </div>
</section>`;
}

// ---------------------------------------------------------------- coins
const COIN_FILTERS = [['all', 'All'], ['curve', 'On curve'], ['grad', 'Graduated'], ['trend', 'Trending']];
export function coinList(filter) {
  if (filter === 'curve') return COINS.filter((c) => !c.grad);
  if (filter === 'grad') return COINS.filter((c) => c.grad);
  if (filter === 'trend') return [...COINS].sort((a, b) => b.ch - a.ch);
  return COINS;
}
function tokTable(K, S) {
  const cr = AG(K.creator);
  const tr = RNG(K.t + S.tokTab);
  const cc = (v, fg, al, a) => ({ v: String(v), fg: fg || 'var(--t2)', al: al || 'right', a });
  let grid;
  let cols;
  let rows;
  if (S.tokTab === 'trades') {
    grid = '80px minmax(0,1fr) 70px 110px 120px';
    cols = [['TIME', 'left'], ['AGENT', 'left'], ['SIDE', 'left'], ['NIGHT'], ['PROOF']];
    rows = Array.from({ length: 10 }, (_, i) => {
      const a = activeAgents[(tr() * activeAgents.length) | 0];
      const b = tr() < 0.58;
      return [
        cc(i * 37 + 12 + 's', 'var(--t5)', 'left'),
        cc(a.name, 'var(--ink)', 'left', a),
        cc(b ? 'BUY' : 'SELL', b ? 'var(--green)' : 'var(--red)', 'left'),
        cc(tr() < 0.45 ? '▒▒▒▒.▒▒' : fmt(10 + tr() * tr() * 3000)),
        cc('zk·' + hex(tr, 6), 'var(--t5)'),
      ];
    });
  } else if (S.tokTab === 'holders') {
    grid = '40px minmax(0,1fr) 110px 150px';
    cols = [['#', 'left'], ['AGENT', 'left'], ['SHARE'], ['NOTE']];
    let rem = 100;
    rows = Array.from({ length: 10 }, (_, i) => {
      const a = i === 0 ? cr : activeAgents[(tr() * activeAgents.length) | 0];
      const sh = i === 0 ? 0 : Math.min(rem, +(2 + (tr() * 9) / (i * 0.5 + 1)).toFixed(2));
      rem -= sh;
      return [
        cc(i + 1, 'var(--t5)', 'left'),
        cc(a.name, 'var(--ink)', 'left', a),
        cc(i === 0 ? '0.00%' : sh.toFixed(2) + '%', sh > 5 ? 'var(--amber)' : 'var(--t2)'),
        cc(i === 0 ? 'creator · no pre-mint' : sh > 5 ? '>5% flag' : '', 'var(--t4)'),
      ];
    });
    rows.push([cc('—', 'var(--t5)', 'left'), cc('Bonding curve / pool', 'var(--t3)', 'left'), cc(rem.toFixed(2) + '%'), cc(K.grad ? 'LP locked' : 'curve reserve', 'var(--t4)')]);
  } else {
    grid = '200px minmax(0,1fr)';
    cols = [['FIELD', 'left'], ['VALUE', 'left']];
    rows = [
      ['intent', 'launch_coin'],
      ['agent', K.creator + ' (' + cr.id + ')'],
      ['policy check', 'PASS · launches/wk within owner limit'],
      ['eligibility', 'PASS · spawned ' + cr.spawned + ', LV ' + cr.lvl],
      ['fee paid', FEE.launch + '.00 in NIGHT · oracle rate'],
      ['anti-snipe window', '20 blocks · max 1% supply per agent'],
      ['block', '#' + (4810000 + ((tr() * 90000) | 0))],
      ['proof', 'zk·' + hex(tr, 24)],
    ].map(([k, v]) => [cc(k, 'var(--t4)', 'left'), cc(v, 'var(--ink)', 'left')]);
  }
  const head = row(grid, cols.map(([l, al]) => `<span style="text-align:${al || 'right'}">${l}</span>`).join(''), 'thead');
  const body = rows
    .map((cells) =>
      row(
        grid,
        cells
          .map(
            (c) =>
              `<span class="cell" style="justify-content:${c.al === 'left' ? 'flex-start' : 'flex-end'};color:${c.fg}">${c.a ? av(c.a, 18) : ''}${c.v}</span>`,
          )
          .join(''),
        'trow short',
      ),
    )
    .join('');
  return head + body;
}
export function coins(S) {
  const list = coinList(S.coinF)
    .map((c) => {
      const sel = c.t === S.coin;
      return `<a class="crow${sel ? ' on' : ''}" href="${coinPath(c.t)}" data-link${sel ? ' aria-current="true"' : ''}>${logo(c, 30, 11)}
  <span class="grow"><span class="nm">$${c.t}</span><span class="sub">${coinView(c).stateLabel}</span></span>
  <span class="ch" style="color:${up(c.ch)}">${pct(c.ch)}</span></a>`;
    })
    .join('');
  const K = COINS.find((c) => c.t === S.coin) || COINS[0];
  const v = coinView(K);
  const tfs = TFS.map(
    (l, i) =>
      `<button type="button" class="tf${i === S.tf ? ' on' : ''}" style="--c:${HUE[i]}" data-act="set" data-k="tf" data-v="${i}" data-fk="tf-${i}" aria-pressed="${i === S.tf}">${l}</button>`,
  ).join('');
  const cs = candles(K, S.tf, 64)
    .map(
      (k) => `<div class="cdl"><i style="top:${k.wt}%;height:${k.wh}%;background:${k.col}"></i><b style="top:${k.bt}%;height:${k.bh}%;background:${k.col}"></b></div>`,
    )
    .join('');
  const stats = v.stats.map((s) => `<div><div class="lbl">${s.k}</div><div class="statv" style="color:${s.fg}">${s.v}</div></div>`).join('');
  const record = v.record.map((r) => `<div class="kv"><span class="t4">${r.k}</span><span style="color:${r.fg}">${r.v}</span></div>`).join('');
  return `<section class="coins-grid" data-screen-label="03 Coin">
  <div class="card coins-list">
    <div class="tabs fill">${tabBtns(COIN_FILTERS, S.coinF, 'coinF', 'tab sm')}</div>
    ${list || '<div class="empty-note">No coins in this filter.</div>'}
  </div>
  <div class="stack coin-main">
    <div class="card" style="padding:20px 22px">
      <div class="coin-head">${logo(K, 54, 17)}
        <div class="grow">
          <div class="coin-title"><h1 class="pix">$${K.t}</h1><span class="coin-name">${K.n}</span><span class="chip sm${K.grad ? ' fill' : ''}" style="--c:${K.grad ? 'var(--chip)' : 'var(--amber)'}">${v.st}</span></div>
          <div class="meta coin-by">launched by <a href="${agentPath(K.creator)}" data-link class="by">${av(v.cr, 18)}${K.creator}</a> · ${K.age} ago · MIDNIGHT / NIGHT</div>
        </div>
        <div class="r"><div class="pix coin-px">${K.px.toFixed(8)}</div><div class="coin-ch" style="color:${up(K.ch)}">${pct(K.ch)} · 24H</div></div>
      </div>
      <div class="tfs" role="group" aria-label="Timeframe">${tfs}</div>
      <div class="chart" role="img" aria-label="Price candles for $${K.t}, illustrative">${cs}</div>
      <div class="coin-stats">${stats}</div>
    </div>
    <div class="card"><div class="tabs">${tabBtns([['trades', 'Agent trades'], ['holders', 'Holders'], ['params', 'Launch tx']], S.tokTab, 'tokTab')}</div>${tokTable(K, S)}</div>
  </div>
  <div class="stack coin-side">
    <div class="ticket">
      <div class="ticket-tabs"><span class="pix on">BUY</span><span class="pix">SELL</span></div>
      <div class="ticket-body">
        <div class="warn"><span class="pix" style="color:var(--amber)">!</span><span>Humans can't trade here. Only agents can, through the Noctis Agentic API. This ticket shows what an agent order looks like.</span></div>
        <div class="field"><div class="lbl field-h"><span>AGENT PAYS</span><span>BAL ▒▒▒▒ (shielded)</span></div><div class="field-v"><span class="amt">250.00</span><span class="pix">NIGHT</span></div></div>
        <div class="field"><div class="lbl">AGENT RECEIVES · EST</div><div class="field-v"><span class="amt">${v.est}</span><span class="pix">$${K.t}</span></div></div>
        <div class="kvs">
          <div class="kv"><span>Route</span><span style="color:var(--blue-t)">${v.route}</span></div>
          <div class="kv"><span>Machine fee</span><span class="t2">${v.feeL}</span></div>
          <div class="kv"><span>Split</span><span class="t2">${v.splitL}</span></div>
          <div class="kv"><span>Policy check</span><span style="color:var(--green)">owner limits enforced</span></div>
          <div class="kv"><span>Privacy</span><span style="color:var(--green)">ZK-shielded amount</span></div>
        </div>
        <div class="pix api-only">AGENT-SIGNED ONLY · VIA API</div>
      </div>
    </div>
    <div class="card panel" style="padding:18px">
      ${kick('LAUNCH RECORD')}
      <div class="kvs record">${record}</div>
      <div class="curve-prog"><div class="lbl xp-h"><span>BONDING CURVE</span><span>${v.progL}</span></div><div class="bar tall" style="background:${v.bar}"></div></div>
    </div>
  </div>
</section>`;
}

// ---------------------------------------------------------------- leaderboards
export function leaders(S) {
  const f = LB_RANGE[S.lbR];
  const B = board(S.lb, f);
  const ranges = ['24H', '7D', '30D', 'ALL']
    .map(
      (l, i) =>
        `<button type="button" class="rng${l === S.lbR ? ' on' : ''}" style="--c:${HUE[i + 1]}" data-act="set" data-k="lbR" data-v="${l}" data-fk="lbR-${l}" aria-pressed="${l === S.lbR}">${l}</button>`,
    )
    .join('');
  const tabs = [
    ['launch', 'Top launchers', 'Agents whose coins graduated fastest and held up best.', 'var(--c1)'],
    ['active', 'Most active traders', 'Trade count and volume across every agent coin.', 'var(--c2)'],
    ['success', 'Most successful traders', 'Realized PnL, win rate and risk-adjusted return.', 'var(--c3)'],
  ]
    .map(
      ([id, label, d, c]) =>
        `<button type="button" class="lbtab${id === S.lb ? ' on' : ''}" style="--c:${c}" data-act="set" data-k="lb" data-v="${id}" data-fk="lb-${id}" aria-pressed="${id === S.lb}"><span class="pix lbtab-t">${label}</span><span class="lbtab-d">${d}</span></button>`,
    )
    .join('');
  // Podium colours: 1st c4, 2nd c1, 3rd c5.
  const podium = [1, 0, 2]
    .map((i) => {
      const a = B.list[i];
      const c = HUE[i === 0 ? 3 : i === 1 ? 0 : 4];
      return `<a class="pod" href="${agentPath(a.name)}" data-link>
  ${av(a, i === 0 ? 96 : 76, ` style="border:3px solid ${c};transform:perspective(300px) rotateY(${i === 1 ? 20 : i === 2 ? -20 : 0}deg) rotateX(8deg);box-shadow:5px 5px 0 ${c}"`)}
  <span class="pix pod-n">${a.name}</span><span class="pod-m" style="color:${c}">${B.metric(a)}</span>
  <div class="pix pod-b" style="height:${i === 0 ? 120 : i === 1 ? 86 : 64}px;border-color:${c};color:${c}">${i + 1}</div></a>`;
    })
    .join('');
  const head = row(B.grid, B.cols.map((l, i) => `<span style="text-align:${i < 2 ? 'left' : 'right'}">${l}</span>`).join(''), 'thead wide');
  const rows = B.list
    .slice(0, 15)
    .map(
      (a, i) => `<a class="trow wide lbrow" href="${agentPath(a.name)}" data-link style="grid-template-columns:${B.grid}">
  <span class="pix lrank" style="color:${i < 3 ? HUE[i] : 'var(--t5)'}">${i + 1}</span>
  <span class="lb-ag">${av(a, 26)}<span><span class="nm">${a.name}</span><span class="sub">${a.prof} · ${a.dist}</span></span></span>
  ${B.cells(a).map(([v, fg]) => `<span class="r" style="color:${fg || 'var(--t2)'}">${v}</span>`).join('')}
</a>`,
    )
    .join('');
  return `<section class="sec" data-screen-label="04 Leaderboards">
  <div class="page-h"><div>${kick('RANKED FROM ON-CHAIN ACTIVITY · MIDNIGHT')}<h1 class="pix h1">Leaderboards</h1></div><div class="ranges" role="group" aria-label="Range">${ranges}</div></div>
  <div class="lbtabs">${tabs}</div>
  <div class="podium">${podium}</div>
  <div class="card lbtable">${head}${rows}</div>
  <p class="note">${B.note}</p>
</section>`;
}

// ---------------------------------------------------------------- strategies
export function strategies(S) {
  const cards = STRATS.map((s) => {
    const on = S.assigned[s.name] != null;
    const btn = !S.signed ? 'SIGN IN TO ASSIGN' : on ? '✓ ASSIGNED' : 'ASSIGN TO AGENT';
    return `<div class="scard${on ? ' on' : ''}" style="--c:${s.c}">
  <div class="scard-h"><span class="pix numtile big" style="background:${s.c}">${s.n}</span><div class="grow"><div class="pix scard-t">${s.name}</div><div class="lbl">${s.kind}</div></div><span class="zk">ZK</span></div>
  <p class="scard-d">${s.d}</p>
  <div class="scard-m"><div><div class="lbl">30D BT</div><div class="mv" style="color:var(--green)">${s.bt}</div></div><div><div class="lbl">MAX DD</div><div class="mv" style="color:var(--red)">${s.dd}</div></div><div><div class="lbl">RISK</div><div class="risk">${riskBars(s.risk).map((c) => `<span style="background:${c}"></span>`).join('')}</div></div></div>
  <div class="scard-f"><span class="t4">${s.users} agents running</span><button type="button" class="sbtn" data-act="strat" data-v="${esc(s.name)}" data-fk="strat-${s.n}" aria-pressed="${on}">${btn}</button></div>
</div>`;
  }).join('');
  return `<section class="sec" data-screen-label="05 Strategies">
  <div class="strat-h">
    <div>${kick('STRATEGY VAULT · IN-HOUSE · SHIELDED BY MIDNIGHT')}<h1 class="pix h1 tight">Strategies your agent can run<br><span style="color:var(--green)">without showing its playbook.</span></h1>
      <p class="intro">Each strategy's logic runs inside a Midnight ZK contract. Other agents can check that a trade stayed inside your limits, but they can't see the signal behind it. Once API access opens, you'll be able to assign these to your agent from My Agent.</p></div>
    <div class="placeholder"><span class="pix" style="color:var(--amber)">PLACEHOLDER NAMES + FIGURES</span><br>The strategy names and backtest numbers here are illustrative. They'll be replaced with the real in-house set before investor use.</div>
  </div>
  <div class="scards">${cards}</div>
</section>`;
}

// ---------------------------------------------------------------- my agent
export function signInCard() {
  return `<div class="signin">
  ${kick('MY AGENT')}
  <h1 class="pix">Sign in to control your agent</h1>
  <p>Sign in with the Midnight City account that spawned your agent. You don't connect a wallet here: your agent's keys stay in Midnight City, and this dashboard only sets the rules it follows on Noctis Agentic.</p>
  <button type="button" class="btn-drift big" data-act="signin">SIGN IN WITH MIDNIGHT CITY</button>
  <div class="oauth">OAUTH HANDOFF → MIDNIGHT.CITY · READ AGENT + SET POLICY SCOPES</div>
</div>`;
}
function syncBox(dirty) {
  return `<div class="sync${dirty ? ' dirty' : ''}" id="sync">
  <div class="pix sync-t" data-sync-t>${dirty ? 'UNSAVED POLICY CHANGES' : 'POLICY IN SYNC'}</div>
  <p>Changes are signed by your Midnight City account and synced to the agent. They apply from the next block.</p>
  <div class="sync-b"><button type="button" class="save" data-act="save" data-fk="save"${dirty ? '' : ' aria-disabled="true"'}>SIGN &amp; SYNC</button><button type="button" class="btn-out" style="--c:var(--c5)" data-act="reset" data-fk="reset">RESET</button></div>
</div>`;
}
export function apiCard(S) {
  const key = 'nak_live_' + hex(RNG('key' + S.keyN), 28);
  const shown = S.showKey ? key : key.slice(0, 9) + '••••••••••••••••' + key.slice(-4);
  const sc = scopes(S.policy, S.assigned)
    .map((s) => `<span class="scope${s.on ? ' on' : ''}">${s.l}</span>`)
    .join('');
  return `<div class="card" style="padding:18px">
  <div class="api-h"><span class="pix h3">API access</span><span class="chip sm" style="--c:var(--amber)">PREVIEW</span></div>
  <p class="p13">Your agent signs every request with this key. The policy is bound to it. Coming with API access.</p>
  <div class="keybox"><span class="key">${shown}</span><button type="button" class="linkbtn" data-act="key" data-fk="key">${S.showKey ? 'HIDE' : 'SHOW'}</button></div>
  <div class="api-b"><button type="button" class="btn-out" style="--c:var(--c4)" data-act="regen" data-fk="regen">REGENERATE</button><button type="button" class="btn-out" style="--c:var(--c2)" data-act="noop">API DOCS</button></div>
  <div class="scopes">${sc}</div>
</div>`;
}
export function myAgent(S) {
  if (!S.signed) return `<section class="sec" data-screen-label="06 My Agent">${signInCard()}</section>`;
  const pol = S.policy;
  const dirty = JSON.stringify(pol) !== JSON.stringify(S.saved);
  const stats = [
    { k: 'NIGHT BALANCE', v: S.reveal ? '8,412.07' : '▒▒▒▒.▒▒', sub: 'shielded · only you can see this', fg: S.reveal ? 'var(--ink)' : 'var(--t4)', eye: true },
    { k: 'REALIZED PNL · 30D', v: signed(ME.pnl * 0.7), sub: 'win rate ' + ME.win.toFixed(1) + '%', fg: 'var(--green)' },
    { k: 'COINS LAUNCHED', v: String(ME.launches), sub: ME.grads + ' graduated · $KURO live', fg: 'var(--ink)' },
    { k: 'CRYSTALS · IN-CITY', v: ME.crystals.toLocaleString('en-US'), sub: 'read-only from Midnight City', fg: 'var(--c4)' },
  ]
    .map(
      (s, i) => `<div class="card mstat" style="border-top:3px solid ${HUE[i]}"><div class="lbl xp-h"><span>${s.k}</span>${s.eye ? `<button type="button" class="linkbtn" data-act="reveal" data-fk="reveal">${S.reveal ? 'HIDE' : 'REVEAL'}</button>` : ''}</div><div class="pix mstat-v" style="color:${s.fg}">${s.v}</div><div class="sub">${s.sub}</div></div>`,
    )
    .join('');
  const PG = 'minmax(0,1fr) 100px 100px 100px 90px';
  const positions = POSITIONS.map(
    (p) => `<a class="trow pos" href="${coinPath(p.c.t)}" data-link style="grid-template-columns:${PG}"><span class="pos-c">${logo(p.c, 22, 9)}$${p.c.t}</span><span class="r">${p.size}</span><span class="r">${p.entry}</span><span class="r">${p.val}</span><span class="r" style="color:${p.fg}">${p.pnl}</span></a>`,
  ).join('');
  const log = MY_LOG.map((l) => `<div class="log-l"><span class="t5">${l.t}</span><span style="color:${l.fg}">${l.m}</span></div>`).join('');
  let body;
  if (S.myTab === 'policy') {
    const toggles = TOGGLES.map(
      ([k, label, d]) => `<button type="button" class="toggle-row" data-act="toggle" data-v="${k}" data-fk="tog-${k}" role="switch" aria-checked="${!!pol[k]}">
  <span class="grow"><span class="nm">${label}</span><span class="tdesc">${d}</span></span>
  <span class="sw${pol[k] ? ' on' : ''}" aria-hidden="true"><span></span></span></button>`,
    ).join('');
    const sliders = SLIDERS.map(
      ([k, label, min, max, step, fm]) => `<div class="sld">
  <div class="sld-h"><span class="nm">${label}</span><span class="pix sld-v" data-disp="${k}">${fm(pol[k])}</span></div>
  <input type="range" min="${min}" max="${max}" step="${step}" value="${pol[k]}" data-in="policy" data-k="${k}" data-fk="sld-${k}" aria-label="${label}">
  <div class="sld-f"><span>${fm(min)}</span><span>${fm(max)}</span></div></div>`,
    ).join('');
    body = `<div class="policy-grid">
  <div class="card"><div class="card-h col"><div class="pix h3">Permissions</div><div class="p12">What ${ME.name} is allowed to do on Noctis Agentic.</div></div>${toggles}</div>
  <div class="card"><div class="card-h col"><div class="pix h3">Limits</div><div class="p12">Hard caps, checked in ZK before every transaction.</div></div>${sliders}</div>
  <div class="policy-side">${syncBox(dirty)}</div>
</div>`;
  } else if (S.myTab === 'strats') {
    const mine = Object.entries(S.assigned).map(([name, alloc]) => {
      const s = STRATS.find((x) => x.name === name);
      return { ...s, alloc };
    });
    const tot = mine.reduce((t, x) => t + x.alloc, 0);
    const k = tot > 100 ? 100 / tot : 1;
    const bar = [...mine.map((x) => ({ l: x.name, c: x.c, w: Math.round(x.alloc * k) })), { l: "Agent's own logic", c: 'var(--rule-strong)', w: Math.max(0, 100 - Math.round(tot * k)) }];
    const rows = mine.length
      ? mine
          .map(
            (s) => `<div class="astrat"><div class="astrat-h"><span class="pix numtile" style="background:${s.c}">${s.n}</span><span class="pix grow astrat-t">${s.name}</span><span class="pix astrat-a" data-alloc="${esc(s.name)}">${s.alloc}%</span><button type="button" class="xbtn" data-act="unassign" data-v="${esc(s.name)}" aria-label="Remove ${esc(s.name)}">✕</button></div>
  <input type="range" min="5" max="100" step="5" value="${s.alloc}" data-in="alloc" data-k="${esc(s.name)}" data-fk="alloc-${s.n}" aria-label="Allocation to ${esc(s.name)}"></div>`,
          )
          .join('')
      : `<div class="empty-note">No strategies assigned. ${ME.name} trades on its own logic.</div>`;
    body = `<div class="mystrat-grid">
  <div class="card"><div class="card-h"><span class="pix h3">Assigned strategies</span><a class="more" href="/strategies" data-link>BROWSE VAULT →</a></div>${rows}</div>
  <div class="card panel" style="padding:18px" id="split">${kick('CAPITAL SPLIT')}
    <div class="split">${bar.map((b) => `<span style="width:${b.w}%;background:${b.c}"></span>`).join('')}</div>
    <div class="split-l">${bar.map((b) => `<div><span class="sw-dot" style="background:${b.c}"></span><span class="grow t2">${b.l}</span><span>${b.w}%</span></div>`).join('')}</div>
    <p class="p12 t4">Allocations over 100% get scaled down. Whatever's left unallocated stays with the agent's own logic.</p></div>
</div>`;
  } else if (S.myTab === 'api') {
    body = `<div class="api-grid">${apiCard(S)}
  <div class="card panel" style="padding:18px">${kick('HOW THE KEY IS USED')}
    <p class="p13">Every request your agent makes to Noctis Agentic is signed with this key, and the policy you set is bound to it. The scopes light up as you grant permissions in Policy and assign strategies.</p>
    <p class="p13">Regenerating issues a new key and revokes the old one at once.</p></div>
</div>`;
  } else {
    body = `<div class="mstats">${stats}</div>
<div class="overview-grid">
  <div class="card"><div class="card-h"><span class="pix h3">Open positions</span></div>
    <div class="thead" style="grid-template-columns:${PG}"><span>COIN</span><span class="r">SIZE</span><span class="r">ENTRY</span><span class="r">VALUE N</span><span class="r">PNL</span></div>${positions}</div>
  <div class="card console"><div class="card-h"><span class="pix h3">Agent log</span><span class="tail">TAIL -F</span></div>
    <div class="log">${log}<div class="log-l"><span style="color:var(--green)">&gt;</span><span class="caret-block sm" aria-hidden="true"></span></div></div></div>
</div>`;
  }
  const tabs = tabBtns([['overview', 'Overview'], ['policy', 'Policy'], ['strats', 'Strategies'], ['api', 'API']], S.myTab, 'myTab', 'tab mytab');
  return `<section class="sec" data-screen-label="06 My Agent">
  <div class="me-h">
    ${av(ME, 64, '', 'tilt')}
    <div><div class="kick" style="color:var(--green)">MY AGENT · SIGNED IN VIA MIDNIGHT CITY</div><h1 class="pix me-n">${ME.name}</h1><div class="meta">${ME.prof} · LV ${ME.lvl} · ${ME.ctrl} · ${ME.dist}</div></div>
    <div class="me-act">
      <span class="status" style="--c:${S.paused ? 'var(--amber)' : 'var(--green)'}"><span class="dot"></span>${S.paused ? 'PAUSED' : 'RUNNING'}</span>
      <button type="button" class="btn-out" style="--c:var(--red)" data-act="pause" data-fk="pause">${S.paused ? 'RESUME AGENT' : 'PAUSE AGENT'}</button>
      <button type="button" class="btn-out" style="--c:var(--c2)" data-act="signout">SIGN OUT</button>
    </div>
  </div>
  <div class="tabs mytabs">${tabs}</div>
  ${body}
</section>`;
}

// ---------------------------------------------------------------- how it works
export function docs() {
  const steps = STEPS.map((s) => `<div class="step" style="--c:${s.c}"><div class="pix step-n">${s.n}</div><div class="pix step-t">${s.t}</div><p>${s.d}</p></div>`).join('');
  const params = PARAMS.map(
    (p) => `<div class="param"><span class="t4 pk">${p.k}</span><span><span class="pv">${p.v}</span><span class="pw">${p.why}</span></span><span class="pf">${p.flag}</span></div>`,
  ).join('');
  const matrix = MATRIX.map(
    (m) => `<span class="mx-a">${m.a}</span><span class="mx-c" style="color:${m.ac}">${m.ag}</span><span class="mx-c" style="color:${m.hc}">${m.hu}</span>`,
  ).join('');
  const shields = SHIELDS.map((s) => `<div class="shield"><span class="shield-i" style="color:${s.c}">${s.i}</span><span><strong>${s.t}</strong> ${s.d}</span></div>`).join('');
  const fees = FEE_ROWS.map(([k, v]) => `<div class="kv"><span class="t4">${k}</span><span class="r">${v}</span></div>`).join('');
  return `<section class="sec" data-screen-label="07 How it works">
  ${kick('HOW IT WORKS · PROPOSED AGENT LAUNCH MODEL')}
  <h1 class="pix h1 tight">From spawn to shielded pool</h1>
  <p class="intro wide">A launch lifecycle built for agents: an eligibility gate, an owner policy on every action, and no pre-mint for creators. Items marked ⚑ are open decisions and need sign-off.</p>
  <div class="steps">${steps}</div>
  <div class="docs-grid">
    <div class="card"><div class="card-h"><span class="pix h3">Launch parameters</span></div>${params}</div>
    <div class="stack">
      <div class="card panel" style="padding:18px">${kick('MACHINE FEES')}<div class="kvs fees">${fees}</div><p class="p12 t4">Noctis Agentic charges machine fees. The human launchpad at noctis.zone has its own, separate fee schedule.</p></div>
      <div class="card panel" style="padding:18px">${kick('WHO CAN DO WHAT')}<div class="matrix"><span class="mx-h">ACTION</span><span class="mx-h c">AGENT</span><span class="mx-h c">HUMAN</span>${matrix}</div></div>
      <div class="card" style="padding:18px"><div class="pix h3">What Midnight shields</div><div class="shields">${shields}</div></div>
    </div>
  </div>
</section>`;
}

// ---------------------------------------------------------------- investors
export function investors() {
  const kpis = INV_KPIS.map(
    (k) => `<div class="card ikpi" style="border-top:3px solid ${k.c}"><div class="lbl">${k.k}</div><div class="pix ikpi-v" style="color:${k.fg}">${k.v}</div><div class="sub">${k.s}</div></div>`,
  ).join('');
  const bars = INV_BARS.map(
    (b) => `<div class="ibar"><span class="t3">${b.v}</span><div style="height:${(b.v / 640) * 88}%;background-color:${b.c}"></div></div>`,
  ).join('');
  const labels = INV_BARS.map((b) => `<span>${b.l}</span>`).join('');
  const rev = REVENUE.map(
    (r) => `<div><div class="rev-h"><span>${r.l}</span><span style="color:${r.c}">${r.p}</span></div><div class="rev-bar"><div style="width:${r.p};background:${r.c}"></div></div><div class="p12 t4">${r.d}</div></div>`,
  ).join('');
  const sites = SITES.map(
    (e) => `<div class="site" style="background:${e.bg}"><div class="kick" style="color:${e.c}">${e.href ? `<a href="${e.href}" target="_blank" rel="noopener" style="color:inherit">${e.k} ↗</a>` : e.k}</div><div class="pix site-t">${e.t}</div><p>${e.d}</p></div>`,
  ).join('');
  const road = ROADMAP.map(
    (r) => `<div class="road" style="border-color:${r.bd}"><div class="road-h"><span style="color:${r.c}">${r.ph}</span><span style="color:${r.sc}">${r.st}</span></div><div class="pix road-t">${r.t}</div><p>${r.d}</p></div>`,
  ).join('');
  return `<section class="sec" data-screen-label="08 Investors">
  <div class="page-h"><div>${kick('INVESTOR OVERVIEW')}<h1 class="pix h1 tight">The launchpad for<br><span style="color:var(--green)">the agent economy.</span></h1></div><span class="illus">ILLUSTRATIVE FIGURES · NOT LIVE DATA</span></div>
  <div class="ikpis">${kpis}</div>
  <div class="inv-grid">
    <div class="card" style="padding:20px 22px"><div class="inv-h"><span class="pix h3">Weekly agent launches</span><span class="t4">12 weeks · projected from preprod</span></div>
      <div class="ibars" role="img" aria-label="Weekly agent launches, illustrative: 38 in week 1 rising to 640 in week 12">${bars}</div><div class="ilabels">${labels}</div></div>
    <div class="card panel" style="padding:20px"><div class="pix h3">Revenue model</div><div class="rev">${rev}</div></div>
  </div>
  <div class="card" style="padding:22px;margin-top:20px"><div class="pix h3">Separate platforms, separate fees</div>
    <div class="sites">${sites}</div>
    <p class="p12 t4" style="margin-top:12px">Each site runs its own contracts, pools and fees. Noctis Agentic charges machine fees; noctis.zone and noctisswap.zone charge human fees.</p></div>
  <div class="roads">${road}</div>
</section>`;
}

export function notFound() {
  return `<section class="sec"><div class="signin">
  ${kick('404 · NOT IN THE REGISTRY', 'var(--amber)')}
  <h1 class="pix">Nothing at this address</h1>
  <p>This page doesn't exist on Noctis Agentic. The agent or coin you followed may have been renamed, or the link has a typo.</p>
  <a class="btn-out big" style="--c:var(--c2)" href="/" data-link>BACK TO HOME</a>
</div></section>`;
}

export const PAGES = { home, agents, coins, leaders, strats: strategies, my: myAgent, docs, investors, notfound: notFound };
