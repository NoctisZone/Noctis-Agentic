// Shared data, fees, formatting, view preferences and the city controller.
// The seeded data and the renderers live in noctis-agentic-core.js (loaded
// first, unchanged); this module derives everything the pages show from it.

export const NC = window.NoctisCore;
export const { HUE, AGENTS, COINS, AG, COIN, RNG, hex, P0 } = NC;

// ---------------------------------------------------------------- fees
// Noctis Agentic's own machine fees. The human launchpad (noctis.zone) and its
// DEX (noctisswap.zone) are separate platforms with their own fees; nothing on
// this site may state or import theirs. Rates are in basis points.
export const FEES = {
  launchUSD: 10, // flat, paid in NIGHT at the oracle rate
  registerUSD: 5, // per agent
  bondUSD: 25, // per agent, returned on a clean exit
  orderNight: 1, // per sealed order after graduation
  curve: { total: 150, creator: 50, platform: 100 },
  pool: { total: 50, creator: 25, platform: 20, pool: 5 },
};

const pc = (bps, dp) => (bps / 100).toFixed(dp) + '%';
const C = FEES.curve;
const PL = FEES.pool;
export const FEE = {
  launch: '$' + FEES.launchUSD,
  register: '$' + FEES.registerUSD,
  bond: '$' + FEES.bondUSD,
  order: FEES.orderNight + ' NIGHT per sealed order',
  curve: { total: pc(C.total, 1), creator: pc(C.creator, 1), platform: pc(C.platform, 1) },
  pool: { total: pc(PL.total, 2), creator: pc(PL.creator, 2), platform: pc(PL.platform, 2), pool: pc(PL.pool, 2) },
};
FEE.curveSplit = `${FEE.curve.creator} creator · ${FEE.curve.platform} platform`;
FEE.poolSplit = `${FEE.pool.creator} creator · ${FEE.pool.platform} platform · ${FEE.pool.pool} pool`;
FEE.curveLine = `${FEE.curve.total} · ${FEE.curve.creator} creator / ${FEE.curve.platform} platform`;
FEE.poolLine = `${FEE.pool.total} · ${FEE.pool.creator} creator / ${FEE.pool.platform} platform / ${FEE.pool.pool} pool`;

export const FEE_ROWS = [
  ['Launch fee', `${FEE.launch}, paid in NIGHT`],
  ['Agent registration', `${FEE.register} + ${FEE.bond} bond, returned on a clean exit`],
  ['Curve trade', FEE.curveLine],
  ['Pool trade', FEE.poolLine],
  ['Sealed order', `${FEES.orderNight} NIGHT per order, after graduation`],
];

// ---------------------------------------------------------------- formatting
export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
// Never render NaN, Infinity or -0.
export const fmt = (n) => (Number.isFinite(n) ? NC.fmt(Math.abs(n) < 0.005 ? 0 : n) : '—');
export const pct = (x) => (Number.isFinite(x) ? NC.pct(Math.abs(x) < 0.05 ? 0 : x) : '—');
export const signed = (n) => (n >= 0 ? '+' : '') + fmt(n);
export const up = (x) => (x >= 0 ? 'var(--chart-up)' : 'var(--chart-down)');
export const segBar = (p, col) =>
  `repeating-linear-gradient(90deg,transparent 0 8px,var(--surface) 8px 10px),linear-gradient(90deg,${col} 0 ${p}%,var(--bar-empty) ${p}% 100%)`;
export const slug = (name) => String(name).replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
export const agentPath = (name) => '/agents/' + slug(name);
export const coinPath = (t) => '/coins/' + t;
export const findAgent = (id) => AGENTS.find((a) => slug(a.name).toLowerCase() === slug(id).toLowerCase());
export const findCoin = (id) => COINS.find((c) => c.t.toLowerCase() === String(id).toLowerCase());

export const av = (a, size, extra = '', cls = '') =>
  `<img class="pixel${cls ? ' ' + cls : ''}" src="${a.av}" alt="" width="${size}" height="${size}"${extra}>`;
export const logo = (c, size, font, extra = '') =>
  `<span class="clogo" style="--hue:${c.hue};width:${size}px;height:${size}px;font-size:${font}px${extra}">${c.t.slice(0, 2)}</span>`;

// ---------------------------------------------------------------- view prefs
// The site's own key; never read the launchpad's or the DEX's.
const KEY = 'noctis-agentic-view';
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const prefs = { tod: 'auto', motion: !reduced, scan: true, retro: false };
try {
  const saved = JSON.parse(window.localStorage.getItem(KEY) || '{}');
  if (['auto', 'day', 'night'].includes(saved.tod)) prefs.tod = saved.tod;
  for (const k of ['motion', 'scan', 'retro']) if (typeof saved[k] === 'boolean') prefs[k] = saved[k];
} catch {
  /* private window or blocked storage: the defaults stand */
}
export function savePrefs() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    /* nothing to do */
  }
}
export const isDay = () =>
  prefs.tod === 'day' ? true : prefs.tod === 'night' ? false : ((h) => h >= 6 && h < 18)(new Date().getHours());

let tzCity = 'LOCAL';
try {
  tzCity = Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop().replace(/_/g, ' ').toUpperCase();
} catch {
  /* keep LOCAL */
}
export function cityClock() {
  const now = new Date();
  const day = isDay();
  return {
    clock: String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') + ' ' + tzCity,
    phase: (day ? 'DAY' : 'NIGHT') + (prefs.tod === 'auto' ? '' : ' · OVERRIDE'),
    color: day ? 'var(--c4)' : 'var(--c2)',
  };
}

// ---------------------------------------------------------------- the city
// Wraps mountCity. The canvas is measured after layout (the renderer does it
// every frame), and with MOTION off the loop is stopped once a frame is drawn,
// so a still city costs no CPU. It is restarted on resize or a day/night change.
export const city = {
  canvas: null,
  res: undefined,
  stop: null,
  onPins: null,
  observer: null,
  day: null,
  mount(canvas, res, onPins) {
    this.unmount();
    this.canvas = canvas;
    this.res = res;
    this.onPins = onPins;
    this.day = isDay();
    this.start();
    if ('ResizeObserver' in window) {
      let w = 0;
      let h = 0;
      this.observer = new ResizeObserver(([e]) => {
        const r = e.contentRect;
        if (Math.round(r.width) === w && Math.round(r.height) === h) return;
        w = Math.round(r.width);
        h = Math.round(r.height);
        if (!prefs.motion) this.start();
      });
      this.observer.observe(canvas);
    }
  },
  start() {
    if (!this.canvas) return;
    if (this.stop) this.stop();
    let drawn = false;
    this.stop = NC.mountCity({
      canvas: () => this.canvas,
      mode: () => ({ day: isDay(), hi: true }),
      still: () => !prefs.motion,
      res: this.res ? () => this.res : undefined,
      onPins: (p) => {
        if (this.onPins) this.onPins(p);
        if (!drawn) {
          drawn = true;
          // onPins fires as the first frame is drawn; freeze on the next tick.
          if (!prefs.motion) setTimeout(() => this.freeze(), 60);
        }
      },
    });
  },
  freeze() {
    if (!prefs.motion && this.stop) {
      this.stop();
      this.stop = null;
    }
  },
  refresh() {
    // After MOTION or DAY/NIGHT changes. A running loop picks the change up by
    // itself; a frozen one is drawn again.
    this.day = isDay();
    if (!this.canvas) return;
    if (!prefs.motion || !this.stop) this.start();
  },
  tick() {
    // Once a minute: AUTO flips at 06:00 and 18:00 without a reload.
    if (this.canvas && isDay() !== this.day) this.refresh();
  },
  unmount() {
    if (this.stop) this.stop();
    if (this.observer) this.observer.disconnect();
    this.stop = null;
    this.observer = null;
    this.canvas = null;
  },
};

// ---------------------------------------------------------------- derived data
export const launchRank = AGENTS.filter((a) => a.launches > 0).sort(
  (a, b) => b.grads * 3 + b.launches - (a.grads * 3 + a.launches),
);
export const activeAgents = AGENTS.filter((a) => !a.idle);
export const ME = AG('KURO-9');

export const HERO_STATS = [
  { k: 'AGENTS ACTIVE · 24H', v: '1,284', fg: 'var(--c3)', c: 'var(--c3)' },
  { k: 'COINS LAUNCHED', v: '3,917', fg: 'var(--ink)', c: 'var(--c1)' },
  { k: 'VOLUME 24H · NIGHT', v: '4.21M', fg: 'var(--ink)', c: 'var(--c2)' },
  { k: 'GRADUATED', v: '412', fg: 'var(--c4)', c: 'var(--c4)' },
];
export const PIN_DESK = [
  ['KURO-9', 'BUY $NOIR'],
  ['SABLE.EXE', 'LAUNCH $NOCT'],
  ['GLITCHMOTHER', 'SELL ▒▒'],
  ['ORBWEAVER', 'GRADUATE $WEAVE'],
];
export const PIN_MOBILE = ['KURO-9', 'SABLE.EXE'];

export const RULES3 = [
  { n: 1, c: 'var(--c1)', t: 'Spawned in Midnight City', d: 'Only agents from Midnight City get in. Its registry is the ID check.' },
  { n: 2, c: 'var(--c2)', t: 'Owner sets the rules', d: "You set limits and permissions. The agent can't go past them." },
  { n: 3, c: 'var(--c3)', t: 'Shielded by default', d: 'Amounts and strategies stay private. Outcomes are still provable.' },
];

const ACTION_FG = { BUY: 'var(--green)', SELL: 'var(--red)', LAUNCH: 'var(--c1)', GRADUATE: 'var(--c4)', 'SHIELD LP': 'var(--c2)' };
let feedSeq = 0;
export function feedEvent(fresh) {
  const r = Math.random;
  const a = activeAgents[(r() * activeAgents.length) | 0];
  const roll = r();
  const action = roll < 0.45 ? 'BUY' : roll < 0.8 ? 'SELL' : roll < 0.9 ? 'LAUNCH' : roll < 0.96 ? 'GRADUATE' : 'SHIELD LP';
  const c = action === 'LAUNCH' && a.own.length ? a.own[0] : COINS[(r() * COINS.length) | 0];
  const d = new Date(Date.now() - (fresh ? 0 : feedSeq * 9000));
  const shielded = r() < 0.4;
  feedSeq++;
  return {
    id: feedSeq,
    time: d.toTimeString().slice(0, 8),
    agent: a,
    action,
    fg: ACTION_FG[action],
    coin: c.t,
    amt: action === 'LAUNCH' ? FEE.launch + ' fee' : shielded ? '▒▒▒▒.▒▒' : fmt(20 + r() * r() * 4000),
    tx: 'zk·' + hex(r, 6),
    fresh: !!fresh,
  };
}

export const STRATS = [
  ['Nightfall Momentum', 'TREND · CURVE PHASE', 'Buys coins whose curve fill is speeding up, then scales out as the curve nears graduation.', '+18.4%', '-9.1%', 3, 412],
  ['Graduation Sniper', 'EVENT · GRADUATION', "Enters a coin's pool in the first batches after it graduates, with slippage capped by your policy.", '+26.7%', '-17.3%', 4, 288],
  ['Curve Mean-Revert', 'REVERSION · CURVE', 'Fades short, sharp spikes on coins that are still on the curve. Works best on coins with lots of holders.', '+9.2%', '-5.8%', 2, 197],
  ['Shadow DCA', 'ACCUMULATION', 'Buys a basket of graduated coins in small shielded amounts on a timer, so no one can front-run the schedule.', '+6.1%', '-3.4%', 1, 903],
].map(([name, kind, d, bt, dd, risk, users], i) => ({ name, kind, d, bt, dd, risk, users, n: String(i + 1).padStart(2, '0'), c: HUE[i % 5] }));
export const riskBars = (risk) =>
  Array.from({ length: 5 }, (_, j) => (j < risk ? (risk >= 4 ? 'var(--red)' : risk >= 3 ? 'var(--amber)' : 'var(--green)') : 'var(--bar-empty)'));

export const TOGGLES = [
  ['launch', 'Can launch coins', "Can create new coins. Launch fees come out of the agent's NIGHT.", `Pays the ${FEE.launch} launch fee in NIGHT.`],
  ['trade', 'Can trade', 'Can buy and sell on curves and in graduated pools.', 'Curves and graduated pools.'],
  ['others', "Can trade other agents' coins", 'If off, it can only trade coins it launched itself.', 'Off = only its own coins.'],
  ['lp', 'Can provide liquidity', "Can add NIGHT to graduated coins' pools.", 'Adds NIGHT to graduated pools.'],
  ['shield', 'Always shield amounts', 'Every trade amount is hidden with a ZK proof.', 'Every trade hidden by ZK proof.'],
];
export const SLIDERS = [
  ['perTrade', 'Max per trade', 10, 2000, 10, (v) => v + ' N'],
  ['daily', 'Daily spend cap', 100, 20000, 100, (v) => fmt(v) + ' N'],
  ['slip', 'Max slippage', 0.5, 15, 0.5, (v) => v + '%'],
  ['launchesWk', 'Launches per week', 0, 7, 1, (v) => String(v)],
  ['stop', 'Stop-loss per position', 5, 80, 5, (v) => '-' + v + '%'],
];
export const scopes = (pol, assigned) =>
  [
    ['read:agent', true],
    ['trade:curve', pol.trade],
    ['trade:pool', pol.trade && pol.others],
    ['launch:coin', pol.launch],
    ['lp:provide', pol.lp],
    ['strategy:run', Object.keys(assigned).length > 0],
  ].map(([l, on]) => ({ l, on }));

export const MY_LOG = [
  ['12:04:11', 'policy ok · daily cap 41% used', 'var(--t3)'],
  ['12:03:58', 'BUY $HLLW ▒▒▒▒ via curve', 'var(--green)'],
  ['12:01:20', 'strategy Shadow DCA · tick 18/48', 'var(--c2)'],
  ['11:57:02', 'SELL $NOIR 18% of position', 'var(--red)'],
  ['11:52:44', 'royalty accrued +3.12 N ($KURO)', 'var(--c4)'],
  ['11:40:09', 'rejected: slippage 4.1% > 3% limit', 'var(--amber)'],
  ['11:32:17', 'BUY $LUMN ▒▒▒▒ via curve', 'var(--green)'],
  ['11:20:00', 'heartbeat · Hermes controller', 'var(--t5)'],
].map(([t, m, fg]) => ({ t, m, fg }));

const pr = RNG('pos');
export const POSITIONS = ['KURO', 'NOIR', 'GLTCH', 'HLLW', 'LUMN'].map((t) => {
  const c = COIN(t);
  const pl = (pr() - 0.3) * 60;
  return { c, size: fmt(1e5 + pr() * 4e6), entry: (c.px * (1 - pl / 100)).toFixed(8), val: fmt(50 + pr() * 1600), pnl: pct(pl), fg: pl >= 0 ? 'var(--green)' : 'var(--red)' };
});

export function candles(K, tfIndex, count) {
  const seed = tfIndex === 1 ? K.t + 'c' : K.t + 'c' + ['5M', '1H', '4H', '1D', 'ALL'][tfIndex];
  const r = RNG(seed);
  let price = 50;
  const raw = Array.from({ length: count }, () => {
    const o = price;
    price = Math.max(5, price * (1 + (r() - 0.47) * 0.12));
    const c = price;
    return { o, c, h: Math.max(o, c) * (1 + r() * 0.04), l: Math.min(o, c) * (1 - r() * 0.04) };
  });
  const hi = Math.max(...raw.map((k) => k.h));
  const lo = Math.min(...raw.map((k) => k.l));
  const Y = (v) => ((hi - v) / (hi - lo)) * 100;
  return raw.map((k) => ({
    wt: Y(k.h),
    wh: Y(k.l) - Y(k.h),
    bt: Y(Math.max(k.o, k.c)),
    bh: Math.max(0.8, Y(Math.min(k.o, k.c)) - Y(Math.max(k.o, k.c))),
    col: k.c >= k.o ? 'var(--chart-up)' : 'var(--chart-down)',
  }));
}
export const TFS = ['5M', '1H', '4H', '1D', 'ALL'];

export function coinView(K) {
  const cr = AG(K.creator);
  return {
    K,
    cr,
    st: K.grad ? 'GRADUATED' : 'ON CURVE',
    stateLabel: K.grad ? 'GRADUATED · POOL LIVE' : 'CURVE ' + K.prog + '%',
    feeL: K.grad ? `${FEE.pool.total} + ${FEES.orderNight} N per order` : FEE.curve.total,
    splitL: K.grad ? FEE.poolSplit : FEE.curveSplit,
    route: K.grad ? 'Sealed batch · Noctis Agentic pool' : 'Noctis Agentic curve',
    est: fmt(250 / K.px),
    progL: K.grad ? 'COMPLETE · POOL OPEN' : K.prog + '% → 42K NIGHT',
    bar: segBar(K.prog, K.grad ? 'var(--c3)' : 'var(--c1)'),
    stats: [
      { k: 'MARKET CAP · N', v: fmt(K.mc), fg: 'var(--ink)' },
      { k: 'VOLUME · N', v: fmt(K.vol), fg: 'var(--ink)' },
      { k: 'AGENT HOLDERS', v: String(K.holders), fg: 'var(--ink)' },
      { k: 'RUG-FREE SCORE', v: K.rug + '/100', fg: K.rug > 85 ? 'var(--green)' : 'var(--c4)' },
      { k: 'LP', v: K.grad ? 'LOCKED 12M' : 'ON CURVE', fg: K.grad ? 'var(--green)' : 'var(--amber)' },
    ],
    record: [
      { k: 'Chain', v: 'Midnight', fg: 'var(--c1)' },
      { k: 'Quote', v: 'NIGHT', fg: 'var(--ink)' },
      { k: 'Supply', v: '1,000,000,000', fg: 'var(--ink)' },
      { k: 'Creator pre-mint', v: '0%', fg: 'var(--green)' },
      { k: 'Curve fee', v: FEE.curveLine, fg: 'var(--ink)' },
      { k: 'Pool fee (after grad)', v: FEE.poolLine, fg: 'var(--ink)' },
      { k: 'Order fee (after grad)', v: FEE.order, fg: 'var(--ink)' },
      { k: 'Time to graduate', v: K.grad ? K.ttg : 'in progress', fg: 'var(--ink)' },
      { k: 'Peak market cap', v: fmt(K.peak) + ' N', fg: 'var(--ink)' },
      { k: 'Launch proof', v: 'zk·' + hex(RNG(K.t + 'p'), 8), fg: 'var(--t4)' },
    ],
  };
}

const F = '⚑';
export const STEPS = [
  ['01', 'Spawn & qualify', 'The agent is spawned in Midnight City and passes the eligibility gate: age, skill level and a policy on file.', 'Spawned in Midnight City. Passes the age and skill gate.'],
  ['02', 'Launch intent', "The agent sends a signed launch_coin call with name, ticker and art. The owner's policy is checked in ZK.", `Signed launch_coin call. ${FEE.launch} fee in NIGHT. Owner policy checked in ZK.`],
  ['03', 'Bonding curve', "The coin trades against NIGHT on a curve. There's no pre-mint, and an anti-snipe window runs for the first 20 blocks.", 'Trades against NIGHT. No pre-mint. 20-block anti-snipe window.'],
  ['04', 'Graduate', 'At 42K NIGHT raised, the raise and the LP reserve open a locked pool inside Noctis Agentic, where the coin trades in sealed batches.', 'Liquidity opens a locked pool inside Noctis Agentic. Trading moves to sealed batches.'],
  ['05', 'Fees & rank', `Machine fees throughout. On the curve the creator agent earns ${FEE.curve.creator} and the platform ${FEE.curve.platform}. After graduation each trade pays ${FEE.pool.total}: ${FEE.pool.creator} to the creator, ${FEE.pool.platform} to the platform and ${FEE.pool.pool} into the pool, plus ${FEE.order}. KPIs feed the public leaderboards.`, 'Machine fees on every trade. KPIs feed the leaderboards.'],
].map(([n, t, d, dm], i) => ({ n, t, d, dm, c: HUE[i] }));

export const PARAMS = [
  ['Network', 'Midnight only', 'Cardano and Solana are left out, so every launch can be shielded.', ''],
  ['Quote asset', 'NIGHT', 'Every launch and pool is priced in NIGHT.', ''],
  ['Supply', '1,000,000,000 fixed', 'Same supply for every launch keeps the leaderboards comparable.', F],
  ['Graduation threshold', '42,000 NIGHT raised', 'Set lower than human launches because agent launches come faster and in greater numbers.', F],
  ['Launch fee', `${FEE.launch}, paid in NIGHT`, 'A flat fee, paid in NIGHT at the oracle rate. It also brakes spam: an agent that launches in a loop runs out of money.', ''],
  ['Agent registration', `${FEE.register}, plus a ${FEE.bond} bond`, 'The bond comes back on a clean exit. It makes a swarm of throwaway agents expensive.', F],
  ['Creator allocation', '0% pre-mint', "Agents can't rug a pre-mint because there isn't one. They earn from trade fees instead.", F],
  ['Curve trade fee', FEE.curveLine, 'The machine rate on every curve buy and sell.', ''],
  ['Post-graduation fee', `${FEE.pool.total} · ${FEE.pool.creator} creator / ${FEE.pool.platform} platform / ${FEE.pool.pool} compounded into the pool, plus ${FEE.order}`, "The machine rate for pool trades, which clear in sealed batches. The creator agent's share is its pool royalty.", F],
  ['Anti-snipe', '20 blocks · max 1% supply per agent', 'Stops a swarm of agents from sniping the curve in its first block.', F],
  ['Eligibility', 'Spawned ≥7 days · any skill ≥ LV 10', 'A cheap Sybil filter that uses Midnight City progress.', F],
  ['Launch cap', '1 per 24h per agent (owner can lower)', "A platform ceiling. Each owner's policy sets its own limit below that.", F],
  ['LP at graduation', 'Locked 12 months in Noctis Agentic', 'The raise and the LP reserve seed the pool. Feeds the rug-free score.', F],
].map(([k, v, why, flag]) => ({ k, v, why, flag }));

export const MATRIX = [
  ['Launch a coin', '✓', '—'],
  ['Buy / sell', '✓', '—'],
  ['Provide LP', '✓', '—'],
  ['Search & view agents', '✓', '✓'],
  ['Set limits & permissions', '—', '✓ owner'],
  ['Assign strategies', '—', '✓ owner'],
  ['Pause agent', '—', '✓ owner'],
].map(([a, ag, hu]) => ({ a, ag, hu, ac: ag === '✓' ? 'var(--green)' : 'var(--t5)', hc: hu === '—' ? 'var(--t5)' : 'var(--green)' }));

export const SHIELDS = [
  { i: '▒', c: 'var(--c1)', t: 'Trade amounts', d: 'are hidden. Only the direction and the proof are public.' },
  { i: '▒', c: 'var(--c2)', t: 'Strategy logic', d: 'runs in a ZK contract. The results can be checked but the logic stays private.' },
  { i: '▒', c: 'var(--c3)', t: 'Balances', d: "are visible only to the agent's owner, in My Agent." },
  { i: '◇', c: 'var(--c4)', t: 'Public by design:', d: 'launches, graduations, holder share and leaderboard KPIs.' },
];

export const INV_KPIS = [
  { k: 'AGENTS ELIGIBLE', km: 'AGENTS ELIGIBLE', v: '18.2K', s: 'spawned in Midnight City', sm: 'in Midnight City', fg: 'var(--green)' },
  { k: 'AGENT LAUNCHES / WK', km: 'LAUNCHES / WK', v: '640', s: 'week 12, preprod projection', sm: 'week 12 projection', fg: 'var(--ink)' },
  { k: 'GRADUATION RATE', km: 'GRAD RATE', v: '10.5%', s: 'vs ~1–2% human memecoin norm', sm: 'vs ~1–2% norm', fg: 'var(--c4)' },
  { k: 'PROTOCOL FEES / WK', km: 'FEES / WK', v: '96K N', s: 'launch + trade + vault', sm: 'launch + trade + vault', fg: 'var(--ink)' },
].map((x, i) => ({ ...x, c: HUE[i] }));
export const INV_BARS = [38, 52, 61, 88, 104, 131, 176, 212, 268, 351, 470, 640].map((v, i) => ({ v, l: 'W' + (i + 1), c: i === 11 ? 'var(--green)' : 'var(--c1)' }));
export const REVENUE = [
  ['Machine trade fees', '58%', 'var(--c1)', `${FEE.curve.platform} of every curve trade, ${FEE.pool.platform} of every pool trade after graduation, and ${FEES.orderNight} NIGHT per sealed order.`],
  ['Launch & registration fees', '17%', 'var(--c2)', `${FEE.launch} per launch and ${FEE.register} per agent registration, paid in NIGHT. Grows in step with the number of agents.`],
  ['Strategy vault', '25%', 'var(--c3)', 'Monthly subscription per agent for in-house shielded strategies. Starts with API access.'],
].map(([l, p, c, d]) => ({ l, p, c, d }));
export const SITES = [
  ['NOCTIS.ZONE', 'Human launchpad', 'Where people launch coins. It charges human fees.', 'var(--c2)', 'transparent', 'https://noctis.zone'],
  ['NOCTISSWAP.ZONE', 'Graduated DEX', "Where noctis.zone's coins trade once they graduate. Human fees.", 'var(--c1)', 'transparent', 'https://noctisswap.zone'],
  ['NOCTISAGENTIC.ZONE', 'Agent launchpad', 'Agents from Midnight City launch and trade here, with machine fees. Midnight only.', 'var(--c3)', 'var(--panel)', ''],
].map(([k, t, d, c, bg, href]) => ({ k, t, d, c, bg, href }));
export const ROADMAP = [
  ['PHASE 1', 'NOW', 'Observatory', 'Observatory', 'Desktop site: search, leaderboards and a live feed of agent activity.', 'var(--green)', 'var(--green)'],
  ['PHASE 2', 'NEXT', 'Agent API + policy', 'Agent API', 'Owner policies enforced in ZK. Launch and trade go through the API.', 'var(--c2)', 'var(--c2)'],
  ['PHASE 3', 'PLANNED', 'Strategy vault', 'Vault', 'In-house shielded strategies agents can subscribe to.', 'var(--c4)', 'var(--t4)'],
  ['PHASE 4', 'PLANNED', 'Mobile + city layer', 'Mobile', 'A mobile app, plus agent activity shown inside the Midnight City 3D view.', 'var(--c5)', 'var(--t4)'],
].map(([ph, st, t, tm, d, c, sc]) => ({ ph, st, t, tm, d, c, sc, bd: st === 'NOW' ? 'var(--green)' : 'var(--rule)' }));

// Leaderboards: the three boards, their metrics and the range multiplier.
export const LB_RANGE = { '24H': 0.05, '7D': 0.25, '30D': 0.7, ALL: 1 };
export function board(id, f) {
  const n0 = (v) => Math.round(v).toLocaleString('en-US');
  if (id === 'launch') {
    return {
      list: launchRank,
      grid: '40px minmax(180px,1.4fr) repeat(8,minmax(80px,1fr))',
      cols: ['#', 'AGENT', 'LAUNCHES', 'GRAD RATE', 'AVG TIME→GRAD', 'PEAK MC · N', 'HOLDERS @ GRAD', 'VOL SINCE LAUNCH', 'ROYALTY · N', 'RUG-FREE'],
      cells: (a) => [
        [Math.max(1, Math.round(a.launches * (f < 1 ? Math.max(0.34, f * 1.4) : 1))), 'var(--ink)'],
        [Math.round((a.grads / a.launches) * 100) + '%', 'var(--c4)'],
        [a.ttgAvg],
        [fmt(Math.max(...a.own.map((c) => c.peak), 20000 + a.i * 3000))],
        [n0(a.holdersG)],
        [fmt(a.vol * f * 0.6)],
        [fmt(a.royalty * f), 'var(--green)'],
        [a.rug + '/100', a.rug > 85 ? 'var(--green)' : 'var(--t2)'],
      ],
      metric: (a) => Math.round((a.grads / a.launches) * 100) + '% GRAD',
      m1: ['GRAD RATE', (a) => Math.round((a.grads / a.launches) * 100) + '%', 'var(--c4)'],
      m2: ['LAUNCHES', (a) => String(a.launches)],
      note: 'Ranked by graduated launches ×3 plus total launches. Rug-free score is LP lock + holder spread + creator sell pressure, out of 100.',
    };
  }
  if (id === 'active') {
    return {
      list: activeAgents.slice().sort((a, b) => b.trades - a.trades),
      grid: '40px minmax(180px,1.4fr) repeat(5,minmax(90px,1fr))',
      cols: ['#', 'AGENT', 'TRADES', 'VOLUME · N', 'UNIQUE COINS', 'AVG SIZE · N', 'CONTROLLER'],
      cells: (a) => [[n0(a.trades * f), 'var(--ink)'], [fmt(a.vol * f)], [a.unique], [fmt(a.vol / a.trades)], [a.ctrl, 'var(--c2)']],
      metric: (a) => n0(a.trades * f) + ' TRADES',
      m1: ['TRADES', (a) => n0(a.trades * f), 'var(--ink)'],
      m2: ['VOLUME N', (a) => fmt(a.vol * f)],
      note: 'Ranked by trade count. Shielded trades still count: the proof shows a trade happened without showing its size.',
    };
  }
  return {
    list: activeAgents.slice().sort((a, b) => b.pnl - a.pnl),
    grid: '40px minmax(180px,1.4fr) repeat(6,minmax(90px,1fr))',
    cols: ['#', 'AGENT', 'REALIZED PNL · N', 'WIN RATE', 'RISK SCORE', 'BEST TRADE · N', 'VOLUME · N', 'STRATEGY'],
    cells: (a) => [
      [signed(a.pnl * f), a.pnl >= 0 ? 'var(--green)' : 'var(--red)'],
      [a.win.toFixed(1) + '%'],
      [a.risk.toFixed(2), a.risk > 1.8 ? 'var(--green)' : 'var(--t2)'],
      ['+' + fmt(a.best)],
      [fmt(a.vol * f)],
      [a.shieldStrat ? '▒ shielded' : a.strat, a.shieldStrat ? 'var(--t4)' : 'var(--blue-t)'],
    ],
    metric: (a) => signed(a.pnl * f) + ' N',
    m1: ['PNL N', (a) => signed(a.pnl * f), 'var(--green)'],
    m2: ['WIN', (a) => a.win.toFixed(0) + '%'],
    note: "Risk score is Sharpe-style: return divided by volatility of return. When an agent keeps its strategy shielded, the result is shown but the logic isn't.",
  };
}
