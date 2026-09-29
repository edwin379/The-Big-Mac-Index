/* =========================================================
   Same burger, different price — Big Mac index slides
   Data: window.BIGMAC (data.js), from The Economist
   ========================================================= */
(() => {
const D = window.BIGMAC;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Language ---------- */
let lang = "en";   // English first; visitors can switch to Japanese
const L = (ja, en) => (lang === "ja" ? ja : en);

const NAMES = {
  ARE:["UAE","アラブ首長国連邦"],ARG:["Argentina","アルゼンチン"],AUS:["Australia","オーストラリア"],AZE:["Azerbaijan","アゼルバイジャン"],
  BHR:["Bahrain","バーレーン"],BRA:["Brazil","ブラジル"],CAN:["Canada","カナダ"],CHE:["Switzerland","スイス"],CHL:["Chile","チリ"],
  CHN:["China","中国"],COL:["Colombia","コロンビア"],CRI:["Costa Rica","コスタリカ"],CZE:["Czech Republic","チェコ"],DNK:["Denmark","デンマーク"],
  EGY:["Egypt","エジプト"],EUZ:["Euro area","ユーロ圏"],GBR:["Britain","イギリス"],GTM:["Guatemala","グアテマラ"],HKG:["Hong Kong","香港"],
  HND:["Honduras","ホンジュラス"],HUN:["Hungary","ハンガリー"],IDN:["Indonesia","インドネシア"],IND:["India","インド"],ISR:["Israel","イスラエル"],
  JOR:["Jordan","ヨルダン"],JPN:["Japan","日本"],KOR:["South Korea","韓国"],KWT:["Kuwait","クウェート"],LBN:["Lebanon","レバノン"],
  LKA:["Sri Lanka","スリランカ"],MDA:["Moldova","モルドバ"],MEX:["Mexico","メキシコ"],MYS:["Malaysia","マレーシア"],NIC:["Nicaragua","ニカラグア"],
  NOR:["Norway","ノルウェー"],NZL:["New Zealand","ニュージーランド"],OMN:["Oman","オマーン"],PAK:["Pakistan","パキスタン"],PER:["Peru","ペルー"],
  PHL:["Philippines","フィリピン"],POL:["Poland","ポーランド"],QAT:["Qatar","カタール"],ROU:["Romania","ルーマニア"],RUS:["Russia","ロシア"],
  SAU:["Saudi Arabia","サウジアラビア"],SGP:["Singapore","シンガポール"],SWE:["Sweden","スウェーデン"],THA:["Thailand","タイ"],TUR:["Turkey","トルコ"],
  TWN:["Taiwan","台湾"],UKR:["Ukraine","ウクライナ"],URY:["Uruguay","ウルグアイ"],USA:["United States","アメリカ"],VEN:["Venezuela","ベネズエラ"],
  VNM:["Vietnam","ベトナム"],ZAF:["South Africa","南アフリカ"]
};
const nm = iso => (NAMES[iso] ? NAMES[iso][lang === "ja" ? 1 : 0] : iso);

/* latest row: [iso, localPrice, currency, rate, usdPrice, valuation] */
const ROW = Object.fromEntries(D.latest.map(r => [r[0], r]));
const US = ROW.USA[4];
const JP = ROW.JPN;
const money = (v, cur) => {
  try {
    return new Intl.NumberFormat(lang === "ja" ? "ja-JP" : "en-US", {
      style: "currency", currency: cur, maximumFractionDigits: v >= 100 ? 0 : 2
    }).format(v);
  } catch (e) { return `${v} ${cur}`; }
};
const usd = v => "$" + v.toFixed(2);
const dateLabel = ym => {
  const [y, m] = ym.split("-").map(Number);
  return L(`${y}年${m}月`, new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "short", year: "numeric" }));
};

/* ---------- Small animation helpers ---------- */
function tween(from, to, ms, onStep, onDone) {
  if (reduce || ms <= 0) { onStep(to); onDone && onDone(); return () => {}; }
  let raf, t0;
  const ease = t => 1 - Math.pow(1 - t, 3);
  const step = now => {
    t0 ??= now;
    const t = Math.min(1, (now - t0) / ms);
    onStep(from + (to - from) * ease(t));
    if (t < 1) raf = requestAnimationFrame(step); else onDone && onDone();
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}
const restartAnim = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
const later = (() => { let ids = []; return {
  add(fn, ms) { ids.push(setTimeout(fn, ms)); },
  clear() { ids.forEach(clearTimeout); ids = []; }
}; })();

/* =========================================================
   Slide 1 — burger builds itself
   ========================================================= */
const s1 = {
  enter() {},
  replay() { $$(".s1 .layer").forEach(l => { l.style.animation = "none"; void l.getBoundingClientRect(); l.style.animation = ""; }); }
};
$("#build").addEventListener("click", () => s1.replay());

/* =========================================================
   Slide 2 — price tag flips from local money to dollars
   ========================================================= */
const s2 = {
  list: ["CHE", "EUZ", "GBR", "USA", "KOR", "CHN", "JPN", "IND"],
  iso: "CHE",
  timers: [],
  build() {
    $("#chips").innerHTML = this.list.map(c =>
      `<button type="button" class="chip" data-c="${c}" aria-pressed="${c === this.iso}">${nm(c)}</button>`).join("");
    $$("#chips .chip").forEach(b => b.addEventListener("click", () => this.pick(b.dataset.c)));
  },
  pick(iso) {
    this.iso = iso;
    this.timers.forEach(clearTimeout); this.timers = [];
    $$("#chips .chip").forEach(b => b.setAttribute("aria-pressed", b.dataset.c === iso));
    const r = ROW[iso], tag = $("#tag"), burger = $("#tagBurger");
    tag.classList.add("instant"); tag.classList.remove("flipped"); void tag.offsetWidth; tag.classList.remove("instant");
    $("#tagLocal").textContent = money(r[1], r[2]);
    $("#tagUsd").textContent = usd(r[4]);
    $("#tagCaption").textContent = "";
    burger.style.transform = "scale(1)";
    this.timers.push(setTimeout(() => {
      tag.classList.add("flipped");
      burger.style.transform = `scale(${(r[4] / US).toFixed(3)})`;
    }, reduce ? 0 : 700));
    this.timers.push(setTimeout(() => this.caption(), reduce ? 0 : 1300));
  },
  caption() {
    const r = ROW[this.iso];
    if (this.iso === "USA") {
      $("#tagCaption").textContent = L(`アメリカは ${usd(r[4])}。これが基準です。`, `The US price, ${usd(r[4])}, is the baseline.`);
      return;
    }
    const pct = Math.round(Math.abs(r[5]) * 100), cheap = r[5] < 0;
    $("#tagCaption").innerHTML = L(
      `${nm(this.iso)}は アメリカより <b class="${cheap ? "u" : "o"}">${pct}%${cheap ? "安い" : "高い"}</b>`,
      `${nm(this.iso)} is <b class="${cheap ? "u" : "o"}">${pct}% ${cheap ? "cheaper" : "pricier"}</b> than the US`);
  },
  enter() { this.pick(this.iso); },
  render() { this.build(); if ($("#tag").classList.contains("flipped")) this.caption(); }
};

/* =========================================================
   Slide 3 — balance scale
   ========================================================= */
const s3 = {
  fair: JP[1] / US,                      // yen per dollar that makes prices equal
  real: Math.round(JP[3]),
  angle: 0, vel: 0, target: 0, raf: null, stopTween: null,
  init() {
    const r = $("#rate");
    r.value = this.real;
    r.addEventListener("input", () => { this.stopTween && this.stopTween(); this.update(); });
    $("#goFair").addEventListener("click", () => this.slideTo(Math.round(this.fair)));
    $("#goReal").addEventListener("click", () => this.slideTo(this.real));
  },
  slideTo(v) {
    const r = $("#rate");
    this.stopTween && this.stopTween();
    this.stopTween = tween(+r.value, v, 900, x => { r.value = Math.round(x); this.update(); });
  },
  update() {
    const rate = +$("#rate").value, jp = JP[1] / rate, diff = jp - US;
    $("#rateOut").textContent = rate;
    $("#priceL").textContent = usd(US);
    $("#priceR").textContent = usd(jp);
    this.target = Math.max(-18, Math.min(18, diff * 4.5));
    const msg = $("#scaleMsg");
    const balanced = Math.abs(diff) < 0.12;
    if (balanced && !msg.classList.contains("balanced")) restartAnim(msg, "balanced");
    if (!balanced) msg.classList.remove("balanced");
    msg.innerHTML = balanced
      ? L("つり合った！これが「公平な」レートです。", "Balanced! That's the “fair” exchange rate.")
      : diff < 0
        ? L(`日本側が軽い → 円が<b class="u">弱すぎる（割安）</b>`, `Japan's side is lighter → the yen is <b class="u">too weak (undervalued)</b>`)
        : L(`日本側が重い → 円が<b class="o">強すぎる（割高）</b>`, `Japan's side is heavier → the yen is <b class="o">too strong (overvalued)</b>`);
    this.kick();
  },
  kick() {
    if (reduce) { this.angle = this.target; this.place(); return; }
    if (this.raf) return;
    const loop = () => {
      this.vel += (this.target - this.angle) * 0.06;
      this.vel *= 0.86;
      this.angle += this.vel;
      this.place();
      if (Math.abs(this.target - this.angle) < 0.01 && Math.abs(this.vel) < 0.01) { this.raf = null; return; }
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  },
  place() {
    const a = this.angle * Math.PI / 180, cx = 300, cy = 119, R = 212;
    $("#beam").setAttribute("transform", `rotate(${this.angle.toFixed(2)} ${cx} ${cy})`);
    $("#panL").setAttribute("transform", `translate(${cx - R * Math.cos(a)} ${cy - R * Math.sin(a)})`);
    $("#panR").setAttribute("transform", `translate(${cx + R * Math.cos(a)} ${cy + R * Math.sin(a)})`);
  },
  render() {
    $("#panNameL").textContent = nm("USA");
    $("#panNameR").textContent = nm("JPN");
    $("#goFair").textContent = L(`公平なレート（${Math.round(this.fair)}円）`, `Fair rate (¥${Math.round(this.fair)})`);
    $("#goReal").textContent = L(`実際のレート（${this.real}円）`, `Real rate (¥${this.real})`);
    this.update();
  },
  enter() { this.angle = 0; this.vel = 0; this.place(); this.update(); },
  leave() { this.stopTween && this.stopTween(); }
};

/* =========================================================
   Slide 4 — time machine (2000 → 2026)
   ========================================================= */
const s4 = {
  S: D.japan,                // [ym, jpLocal, jpUsd, usUsd, valuation, rank, total, rate]
  i: 0, timer: null, played: false,
  init() {
    const sl = $("#tmSlider");
    sl.max = this.S.length - 1; sl.value = 0;
    sl.addEventListener("input", () => { this.pause(); this.show(+sl.value); });
    $("#play").addEventListener("click", () => (this.timer ? this.pause() : this.play()));
  },
  show(i) {
    this.i = i;
    const [ym, loc, jp, us, val, rank, total] = this.S[i];
    const [y, m] = ym.split("-");
    $("#tmYear").innerHTML = `${y}<small>${L(`${+m}月`, new Date(2000, m - 1, 1).toLocaleDateString("en-GB", { month: "long" }))}</small>`;
    $("#tmUS").style.transform = `scale(${(us / US).toFixed(3)})`;
    $("#tmJP").style.transform = `scale(${(jp / US).toFixed(3)})`;
    $("#tmUSp").textContent = usd(us);
    $("#tmJPp").textContent = usd(jp);
    $("#tmJPl").textContent = "¥" + loc;
    const pos = Math.max(2, Math.min(98, 50 + (val / 0.6) * 50));
    const pct = Math.round(val * 100);
    $("#needle").style.left = pos + "%";
    $("#needleVal").textContent = (pct > 0 ? "+" : pct < 0 ? "−" : "") + Math.abs(pct) + "%";
    $("#needleVal").className = val < 0 ? "u" : "o";
    $("#tmRank").innerHTML = L(`日本のビッグマックは世界 <b>${rank}</b> 位 / ${total}か国`, `Japan's Big Mac ranks <b>#${rank}</b> of ${total} by price`);
    $("#tmSlider").value = i;
  },
  play() {
    if (this.i >= this.S.length - 1) this.show(0);
    $("#playIcon").setAttribute("d", "M7 5h4v14H7zM13 5h4v14h-4z");
    $("#play").setAttribute("aria-label", "Pause");
    this.timer = setInterval(() => {
      if (this.i >= this.S.length - 1) return this.pause();
      this.show(this.i + 1);
    }, reduce ? 600 : 280);
  },
  pause() {
    clearInterval(this.timer); this.timer = null;
    $("#playIcon").setAttribute("d", "M7 5l12 7-12 7z");
    $("#play").setAttribute("aria-label", "Play");
  },
  enter() {
    this.show(this.i);
    if (!this.played) { this.played = true; later.add(() => this.play(), 900); }
  },
  leave() { this.pause(); },
  render() { this.show(this.i); }
};

/* =========================================================
   Slide 5 — quiz: which is cheaper?
   ========================================================= */
const s5 = {
  round: 0, results: [], pair: null, used: new Set(), done: false,
  pool: D.latest.map(r => r[0]),
  init() {
    $$("#vs .card").forEach(c => c.addEventListener("click", () => this.pick(+c.dataset.side)));
    $("#quizNext").addEventListener("click", () => {
      if (this.done) this.reset();
      else if (this.round >= 4) this.finish();
      else { this.round++; this.deal(); }
    });
    this.reset(true);
  },
  reset(silent) {
    this.round = 0; this.results = []; this.used.clear(); this.done = false;
    this.deal(silent);
  },
  newPair() {
    if (this.round === 0) return Math.random() < .5 ? ["JPN", "KOR"] : ["KOR", "JPN"];
    for (let k = 0; k < 200; k++) {
      const a = this.pool[Math.floor(Math.random() * this.pool.length)];
      const b = this.pool[Math.floor(Math.random() * this.pool.length)];
      const key = [a, b].sort().join();
      if (a !== b && !this.used.has(key) && Math.abs(ROW[a][4] - ROW[b][4]) >= 0.35) { this.used.add(key); return [a, b]; }
    }
    return ["CHE", "IND"];
  },
  deal(silent) {
    this.pair = this.newPair();
    $$("#vs .card").forEach((c, k) => {
      c.disabled = false;
      c.classList.remove("win", "picked", "wrong");
      $(".cn", c).textContent = nm(this.pair[k]);
      $(".cp", c).textContent = "?";
      $(".bgr", c).style.transform = "scale(.8)";
      if (!silent) restartAnim(c, "deal");
    });
    $("#quizNext").hidden = true;
    $("#quizMsg").innerHTML = L(`第${this.round + 1}問 / 5`, `Question ${this.round + 1} of 5`);
    this.drawScore();
  },
  pick(side) {
    const cards = $$("#vs .card");
    if (cards[0].disabled) return;
    const p = this.pair.map(c => ROW[c][4]);
    const cheaper = p[0] < p[1] ? 0 : 1, ok = side === cheaper;
    this.results.push(ok);
    const mx = Math.max(...p);
    cards.forEach((c, k) => {
      c.disabled = true;
      const out = $(".cp", c);
      tween(0, p[k], 900, v => { out.textContent = usd(v); });
      $(".bgr", c).style.transform = `scale(${(p[k] / mx).toFixed(3)})`;
    });
    cards[side].classList.add("picked");
    if (!ok) cards[side].classList.add("wrong");
    later.add(() => cards[cheaper].classList.add("win"), reduce ? 0 : 700);
    $("#quizMsg").innerHTML = ok
      ? `<b class="good">${L("正解！", "Correct!")}</b> ${L(`${nm(this.pair[cheaper])}の方が安い`, `${nm(this.pair[cheaper])} is cheaper`)}`
      : `<b class="bad">${L("ざんねん…", "Not quite.")}</b> ${L(`安いのは${nm(this.pair[cheaper])}`, `${nm(this.pair[cheaper])} is cheaper`)}`;
    const btn = $("#quizNext");
    btn.textContent = this.round >= 4 ? L("結果を見る", "See result") : L("次の問題", "Next question");
    btn.hidden = false;
    this.drawScore();
  },
  finish() {
    this.done = true;
    const n = this.results.filter(Boolean).length;
    $("#quizMsg").innerHTML = `<b>${L(`5問中 ${n}問 正解！`, `You got ${n} of 5!`)}</b> ${n >= 4 ? L("ビッグマック博士です。", "Big Mac expert.") : L("意外と難しい？", "Harder than it looks?")}`;
    $("#quizNext").textContent = L("もう一回", "Play again");
    this.drawScore();
  },
  drawScore() {
    $("#score").innerHTML = Array.from({ length: 5 }, (_, k) => {
      const r = this.results[k];
      const cls = r === true ? "ok" : r === false ? "ng" : (k === this.round && !this.done && this.results.length === k ? "now" : "");
      return `<span class="${cls}"></span>`;
    }).join("");
  },
  render() {
    $$("#vs .card").forEach((c, k) => { $(".cn", c).textContent = nm(this.pair[k]); });
    if ($$("#vs .card")[0].disabled) {
      if (this.done) this.finish(); else {
        const btn = $("#quizNext");
        btn.textContent = this.round >= 4 ? L("結果を見る", "See result") : L("次の問題", "Next question");
      }
    } else $("#quizMsg").innerHTML = L(`第${this.round + 1}問 / 5`, `Question ${this.round + 1} of 5`);
  },
  enter() { if (!$$("#vs .card")[0].disabled) $$("#vs .card").forEach(c => restartAnim(c, "deal")); }
};

/* =========================================================
   Slide 6 — what ¥1,000 buys
   ========================================================= */
const s6 = {
  list: ["CHE", "GBR", "USA", "KOR", "CHN", "JPN", "IND", "IDN"],
  iso: "JPN", stop: null,
  build() {
    $("#buyChips").innerHTML = this.list.map(c =>
      `<button type="button" class="chip" data-c="${c}" aria-pressed="${c === this.iso}">${nm(c)}</button>`).join("");
    $$("#buyChips .chip").forEach(b => b.addEventListener("click", () => this.pick(b.dataset.c)));
  },
  pick(iso) {
    this.iso = iso;
    later.clear();
    this.stop && this.stop();
    $$("#buyChips .chip").forEach(b => b.setAttribute("aria-pressed", b.dataset.c === iso));
    const dollars = 1000 / JP[3];
    const n = dollars / ROW[iso][4];
    const tray = $("#tray");
    tray.innerHTML = "";
    restartAnim($(".bill"), "spend");
    const full = Math.floor(n), frac = n - full, gap = reduce ? 0 : 260;
    const add = w => {
      const d = document.createElement("div");
      d.className = "item";
      if (w < 1) d.style.width = `calc(var(--iw) * ${w.toFixed(3)})`;
      d.innerHTML = `<svg viewBox="0 0 200 140" aria-hidden="true"><use href="#bm"/></svg>`;
      tray.appendChild(d);
    };
    for (let k = 0; k < full; k++) later.add(() => add(1), 250 + k * gap);
    if (frac > 0.02) later.add(() => add(frac), 250 + full * gap);
    const out = $("#buyCount");
    this.stop = tween(0, n, 250 + (full + 1) * gap, v => { out.textContent = v.toFixed(1); });
  },
  render() {
    this.build();
    $("#billLead").textContent = L(
      `${dateLabel(D.latestDate)}のレート（1ドル＝${Math.round(JP[3])}円）で両替すると、1,000円＝${usd(1000 / JP[3])}。国を選んでビッグマックを買ってみよう。`,
      `At the ${dateLabel(D.latestDate)} rate (¥${Math.round(JP[3])} per $1), ¥1,000 is ${usd(1000 / JP[3])}. Pick a country and go shopping.`);
  },
  enter() { this.pick(this.iso); }
};

/* =========================================================
   Slide 7 — world map with burgers sized by dollar price
   ========================================================= */
const sMap = {
  W: window.WORLD,
  NS: "http://www.w3.org/2000/svg",
  vb: [0, 0, 1000, 520],
  sel: "JPN", region: "world", stop: null,
  REGIONS: {
    world: null,
    americas: ["USA","CAN","MEX","GTM","HND","NIC","CRI","COL","VEN","PER","BRA","CHL","ARG","URY"],
    europe: ["CHE","EUZ","GBR","NOR","SWE","DNK","POL","CZE","HUN","ROU","MDA","UKR","TUR"],
    mideast: ["EGY","ISR","JOR","LBN","SAU","KWT","BHR","QAT","ARE","OMN","AZE","PAK"],
    asia: ["CHN","JPN","KOR","TWN","HKG","VNM","THA","MYS","SGP","IDN","PHL","IND","LKA","AUS","NZL"]
  },

  /* burger width in viewBox units for a given view width */
  size(price, vbw = this.vb[2]) {
    const phone = innerWidth < 760 ? 1.3 : 1;
    return price * 3.4 * phone * Math.pow(vbw / 1000, 0.5);
  },

  init() {
    $("#land").innerHTML = this.W.shapes.map(([iso, d]) =>
      `<path d="${d}"${iso && ROW[iso] ? ` class="has" data-c="${iso}"` : ""}/>`).join("");
    const pins = $("#pins");
    const list = D.latest.filter(r => this.W.points[r[0]]).sort((a, b) => b[4] - a[4]);
    this.pins = list.map(r => {
      const [x, y] = this.W.points[r[0]];
      const g = document.createElementNS(this.NS, "g");
      g.setAttribute("class", "pin");
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.dataset.c = r[0];
      g.style.setProperty("--d", Math.round(200 + x * 1.1));
      g.innerHTML = `<line class="leader"/><circle class="spot"/><use href="#bm"/>`;
      g.addEventListener("pointerenter", () => { pins.classList.add("focus"); this.pick(r[0]); });
      g.addEventListener("focus", () => { pins.classList.add("focus"); this.pick(r[0]); });
      g.addEventListener("blur", () => pins.classList.remove("focus"));
      g.addEventListener("click", () => this.pick(r[0]));
      pins.appendChild(g);
      return { g, use: g.querySelector("use"), line: g.querySelector(".leader"), dot: g.querySelector(".spot"),
               x, y, p: r[4], iso: r[0], cx: x, cy: y };
    });
    $("#map").addEventListener("pointerleave", () => pins.classList.remove("focus"));
    this.solve(this.vb).forEach((q, k) => { this.pins[k].cx = q[0]; this.pins[k].cy = q[1]; });
    this.draw();
    let rt;
    addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => this.zoom(this.region, true), 150); });
  },

  /* Collision avoidance: push overlapping burgers apart, pull each back toward its country */
  solve(vb) {
    const gap = vb[2] * 0.004;
    const B = this.pins.map(o => {
      const w = this.size(o.p, vb[2]), h = w * 0.7;
      return { w, h, tx: o.x, ty: o.y - h / 2 - gap * 1.5, px: o.x, py: o.y - h / 2 - gap * 1.5 };
    });
    for (let it = 0; it < 260; it++) {
      for (let i = 0; i < B.length; i++) for (let j = i + 1; j < B.length; j++) {
        const a = B[i], b = B[j];
        const ox = (a.w + b.w) / 2 + gap - Math.abs(a.px - b.px);
        const oy = (a.h + b.h) / 2 + gap - Math.abs(a.py - b.py);
        if (ox <= 0 || oy <= 0) continue;
        if (ox < oy) { const s = (a.px < b.px ? -1 : 1) * ox / 2; a.px += s; b.px -= s; }
        else { const s = (a.py < b.py ? -1 : 1) * oy / 2; a.py += s; b.py -= s; }
      }
      const pull = it < 200 ? 0.04 : 0;          // let the last passes only separate
      for (const b of B) { b.px += (b.tx - b.px) * pull; b.py += (b.ty - b.py) * pull; }
    }
    return B.map(b => [b.px, b.py]);
  },

  draw() {
    const r = this.vb[2] * 0.0022;
    for (const o of this.pins) {
      const w = this.size(o.p), h = w * 0.7;
      o.use.setAttribute("x", o.cx - w / 2); o.use.setAttribute("y", o.cy - h / 2);
      o.use.setAttribute("width", w); o.use.setAttribute("height", h);
      o.dot.setAttribute("cx", o.x); o.dot.setAttribute("cy", o.y); o.dot.setAttribute("r", r);
      const bx = o.cx, by = o.cy + h / 2;                        // bottom of the burger
      const far = Math.hypot(bx - o.x, by - o.y) > w * 0.35;
      o.line.setAttribute("x1", o.x); o.line.setAttribute("y1", o.y);
      o.line.setAttribute("x2", bx); o.line.setAttribute("y2", by);
      o.line.style.opacity = far ? "" : "0";
    }
    $("#map").setAttribute("viewBox", this.vb.map(v => v.toFixed(1)).join(" "));
    this.legend();
  },

  boxFor(region) {
    const isos = this.REGIONS[region];
    if (!isos) return [0, 0, 1000, 520];
    const pts = isos.map(c => this.W.points[c]).filter(Boolean);
    let x0 = Math.min(...pts.map(p => p[0])) - 50, x1 = Math.max(...pts.map(p => p[0])) + 50;
    let y0 = Math.min(...pts.map(p => p[1])) - 60, y1 = Math.max(...pts.map(p => p[1])) + 40;
    let w = x1 - x0, h = y1 - y0;
    const ar = 1000 / 520;
    if (w / h < ar) { const nw = h * ar; x0 -= (nw - w) / 2; w = nw; } else { const nh = w / ar; y0 -= (nh - h) / 2; h = nh; }
    return [x0, y0, w, h];
  },

  zoom(region, instant) {
    this.region = region;
    $$("#regions .chip").forEach(b => b.setAttribute("aria-pressed", b.dataset.r === region));
    const fromVb = [...this.vb], toVb = this.boxFor(region);
    const from = this.pins.map(o => [o.cx, o.cy]), to = this.solve(toVb);
    this.stop && this.stop();
    this.stop = tween(0, 1, instant ? 0 : 1000, t => {
      this.vb = fromVb.map((v, k) => v + (toVb[k] - v) * t);
      this.pins.forEach((o, k) => { o.cx = from[k][0] + (to[k][0] - from[k][0]) * t; o.cy = from[k][1] + (to[k][1] - from[k][1]) * t; });
      this.draw();
    });
  },

  pick(iso, force) {
    const r = ROW[iso]; if (!r) return;
    if (iso === this.sel && !force && this.picked) return;
    this.picked = true;
    this.sel = iso;
    this.pins.forEach(o => o.g.classList.toggle("sel", o.iso === iso));
    $$("#land path.on").forEach(p => p.classList.remove("on"));
    $$(`#land path[data-c="${iso}"]`).forEach(p => p.classList.add("on"));
    const pct = Math.round(Math.abs(r[5]) * 100), cheap = r[5] < 0;
    const rel = iso === "USA"
      ? L("基準（0%）", "The baseline (0%)")
      : L(`アメリカより <b class="${cheap ? "u" : "o"}">${pct}%${cheap ? "安い" : "高い"}</b>`,
          `<b class="${cheap ? "u" : "o"}">${pct}% ${cheap ? "cheaper" : "pricier"}</b> than the US`);
    const rank = [...D.latest].sort((a, b) => b[4] - a[4]).findIndex(x => x[0] === iso) + 1;
    const card = $("#mapcard");
    card.innerHTML = `<span class="n">${nm(iso)}</span><span class="p">${usd(r[4])}</span><span class="l">${money(r[1], r[2])}</span>
      <span class="r">${rel}</span><span class="r">${L(`世界 ${rank}位 / ${D.latest.length}か国`, `#${rank} of ${D.latest.length}`)}</span>`;
    restartAnim(card, "bump");
  },

  legend() {
    const svg = $("#map"); if (!svg.clientWidth) return;
    const px = svg.clientWidth / this.vb[2];
    $("#legend").innerHTML = [3, 6, 9].map(p => {
      const w = this.size(p) * px;
      return `<figure><svg viewBox="0 0 200 140" style="width:${w.toFixed(1)}px;height:${(w * 0.7).toFixed(1)}px"><use href="#bm"/></svg>$${p}</figure>`;
    }).join("");
  },

  render() {
    const names = { world: ["世界", "World"], americas: ["アメリカ大陸", "Americas"], europe: ["ヨーロッパ", "Europe"], mideast: ["中東", "Middle East"], asia: ["アジア・オセアニア", "Asia-Pacific"] };
    $("#regions").innerHTML = Object.keys(this.REGIONS).map(k =>
      `<button type="button" class="chip" data-r="${k}" aria-pressed="${k === this.region}">${L(...names[k])}</button>`).join("");
    $$("#regions .chip").forEach(b => b.addEventListener("click", () => this.zoom(b.dataset.r)));
    this.pins.forEach(o => o.g.setAttribute("aria-label", `${nm(o.iso)} ${usd(ROW[o.iso][4])}`));
    this.pick(this.sel, true);
  },
  enter() {
    this.zoom(this.region, true);
    this.pick(this.sel, true);
    later.add(() => $("#pins").classList.add("settled"), reduce ? 0 : 2200);
  },
  leave() { this.stop && this.stop(); $("#pins").classList.remove("settled", "focus"); }
};

/* =========================================================
   Slide 8 — wrap-up with falling burgers
   ========================================================= */
const s7 = {
  init() {
    const rain = $("#rain");
    for (let k = 0; k < 16; k++) {
      const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      el.setAttribute("viewBox", "0 0 200 140");
      el.innerHTML = `<use href="#bm"/>`;
      el.style.left = (Math.random() * 96) + "%";
      el.style.animationDuration = (7 + Math.random() * 7) + "s";
      el.style.animationDelay = (-Math.random() * 14) + "s";
      el.style.setProperty("--r", (Math.random() * 400 - 200) + "deg");
      const s = 0.6 + Math.random() * 0.9;
      el.style.width = 60 * s + "px"; el.style.height = 42 * s + "px";
      rain.appendChild(el);
    }
    $("#restart").addEventListener("click", () => go(0));
  }
};

/* =========================================================
   Deck navigation
   ========================================================= */
const slides = $$(".slide");
const hooks = [s1, s2, s3, s4, s5, s6, sMap, s7];
const track = $("#track");
let cur = -1;

$("#dots").innerHTML = slides.map((_, k) => `<button type="button" aria-label="Slide ${k + 1}"></button>`).join("");
$$("#dots button").forEach((b, k) => b.addEventListener("click", () => go(k)));

function go(i, instant) {
  i = Math.max(0, Math.min(slides.length - 1, i));
  if (i === cur) return;
  later.clear();
  if (cur >= 0) { hooks[cur].leave && hooks[cur].leave(); slides[cur].classList.remove("active"); }
  cur = i;
  if (instant) { track.style.transition = "none"; }
  track.style.transform = `translateX(${-100 * i}vw)`;
  if (instant) { void track.offsetWidth; track.style.transition = ""; }
  slides.forEach((s, k) => {
    s.inert = k !== i;
    s.setAttribute("aria-label", `${k + 1} / ${slides.length}`);
  });
  $$("#dots button").forEach((b, k) => b.setAttribute("aria-current", k === i));
  $("#prev").disabled = i === 0;
  $("#next").disabled = i === slides.length - 1;
  $("#pageNum").textContent = `${i + 1} / ${slides.length}`;
  history.replaceState(null, "", `#${i + 1}`);
  const arrive = () => { slides[i].classList.add("active"); slides[i].scrollTop = 0; hooks[i].enter && hooks[i].enter(); };
  if (instant || reduce) arrive(); else setTimeout(arrive, 380);
}

$("#prev").addEventListener("click", () => go(cur - 1));
$("#next").addEventListener("click", () => go(cur + 1));
document.addEventListener("keydown", e => {
  if (e.target.matches("input, select, textarea")) return;
  if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); go(cur + 1); }
  if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(cur - 1); }
  if (e.key === "Home") go(0);
  if (e.key === "End") go(slides.length - 1);
});

/* swipe on touch screens */
let sx = null, sy = null;
$("#deck").addEventListener("pointerdown", e => {
  if (e.pointerType === "mouse" || e.target.closest("input")) return;
  sx = e.clientX; sy = e.clientY;
});
$("#deck").addEventListener("pointerup", e => {
  if (sx === null) return;
  const dx = e.clientX - sx, dy = e.clientY - sy;
  sx = null;
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) go(cur + (dx < 0 ? 1 : -1));
});

/* ---------- Language switch ---------- */
function applyLang() {
  document.documentElement.lang = lang;
  document.documentElement.dataset.lang = lang;
  document.title = L("同じバーガー、ちがう値段 — ビッグマック指数", "Same burger, different price — The Big Mac index");
  $$("[data-setlang]").forEach(b => b.setAttribute("aria-pressed", b.dataset.setlang === lang));
  $("#prev").setAttribute("aria-label", L("前のスライド", "Previous slide"));
  $("#next").setAttribute("aria-label", L("次のスライド", "Next slide"));
  s2.render(); s3.render(); s4.render(); s5.render(); s6.render(); sMap.render();
}
$$("[data-setlang]").forEach(b => b.addEventListener("click", () => {
  lang = b.dataset.setlang;
  applyLang();
}));

addEventListener("hashchange", () => {
  const n = parseInt(location.hash.slice(1), 10);
  if (Number.isFinite(n)) go(n - 1);
});

/* ---------- Start ---------- */
s3.init(); s4.init(); s5.init(); sMap.init(); s7.init();
applyLang();
const start = parseInt(location.hash.slice(1), 10);
go(Number.isFinite(start) ? start - 1 : 0, true);
})();