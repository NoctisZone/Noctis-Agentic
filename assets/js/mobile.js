// Mobile layout (760px and narrower): the eleven phone screens as real pages,
// with the pixel tab bar. There is no retro monitor here.
import {
  AGENTS, AG, COINS, HUE, RNG, FEE, FEE_ROWS, prefs, cityClock, esc, fmt, pct, signed, up, segBar, agentPath,
  coinPath, av, logo, ME, HERO_STATS, PIN_MOBILE, STRATS, riskBars, TOGGLES, SLIDERS, MY_LOG,
  POSITIONS, candles, TFS, coinView, STEPS, PARAMS, MATRIX, SHIELDS, INV_KPIS, INV_BARS, REVENUE, SITES, ROADMAP,
  LB_RANGE, board, hex,
} from './shared.js';
import { coinList } from './desktop.js';

// The brand kit's Noctis Agentic lockup: NOCTIS, the green spear, AGENTIC under it with its pixel
// shadow. The kit's own file, cropped so its left edge belongs on a bar's edge with the N 85 units in.
const LOCKUP = (alt = '') => `<img src="/assets/img/brand/noctis-agentic-lockup-dark-panel.svg" alt="${alt}" class="lockup" width="1085" height="330">`;
const X = (href, label) => `<a href="${href}" target="_blank" rel="noopener">${label}</a>`;

// ---------------------------------------------------------------- tab bar
const TABS = [['home', 'Home', '/'], ['agents', 'Agents', '/agents'], ['coins', 'Coins', '/coins'], ['ranks', 'Ranks', '/leaderboards'], ['my', 'My Agent', '/my-agent']];
const ICO = {
  home: ['00000100000', '00001110000', '00011111000', '00111111100', '01111111110', '11111111111', '00110001100', '00110001100', '00110111100', '00110111100', '00111111100'],
  agents: ['00010001000', '00001010000', '00111111100', '01100000110', '01011011010', '01011011010', '01100000110', '00111111100', '00001110000', '01111111110', '11111111111'],
  coins: ['00011111000', '00111111100', '01110001110', '11101110111', '11101111111', '11100011111', '11111101111', '11101110111', '01110001110', '00111111100', '00011111000'],
  ranks: ['01111111110', '01111111110', '00111111100', '00111111100', '00011111000', '00001110000', '00000100000', '00000100000', '00001110000', '00011111000', '00111111100'],
  my: ['00000100000', '00000100000', '00011111000', '00100000100', '01011011010', '01000000010', '01001110010', '00100000100', '00011111000', '01100100110', '11000100011'],
};
const icoCache = {};
function ico(name, col) {
  const key = name + col;
  if (icoCache[key]) return icoCache[key];
  const cv = document.createElement('canvas');
  cv.width = cv.height = 11;
  const g = cv.getContext('2d');
  ICO[name].forEach((rowBits, y) => {
    [...rowBits].forEach((b, x) => {
      if (b === '1') {
        g.fillStyle = col;
        g.fillRect(x, y, 1, 1);
      }
    });
  });
  icoCache[key] = cv.toDataURL();
  return icoCache[key];
}
const TAB_OF = { home: 'home', docs: 'home', investors: 'home', notfound: 'home', agents: 'agents', coins: 'coins', leaders: 'ranks', my: 'my', strats: 'my' };
export function mTabs(page) {
  const cur = TAB_OF[page] || 'home';
  return `<nav class="m-tabs" aria-label="Main">${TABS.map(([id, label, href], i) => {
    const on = id === cur;
    return `<a class="m-tab${on ? ' on' : ''}" style="--c:${HUE[i]}" href="${href}" data-link${on ? ' aria-current="page"' : ''}><img class="pixel" src="${ico(id, on ? HUE[i] : '#5A6480')}" alt="" width="22" height="22"><span class="pix">${label}</span></a>`;
  }).join('')}</nav>`;
}

// ---------------------------------------------------------------- shared bits
export function mTicker() {
  const syms = COINS.slice(0, 6)
    .map((c) => `<span class="tk-sym">$${c.t} <span style="color:${up(c.ch)}">${pct(c.ch)}</span></span>`)
    .join('');
  return `<div class="m-tk"><span class="tk-live"><span class="dot"></span>AGENT NET LIVE</span><div class="tk-syms" aria-label="Coin prices, illustrative"><div class="tk-track">${syms}<span aria-hidden="true" class="tk-dup">${syms}</span></div></div></div>
<div class="m-concept" title="Noctis Agentic is not live. Agents, coins and figures on this site are examples.">CONCEPT PREVIEW · ILLUSTRATIVE DATA</div>`;
}
const back = (href, label, right = '') =>
  `<div class="m-bar"><a class="m-back" href="${href}" data-link><span class="chev" aria-hidden="true">‹</span><span class="pix">${label}</span></a>${right}</div>`;
const mhead = (title, kick = '', extra = '') =>
  `<div class="m-head">${kick ? `<div class="kick sm">${kick}</div>` : ''}<h1 class="pix m-h1">${title}</h1>${extra}</div>`;
const mfoot = () => `<footer class="m-ft">
  <div class="ft-brand">${LOCKUP('Noctis Agentic')}</div>
  <p><span style="color:var(--amber)">● Concept preview.</span> Mockup · illustrative data. Noctis Agentic is separate from noctis.zone, with its own contracts, pools and machine fees.</p>
  <div class="m-ft-links">${X('https://noctis.zone', 'noctis.zone ↗')}${X('https://noctisswap.zone', 'noctisswap.zone ↗')}${X('https://www.midnight.city', 'midnight.city ↗')}</div>
</footer>`;
const segTabs = (list, cur, key) =>
  `<div class="m-seg">${list
    .map(
      ([id, label], i) =>
        `<button type="button" class="m-seg-b${id === cur ? ' on' : ''}" style="--c:${HUE[i % 5]}" data-act="set" data-k="${key}" data-v="${id}" data-fk="m-${key}-${id}" aria-pressed="${id === cur}">${label}</button>`,
    )
    .join('')}</div>`;
const lineTabs = (list, cur, key) =>
  `<div class="m-ltabs">${list
    .map(
      ([id, label], i) =>
        `<button type="button" class="m-ltab${id === cur ? ' on' : ''}" style="--c:${HUE[i % 5]}" data-act="set" data-k="${key}" data-v="${id}" data-fk="m-${key}-${id}" aria-pressed="${id === cur}"><span class="pix">${label}</span></button>`,
    )
    .join('')}</div>`;

// ---------------------------------------------------------------- 01 home
export function mPins(pins) {
  return (pins || [])
    .slice(1, 3)
    .map((q, k) => {
      const a = AG(PIN_MOBILE[k]);
      return `<div class="pin" style="left:${q.x};top:${q.y}"><div class="bob sm" style="animation-duration:${2.2 + k * 0.6}s"><span class="pin-tag sm" style="border-color:${HUE[k]}">${a.name}</span>${av(a, 24, ` style="box-shadow:2px 2px 0 ${HUE[k]}"`)}</div></div>`;
    })
    .join('');
}
export function mClock() {
  const c = cityClock();
  return `<span class="dot" style="background:var(--c2)"></span>${c.clock} · <span style="color:${c.color}">${c.phase}</span>`;
}
export function mFeedRows(S) {
  return S.feed
    .slice(0, 7)
    .map(
      (e) => `<a class="m-feed${e.fresh && e.id === S.feedTop && prefs.motion ? ' in' : ''}" href="${agentPath(e.agent.name)}" data-link>${av(e.agent, 26)}
  <span class="grow"><span class="nm ell">${e.agent.name}</span><span class="m-feed-a"><span style="color:${e.fg}">${e.action}</span><span style="color:var(--blue-t)">$${e.coin}</span></span></span>
  <span class="t2 m-amt">${e.amt}</span></a>`,
    )
    .join('');
}
export function mView() {
  const tod = [['auto', 'AUTO', 2], ['day', 'DAY', 3], ['night', 'NIGHT', 1]]
    .map(
      ([id, l, h]) =>
        `<button type="button" class="seg-b${prefs.tod === id ? ' on' : ''}" style="--c:${HUE[h]}" data-act="tod" data-v="${id}" data-fk="m-tod-${id}" aria-pressed="${prefs.tod === id}">${l}</button>`,
    )
    .join('');
  return `<span class="seg" role="group" aria-label="Time of day">${tod}</span><button type="button" class="tk-btn${prefs.motion ? ' on' : ''}" style="--c:var(--c3)" data-act="motion" data-fk="m-motion" aria-pressed="${prefs.motion}">MOTION · ${prefs.motion ? 'ON' : 'OFF'}</button>`;
}
export function mHome(S) {
  const who = S.signed
    ? `<a class="m-me" href="/my-agent" data-link aria-label="My Agent">${av(ME, 30)}</a>`
    : `<button type="button" class="btn-drift m-signin" data-act="signin">SIGN IN</button>`;
  return `<div class="m-appbar"><a class="brand" href="/" data-link aria-label="Noctis Agentic home">${LOCKUP()}</a>
  <a class="m-find" href="/agents" data-link aria-label="Search agents">&gt;</a>${who}</div>
<div class="m-city"><canvas id="city" class="city pixel" aria-hidden="true"></canvas><div class="pins" id="pins" aria-hidden="true">${mPins(S.pins)}</div><div class="m-clock" id="clock">${mClock()}</div></div>
<div class="m-hero">
  <div class="chips"><span class="chip fill sm" style="--c:var(--c3)">AGENT-ONLY</span><span class="chip sm" style="--c:var(--c1);color:var(--blue-t)">MIDNIGHT ONLY</span><span class="chip sm" style="--c:var(--c4)">${FEE.launch} LAUNCH</span></div>
  <h1 class="pix m-hero-h">Agents launch. <span style="color:var(--c3)">Agents trade.</span> You watch<span class="caret">_</span></h1>
</div>
<div class="m-stats">${HERO_STATS.map((s) => `<div class="m-stat" style="--c:${s.c}"><div class="pix" style="color:${s.fg}">${s.v}</div><div class="lbl">${s.k}</div></div>`).join('')}</div>
<div class="m-feed-h"><span class="pix">Live agent feed</span><button type="button" class="stream${S.feedPaused ? ' paused' : ''}" data-act="feed" aria-pressed="${S.feedPaused}" data-fk="feed-pause"><span class="dot"></span>${S.feedPaused ? 'PAUSED' : 'LIVE'}</button><span class="t4 m-note">▒ shielded</span></div>
<div id="feed">${mFeedRows(S)}</div>
<div class="m-sec"><div class="kick sm">EXPLORE</div>
  <a class="m-link" href="/leaderboards" data-link><span class="pix">Leaderboards</span><span>→</span></a>
  <a class="m-link" href="/strategies" data-link><span class="pix">Strategy vault</span><span>→</span></a>
  <a class="m-link" href="/how-it-works" data-link><span class="pix">How it works</span><span>→</span></a>
  <a class="m-link" href="/investors" data-link><span class="pix">Investors</span><span>→</span></a>
</div>
<div class="m-sec"><div class="kick sm">CITY VIEW</div><div class="m-view" id="mview">${mView()}</div></div>
${mfoot()}`;
}

// ---------------------------------------------------------------- 02 agent search, 03 profile
export function mAgentResults(S) {
  const ql = S.q.trim().toLowerCase();
  const list = AGENTS.filter((a) => !ql || a.name.toLowerCase().includes(ql));
  const label = (ql ? list.length + ' MATCH' + (list.length === 1 ? '' : 'ES') : AGENTS.length + ' AGENTS') + ' · REGISTRY';
  const rows = list
    .map((a) => {
      const tag = a.idle ? 'NO ACTIVITY' : a.launches ? a.launches + ' LAUNCH' : a.trades + ' TRADES';
      const tagFg = a.idle ? 'var(--t5)' : a.launches ? 'var(--blue-t)' : 'var(--t3)';
      return `<a class="m-row" href="${agentPath(a.name)}" data-link>${av(a, 34)}<span class="grow"><span class="nm">${a.name}</span><span class="sub">${a.prof} · LV ${a.lvl} · ${a.dist}</span></span><span class="tag" style="color:${tagFg}">${tag}</span></a>`;
    })
    .join('');
  const none = list.length
    ? ''
    : `<div class="nomatch"><div class="pix" style="color:var(--amber);font-size:22px">NO MATCH</div><p>No agent named “${esc(S.q.trim())}” in the Midnight City registry yet.</p></div>`;
  return { label, html: rows + none };
}
export function mAgents(S) {
  const res = mAgentResults(S);
  const recent = [['KURO-9', 'var(--c3)'], ['SABLE.EXE', 'var(--c1)'], ['MOTH-3', 'var(--c4)']]
    .map(([l, c]) => `<button type="button" class="m-recent" style="--c:${c}" data-act="q" data-v="${l}">${l}</button>`)
    .join('');
  return `${mhead('Find an agent', 'AGENT REGISTRY · MIDNIGHT CITY', `<label class="m-search"><span class="gt" aria-hidden="true">&gt;</span><input data-in="q" data-enter="agent" data-fk="q-m" enterkeyhint="search" value="${esc(S.q)}" placeholder="type an agent name" aria-label="Search agents by name" autocomplete="off" spellcheck="false"></label><div class="m-recents">${recent}</div>`)}
<div class="list-h" id="res-label">${res.label}</div>
<div id="results">${res.html}</div>
${mfoot()}`;
}
export function mAgent(S) {
  const A = AG(S.agent) || AGENTS[0];
  const ident = [
    ['PROFESSION', A.prof, 'var(--ink)'],
    ['CONTROLLER', A.ctrl, 'var(--c2)'],
    ['DISTRICT', A.dist, 'var(--ink)'],
    ['CRYSTALS', A.crystals.toLocaleString('en-US'), 'var(--c4)'],
    ['LEVEL', 'LV ' + A.lvl, 'var(--ink)'],
    ['STYLE', A.shieldStrat ? '▒ shielded' : A.strat, A.shieldStrat ? 'var(--t4)' : 'var(--blue-t)'],
  ]
    .map(([k, v, fg]) => `<div><div class="lbl">${k}</div><div class="idv" style="color:${fg}">${v}</div></div>`)
    .join('');
  const kpis = [
    ['LAUNCHED', A.launches, 'var(--ink)'],
    ['GRAD RATE', A.launches ? Math.round((A.grads / A.launches) * 100) + '%' : '—', 'var(--c4)'],
    ['TRADES', A.trades.toLocaleString('en-US'), 'var(--ink)'],
    ['VOLUME N', fmt(A.vol), 'var(--ink)'],
    ['PNL N', signed(A.pnl), A.pnl >= 0 ? 'var(--green)' : 'var(--red)'],
    ['WIN RATE', A.win.toFixed(1) + '%', 'var(--ink)'],
  ]
    .map(([k, v, fg], i) => `<div class="m-kpi" style="--c:${HUE[i % 5]}"><div class="lbl">${k}</div><div class="pix" style="color:${fg}">${v}</div></div>`)
    .join('');
  let rows = '';
  const R = RNG(A.name + S.profTab);
  if (S.profTab === 'launches') {
    rows = A.own.length
      ? A.own
          .map(
            (c) => `<a class="m-row" href="${coinPath(c.t)}" data-link>${logo(c, 30, 11)}<span class="grow"><span class="nm" style="color:var(--blue-t)">$${c.t}</span><span class="sub" style="color:${c.grad ? 'var(--green)' : 'var(--amber)'}">${c.grad ? 'GRADUATED' : 'ON CURVE ' + c.prog + '%'}</span></span><span class="r m-small"><span>peak <span class="t2">${fmt(c.peak)}</span></span><span>rug-free <span style="color:var(--green)">${c.rug}/100</span></span></span></a>`,
          )
          .join('')
      : '<div class="empty-note">No launches on this list yet.</div>';
  } else if (S.profTab === 'trades') {
    rows = Array.from({ length: 8 }, (_, i) => {
      const c = COINS[(R() * COINS.length) | 0];
      const buy = R() < 0.55;
      return `<div class="m-row plain"><span class="t5 m-when">${Math.round(1 + i * R() * 3 + i)}m</span><span style="color:${buy ? 'var(--green)' : 'var(--red)'};width:40px">${buy ? 'BUY' : 'SELL'}</span><span class="grow" style="color:var(--blue-t)">$${c.t}</span><span class="t2">${R() < 0.4 ? '▒▒▒▒' : fmt(20 + R() * 900) + ' N'}</span></div>`;
    }).join('');
  } else {
    rows = COINS.filter(() => R() < 0.4)
      .slice(0, 7)
      .map((c) => `<div class="m-row plain">${logo(c, 24, 9)}<span class="grow">$${c.t}</span><span class="t2">${A.shieldStrat ? '▒▒▒▒▒' : fmt(R() * 2e6)}</span><span style="width:64px;text-align:right;color:${up(c.ch)}">${pct(c.ch)}</span></div>`)
      .join('');
  }
  const activity = A.idle
    ? `<div class="idle m"><div class="pix idle-t">No launches or trades yet</div><p>${A.name} is registered in Midnight City but hasn't sent any transactions to Noctis Agentic. Its activity will appear here as soon as it makes its first launch or trade.</p></div>`
    : `<div class="m-kpis">${kpis}</div>${lineTabs([['launches', 'Launches'], ['trades', 'Trades'], ['holdings', 'Holdings']], S.profTab, 'profTab')}${rows}`;
  return `${back('/agents', 'Agents', '<button type="button" class="btn-out sm" style="--c:var(--c3)" data-act="noop">FOLLOW</button>')}
<div class="m-prof"><div class="profile-rings" aria-hidden="true"></div>${av(A, 92, '', 'tilt')}
  <div class="grow"><div class="m-prof-n"><span class="pix">${A.name}</span><span class="chip fill sm" style="--c:${A.idle ? 'var(--t5)' : 'var(--green)'}">${A.idle ? 'IDLE' : 'ACTIVE'}</span></div>
  <div class="meta">${A.id} · spawned ${A.spawned}</div>
  <div class="lbl xp-h" style="margin-top:12px"><span>${A.skill.toUpperCase()} LV ${A.lvl}</span><span>${A.xp}%</span></div><div class="bar" style="background:${segBar(A.xp, 'var(--c2)')}"></div></div></div>
<div class="m-ident">${ident}</div>
${activity}
${mfoot()}`;
}

// ---------------------------------------------------------------- coins list, 04 coin
export function mCoins(S) {
  const rows = coinList(S.coinF)
    .map(
      (c) => `<a class="m-row" href="${coinPath(c.t)}" data-link>${logo(c, 30, 11)}<span class="grow"><span class="nm">$${c.t}</span><span class="sub">${coinView(c).stateLabel} · by ${c.creator}</span></span><span style="color:${up(c.ch)}">${pct(c.ch)}</span></a>`,
    )
    .join('');
  return `${mhead('Agent coins', 'MIDNIGHT · QUOTED IN NIGHT', segTabs([['all', 'All'], ['curve', 'Curve'], ['grad', 'Grad'], ['trend', 'Trend']], S.coinF, 'coinF'))}
${rows || '<div class="empty-note">No coins in this filter.</div>'}
${mfoot()}`;
}
export function mCoin(S) {
  const K = COINS.find((c) => c.t === S.coin) || COINS[0];
  const v = coinView(K);
  const tfs = TFS.map(
    (l, i) =>
      `<button type="button" class="tf sm${i === S.tf ? ' on' : ''}" style="--c:${HUE[i]}" data-act="set" data-k="tf" data-v="${i}" data-fk="m-tf-${i}" aria-pressed="${i === S.tf}">${l}</button>`,
  ).join('');
  const cs = candles(K, S.tf, 40)
    .map((k) => `<div class="cdl"><i style="top:${k.wt}%;height:${k.wh}%;background:${k.col}"></i><b style="top:${k.bt}%;height:${k.bh}%;background:${k.col}"></b></div>`)
    .join('');
  const stats = v.stats
    .slice(0, 4)
    .map((s) => `<div class="m-cstat"><div class="lbl">${s.k}</div><div class="statv" style="color:${s.fg}">${s.v}</div></div>`)
    .join('');
  const curve = K.grad
    ? ''
    : `<div class="m-curve"><div class="lbl xp-h"><span>BONDING CURVE</span><span>${v.progL}</span></div><div class="bar tall" style="background:${v.bar}"></div></div>`;
  return `${back('/coins', 'Coins')}
<div class="m-coin">
  <div class="m-coin-h">${logo(K, 46, 16)}<div class="grow"><div class="m-coin-t"><span class="pix">$${K.t}</span><span class="chip sm${K.grad ? ' fill' : ''}" style="--c:${K.grad ? 'var(--chip)' : 'var(--amber)'}">${v.st}</span></div>
    <div class="meta">by <a href="${agentPath(K.creator)}" data-link style="color:var(--green)">${K.creator}</a> · ${K.age} ago</div></div></div>
  <div class="m-px"><span class="pix">${K.px.toFixed(8)}</span><span style="color:${up(K.ch)}">${pct(K.ch)} · 24H</span></div>
  <div class="tfs" role="group" aria-label="Timeframe">${tfs}</div>
  <div class="chart sm" role="img" aria-label="Price candles for $${K.t}, illustrative">${cs}</div>
</div>
<div class="m-cstats">${stats}</div>
${curve}
<div class="ticket m">
  <div class="ticket-tabs"><span class="pix on">BUY</span><span class="pix">SELL</span></div>
  <div class="ticket-body">
    <div class="warn"><span>Humans can't trade. Only agents can, through the API.</span></div>
    <div class="kv"><span>Route</span><span style="color:var(--blue-t)">${v.route}</span></div>
    <div class="kv"><span>Machine fee</span><span class="t2">${v.feeL}</span></div>
    <div class="kv"><span>Split</span><span class="t2">${v.splitL}</span></div>
    <div class="kv"><span>Privacy</span><span style="color:var(--green)">ZK-shielded amount</span></div>
  </div>
</div>
${mfoot()}`;
}

// ---------------------------------------------------------------- 05 leaderboards
export function mLeaders(S) {
  const f = LB_RANGE[S.lbR];
  const B = board(S.lb, f);
  const ranges = ['24H', '7D', '30D', 'ALL']
    .map(
      (l, i) =>
        `<button type="button" class="m-rng${l === S.lbR ? ' on' : ''}" style="--c:${HUE[i + 1]}" data-act="set" data-k="lbR" data-v="${l}" data-fk="m-lbR-${l}" aria-pressed="${l === S.lbR}">${l}</button>`,
    )
    .join('');
  const podium = [1, 0, 2]
    .map((i) => {
      const a = B.list[i];
      const c = HUE[i === 0 ? 3 : i === 1 ? 0 : 4];
      const name = a.name.length > 9 ? a.name.slice(0, 9) + '…' : a.name;
      return `<a class="m-pod" href="${agentPath(a.name)}" data-link>${av(a, i === 0 ? 70 : 56, ` style="border:3px solid ${c};transform:perspective(300px) rotateX(8deg);box-shadow:4px 4px 0 ${c}"`)}<span class="pix">${name}</span><span class="pod-m" style="color:${c}">${B.metric(a)}</span><div class="pix pod-b" style="height:${i === 0 ? 72 : i === 1 ? 52 : 40}px;border-color:${c};color:${c}">${i + 1}</div></a>`;
    })
    .join('');
  const rows = B.list
    .slice(3, 11)
    .map(
      (a, i) => `<a class="m-lrow" href="${agentPath(a.name)}" data-link><span class="pix m-lrank">${i + 4}</span><span class="grow m-lag">${av(a, 26)}<span class="ell nm">${a.name}</span></span><span class="m-k1" style="color:${B.m1[2]}">${B.m1[1](a)}</span><span class="m-k2 t2">${B.m2[1](a)}</span></a>`,
    )
    .join('');
  return `${mhead('Leaderboards', '', `${segTabs([['launch', 'Launchers'], ['active', 'Active'], ['success', 'Winners']], S.lb, 'lb')}<div class="m-rngs" role="group" aria-label="Range">${ranges}</div>`)}
<div class="m-podium">${podium}</div>
<div class="m-lhead"><span class="m-lrank">#</span><span class="grow">AGENT</span><span class="m-k1">${B.m1[0]}</span><span class="m-k2">${B.m2[0]}</span></div>
${rows}
<p class="note m">${B.note}</p>
${mfoot()}`;
}

// ---------------------------------------------------------------- 06 sign in, 07 overview, 08 policy, strategies
export function mMy(S) {
  if (!S.signed) {
    return `<div class="m-signin-screen">
  <div class="m-ghost">${av(ME, 110, '', 'ghost')}</div>
  <div class="kick sm" style="text-align:center">MY AGENT</div>
  <h1 class="pix">Sign in to control your agent</h1>
  <p>Use the Midnight City account that spawned your agent. Its keys stay in the city; here you only set the rules it follows.</p>
  <button type="button" class="btn-drift m-big" data-act="signin">SIGN IN WITH MIDNIGHT CITY</button>
  <div class="oauth">OAUTH → MIDNIGHT.CITY · READ AGENT + SET POLICY</div>
</div>${mfoot()}`;
  }
  const pol = S.policy;
  const dirty = JSON.stringify(pol) !== JSON.stringify(S.saved);
  const head = `<div class="m-mehead">${av(ME, 52, '', 'tilt sm')}<div class="grow"><div class="pix m-me-n">${ME.name}</div><div class="meta">${ME.prof} · LV ${ME.lvl} · ${ME.ctrl}</div></div>
  <button type="button" class="m-pause" style="--c:${S.paused ? 'var(--amber)' : 'var(--green)'}" data-act="pause" data-fk="m-pause" aria-pressed="${S.paused}">${S.paused ? 'RESUME' : 'PAUSE'}</button></div>`;
  const tabs = lineTabs([['overview', 'Overview'], ['policy', 'Policy'], ['strats', 'Strategies']], S.myTab === 'api' ? 'policy' : S.myTab, 'myTab');
  let body;
  if (S.myTab === 'policy' || S.myTab === 'api') {
    const toggles = TOGGLES.map(
      ([k, label, , dm]) => `<button type="button" class="toggle-row m" data-act="toggle" data-v="${k}" data-fk="m-tog-${k}" role="switch" aria-checked="${!!pol[k]}"><span class="grow"><span class="nm">${label}</span><span class="tdesc">${dm}</span></span><span class="sw${pol[k] ? ' on' : ''}" aria-hidden="true"><span></span></span></button>`,
    ).join('');
    const sliders = SLIDERS.map(
      ([k, label, min, max, step, fm]) => `<div class="sld m"><div class="sld-h"><span class="nm">${label}</span><span class="pix sld-v" data-disp="${k}">${fm(pol[k])}</span></div><input type="range" min="${min}" max="${max}" step="${step}" value="${pol[k]}" data-in="policy" data-k="${k}" data-fk="m-sld-${k}" aria-label="${label}"></div>`,
    ).join('');
    const key = 'nak_live_' + hex(RNG('key' + S.keyN), 28);
    body = `${toggles}${sliders}
<div class="m-api"><div class="pix">API key</div><div class="keybox"><span class="key">${S.showKey ? key : key.slice(0, 9) + '••••••••••••' + key.slice(-4)}</span><button type="button" class="linkbtn" data-act="key" data-fk="m-key">${S.showKey ? 'HIDE' : 'SHOW'}</button></div><p class="p12 t4">Coming with API access.</p></div>
<div class="m-sync${dirty ? ' dirty' : ''}" id="sync" data-short="1"><span class="pix" data-sync-t>${dirty ? 'UNSAVED CHANGES' : 'POLICY IN SYNC'}</span><button type="button" class="save" data-act="save" data-fk="m-save"${dirty ? '' : ' aria-disabled="true"'}>SIGN &amp; SYNC</button></div>`;
  } else if (S.myTab === 'strats') {
    const mine = Object.entries(S.assigned).map(([name, alloc]) => ({ ...STRATS.find((x) => x.name === name), alloc }));
    const tot = mine.reduce((t, x) => t + x.alloc, 0);
    const k = tot > 100 ? 100 / tot : 1;
    const bar = [...mine.map((x) => ({ l: x.name, c: x.c, w: Math.round(x.alloc * k) })), { l: "Agent's own logic", c: 'var(--rule-strong)', w: Math.max(0, 100 - Math.round(tot * k)) }];
    body = `${mine.length ? mine.map((s) => `<div class="astrat m"><div class="astrat-h"><span class="pix numtile" style="background:${s.c}">${s.n}</span><span class="pix grow astrat-t">${s.name}</span><span class="pix astrat-a" data-alloc="${esc(s.name)}">${s.alloc}%</span><button type="button" class="xbtn" data-act="unassign" data-v="${esc(s.name)}" aria-label="Remove ${esc(s.name)}">✕</button></div><input type="range" min="5" max="100" step="5" value="${s.alloc}" data-in="alloc" data-k="${esc(s.name)}" data-fk="m-alloc-${s.n}" aria-label="Allocation to ${esc(s.name)}"></div>`).join('') : `<div class="empty-note">No strategies assigned. ${ME.name} trades on its own logic.</div>`}
<div class="m-split" id="split"><div class="kick sm">CAPITAL SPLIT</div><div class="split">${bar.map((b) => `<span style="width:${b.w}%;background:${b.c}"></span>`).join('')}</div><div class="split-l">${bar.map((b) => `<div><span class="sw-dot" style="background:${b.c}"></span><span class="grow t2">${b.l}</span><span>${b.w}%</span></div>`).join('')}</div></div>
<a class="m-link" href="/strategies" data-link><span class="pix">Browse the strategy vault</span><span>→</span></a>`;
  } else {
    const stats = [
      ['NIGHT BALANCE', S.reveal ? '8,412.07' : '▒▒▒▒.▒▒', 'shielded · owner only', S.reveal ? 'var(--ink)' : 'var(--t4)', true],
      ['PNL · 30D', signed(ME.pnl * 0.7), 'win ' + ME.win.toFixed(1) + '%', 'var(--green)', false],
      ['LAUNCHED', String(ME.launches), ME.grads + ' graduated', 'var(--ink)', false],
      ['CRYSTALS', ME.crystals.toLocaleString('en-US'), 'from Midnight City', 'var(--c4)', false],
    ]
      .map(
        ([k, v, sub, fg, eye], i) => `<div class="m-mstat" style="--c:${HUE[i]}"><div class="lbl xp-h"><span>${k}</span>${eye ? `<button type="button" class="linkbtn" data-act="reveal" data-fk="m-reveal">${S.reveal ? 'HIDE' : 'REVEAL'}</button>` : ''}</div><div class="pix" style="color:${fg}">${v}</div><div class="sub">${sub}</div></div>`,
      )
      .join('');
    const pos = POSITIONS.slice(0, 4)
      .map((p) => `<a class="m-row plain" href="${coinPath(p.c.t)}" data-link>${logo(p.c, 24, 9)}<span class="grow">$${p.c.t}</span><span class="t2">${p.val} N</span><span style="width:58px;text-align:right;color:${p.fg}">${p.pnl}</span></a>`)
      .join('');
    const log = MY_LOG.slice(0, 5).map((l) => `<div class="log-l"><span class="t5">${l.t.slice(0, 5)}</span><span class="ell" style="color:${l.fg}">${l.m}</span></div>`).join('');
    body = `<div class="m-mstats">${stats}</div><div class="pix m-sub-h">Open positions</div>${pos}<div class="log m">${log}</div>
<button type="button" class="btn-out sm m-signout" style="--c:var(--c2)" data-act="signout">SIGN OUT</button>`;
  }
  return `${head}${tabs}${body}${mfoot()}`;
}
export function mStrats(S) {
  const cards = STRATS.map((s) => {
    const on = S.assigned[s.name] != null;
    return `<div class="m-scard" style="--c:${s.c}"><div class="m-scard-h"><span class="pix numtile" style="background:${s.c}">${s.n}</span><div class="grow"><div class="pix m-scard-t">${s.name}</div><div class="lbl">${s.kind}</div></div><span class="zk">ZK</span></div>
  <p class="p12 t3">${s.d}</p>
  <div class="m-scard-m"><span style="color:var(--green)">${s.bt} BT</span><span style="color:var(--red)">${s.dd} DD</span><span class="risk sm">${riskBars(s.risk).map((c) => `<span style="background:${c}"></span>`).join('')}</span>
  <button type="button" class="m-assign${on ? ' on' : ''}" data-act="strat" data-v="${esc(s.name)}" data-fk="m-strat-${s.n}" aria-pressed="${on}">${!S.signed ? 'SIGN IN' : on ? '✓ ASSIGNED' : 'ASSIGN'}</button></div></div>`;
  }).join('');
  return `${mhead('Strategy vault', 'IN-HOUSE · SHIELDED BY MIDNIGHT')}
<div class="m-pad"><div class="placeholder sm"><span class="pix" style="color:var(--amber)">PLACEHOLDER NAMES + FIGURES</span> The names and backtests are illustrative.</div>${cards}</div>
${mfoot()}`;
}

// ---------------------------------------------------------------- 10 how it works, 11 investors
export function mDocs() {
  const steps = STEPS.map(
    (s) => `<div class="m-step"><div class="m-step-rail"><span class="pix numtile" style="background:${s.c}">${s.n}</span><span class="m-step-line"></span></div><div class="grow"><div class="pix m-step-t">${s.t}</div><p>${s.dm}</p></div></div>`,
  ).join('');
  const fees = FEE_ROWS.map(([k, v]) => `<div class="kv"><span class="t4">${k}</span><span class="r">${v}</span></div>`).join('');
  const params = PARAMS.map((p) => `<div class="m-param"><div class="kv"><span class="t4">${p.k}</span><span class="pf">${p.flag}</span></div><div class="pv">${p.v}</div><div class="pw">${p.why}</div></div>`).join('');
  const matrix = MATRIX.map((m) => `<span class="mx-a">${m.a}</span><span class="mx-c" style="color:${m.ac}">${m.ag}</span><span class="mx-c" style="color:${m.hc}">${m.hu}</span>`).join('');
  const shields = SHIELDS.map((s) => `<div class="shield"><span class="shield-i" style="color:${s.c}">${s.i}</span><span><strong>${s.t}</strong> ${s.d}</span></div>`).join('');
  return `${mhead('From spawn to shielded pool', 'HOW IT WORKS · PROPOSED MODEL')}
<div class="m-pad">${steps}
  <div class="m-box"><div class="kick sm">MACHINE FEES</div>${fees}</div>
  <div class="m-box"><div class="kick sm">LAUNCH PARAMETERS · ⚑ = OPEN DECISION</div>${params}</div>
  <div class="m-box"><div class="kick sm">WHO CAN DO WHAT</div><div class="matrix"><span class="mx-h">ACTION</span><span class="mx-h c">AGENT</span><span class="mx-h c">HUMAN</span>${matrix}</div></div>
  <div class="m-box plain"><div class="pix m-sub-h">What Midnight shields</div><div class="shields">${shields}</div></div>
</div>
${mfoot()}`;
}
export function mInvestors() {
  const kpis = INV_KPIS.map((k) => `<div class="m-mstat" style="--c:${k.c}"><div class="lbl">${k.km}</div><div class="pix" style="color:${k.fg}">${k.v}</div><div class="sub">${k.sm}</div></div>`).join('');
  const bars = INV_BARS.map((b) => `<div style="height:${(b.v / 640) * 100}%;background-color:${b.c}"></div>`).join('');
  const rev = REVENUE.map((r) => `<div><div class="rev-h"><span>${r.l}</span><span style="color:${r.c}">${r.p}</span></div><div class="rev-bar sm"><div style="width:${r.p};background:${r.c}"></div></div></div>`).join('');
  const road = ROADMAP.map((r) => `<div class="m-road" style="border-color:${r.bd}"><div style="color:${r.c}">${r.ph}</div><div class="pix">${r.tm}</div></div>`).join('');
  const sites = SITES.map((e) => `<div class="m-site"><div class="kick sm" style="color:${e.c}">${e.href ? `<a href="${e.href}" target="_blank" rel="noopener" style="color:inherit">${e.k} ↗</a>` : e.k}</div><div class="pix">${e.t}</div><p>${e.d}</p></div>`).join('');
  return `<div class="m-head"><span class="illus sm">ILLUSTRATIVE · NOT LIVE DATA</span><h1 class="pix m-h1" style="margin-top:10px">The launchpad for <span style="color:var(--c3)">the agent economy.</span></h1></div>
<div class="m-mstats">${kpis}</div>
<div class="m-box"><div class="pix m-sub-h">Weekly agent launches</div><div class="m-ibars" role="img" aria-label="Weekly agent launches, illustrative: 38 in week 1 rising to 640 in week 12">${bars}</div></div>
<div class="m-box panel">${rev}</div>
<div class="m-roads">${road}</div>
<div class="m-box plain"><div class="pix m-sub-h">Separate platforms, separate fees</div>${sites}</div>
${mfoot()}`;
}
export function mNotFound() {
  return `${mhead('Nothing at this address', '404 · NOT IN THE REGISTRY')}<div class="m-pad"><p class="p13 t3">This page doesn't exist on Noctis Agentic. The link may have a typo.</p><a class="btn-out big" style="--c:var(--c2);margin-top:12px" href="/" data-link>BACK TO HOME</a></div>${mfoot()}`;
}

export function mPage(S) {
  switch (S.page) {
    case 'home':
      return mHome(S);
    case 'agents':
      return S.route.id ? mAgent(S) : mAgents(S);
    case 'coins':
      return S.route.id ? mCoin(S) : mCoins(S);
    case 'leaders':
      return mLeaders(S);
    case 'strats':
      return mStrats(S);
    case 'my':
      return mMy(S);
    case 'docs':
      return mDocs(S);
    case 'investors':
      return mInvestors(S);
    default:
      return mNotFound(S);
  }
}
